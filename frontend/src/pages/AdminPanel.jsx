import { useEffect, useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import { Download, Users, FileText, Activity, LayoutDashboard, Filter, X, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Custom theme colors
const STATUS_COLORS = ["#F59E0B", "#3B82F6", "#10B981"]; 
const TYPE_COLORS = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981"];
const ROLE_COLORS = ["#6B7280", "#10B981", "#EF4444"]; 

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [activities, setActivities] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  // Modal State
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Filter States
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [userLocationFilter, setUserLocationFilter] = useState("All");
  const [complaintTypeFilter, setComplaintTypeFilter] = useState("All");
  const [complaintStatusFilter, setComplaintStatusFilter] = useState("All");

  const token = localStorage.getItem("token");

  // Helper function to safely parse location objects (Prevents React crashes)
  const getLocationString = (loc) => {
    if (!loc) return "";
    if (typeof loc === "string") return loc;
    if (typeof loc === "object") {
      if (loc.address) return loc.address;
      if (loc.coordinates && Array.isArray(loc.coordinates)) {
        return `[${loc.coordinates[0]}, ${loc.coordinates[1]}]`;
      }
      return "Map Location";
    }
    return String(loc);
  };

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    fetch("http://localhost:5000/api/admin/stats", { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.message) setStats(data);
      })
      .catch((err) => console.error("Failed to fetch stats:", err));

    fetch("http://localhost:5000/api/admin/users", { headers })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
          setVolunteers(data.filter((u) => u.role === "volunteer"));
        }
      })
      .catch((err) => console.error("Failed to fetch users:", err));

    fetch("http://localhost:5000/api/admin/complaints", { headers })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setComplaints(data);
      })
      .catch((err) => console.error("Failed to fetch complaints:", err));

    fetch("http://localhost:5000/api/admin/activities", { headers })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setActivities(data);
      })
      .catch((err) => console.error("Failed to fetch activities:", err));
  }, [token]);

  // Derived filtered data
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter((u) => {
      const matchRole = userRoleFilter === "All" || u.role === userRoleFilter.toLowerCase();
      const locStr = getLocationString(u.location);
      const matchLoc = userLocationFilter === "All" || (locStr && locStr.includes(userLocationFilter));
      return matchRole && matchLoc;
    });
  }, [users, userRoleFilter, userLocationFilter]);

  const filteredComplaints = useMemo(() => {
    if (!Array.isArray(complaints)) return [];
    return complaints.filter((c) => {
      const matchType = complaintTypeFilter === "All" || c.type === complaintTypeFilter;
      const matchStatus = complaintStatusFilter === "All" || c.status === complaintStatusFilter;
      return matchType && matchStatus;
    });
  }, [complaints, complaintTypeFilter, complaintStatusFilter]);

  // Actions
  const assignVolunteer = async (issueId, volunteerId) => {
    if (!volunteerId) return;
    await fetch(`http://localhost:5000/api/admin/complaints/${issueId}/assign`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ volunteerId }),
    });
    setComplaints((prev) =>
      prev.map((c) => (c._id === issueId ? { ...c, status: "In Progress", assignedTo: { _id: volunteerId } } : c))
    );
  };

  const changeRole = async (userId, newRole) => {
    await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role: newRole }),
    });
    setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== userId));
    }
  };

  // Downloads
  const downloadPDF = () => {
    const doc = new jsPDF();
    const rows = complaints.map((c) => [
      c.title,
      c.address,
      c.status,
      c.type || "N/A",
      new Date(c.createdAt).toLocaleDateString(),
    ]);
    autoTable(doc, {
      head: [["Title", "Location", "Status", "Type", "Date"]],
      body: rows,
    });
    doc.save("complaints_report.pdf");
    setIsDownloadModalOpen(false);
  };

  const downloadExcel = () => {
    const formattedData = complaints.map((c) => ({
      Title: c.title,
      Location: c.address,
      Status: c.status,
      Type: c.type || "N/A",
      Date: new Date(c.createdAt).toLocaleString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Complaints");
    XLSX.writeFile(workbook, "complaints_report.xlsx");
    setIsDownloadModalOpen(false);
  };

  const TabButton = ({ id, icon: Icon, label, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-medium transition-colors ${
        activeTab === id
          ? "border-indigo-600 text-indigo-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count !== undefined && (
        <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{count}</span>
      )}
    </button>
  );

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview and management tools.</p>
        </div>
        <button
          onClick={() => setIsDownloadModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow transition"
        >
          <Download className="w-4 h-4" />
          Download Report
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-8 overflow-x-auto">
          <TabButton id="overview" icon={LayoutDashboard} label="Overview" />
          <TabButton id="users" icon={Users} label="Manage Users" count={Array.isArray(users) ? users.length : 0} />
          <TabButton id="complaints" icon={FileText} label="View Complaints" count={Array.isArray(complaints) ? complaints.length : 0} />
          <TabButton id="activities" icon={Activity} label="Recent Activities" />
        </div>

        {/* ─── TAB: OVERVIEW ─── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { title: "Total Users", value: stats.totalUsers || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
                { title: "Total Complaints", value: stats.totalComplaints || 0, icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
                { title: "Pending Complaints", value: stats.pending || 0, icon: Activity, color: "text-orange-500", bg: "bg-orange-100" },
                { title: "Resolved Complaints", value: stats.resolved || 0, icon: LayoutDashboard, color: "text-green-500", bg: "bg-green-100" },
              ].map((card, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${card.bg}`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-gray-500 font-medium">{card.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-lg font-bold mt-8 mb-4">Statistics & Analytics</h2>

            {/* Pie Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-500" /> Complaint Status Distribution
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height={250} minHeight={250}>
                    <PieChart>
                      <Pie data={stats.statusDistribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                        {(stats.statusDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-pink-500" /> Complaint Types
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height={250} minHeight={250}>
                    <PieChart>
                      <Pie data={stats.complaintTypes || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={0} outerRadius={80}>
                        {(stats.complaintTypes || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-green-500" /> User Roles
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height={250} minHeight={250}>
                    <PieChart>
                      <Pie data={stats.userRoles || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={0} outerRadius={80}>
                        {(stats.userRoles || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bar Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" /> Monthly Complaint Trends (6 Months)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height={250} minHeight={250}>
                    <BarChart data={stats.monthlyTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                      <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                      <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-pink-500" /> Top 3 Complaint Types
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height={250} minHeight={250}>
                    <BarChart data={stats.topComplaintTypes || []} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "#374151", fontSize: 12 }} width={100} />
                      <Tooltip cursor={{ fill: "transparent" }} />
                      <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: USERS ─── */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-800">User Management</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Showing {filteredUsers.length} of {Array.isArray(users) ? users.length : 0} users
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <Filter className="w-4 h-4" />
                  <select
                    className="bg-transparent outline-none font-medium"
                    value={userLocationFilter}
                    onChange={(e) => setUserLocationFilter(e.target.value)}
                  >
                    <option value="All">All Locations</option>
                    {[...new Set(
                      (Array.isArray(users) ? users : [])
                        .map((u) => getLocationString(u.location))
                        .filter(Boolean)
                    )].map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <select
                    className="bg-transparent outline-none font-medium"
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
                    <option value="All">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                      <td className="px-6 py-4 text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 text-gray-500">{getLocationString(user.location) || "N/A"}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => changeRole(user._id, e.target.value)}
                          className={`text-xs font-bold px-2 py-1 rounded-full border outline-none cursor-pointer ${
                            user.role === "admin" ? "bg-red-50 text-red-600 border-red-200" :
                            user.role === "volunteer" ? "bg-green-50 text-green-600 border-green-200" :
                            "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="volunteer">Volunteer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 flex justify-center gap-3">
                        <button onClick={() => deleteUser(user._id)} className="text-gray-400 hover:text-red-500 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB: COMPLAINTS ─── */}
        {activeTab === "complaints" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-800">All Complaints</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Showing {filteredComplaints.length} of {Array.isArray(complaints) ? complaints.length : 0} complaints
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <Filter className="w-4 h-4" />
                  <select
                    className="bg-transparent outline-none font-medium"
                    value={complaintStatusFilter}
                    onChange={(e) => setComplaintStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Title</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium text-center">Status</th>
                    <th className="px-6 py-4 font-medium">Assigned To</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredComplaints.map((issue) => {
                    const regionVols = volunteers.filter((v) => {
                       const vLoc = getLocationString(v.location);
                       return vLoc === issue.address || !vLoc;
                    });
                    return (
                      <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{issue.title}</td>
                        <td className="px-6 py-4 text-gray-500">{issue.address}</td>
                        <td className="px-6 py-4 text-gray-500">{issue.type || "General"}</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${
                              issue.status === "Pending" ? "bg-orange-50 text-orange-600 border-orange-200" :
                              issue.status === "In Progress" ? "bg-blue-50 text-blue-600 border-blue-200" :
                              "bg-green-50 text-green-600 border-green-200"
                            }`}
                          >
                            {issue.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className="text-xs font-medium border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-indigo-500 w-full"
                            value={issue.assignedTo?._id || ""}
                            onChange={(e) => assignVolunteer(issue._id, e.target.value)}
                          >
                            <option value="" disabled>Unassigned</option>
                            {regionVols.map((v) => (
                              <option key={v._id} value={v._id}>{v.username}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {new Date(issue.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB: ACTIVITIES ─── */}
        {activeTab === "activities" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Recent Activities</h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {Array.isArray(activities) && activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-100 text-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-gray-900">{activity.performedBy?.username || "System"}</div>
                        <time className="font-medium text-xs text-gray-500">
                          {new Date(activity.createdAt).toLocaleString()}
                        </time>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-indigo-600">{activity.action}</span> -{" "}
                        {activity.description}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recent activities to display.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── DOWNLOAD MODAL ─── */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsDownloadModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-1">Download Report</h3>
            <p className="text-sm text-gray-500 mb-6">
              Choose your preferred format to download the statistical report.
            </p>

            <div className="space-y-3">
              <button
                onClick={downloadExcel}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-green-100 hover:border-green-500 hover:bg-green-50 transition text-left group"
              >
                <div className="bg-green-100 text-green-600 p-2.5 rounded-lg group-hover:bg-green-500 group-hover:text-white transition">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Excel (CSV)</div>
                  <div className="text-xs text-gray-500">Download as CSV file for Excel/Sheets</div>
                </div>
              </button>

              <button
                onClick={downloadPDF}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-red-100 hover:border-red-500 hover:bg-red-50 transition text-left group"
              >
                <div className="bg-red-100 text-red-600 p-2.5 rounded-lg group-hover:bg-red-500 group-hover:text-white transition">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">PDF</div>
                  <div className="text-xs text-gray-500">Download as formatted PDF document</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;