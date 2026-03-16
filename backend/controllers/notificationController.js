import Notification from "../models/Notification.js";

// Get all notifications for logged in user
export const getNotifications = async (req, res) => {
  try {
    // Failsafe: check if req.user exists
    if (!req.user || (!req.user._id && !req.user.id)) {
      return res.status(401).json({ message: "User not authorized or missing from request" });
    }
    
    // Use req.user.id if _id is undefined
    const userId = req.user._id || req.user.id; 

    const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error("Notification Error:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// Mark one as read
export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
};

// Mark ALL as read
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications" });
  }
};