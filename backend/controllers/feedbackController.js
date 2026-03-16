import Feedback from "../models/Feedback.js";
import Notification from "../models/Notification.js";

// @desc    Get ALL feedback for Admin
// @route   GET /api/feedback/admin
export const getAllFeedback = async (req, res) => {
  try {
    // Populates the user data so the admin can see WHO sent it
    const feedbacks = await Feedback.find()
      .populate("user", "username email") 
      .sort({ createdAt: -1 });
      
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
};

// @desc    Admin replies to feedback and notifies user
// @route   POST /api/feedback/:id/reply
export const replyToFeedback = async (req, res) => {
  try {
    const { id } = req.params; // The feedback ID
    const { userId, comment } = req.body; // The user to notify and the admin's message

    // 1. Update the feedback with the admin's reply
    await Feedback.findByIdAndUpdate(id, { adminReply: comment });

    // 2. Trigger a notification for that specific user
    await Notification.create({
      recipient: userId,
      message: `Admin replied to your feedback: "${comment}"`,
      category: 'Feedback'
    });

    res.json({ message: "Reply sent and user notified!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send reply" });
  }
};