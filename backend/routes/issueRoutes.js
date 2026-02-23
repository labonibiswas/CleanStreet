const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const Issue = require("../models/Issue");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      issueType,
      priority,
      address,
      landmark,
      description,
      longitude,
      latitude,
    } = req.body;

    
    if (!title || !issueType || !priority || !address || !description || !longitude || !latitude) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newIssue = new Issue({
      title,
      issueType,
      priority,
      address,
      landmark: landmark || "", 
      description,
      imageUrl: req.file ? req.file.path : null, 
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      reportedBy: req.user.id,
    });

    await newIssue.save();

    res.status(201).json({
      message: "Issue reported successfully",
      issue: newIssue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;