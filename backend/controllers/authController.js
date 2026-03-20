const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Notification = require("../models/Notification");

const logActivity = async (data) => {
  try {
    const Activity = require("../models/Activity");
    await Activity.create(data);
  } catch { /* skip if Activity model not yet added */ }
};

exports.registerUser = async (req, res) => {
  try {
    const { fullName, username, email, phone, password, role, location } = req.body;

    if (!location || !location.coordinates) {
      return res.status(400).json({ message: "Location required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName, username, email, phone, role,
      password: hashedPassword,
      location,
    });

    // ── Log activity ──
    await logActivity({
      type:        "new_user",
      userName:    fullName || username,
      description: `joined as a new ${role || "citizen"}`,
      issueTitle:  null,
      userId:      user._id,
    });

    // ── Notify Admins ──
    try {
      // 1. Fetch the admins FIRST
      const admins = await User.find({ role: "admin" });
      
      if (admins.length > 0) {
        // 2. Map through them to create the notifications
        const adminNotifications = admins.map(admin => ({
          recipient: admin._id,
          message: `New Registration: ${user.fullName || user.username} joined as a ${user.role || "citizen"}.`,
          link: `/dashboard?tab=Manage Users`, // Automatically switches to the Manage Users tab
          isRead: false // Uses your exact schema field
        }));
        
        // 3. Save to database
        await Notification.insertMany(adminNotifications);
      }
    } catch (notifErr) {
      console.error("Failed to notify admins of new user:", notifErr);
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id:       user._id,
        fullName: user.fullName,
        username: user.username,
        email:    user.email,
        phone:    user.phone,
        role:     user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
    await user.save();
      // ── Log activity ──
    await logActivity({
      type:        "profile_update",
      userName:    user.fullName || user.username,
      description: `changed their password`,
      issueTitle:  null,
      userId:      user._id,
    });

    res.json({ message: "Password updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, username, phone } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    user.phone    = phone    || user.phone;

    const updatedUser = await user.save();
    // ── Log activity ──
    await logActivity({
      type:        "profile_update",
      userName:    updatedUser.fullName || updatedUser.username,
      description: changes.length > 0
        ? `updated their ${changes.join(", ")}`
        : `viewed their profile`,
      issueTitle:  null,
      userId:      updatedUser._id,
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id:       updatedUser._id,
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        email:    updatedUser.email,
        phone:    updatedUser.phone,
        role:     updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};