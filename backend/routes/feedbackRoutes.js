const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary"); // Adjust path if your config is elsewhere
const Issue = require("../models/Issue");
const User = require("../models/User");

// Configure Cloudinary Storage specifically for Feedback
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "cleanstreet_feedback", // Saves to a separate folder from complaints
    allowed_formats: ["jpg", "png", "jpeg", "avif", "webp"],
  },
});

const upload = multer({ storage });
// 1. GET ADMIN FEEDBACK (Must be at the top!)
// GET /api/feedback/admin
router.get("/admin", protect, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "username email role") // Brought in role
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching feedback" });
  }
});

// 2. POST NEW FEEDBACK (Direct Cloudinary Streaming + Volunteer Linking + Admin Alerts)
router.post("/", protect, upload.array("images", 3), async (req, res) => {
  try {
    const { message, category, complaintId } = req.body;
    const imageUrls = req.files ? req.files.map(file => file.path) : [];
    let targetVolunteerId = null;

    if (category === "Complaint Resolution" && complaintId) {
      const issue = await Issue.findById(complaintId);
      
      if (issue && issue.assignedTo) {
        targetVolunteerId = issue.assignedTo;

        const volunteerRating = message.match(/\[Volunteer Rating: (.*?)\]/)?.[1] || "N/A";
        const quality = message.match(/\[Quality: (.*?)\]/)?.[1] || "N/A";

        await Notification.create({
          recipient: targetVolunteerId,
          message: `Feedback for "${issue.title}": Rated ${volunteerRating} (${quality} quality).`,
          link: "/my-ratings", 
          read: false
        });
      }
    }

    const feedback = new Feedback({
      user: req.user._id,
      message,
      category,
      adminReply: "",
      images: imageUrls,
      complaintId: complaintId || null,
      volunteerId: targetVolunteerId
    });

    const savedFeedback = await feedback.save();

    // --- NEW: NOTIFY ALL ADMINS ---
    try {
      const admins = await User.find({ role: "admin" });
      if (admins.length > 0) {
        const reporterName = req.user?.username || "A user";
        const adminAlerts = admins.map(admin => ({
          recipient: admin._id,
          message: `New ${category} feedback received from ${reporterName}.`,
          link: "/admin-feedback", 
          read: false // Matching the schema you used above
        }));
        await Notification.insertMany(adminAlerts);
      }
    } catch (notifErr) {
      console.error("Failed to notify admins of new feedback:", notifErr);
    }
    // ------------------------------

    res.status(201).json(savedFeedback);
  } catch (err) {
    console.error("Feedback Upload Error:", err);
    res.status(500).json({ message: "Database error: " + err.message });
  }
});

// 3. POST ADMIN REPLY & NOTIFY (With Details)
router.post("/:id/reply", protect, async (req, res) => {
  try {
    const { userId, message } = req.body; // 'message' here is the text the admin typed
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    feedback.adminReply = message;
    await feedback.save();

    // Create detailed notification for the user who sent the feedback
    await Notification.create({
      recipient: userId,
      message: `Admin responded to your ${feedback.category} feedback: "${message.substring(0, 40)}${message.length > 40 ? '...' : ''}"`,
      link: "/dashboard", 
      read: false
    });

    res.json({ message: "Reply sent and user notified" });
  } catch (err) {
    console.error("REPLY ERROR:", err);
    res.status(500).json({ message: "Reply failed: " + err.message });
  }
});

// GET /api/feedback/my-ratings
// Fetch feedback specifically linked to the logged-in volunteer
router.get("/my-ratings", protect, async (req, res) => {
  try {
    const ratings = await Feedback.find({ volunteerId: req.user._id })
      .populate("user", "username") // Who gave the feedback
      .populate("complaintId", "title location") // What was the issue
      .sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching your ratings" });
  }
});

module.exports = router;
