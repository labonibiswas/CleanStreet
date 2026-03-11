const Issue = require("../models/Issue");

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


exports.getRecent = async (req, res) => {
  try {

    const issues = await Issue.find()
      .sort({ createdAt: -1 })
      .limit(10);

    const formatted = issues.map(issue => ({
      title: issue.title,
      address: issue.address,
      priority: issue.priority,
      status: issue.status,
      time: issue.createdAt
    }));

    res.json(formatted);

  } catch (error) {
    res.status(500).json({ message: "Error loading recent issues" });
  }
};