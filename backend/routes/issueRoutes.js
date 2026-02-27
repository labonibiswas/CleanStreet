const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {protect, authorize} = require("../middleware/authMiddleware");
const { createIssue, getIssues, getIssueById, getNearbyComplaints, updateIssue, deleteIssue, respondToComplaint } = require("../controllers/issueController");

router.post("/", protect, upload.array("images", 4), createIssue);
router.get("/", protect, getIssues);
router.get("/nearby", protect, authorize("volunteer"), getNearbyComplaints);
router.get("/:id", protect, getIssueById);
router.put("/:id", protect, upload.array("images"), updateIssue);
router.delete("/:id", protect, deleteIssue)


// Route to accept/reject a task
router.patch("/:id/respond", protect, authorize("volunteer"), respondToComplaint);

module.exports = router;