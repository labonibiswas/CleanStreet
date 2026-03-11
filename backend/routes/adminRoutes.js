const express = require("express");
const router  = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getVolunteerActiveCount,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
  getNearbyVolunteers,
  assignComplaint,
  getRecentActivities,
  downloadCSV,
  downloadPDF,
} = require("../controllers/adminController");

const adminOnly = [protect, authorize("admin")];

//Dashboard
router.get("/dashboard", ...adminOnly, getAdminStats);

//Users
router.get   ("/users",                        ...adminOnly, getAllUsers);
router.patch ("/users/:id/role",               ...adminOnly, updateUserRole);
router.get   ("/users/:id/volunteer-check",    ...adminOnly, getVolunteerActiveCount);
router.delete("/users/:id",                    ...adminOnly, deleteUser);

//Complaints
router.get   ("/complaints",                         ...adminOnly, getAllComplaints);
router.patch ("/complaints/:id/status",              ...adminOnly, updateComplaintStatus);
router.get   ("/complaints/:id/nearby-volunteers",   ...adminOnly, getNearbyVolunteers);
router.patch ("/complaints/:id/assign",              ...adminOnly, assignComplaint);
router.delete("/complaints/:id",                     ...adminOnly, deleteComplaint);

//Activities
router.get("/activities", ...adminOnly, getRecentActivities);

//Reports
router.get("/report/csv", ...adminOnly, downloadCSV);
router.get("/report/pdf", ...adminOnly, downloadPDF);

module.exports = router;