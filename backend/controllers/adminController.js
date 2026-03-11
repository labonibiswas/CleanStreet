const Issue = require("../models/Issue");
const User  = require("../models/User");


const logActivity = async (data) => {
  try {
    const Activity = require("../models/Activity");
    await Activity.create(data);
  } catch { /* skip */ }
};


const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${String(dt.getDate()).padStart(2,"0")} ${MON[dt.getMonth()]} ${dt.getFullYear()}`;
};


const getLast7DaysData = async () => {
  const data = await Issue.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return data.map(d => [d._id, d.count]);
};

const getMonthlyData = async () => {
  const data = await Issue.aggregate([
    { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return data.map(d => [M[(d._id ?? 1) - 1], d.count]);
};

const getLast30DaysReg = async () => {
  const data = await User.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return data.map(d => [d._id, d.count]);
};


// GET ADMIN DASHBOARD STATS
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers, citizens, volunteers, admins,
      totalComplaints, pendingComplaints, inReviewComplaints, resolvedComplaints,
      complaintTypes, last7Days, userRegistrations, monthlyTrends,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "citizen" }),
      User.countDocuments({ role: "volunteer" }),
      User.countDocuments({ role: "admin" }),
      Issue.countDocuments(),
      Issue.countDocuments({ status: "Pending" }),
      Issue.countDocuments({ status: "In Review" }),
      Issue.countDocuments({ status: "Resolved" }),
      Issue.aggregate([{ $group: { _id: { $toLower: "$issueType" }, count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Issue.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Issue.aggregate([{ $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    ]);

    res.status(200).json({
      stats: { totalUsers, totalComplaints, pendingComplaints, resolvedComplaints, inReviewComplaints },
      userRoles: { citizens, volunteers, admins },
      complaintTypes, last7Days, userRegistrations, monthlyTrends,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching admin dashboard data" });
  }
};


// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};


// UPDATE USER ROLE
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["citizen", "volunteer", "admin"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Block changing your own role 
    if (req.user?._id?.toString() === user._id.toString())
      return res.status(403).json({ message: "You cannot change your own role" });

    const prevRole = user.role;
    let resetCount = 0;

    // Volunteer or Admin → citizen: reset their active assigned complaints to Pending
    if ((prevRole === "volunteer" || prevRole === "admin") && role === "citizen") {
      const affected = await Issue.find({
        assignedTo: user._id,
        status: { $in: ["In Review", "Pending"] },
      });
      resetCount = affected.length;
      if (resetCount > 0) {
        await Issue.updateMany(
          { assignedTo: user._id, status: { $in: ["In Review", "Pending"] } },
          { $set: { assignedTo: null, status: "Pending", progress: 0 } }
        );
      }
    }

    user.role = role;
    await user.save();
    const updated = await User.findById(user._id).select("-password");

    await logActivity({
      type: "role_change",
      userName: req.user?.fullName || "Admin",
      description: `changed role of ${user.fullName} from ${prevRole} to ${role}${resetCount > 0 ? ` — ${resetCount} complaint(s) reset to Pending` : ""}`,
      userId: req.user?._id || null,
    });

    res.status(200).json({ user: updated, resetCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to update role" });
  }
};


// GET ALL COMPLAINTS 
const getAllComplaints = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("reportedBy", "fullName username")
      .populate("assignedTo",  "fullName username")
      .sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
};


// UPDATE COMPLAINT STATUS
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "In Review", "Resolved"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const progressMap = { Pending: 0, "In Review": 50, Resolved: 100 };

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status, progress: progressMap[status] },
      { new: true }
    )
      .populate("reportedBy", "fullName username")
      .populate("assignedTo",  "fullName username");

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    await logActivity({
      type: "status_change",
      userName: req.user?.fullName || "Admin",
      description: `changed status of "${issue.title}" to '${status}'`,
      issueTitle: issue.title,
      userId: req.user?._id || null,
      issueId: issue._id,
    });

    res.status(200).json(issue);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
};


// GET NEARBY VOLUNTEERS for a complaint
const getNearbyVolunteers = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const [lng, lat] = issue.location.coordinates;

    const volunteers = await User.find({
      role: "volunteer",
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 50000, // 50 km radius
        },
      },
    }).select("-password").limit(20);

    // Attach distance in km for display in the UI
    const withDist = volunteers.map((v) => {
      const [vLng, vLat] = v.location?.coordinates || [0, 0];
      const R = 6371;
      const dLat = ((vLat - lat) * Math.PI) / 180;
      const dLng = ((vLng - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((vLat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { ...v.toObject(), distKm: Math.round(distKm * 10) / 10 };
    });

    res.status(200).json(withDist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch nearby volunteers" });
  }
};


// ASSIGN COMPLAINT TO VOLUNTEER  
const assignComplaint = async (req, res) => {
  try {
    const { volunteerId } = req.body;

    const volunteer = await User.findById(volunteerId);
    if (!volunteer || volunteer.role !== "volunteer")
      return res.status(400).json({ message: "Invalid volunteer" });

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { assignedTo: volunteerId, status: "In Review", progress: 10 },
      { new: true }
    )
      .populate("reportedBy", "fullName username")
      .populate("assignedTo",  "fullName username");

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    await logActivity({
      type: "assigned",
      userName: req.user?.fullName || "Admin",
      description: `assigned "${issue.title}" to ${volunteer.fullName}`,
      issueTitle: issue.title,
      userId: volunteer._id,
      issueId: issue._id,
    });

    res.status(200).json(issue);
  } catch (err) {
    res.status(500).json({ message: "Failed to assign complaint" });
  }
};


// GET RECENT ACTIVITIES
const getRecentActivities = async (req, res) => {
  try {
    let acts = [];
    try {
      const Activity = require("../models/Activity");
      acts = await Activity.find().sort({ createdAt: -1 }).limit(50);
      if (acts.length > 0) return res.status(200).json(acts);
    } catch { /* Activity model not yet created */ }

    const issues = await Issue.find()
      .populate("reportedBy", "fullName")
      .populate("assignedTo",  "fullName")
      .sort({ updatedAt: -1 })
      .limit(30);

    acts = issues.map(issue => ({
      _id: issue._id,
      type: issue.status === "Resolved" ? "status_change"
           : issue.assignedTo           ? "assigned"
           :                              "new_complaint",
      userName: issue.reportedBy?.fullName || "Unknown",
      description: `Updated complaint "${issue.title}" status to '${issue.status}'`,
      issueTitle: issue.title,
      createdAt: issue.updatedAt,
    }));

    res.status(200).json(acts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};


// DOWNLOAD EXCEL REPORT
const downloadCSV = async (req, res) => {
  let XLSX;
  try {
    XLSX = require("xlsx");
  } catch {
    return res.status(500).json({ message: "xlsx not installed. Run: npm install xlsx" });
  }

  try {
    const [users, issues] = await Promise.all([
      User.find().select("-password"),
      Issue.find()
        .populate("reportedBy", "fullName")
        .populate("assignedTo",  "fullName"),
    ]);

    const pending  = issues.filter(i => i.status === "Pending").length;
    const inReview = issues.filter(i => i.status === "In Review").length;
    const resolved = issues.filter(i => i.status === "Resolved").length;

    const typeMap = {};
    issues.forEach(i => { const t = i.issueType || "Unknown"; typeMap[t] = (typeMap[t] || 0) + 1; });

    const roleCounts = { citizen: 0, volunteer: 0, admin: 0 };
    users.forEach(u => { if (roleCounts[u.role] !== undefined) roleCounts[u.role]++; });

    const [d7, mo, reg] = await Promise.all([getLast7DaysData(), getMonthlyData(), getLast30DaysReg()]);

    const wb = XLSX.utils.book_new();

    //Sheet 1: Summary — all statistics 
    const ws1 = XLSX.utils.aoa_to_sheet([
      ["Clean Street — Admin Statistical Report"],
      [`Generated: ${fmtDate(new Date())}  ${new Date().toLocaleTimeString()}`],
      [],
      ["=== SUMMARY STATISTICS ===", ""],
      ["Metric",            "Value"],
      ["Total Users",       users.length],
      ["Total Complaints",  issues.length],
      ["Pending",           pending],
      ["In Review",         inReview],
      ["Resolved",          resolved],
      [],
      ["=== COMPLAINT STATUS DISTRIBUTION ===", ""],
      ["Status",    "Count"],
      ["Pending",   pending],
      ["In Review", inReview],
      ["Resolved",  resolved],
      [],
      ["=== COMPLAINT TYPES DISTRIBUTION ===", ""],
      ["Type", "Count"],
      ...Object.entries(typeMap).sort((a, b) => b[1] - a[1]).map(([k, v]) => [
        k.charAt(0).toUpperCase() + k.slice(1), v,
      ]),
      [],
      ["=== USER ROLES DISTRIBUTION ===", ""],
      ["Role",       "Count"],
      ["Citizens",   roleCounts.citizen],
      ["Volunteers", roleCounts.volunteer],
      ["Admins",     roleCounts.admin],
      [],
      ["=== COMPLAINTS — LAST 7 DAYS ===", ""],
      ["Date", "Count"],
      ...(d7.length > 0 ? d7 : [["No data in last 7 days", "—"]]),
      [],
      ["=== MONTHLY COMPLAINT TRENDS ===", ""],
      ["Month", "Count"],
      ...(mo.length > 0 ? mo : [["No data", "—"]]),
      [],
      ["=== USER REGISTRATIONS — LAST 30 DAYS ===", ""],
      ["Date", "Count"],
      ...(reg.length > 0 ? reg : [["No registrations in last 30 days", "—"]]),
    ]);
    ws1["!cols"] = [{ wch: 40 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Summary");

    //Sheet 2: All Complaints
    const ws2 = XLSX.utils.aoa_to_sheet([
      ["Title", "Reported By", "Address", "Type", "Priority", "Status", "Assigned To", "Progress %", "Date"],
      ...issues.map(i => [
        i.title                || "",
        i.reportedBy?.fullName || "Unknown",
        i.address              || "",
        i.issueType            || "",
        i.priority             || "",
        i.status               || "Pending",
        i.assignedTo?.fullName || "Unassigned",
        i.progress             ?? 0,
        fmtDate(i.createdAt),
      ]),
    ]);
    ws2["!cols"] = [
      { wch: 34 }, { wch: 20 }, { wch: 30 }, { wch: 16 },
      { wch: 12 }, { wch: 14 }, { wch: 20 }, { wch: 12 }, { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, ws2, "Complaints");

    //Sheet 3: Users
    const ws3 = XLSX.utils.aoa_to_sheet([
      ["Full Name", "Username", "Email", "Phone", "Role", "Joined"],
      ...users.map(u => [
        u.fullName || "",
        u.username || "",
        u.email    || "",
        u.phone    || "",
        u.role     || "",
        fmtDate(u.createdAt),
      ]),
    ]);
    ws3["!cols"] = [
      { wch: 24 }, { wch: 18 }, { wch: 28 },
      { wch: 16 }, { wch: 12 }, { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, ws3, "Users");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="clean-street-report-${new Date().toISOString().split("T")[0]}.xlsx"`
    );
    res.send(buf);
  } catch (err) {
    console.error("Excel Error:", err);
    if (!res.headersSent) res.status(500).json({ message: "Failed to generate Excel report" });
  }
};


