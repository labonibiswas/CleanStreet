const User = require("../models/User");
const Issue = require("../models/Issue");
const Activity = require("../models/Activity");

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalComplaints = await Issue.countDocuments();
    const pending = await Issue.countDocuments({ status: "Pending" });
    const inProgress = await Issue.countDocuments({ status: "In Progress" });
    const resolved = await Issue.countDocuments({ status: "Resolved" });

    // 1. Complaint Status Distribution
    const statusDistribution = [
      { name: "Pending", value: pending },
      { name: "In Progress", value: inProgress },
      { name: "Resolved", value: resolved },
    ];

    // 2. Complaint Types Distribution & Top 3
    const typeAggr = await Issue.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const complaintTypes = typeAggr.length > 0 
      ? typeAggr.map(t => ({ name: t._id || "Uncategorized", value: t.count }))
      : [{ name: "General", value: totalComplaints }];
      
    const topComplaintTypes = complaintTypes.slice(0, 3);

    // 3. User Roles Distribution
    const roleAggr = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    const userRoles = roleAggr.map(r => ({ name: r._id || "user", value: r.count }));

    // 4. Monthly Trends (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const trendsAggr = await Issue.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const monthlyTrends = trendsAggr.map(t => ({
      month: t._id,
      count: t.count
    }));

    res.json({
      totalUsers,
      totalComplaints,
      pending,
      inProgress,
      resolved,
      statusDistribution,
      complaintTypes,
      userRoles,
      topComplaintTypes,
      monthlyTrends
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error in getUsers:", error.message);
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = req.body.role;
    await user.save();
    
    // Log Activity safely
    if (req.user && req.user._id) {
      await Activity.create({
        action: "Role Changed",
        performedBy: req.user._id,
        description: `Changed role of ${user.username} to ${req.body.role}`
      });
    }

    res.json({ message: "Role updated" });
  } catch (error) {
    console.error("Error in changeRole:", error.message);
    res.status(500).json({ message: "Failed to change role", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error in deleteUser:", error.message);
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    // Removed the populate("createdBy") that was causing the 500 Schema crash
    const issues = await Issue.find()
      .populate("assignedTo", "username email");
    
    res.json(issues);
  } catch (error) {
    console.error("🔥 ERROR IN getComplaints:", error.message);
    res.status(500).json({ message: "Failed to fetch complaints", error: error.message });
  }
};

exports.assignVolunteer = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    issue.assignedTo = req.body.volunteerId;
    issue.status = "In Progress";
    await issue.save();

    // Log Activity safely
    if (req.user && req.user._id) {
      await Activity.create({
        action: "Volunteer Assigned",
        performedBy: req.user._id, 
        description: `Assigned volunteer to issue: ${issue.title}`
      });
    }

    res.json({
      message: "Volunteer assigned successfully",
      issue
    });
  } catch (error) {
    console.error("Error in assignVolunteer:", error.message);
    res.status(500).json({ message: "Error assigning volunteer", error: error.message });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate("performedBy", "username email role")
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(activities);
  } catch (error) {
    console.error("Error in getActivities:", error.message);
    res.status(500).json({ message: "Failed to fetch activities", error: error.message });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    // Removed the populate("createdBy") here as well
    const complaints = await Issue.find()
      .populate("assignedTo", "username");
    res.json(complaints);
  } catch (error) {
    console.error("Error in downloadReport:", error.message);
    res.status(500).json({ message: "Failed to generate report data", error: error.message });
  }
};