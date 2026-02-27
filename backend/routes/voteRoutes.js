const express = require("express");
const router = express.Router();
const {protect} = require("../middleware/authMiddleware");
const { voteIssue } = require("../controllers/voteController");


router.post("/:id/vote", protect, voteIssue);

module.exports = router;