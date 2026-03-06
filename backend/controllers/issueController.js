const Issue = require("../models/Issue");
const Vote = require("../models/Vote");
const User = require("../models/User");

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

    const userId = req.user?._id;

    const issuesWithVotes = await Promise.all(
      issues.map(async (issue) => {
        const upvotes = await Vote.countDocuments({
          issue: issue._id,
          voteType: "upvote",
        });

        const downvotes = await Vote.countDocuments({
          issue: issue._id,
          voteType: "downvote",
        });

        let userVote = null;

        if (userId) {
          const existingVote = await Vote.findOne({
            issue: issue._id,
            user: userId,
          });

          if (existingVote) {
            userVote = existingVote.voteType;
          }
        }

        return {
          ...issue.toObject(),
          votes: { upvotes, downvotes, userVote },
        };
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
    const issue = await Issue.findById(req.params.id)
      .populate("reportedBy", "fullName username email");

    if (!issue)
      return res.status(404).json({ message: "Issue not found" });

    const upvotes = await Vote.countDocuments({
      issue: issue._id,
      voteType: "upvote",
    });

    const downvotes = await Vote.countDocuments({
      issue: issue._id,
      voteType: "downvote",
    });

    const userId = req.user?._id;

    let userVote = null;

    if (userId) {
      const existingVote = await Vote.findOne({
        issue: issue._id,
        user: userId,
      });

      if (existingVote) {
        userVote = existingVote.voteType;
      }
    }

    res.status(200).json({
      ...issue.toObject(),
      votes: { upvotes, downvotes, userVote },
    });
  } catch (error) {
    console.error("GET ISSUE ERROR:", error);
    res.status(500).json({ message: "Failed to fetch issue" });
  }
};

// DELETE ISSUE
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // SECURITY CHECK: Does the ID from the Token match the ID of the creator?
    if (issue.reportedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete this" });
    }

    await issue.deleteOne();
    res.json({ message: "Issue removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE ISSUE (Edit)
const updateIssue = async (req, res) => {
  try {
    let issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    
    let updatedImageUrls = [];
    if (req.body.imageUrls) {
      updatedImageUrls = typeof req.body.imageUrls === 'string' 
        ? JSON.parse(req.body.imageUrls) 
        : req.body.imageUrls;
    }

    
    if (req.files && req.files.length > 0) {
      const newUploads = req.files.map(file => file.path);
      updatedImageUrls = [...updatedImageUrls, ...newUploads];
    }

  
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      issueType: req.body.issueType,
      priority: req.body.priority,
      address: req.body.address,
      landmark: req.body.landmark,
      imageUrls: updatedImageUrls, 
      location: {
        type: "Point",
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
      }
    };

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { returnDocument: 'after', runValidators: true }
    );

    res.json(updatedIssue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// Get complaints within 20km for a volunteer

const getNearbyComplaints = async (req, res) => {
  try {
    const volunteer = await User.findById(req.user.id);
    console.log("Volunteer Location:", volunteer.location.coordinates);

    const nearbyIssues = await Issue.find({
      status: "Pending",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: volunteer.location.coordinates,
          },
          $maxDistance: 20000, 
        },
      },
    }).populate("reportedBy", "fullName username"); 

    console.log("Found Issues:", nearbyIssues.length);
    
    return res.status(200).json(nearbyIssues); 

  } catch (error) {
    console.error("Error in nearby complaints:", error);
    res.status(500).json({ message: error.message });
  }
};

// Handle Accept/Reject action
const respondToComplaint = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  try {
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    if (action === "accept") {
      if (issue.status !== "Pending") {
        return res.status(400).json({ message: "Only pending complaints can be accepted" });
      }

      const updated = await Issue.findByIdAndUpdate(
        id,
        {
          status: "In Review",
          assignedTo: req.user.id,
          progress: 10,
        },
        { new: true }
      );
      return res.status(200).json({ message: "Complaint accepted", issue: updated });
    }

    if (action === "reject") {
      if (issue.status !== "In Review") {
        return res.status(400).json({ message: "Only in-review complaints can be released" });
      }
      if (!issue.assignedTo || issue.assignedTo.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: "You can only release complaints assigned to you" });
      }

      const updated = await Issue.findByIdAndUpdate(
        id,
        { status: "Pending", assignedTo: null, progress: 0 },
        { new: true }
      );
      return res.status(200).json({ message: "Complaint released", issue: updated });
    }

    res.status(400).json({ message: "Invalid action. Use 'accept' or 'reject'" });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};



module.exports = { createIssue, getIssues, getIssueById, getNearbyComplaints, updateIssue,  deleteIssue, respondToComplaint};