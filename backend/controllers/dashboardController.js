const Issue = require("../models/Issue");

// GET DASHBOARD STATS
exports.getStats = async (req, res) => {
  try {
    const total = await Issue.countDocuments();
    const pending = await Issue.countDocuments({ status: "Pending" });
    const inProgress = await Issue.countDocuments({ status: "In Progress" });
    const resolved = await Issue.countDocuments({ status: "Resolved" });

    res.json({
      total,
      pending,
      inProgress,
      resolved
    });
  } catch (error) {
    res.status(500).json({ message: "Error loading dashboard stats" });
  }
};

// GET RECENT ACTIVITY
exports.getRecent = async (req, res) => {
  try {
    const issues = await Issue.find()
      .sort({ createdAt: -1 })
      .limit(10)

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: "Error loading recent issues" });
  }
};