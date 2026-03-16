import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { 
  BiSend, 
  BiCheckCircle, 
  BiUserCircle, 
  BiTimeFive,
  BiMessageSquareDetail,
  BiFilterAlt
} from "react-icons/bi";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); 
  
  const [commentText, setCommentText] = useState({});
  const [selectedUser, setSelectedUser] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [fbRes, userRes] = await Promise.all([
        fetch("http://localhost:5000/api/feedback/admin", { headers }),
        fetch("http://localhost:5000/api/users", { headers })
      ]);
      
      if (fbRes.ok) setFeedbacks(await fbRes.json());
      
      if (userRes.ok) {
        const allUsers = await userRes.json();
        const staffAndVolunteers = allUsers.filter(u => u.role === "admin" || u.role === "volunteer");
        setAssignableUsers(staffAndVolunteers);
      }
    } catch (err) {
      toast.error("Failed to load dashboard data");
    }
  };

  const handleAdminReply = async (fbId, authorId) => {
    const message = commentText[fbId];
    const targetUserId = selectedUser[fbId] || authorId;

    if (!message) return toast.error("Please enter a response message.");

    try {
      const res = await fetch(`http://localhost:5000/api/feedback/${fbId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ userId: targetUserId, message })
      });

      if (res.ok) {
        toast.success("Response and notification sent!");
        setCommentText({ ...commentText, [fbId]: "" });
        fetchData(); 
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to send response");
      }
    } catch (err) {
      toast.error("Network error. Try again.");
    }
  };

  const pendingCount = feedbacks.filter(f => !f.adminReply).length;
  const resolvedCount = feedbacks.length - pendingCount;

  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesCategory = categoryFilter === "all" || fb.category === categoryFilter;
    const matchesStatus = 
      statusFilter === "all" ? true : 
      statusFilter === "pending" ? !fb.adminReply : 
      !!fb.adminReply;
    return matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-4xl">
        
        {/* Dashboard Header & Stats */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BiMessageSquareDetail className="text-indigo-600" />
            Feedback Command Center
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-black text-slate-800">{feedbacks.length}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><BiFilterAlt size={20} /></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Action Needed</p>
                <p className="text-2xl font-black text-slate-800">{pendingCount}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><BiTimeFive size={20} /></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Resolved</p>
                <p className="text-2xl font-black text-slate-800">{resolvedCount}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><BiCheckCircle size={20} /></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm mb-6 gap-3">
          <div className="flex p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
            {['all', 'pending', 'resolved'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 sm:px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${
                  statusFilter === status 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <select 
            className="w-full sm:w-auto bg-slate-50 border-none text-slate-700 font-bold text-xs py-2 px-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Issue Related">Cleanup Issues</option>
            <option value="App Experience">App Experience</option>
          </select>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedbacks.map((fb) => (
            <div key={fb._id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-in fade-in duration-300">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <BiUserCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">@{fb.user?.username || "Unknown Citizen"}</h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {new Date(fb.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider ${
                  fb.category === "Issue Related" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {fb.category}
                </span>
              </div>
              
              {/* Feedback Body */}
              <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                <p className="text-slate-700 text-sm font-medium">"{fb.message}"</p>
              </div>

              {/* Action Area */}
              {fb.adminReply ? (
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex gap-3 items-center">
                  <div className="text-emerald-500"><BiCheckCircle size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Resolution Sent</p>
                    <p className="text-emerald-900 text-sm font-medium">{fb.adminReply}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5 ml-1">
                      Assign To / Mention
                    </label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-slate-50 text-slate-700 p-2.5 text-sm rounded-xl font-medium outline-none focus:bg-white focus:border-indigo-100 transition-colors"
                      value={selectedUser[fb._id] || (fb.user?._id || "")}
                      onChange={(e) => setSelectedUser({...selectedUser, [fb._id]: e.target.value})}
                    >
                      <option value={fb.user?._id}>Original Author (@{fb.user?.username || "User"})</option>
                      <option disabled>────── Staff & Volunteers ──────</option>
                      {assignableUsers.map(u => (
                        <option key={u._id} value={u._id}>
                          @{u.username} — {u.role.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Type your response..."
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-3 pr-24 text-slate-700 text-sm font-medium focus:bg-white focus:border-indigo-100 outline-none transition-colors"
                      value={commentText[fb._id] || ""}
                      onChange={(e) => setCommentText({...commentText, [fb._id]: e.target.value})}
                    />
                    <button 
                      onClick={() => handleAdminReply(fb._id, fb.user?._id)}
                      className="absolute right-1.5 top-1.5 bottom-1.5 bg-indigo-600 text-white px-4 text-sm rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center gap-1"
                    >
                      <BiSend size={16} />
                      Send
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
          
          {filteredFeedbacks.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">No feedback found.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminFeedback;