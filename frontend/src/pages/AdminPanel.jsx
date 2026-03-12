import { useEffect, useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import { Download, Users, FileText, Activity as ActIcon, LayoutDashboard, Filter, X, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const STATUS_COLORS = ["#F59E0B", "#3B82F6", "#10B981"]; 
const TYPE_COLORS = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#6B7280"];
const ROLE_COLORS = ["#6B7280", "#10B981", "#EF4444"]; 

const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2) return Infinity;
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [activities, setActivities] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [userLocationFilter, setUserLocationFilter] = useState("All");
  const [complaintStatusFilter, setComplaintStatusFilter] = useState("All");

  const token = localStorage.getItem("token");

  // Strictly extracts just the City name for clean tables
  const getCityOnly = (loc) => {
    if (!loc) return "City Not Provided";
    if (typeof loc === "object" && loc.city) return loc.city;
    
    // If it's a string, try to grab the first part before a comma (usually the city/area)
    if (typeof loc === "string" && loc.trim() !== "") {
      return loc.split(",")[0].trim(); 
    }
    return "City Not Provided";
  };

  const getCoords = (loc) => {
    if (!loc) return null;
    if (Array.isArray(loc) && loc.length >= 2) return [loc[0], loc[1]];
    if (loc.coordinates && Array.isArray(loc.coordinates)) return [loc.coordinates[0], loc.coordinates[1]];
    if (loc.lat !== undefined && loc.lng !== undefined) return [loc.lng, loc.lat];
    return null;
  };

  const fetchActivities = () => {
    fetch("http://localhost:5000/api/admin/activities", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setActivities(data); });
  };

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    fetch("http://localhost:5000/api/admin/stats", { headers })
      .then((res) => res.json())
      .then((data) => { if (data && !data.message) setStats(data); });

    fetch("http://localhost:5000/api/admin/users", { headers })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
          setVolunteers(data.filter((u) => u.role === "volunteer"));
        }
      });

    fetch("http://localhost:5000/api/admin/complaints", { headers })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setComplaints(data); });

    fetchActivities();
  }, [token]);

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter((u) => {
      const matchRole = userRoleFilter === "All" || u.role === userRoleFilter.toLowerCase();
      const locStr = getCityOnly(u.location);
      const matchLoc = userLocationFilter === "All" || (locStr && locStr.includes(userLocationFilter));
      return matchRole && matchLoc;
    });
  }, [users, userRoleFilter, userLocationFilter]);

  const filteredComplaints = useMemo(() => {
    if (!Array.isArray(complaints)) return [];
    return complaints.filter((c) => {
      return complaintStatusFilter === "All" || c.status === complaintStatusFilter;
    });
  }, [complaints, complaintStatusFilter]);

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
    fetchActivities(); 
  };

  const changeRole = async (userId, newRole) => {
    await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role: newRole }),
    });
    setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
    fetchActivities(); 
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await fetch(`http://localhost:5000/api/admin/users/${userId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.filter((u) => u._id !== userId));
    }
  };

  const logAndDownload = async (type) => {
    await fetch("http://localhost:5000/api/admin/report", { headers: { Authorization: `Bearer ${token}` } });
    fetchActivities(); 
    if (type === "pdf") downloadPDF();
    else downloadExcel();
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const rows = complaints.map((c) => [ c.title, getCityOnly(c.location || c.address), c.status, c.type || "N/A", new Date(c.createdAt).toLocaleDateString() ]);
    autoTable(doc, { head: [["Title", "City", "Status", "Type", "Date"]], body: rows });
    doc.save("complaints_report.pdf");
    setIsDownloadModalOpen(false);
  };

  const downloadExcel = () => {
    const formattedData = complaints.map((c) => ({
      Title: c.title, City: getCityOnly(c.location || c.address), Status: c.status, Type: c.type || "N/A", Date: new Date(c.createdAt).toLocaleString(),
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
      className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-medium transition-colors ${activeTab === id ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
    >
      <Icon className="w-4 h-4" /> {label}
      {count !== undefined && <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{count}</span>}
    </button>
  );

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen font-sans text-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview and management tools.</p>
        </div>
        <button onClick={() => setIsDownloadModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow transition">
          <Download className="w-4 h-4" /> Download Report
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6 border-b border-gray-200 mb-8 overflow-x-auto">
          <TabButton id="overview" icon={LayoutDashboard} label="Overview" />
          <TabButton id="users" icon={Users} label="Manage Users" count={Array.isArray(users) ? users.length : 0} />
          <TabButton id="complaints" icon={FileText} label="View Complaints" count={Array.isArray(complaints) ? complaints.length : 0} />
          <TabButton id="activities" icon={ActIcon} label="Recent Activities" />
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { title: "Total Users", value: stats.totalUsers || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
                { title: "Total Complaints", value: stats.totalComplaints || 0, icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
                { title: "Pending Complaints", value: stats.pending || 0, icon: ActIcon, color: "text-orange-500", bg: "bg-orange-100" },
                { title: "Resolved Complaints", value: stats.resolved || 0, icon: LayoutDashboard, color: "text-green-500", bg: "bg-green-100" },
              ].map((card, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${card.bg}`}><card.icon className={`w-6 h-6 ${card.color}`} /></div>
                  <div><p className="text-2xl font-bold">{card.value}</p><p className="text-xs text-gray-500 font-medium">{card.title}</p></div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-indigo-500" /> Complaint Status</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height={250} minHeight={250}>
                    <PieChart>
                      <Pie data={stats.statusDistribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                        {(stats.statusDistribution || []).map((e, i) => (<Cell key={`c-${i}`} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />))}
                      </Pie>
                      <Tooltip /><Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-pink-500" /> Complaint Types</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height={250} minHeight={250}>
                    <PieChart>
                      <Pie data={stats.complaintTypes || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={0} outerRadius={80}>
                        {(stats.complaintTypes || []).map((e, i) => (<Cell key={`c-${i}`} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />))}
                      </Pie>
                      <Tooltip /><Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-green-500" /> User Roles</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height={250} minHeight={250}>
                    <PieChart>
                      <Pie data={stats.userRoles || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={0} outerRadius={80}>
                        {(stats.userRoles || []).map((e, i) => (<Cell key={`c-${i}`} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />))}
                      </Pie>
                      <Tooltip /><Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><ActIcon className="w-4 h-4 text-indigo-500" /> Monthly Trends</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height={250} minHeight={250}>
                    <BarChart data={stats.monthlyTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                      <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "none" }} />
                      <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><ActIcon className="w-4 h-4 text-pink-500" /> Top Complaint Types</h3>
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

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div><h2 className="text-lg font-bold text-gray-800">User Management</h2></div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <Filter className="w-4 h-4" />
                  <select className="bg-transparent outline-none font-medium" value={userLocationFilter} onChange={(e) => setUserLocationFilter(e.target.value)}>
                    <option value="All">All Cities</option>
                    {[...new Set(
                      (Array.isArray(users) ? users : [])
                        .map((u) => getCityOnly(u.location))
                        .filter(loc => loc !== "City Not Provided")
                    )].map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <select className="bg-transparent outline-none font-medium" value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
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
                    <th className="px-6 py-4 font-medium">City</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                      <td className="px-6 py-4 text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 text-gray-500">{getCityOnly(user.location)}</td>
                      <td className="px-6 py-4">
                        {user.role === "admin" ? (
                          <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-full inline-block">Admin</span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => changeRole(user._id, e.target.value)}
                            className={`text-xs font-bold px-2 py-1 rounded-full border outline-none cursor-pointer ${
                              user.role === "volunteer" ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}
                          >
                            <option value="user">User</option>
                            <option value="volunteer">Volunteer</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 flex justify-center gap-3">
                        {user.role !== "admin" ? (
                          <button onClick={() => deleteUser(user._id)} className="text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                        ) : (<span className="text-gray-300">--</span>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COMPLAINTS TAB */}
        {activeTab === "complaints" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div><h2 className="text-lg font-bold text-gray-800">All Complaints</h2></div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <Filter className="w-4 h-4" />
                  <select className="bg-transparent outline-none font-medium" value={complaintStatusFilter} onChange={(e) => setComplaintStatusFilter(e.target.value)}>
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
                    <th className="px-6 py-4 font-medium">City</th>
                    <th className="px-6 py-4 font-medium text-center">Status</th>
                    <th className="px-6 py-4 font-medium">Assign Volunteer</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredComplaints.map((issue) => {
                    const iCity = getCityOnly(issue.location || issue.address);
                    const iCoords = getCoords(issue.location || issue.address);
                    
                    let nearbyVols = [];

                    if (!iCoords && iCity === "City Not Provided") {
                      nearbyVols = volunteers; // Failsafe
                    } else {
                      nearbyVols = volunteers.filter((v) => {
                        const vCoords = getCoords(v.location);
                        if (vCoords && iCoords && calculateDistance(vCoords, iCoords) <= 30) return true;
                        
                        const vCity = getCityOnly(v.location);
                        if (vCity !== "City Not Provided" && (vCity.toLowerCase().includes(iCity.toLowerCase()) || iCity.toLowerCase().includes(vCity.toLowerCase()))) return true;
                        
                        return false;
                      });
                    }

                    return (
                      <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{issue.title}</td>
                        <td className="px-6 py-4 text-gray-500">{iCity}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${
                              issue.status === "Pending" ? "bg-orange-50 text-orange-600 border-orange-200" :
                              issue.status === "In Progress" ? "bg-blue-50 text-blue-600 border-blue-200" :
                              "bg-green-50 text-green-600 border-green-200"
                            }`}>{issue.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className="text-xs font-medium border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-indigo-500 w-full max-w-[180px]"
                            value={issue.assignedTo?._id || ""}
                            onChange={(e) => assignVolunteer(issue._id, e.target.value)}
                          >
                            <option value="" disabled>Select Volunteer</option>
                            {nearbyVols.length === 0 && <option disabled>No volunteers in city</option>}
                            {nearbyVols.map((v) => (
                               <option key={v._id} value={v._id}>{v.username}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB: 1-LINE ACTIVITIES ─── */}
        {activeTab === "activities" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Recent Activity Log</h2>
            {Array.isArray(activities) && activities.length > 0 ? (
              <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {activities.map((act, index) => (
                  <li key={index} className="px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-gray-50 transition">
                    <div className="text-sm">
                      <span className="font-bold text-gray-900">{act.user}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className={`font-semibold ${act.action.includes("Resolved") ? "text-green-600" : "text-indigo-600"}`}>{act.action}</span>
                      <span className="text-gray-500 ml-2 hidden sm:inline">- {act.description}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                      {new Date(act.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 py-4">No recent activities found.</p>
            )}
          </div>
        )}
      </div>

      {isDownloadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsDownloadModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Download Report</h3>
            <p className="text-sm text-gray-500 mb-6">Choose your preferred format to download.</p>
            <div className="space-y-3">
              <button onClick={() => logAndDownload("excel")} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-green-100 hover:border-green-500 hover:bg-green-50 transition text-left group">
                <div className="bg-green-100 text-green-600 p-2.5 rounded-lg group-hover:bg-green-500 group-hover:text-white transition"><FileText className="w-6 h-6" /></div>
                <div><div className="font-bold text-gray-900">Excel (CSV)</div></div>
              </button>
              <button onClick={() => logAndDownload("pdf")} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-red-100 hover:border-red-500 hover:bg-red-50 transition text-left group">
                <div className="bg-red-100 text-red-600 p-2.5 rounded-lg group-hover:bg-red-500 group-hover:text-white transition"><FileText className="w-6 h-6" /></div>
                <div><div className="font-bold text-gray-900">PDF</div></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;