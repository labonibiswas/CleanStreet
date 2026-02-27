const Vote = require("../models/Vote");
const Issue = require("../models/Issue");

// POST /api/votes/:id/vote
const voteIssue = async (req, res) => {
  const { voteType } = req.body; // "upvote" or "downvote"
  const issueId = req.params.id;
  const userId = req.user._id;

  try {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const existingVote = await Vote.findOne({
      issue: issueId,
      user: userId,
    });

    //TOGGLE LOGIC
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await existingVote.deleteOne();
      } else {
        existingVote.voteType = voteType;
        await existingVote.save();
      }
    } else {
      await Vote.create({
        issue: issueId,
        user: userId,
        voteType,
      });
    }

    // Count votes
    const upvotes = await Vote.countDocuments({
      issue: issueId,
      voteType: "upvote",
    });

    const downvotes = await Vote.countDocuments({
      issue: issueId,
      voteType: "downvote",
    });

    // Return user's current vote also
    const userVoteDoc = await Vote.findOne({
      issue: issueId,
      user: userId,
    });

    res.json({
      _id: issueId,
      votes: {
        upvotes,
        downvotes,
        userVote: userVoteDoc ? userVoteDoc.voteType : null,
      },
    });
  } catch (error) {
    console.error("VOTE ISSUE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { voteIssue };