const User = require("../models/User");
const Issue = require("../models/Issue");
const Activity = require("../models/Activity");

const issueTypeLabels = {
  "pothole": "Pothole",
  "garbage": "Garbage Dump",
  "streetlight": "Broken Streetlight",
  "drainage": "Drainage Issue",
  "other": "Other"
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalComplaints = await Issue.countDocuments();
    const pending = await Issue.countDocuments({ status: "Pending" });
    const inProgress = await Issue.countDocuments({ status: "In Progress" });
    const resolved = await Issue.countDocuments({ status: "Resolved" });

    const statusDistribution = [
      { name: "Pending", value: pending },
      { name: "In Progress", value: inProgress },
      { name: "Resolved", value: resolved },
    ];

    const typeAggr = await Issue.aggregate([
      { $group: { _id: { $ifNull: ["$issueType", "$type"] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const complaintTypes = typeAggr.length > 0 
      ? typeAggr.map(t => ({ 
          name: issueTypeLabels[t._id] || t._id || "General", 
          value: t.count 
        }))
      : [{ name: "General", value: totalComplaints }];
      
    const topComplaintTypes = complaintTypes.slice(0, 5); 

    const roleAggr = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    const userRoles = roleAggr.map(r => ({ name: r._id || "user", value: r.count }));

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
    
    const monthlyTrends = trendsAggr.map(t => ({ month: t._id, count: t.count }));

    res.json({
      totalUsers, totalComplaints, pending, inProgress, resolved,
      statusDistribution, complaintTypes, userRoles, topComplaintTypes, monthlyTrends
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = req.body.role;
    await user.save();
    
    if (req.user && req.user._id) {
      await Activity.create({
        action: "Role Changed",
        performedBy: req.user._id,
        description: `Changed role of ${user.username} to ${req.body.role}`
      });
    }
    res.json({ message: "Role updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to change role" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const issues = await Issue.find().populate("assignedTo", "username email");
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
};

exports.assignVolunteer = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    issue.assignedTo = req.body.volunteerId;
    issue.status = "In Progress";
    
    // NEW: We are setting this flag so the Volunteer Dashboard can see who assigned it.
    issue.assignedByAdmin = true; 

    await issue.save(); 

    res.json({ message: "Volunteer assigned successfully", issue });
  } catch (error) {
    res.status(500).json({ message: "Error assigning volunteer" });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const explicitActs = await Activity.find()
      .populate("performedBy", "username")
      .sort({ createdAt: -1 }).limit(10);

    const newUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    const newIssues = await Issue.find()
      .populate({ path: "createdBy", select: "username", strictPopulate: false })
      .sort({ createdAt: -1 }).limit(5);

    const statusUpdates = await Issue.find({ status: { $ne: "Pending" } })
      .populate("assignedTo", "username")
      .sort({ updatedAt: -1 }).limit(10);

    let timeline = [];

    explicitActs.forEach(a => {
      timeline.push({ action: a.action, description: a.description, user: a.performedBy?.username || "Admin", time: a.createdAt });
    });

    newUsers.forEach(u => {
      timeline.push({ action: "New User Registered", description: `Account created for ${u.email}`, user: u.username, time: u.createdAt });
    });

    newIssues.forEach(i => {
      timeline.push({ action: "Complaint Raised", description: `New issue reported: "${i.title}"`, user: (i.createdBy && i.createdBy.username) ? i.createdBy.username : "Citizen", time: i.createdAt });
    });

    statusUpdates.forEach(i => {
      if (i.status === "Resolved") {
        timeline.push({ action: "Complaint Resolved", description: `Successfully fixed: "${i.title}"`, user: i.assignedTo?.username || "Volunteer", time: i.updatedAt });
      } else if (i.status === "In Progress") {
        timeline.push({ action: "Complaint Accepted", description: `Working on: "${i.title}"`, user: i.assignedTo?.username || "Volunteer", time: i.updatedAt });
      }
    });

    timeline.sort((a, b) => new Date(b.time) - new Date(a.time));
    res.json(timeline.slice(0, 20));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    if (req.user && req.user._id) {
      await Activity.create({ action: "Report Generated", performedBy: req.user._id, description: "Admin downloaded the statistical report data." });
    }
    const complaints = await Issue.find().populate("assignedTo", "username");
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate report" });
  }
};