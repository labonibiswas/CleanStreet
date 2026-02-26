const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createComment, getComments } = require("../controllers/commentController");

router.post("/:id", protect, createComment);
router.get("/:id", getComments);

module.exports = router;