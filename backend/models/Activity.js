const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
{
  action: {
    type: String,
    required: true
  },

  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  description: String
},
{ timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);