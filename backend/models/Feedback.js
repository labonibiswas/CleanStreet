const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  
  // UPDATE: Added "Complaint Resolution" to the allowed categories
  category: { 
    type: String, 
    enum: ["Issue Related", "App Experience", "Complaint Resolution"], 
    required: true 
  },
  
  adminReply: { type: String, default: "" }, 
  images: [{ type: String }], 

  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue" },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);