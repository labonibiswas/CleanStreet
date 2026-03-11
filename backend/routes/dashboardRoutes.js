const express = require("express");
const { getStats, getRecent } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stats", protect, getStats);
router.get("/recent", protect, getRecent);

module.exports = router;