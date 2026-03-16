const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

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

// 2. POST NEW FEEDBACK
// POST /api/feedback
router.post("/", protect, async (req, res) => {
  try {
    const { message, category } = req.body;
    const feedback = new Feedback({
      user: req.user._id,
      message,
      category,
      adminReply: ""
    });
    const savedFeedback = await feedback.save();
    res.status(201).json(savedFeedback);
  } catch (err) {
    res.status(500).json({ message: "Database error: " + err.message });
  }
});

// 3. POST ADMIN REPLY & NOTIFY
// POST /api/feedback/:id/reply
router.post("/:id/reply", protect, async (req, res) => {
  try {
    const { userId, message } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    // Save the reply
    feedback.adminReply = message;
    await feedback.save();

    // Create notification for the assigned person
    await Notification.create({
      recipient: userId,
      message: `Feedback Assignment/Reply: "${message}"`,
      link: "/dashboard", 
      read: false
    });

    res.json({ message: "Reply sent and user notified" });
  } catch (err) {
    console.error("REPLY ERROR:", err);
    res.status(500).json({ message: "Reply failed: " + err.message });
  }
});

module.exports = router;