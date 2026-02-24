const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const Issue = require("../models/Issue");
const protect = require("../middleware/authMiddleware");

// POST: Create a new issue with multiple images
router.post("/", protect, upload.array("images", 4), async (req, res) => {
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

    // Validation
    if (!title || !issueType || !priority || !address || !description || !longitude || !latitude) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Process multiple images
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const newIssue = new Issue({
      title,
      issueType,
      priority,
      address,
      landmark: landmark || "", 
      description,
      imageUrls: imageUrls, 
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      reportedBy: req.user.id, // Links the issue to the logged-in user
      progress: 0, // Set to 0 to match your current frontend screenshot
    });

    await newIssue.save();

    res.status(201).json({
      message: "Issue reported successfully",
      issue: newIssue,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET: Fetch all reports with User Name populated
router.get("/", async (req, res) => {
  try {
    // .populate replaces the user ID with the actual user 'name' string
    const issues = await Issue.find()
      .populate("reportedBy", "name") 
      .sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
});

module.exports = router;