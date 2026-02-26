const Vote = require("../models/Vote");
const Issue = require("../models/Issue");

// POST /api/votes/:id/vote
const voteIssue = async (req, res) => {
  const { voteType } = req.body; // "upvote" or "downvote"
  const issueId = req.params.id;
  const userId = req.user._id;

  try {
    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // Check if user has already voted
    let vote = await Vote.findOne({ issue: issueId, user: userId });

    if (vote) {
      vote.voteType = voteType; // update
      await vote.save();
    } else {
      vote = await Vote.create({ issue: issueId, user: userId, voteType });
    }

    // Count votes
    const upvotes = await Vote.countDocuments({ issue: issueId, voteType: "upvote" });
    const downvotes = await Vote.countDocuments({ issue: issueId, voteType: "downvote" });

    res.json({ _id: issue._id, votes: { upvotes, downvotes } });
  } catch (error) {
    console.error("VOTE ISSUE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { voteIssue };