const Issue = require("../models/Issue");
const Vote = require("../models/Vote");

// Create Issue
const createIssue = async (req, res) => {
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

    const parsedLongitude = parseFloat(longitude);
    const parsedLatitude = parseFloat(latitude);

    if (isNaN(parsedLongitude) || isNaN(parsedLatitude)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const imageUrls = req.files?.map(file => file.path) || [];

    if (!req.user?._id) return res.status(401).json({ message: "User not authenticated" });

    const newIssue = new Issue({
      title,
      issueType,
      priority,
      address,
      landmark: landmark || "",
      description,
      imageUrls,
      location: { type: "Point", coordinates: [parsedLongitude, parsedLatitude] },
      reportedBy: req.user._id,
      progress: 0,
      status: "Pending",
    });

    await newIssue.save();

    res.status(201).json({ message: "Issue reported successfully", issue: newIssue });
  } catch (error) {
    console.error("CREATE ISSUE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all issues with vote counts
const getIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("reportedBy", "fullName username email")
      .sort({ createdAt: -1 });

    // Add votes
    const issuesWithVotes = await Promise.all(
      issues.map(async (issue) => {
        const upvotes = await Vote.countDocuments({ issue: issue._id, voteType: "upvote" });
        const downvotes = await Vote.countDocuments({ issue: issue._id, voteType: "downvote" });
        return { ...issue.toObject(), votes: { upvotes, downvotes } };
      })
    );

    res.status(200).json(issuesWithVotes);
  } catch (error) {
    console.error("GET ISSUES ERROR:", error);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

// Get single issue by ID
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate("reportedBy", "fullName username email");

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const upvotes = await Vote.countDocuments({ issue: issue._id, voteType: "upvote" });
    const downvotes = await Vote.countDocuments({ issue: issue._id, voteType: "downvote" });

    res.status(200).json({ ...issue.toObject(), votes: { upvotes, downvotes } });
  } catch (error) {
    console.error("GET ISSUE ERROR:", error);
    res.status(500).json({ message: "Failed to fetch issue" });
  }
};

module.exports = { createIssue, getIssues, getIssueById };