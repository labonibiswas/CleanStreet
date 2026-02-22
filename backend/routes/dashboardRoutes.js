const express = require("express");
const { getStats, getRecent } = require("../controllers/dashboardController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stats", getStats);
router.get("/recent", getRecent);

module.exports = router;