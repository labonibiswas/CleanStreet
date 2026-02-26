const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const protect = require("../middleware/authMiddleware");
const { createIssue, getIssues, getIssueById } = require("../controllers/issueController");

router.post("/", protect, upload.array("images", 4), createIssue);
router.get("/", getIssues);
router.get("/:id", getIssueById);

module.exports = router;