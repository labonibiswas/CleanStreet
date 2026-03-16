const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ["Issue Related", "App Experience"], required: true },
  adminReply: { type: String, default: "" }, // Crucial for storing responses
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);