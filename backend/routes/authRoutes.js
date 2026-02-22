const express = require("express");

const { registerUser, loginUser, changePassword, updateProfile } = require("../controllers/authController");

const protect = require("../middleware/authMiddleware"); 

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/change-password", protect, changePassword);
router.put("/update-profile", protect, updateProfile);

module.exports = router;
