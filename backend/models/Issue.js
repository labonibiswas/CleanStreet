const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, // Clean up whitespace
    },

    issueType: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "critical"], 
    },

    address: {
      type: String,
      required: true,
    },

    landmark: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      required: true,
    },

    
    imageUrls: {
      type: [String], 
      default: [],
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

    // Relationship to pull User Name
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Must match the name used in your User model file
      required: true,
    },
    
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "In Review", "Resolved"], // Standardizes progress tracking
    },
    

    // Dynamic Progress Value
    progress: {
      type: Number,
      default: 0, // Starting point for new civic reports
      min: 0,
      max: 100,
    },

  

  },
  { timestamps: true } 

  
);

// Enable geospatial queries for maps
issueSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Issue", issueSchema);