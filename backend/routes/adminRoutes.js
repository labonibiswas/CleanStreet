const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");

const adminController = require("../controllers/adminController");

router.get("/stats", protect, authorize("admin"), adminController.getStats);

router.get("/users", protect, authorize("admin"), adminController.getUsers);

router.put("/users/:id/role", protect, authorize("admin"), adminController.changeRole);

router.delete("/users/:id", protect, authorize("admin"), adminController.deleteUser);

router.get("/complaints", protect, authorize("admin"), adminController.getComplaints);

router.put("/complaints/:id/assign", protect, authorize("admin"), adminController.assignVolunteer);

router.get("/activities", protect, authorize("admin"), adminController.getActivities);

router.get("/report", protect, authorize("admin"), adminController.downloadReport);

module.exports = router;