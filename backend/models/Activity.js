// models/Activity.js
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "status_change",    // complaint status updated
        "new_complaint",    // new complaint filed
        "complaint_update", // complaint details edited by user
        "complaint_delete", // complaint deleted by user
        "new_user",         // new user registered
        "profile_update",   // user updated their profile/details
        "assigned",         // complaint assigned to volunteer
        "role_change",      // admin changed a user's role
      ],
      default: "status_change",
    },
    userName:    { type: String, required: true },
    description: { type: String, required: true },
    issueTitle:  { type: String, default: null },
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User",  default: null },
    issueId:     { type: mongoose.Schema.Types.ObjectId, ref: "Issue", default: null },
  },
  { timestamps: true }
);

// TTL index — auto-delete activities older than 90 days to keep collection clean
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model("Activity", activitySchema);