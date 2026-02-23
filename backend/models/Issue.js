const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    issueType: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    // ✅ Landmark OPTIONAL
    landmark: {
      type: String,
      default: "",
    },

    // ✅ Description REQUIRED
    description: {
      type: String,
      required: true,
    },

    // ✅ Image OPTIONAL
    imageUrl: {
      type: String,
      default: null,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

issueSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Issue", issueSchema);