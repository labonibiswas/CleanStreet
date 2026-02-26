const Comment = require("../models/Comment");

exports.createComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      issue: req.params.id,
      user: req.user._id,
      text: req.body.text,
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ issue: req.params.id }).populate(
      "user",
      "fullName username"
    );
    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};