// DOWNLOAD PDF REPORT
const downloadPDF = async (req, res) => {
  let PDFDocument;
  try {
    PDFDocument = require("pdfkit");
  } catch {
    return res.status(500).json({ message: "pdfkit not installed. Run: npm install pdfkit" });
  }

  try {
    const [users, issues] = await Promise.all([
      User.find().select("-password"),
      Issue.find()
        .populate("reportedBy", "fullName")
        .populate("assignedTo",  "fullName"),
    ]);

    const pending  = issues.filter(i => i.status === "Pending").length;
    const inReview = issues.filter(i => i.status === "In Review").length;
    const resolved = issues.filter(i => i.status === "Resolved").length;

    const typeMap = {};
    issues.forEach(i => { const t = i.issueType || "Unknown"; typeMap[t] = (typeMap[t] || 0) + 1; });

    const roleCounts = { citizen: 0, volunteer: 0, admin: 0 };
    users.forEach(u => { if (roleCounts[u.role] !== undefined) roleCounts[u.role]++; });

    const chunks = [];
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    doc.on("data",  chunk => chunks.push(chunk));
    doc.on("error", err => {
      console.error("PDFKit error:", err);
      if (!res.headersSent) res.status(500).json({ message: "PDF generation error" });
    });
    doc.on("end", () => {
      const pdf = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", pdf.length);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="clean-street-report-${new Date().toISOString().split("T")[0]}.pdf"`
      );
      res.end(pdf);
    });

  
    const HR = () => {
      doc.moveDown(0.3)
         .moveTo(50, doc.y).lineTo(545, doc.y)
         .strokeColor("#E2E8F0").lineWidth(0.5).stroke()
         .moveDown(0.5);
    };

    const SECTION = (title) => {
      if (doc.y > 680) doc.addPage();
      doc.moveDown(0.5)
         .fontSize(13).fillColor("#334155").font("Helvetica-Bold").text(title)
         .moveDown(0.35);
    };

    const KV = (label, value, valColor = "#1E293B") => {
      doc.fontSize(10)
         .font("Helvetica").fillColor("#64748B").text(`${label}:   `, { continued: true })
         .font("Helvetica-Bold").fillColor(valColor).text(String(value ?? "—"));
    };

   
    doc.fontSize(24).fillColor("#1E293B").font("Helvetica-Bold").text("Clean Street", { align: "center" });
    doc.fontSize(13).fillColor("#6366F1").font("Helvetica-Bold").text("Admin Statistical Report", { align: "center" });
    doc.fontSize(9).fillColor("#94A3B8").font("Helvetica")
       .text(`Generated: ${fmtDate(new Date())}  ${new Date().toLocaleTimeString()}`, { align: "center" });
    doc.moveDown(1.2);
    HR();

    //Summary
    SECTION("Summary Statistics");
    KV("Total Users",      users.length);
    KV("Total Complaints", issues.length);
    KV("Pending",          pending,  "#D97706");
    KV("In Review",        inReview, "#4F46E5");
    KV("Resolved",         resolved, "#16A34A");
    HR();

    //Complaint Types
    SECTION("Complaint Types Distribution");
    Object.entries(typeMap).sort((a, b) => b[1] - a[1])
          .forEach(([k, v]) => KV(k.charAt(0).toUpperCase() + k.slice(1), v));
    HR();

    //User Roles
    SECTION("User Roles Distribution");
    KV("Citizens",   roleCounts.citizen);
    KV("Volunteers", roleCounts.volunteer);
    KV("Admins",     roleCounts.admin);
    HR();

    //Last 7 Days
    SECTION("Complaints — Last 7 Days");
    const d7 = await getLast7DaysData();
    d7.length === 0
      ? doc.fontSize(10).fillColor("#94A3B8").font("Helvetica").text("No complaints in the last 7 days.")
      : d7.forEach(([date, count]) => KV(date, count));
    HR();

    //Monthly Trends
    SECTION("Monthly Complaint Trends");
    const mo = await getMonthlyData();
    mo.length === 0
      ? doc.fontSize(10).fillColor("#94A3B8").font("Helvetica").text("No monthly data.")
      : mo.forEach(([month, count]) => KV(month, count));
    HR();

    //User Registrations
    SECTION("User Registrations — Last 30 Days");
    const reg = await getLast30DaysReg();
    reg.length === 0
      ? doc.fontSize(10).fillColor("#94A3B8").font("Helvetica").text("No registrations in the last 30 days.")
      : reg.forEach(([date, count]) => KV(date, count));
    HR();

    //All Complaints
    SECTION("All Complaints");
    issues.forEach((issue, idx) => {
      if (doc.y > 710) doc.addPage();
      const sc = issue.status === "Resolved"  ? "#16A34A"
               : issue.status === "In Review" ? "#4F46E5" : "#D97706";
      doc.fontSize(10)
         .font("Helvetica-Bold").fillColor("#1E293B")
         .text(`${idx + 1}. ${issue.title}`, { continued: true })
         .font("Helvetica").fillColor("#64748B")
         .text(`  ·  ${issue.issueType || "—"}  ·  ${issue.reportedBy?.fullName || "Unknown"}  ·  ${fmtDate(issue.createdAt)}  ·  `, { continued: true })
         .font("Helvetica-Bold").fillColor(sc)
         .text(issue.status || "Pending");
    });

    doc.end();

  } catch (err) {
    console.error("PDF Error:", err);
    if (!res.headersSent) res.status(500).json({ message: "Failed to generate PDF" });
  }
};





// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Block deleting another admin
    if (user.role === "admin")
      return res.status(403).json({ message: "Cannot delete an admin account" });

    // If volunteer — find their active assigned complaints and reset them
    let resetCount = 0;
    if (user.role === "volunteer") {
      const activeComplaints = await Issue.find({
        assignedTo: user._id,
        status: { $in: ["In Review", "Pending"] },
      });
      resetCount = activeComplaints.length;

      if (resetCount > 0) {
        await Issue.updateMany(
          { assignedTo: user._id, status: { $in: ["In Review", "Pending"] } },
          { $set: { assignedTo: null, status: "Pending", progress: 0 } }
        );
        await logActivity({
          type: "status_change",
          userName: req.user?.fullName || "Admin",
          description: `reset ${resetCount} complaint(s) to Pending after deleting volunteer "${user.fullName}"`,
          userId: req.user?._id,
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    await logActivity({
      type: "complaint_delete",
      userName: req.user?.fullName || "Admin",
      description: `deleted ${user.role} account "${user.fullName}" (${user.email})${resetCount > 0 ? ` — ${resetCount} complaint(s) reset to Pending` : ""}`,
      userId: req.user?._id,
    });

    res.status(200).json({
      message: "User deleted",
      resetCount,
    });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};


// CHECK VOLUNTEER BEFORE ROLE DOWNGRADE
const getVolunteerActiveCount = async (req, res) => {
  try {
    const count = await Issue.countDocuments({
      assignedTo: req.params.id,
      status: { $in: ["In Review", "Pending"] },
    });
    res.status(200).json({ activeCount: count });
  } catch (err) {
    res.status(500).json({ message: "Failed to check volunteer complaints" });
  }
};


// DELETE COMPLAINT
const deleteComplaint = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("reportedBy", "fullName")
      .populate("assignedTo",  "fullName");

    if (!issue) return res.status(404).json({ message: "Complaint not found" });

    await Issue.findByIdAndDelete(req.params.id);

    await logActivity({
      type: "complaint_delete",
      userName: req.user?.fullName || "Admin",
      description: `deleted complaint "${issue.title}" (reported by ${issue.reportedBy?.fullName || "Unknown"})`,
      issueTitle: issue.title,
      userId: req.user?._id,
      issueId: issue._id,
    });

    res.status(200).json({ message: "Complaint deleted" });
  } catch (err) {
    console.error("Delete complaint error:", err);
    res.status(500).json({ message: "Failed to delete complaint" });
  }
};


module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getAllComplaints,
  updateComplaintStatus,
  getNearbyVolunteers,
  assignComplaint,
  getRecentActivities,
  downloadCSV,
  downloadPDF,
  deleteUser, 
  getVolunteerActiveCount, 
  deleteComplaint
};