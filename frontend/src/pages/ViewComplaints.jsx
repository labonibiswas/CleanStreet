import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BiUpvote, BiDownvote, BiComment, BiSearch, BiFilterAlt, BiUser, BiSort } from "react-icons/bi";

const DEFAULT_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1gkutdgQHhRK_4bHIaWtDRkIgd1Fgquoj-g&s";

const ViewComplaints = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [viewScope, setViewScope] = useState("All");

  const token = localStorage.getItem("token");

  const currentUser = useMemo(() => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }, [token]);

  useEffect(() => {
                  const fetchReports = async () => {
        try {
          setLoading(true);
          setError(null);
          let url = "http://localhost:5000/api/issues";

          if (viewScope === "Nearby") {
            url = "http://localhost:5000/api/issues/nearby";
          }

          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error("Failed to fetch");

          const data = await response.json();

        const reportsWithComments = await Promise.all(
          data.map(async (report) => {
            try {
              const resComments = await fetch(`http://localhost:5000/api/comments/${report._id}`);
              const commentsData = await resComments.json();
              return {
                ...report,
                comments: Array.isArray(commentsData) ? commentsData : [],
              };
            } catch {
              return { ...report, comments: [] };
            }
          })
        );
        setReports(Array.isArray(reportsWithComments) ? reportsWithComments : []);
      } catch (err) {
        setError("Unable to load reports.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [token, viewScope]);

  const handleVote = async (e, id, type) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:5000/api/votes/${id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType: type }),
      });
      if (!res.ok) throw new Error("Failed to vote");
      const updated = await res.json();
      setReports((prev) =>
        prev.map((report) =>
          report._id === id ? { ...report, votes: updated.votes } : report
        )
      );
    } catch (err) {
      alert("Error voting");
    }
  };

  const filteredReports = useMemo(() => {
    let filtered = [...reports];
    if (viewScope === "Mine" && currentUser) {
        filtered = filtered.filter((r) => 
            (r.reportedBy?._id === currentUser.id || r.reportedBy === currentUser.id) ||
            (r.reportedBy?._id === currentUser._id || r.reportedBy === currentUser._id)
        );
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter((r) => (r.status || "Pending") === statusFilter);
    }
    if (priorityFilter !== "All") {
      filtered = filtered.filter(
        (r) => r.priority && r.priority.toLowerCase() === priorityFilter.toLowerCase()
      );
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter((r) =>
        r.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    filtered.sort((a, b) => {
      const d1 = new Date(a.createdAt);
      const d2 = new Date(b.createdAt);
      return sortOrder === "Newest" ? d2 - d1 : d1 - d2;
    });
    return filtered;
  }, [reports, statusFilter, priorityFilter, searchTerm, sortOrder, viewScope, currentUser]);

  if (loading) return <div className="text-center py-20 text-slate-600 font-medium">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500 font-medium">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-6 pb-12 px-4">
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Community Issues</h1>
            <p className="text-slate-500 mt-1 text-md">Help us make the city cleaner and safer.</p>
          </div>

          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit">
            <button
              onClick={() => setViewScope("All")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                viewScope === "All" ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Public Feed
            </button>
            <button
              onClick={() => setViewScope("Mine")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                viewScope === "Mine" ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <BiUser size={14} /> My Reports
            </button>
                          {token && (
              <button
                onClick={() => setViewScope("Nearby")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  viewScope === "Nearby"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                Nearby
              </button>
            )}
          </div>
        </div>

        {/*FILTER BAR */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-4 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-stretch divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            
            <div className="flex-grow flex items-center px-4 py-2">
              <BiSearch className="text-slate-400 mr-2" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-700 text-sm font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="flex items-center px-3 py-2 min-w-[140px]">
                <span className="text-slate-400 mr-2 text-sm"><BiFilterAlt /></span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-[13px] font-bold text-slate-700 outline-none cursor-pointer w-full"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Review">In Review</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="flex items-center px-3 py-2 min-w-[140px]">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-transparent text-[13px] font-bold text-slate-700 outline-none cursor-pointer w-full"
                >
                  <option value="All">Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="flex items-center px-3 py-2 min-w-[140px] bg-slate-50/30">
                <span className="text-slate-400 mr-2 text-sm"><BiSort /></span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-transparent text-[13px] font-bold text-slate-700 outline-none cursor-pointer w-full"
                >
                  <option value="Newest">Newest</option>
                  <option value="Oldest">Oldest</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* COMPACT RESULTS INFO */}
        <div className="mb-4 px-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                {filteredReports.length} matches
            </span>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredReports.map((report, index) => {
            const fullName = report?.reportedBy?.fullName || "Unknown User";
            const username = report?.reportedBy?.username || "U";
            const createdDate = report?.createdAt ? new Date(report.createdAt).toLocaleDateString() : "Unknown";
            const images = report?.imageUrls?.length > 0 ? report.imageUrls : [DEFAULT_IMAGE];

            return (
              <div
                key={report?._id || index}
                onClick={() => navigate(`/complaint/${report._id}`)}
                className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col border border-slate-100"
              >
                {/* IMAGE AREA*/}
                <div className="relative h-48 overflow-hidden group">
                  <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-48">
                    {images.map((img, i) => (
                      <img key={i} src={img} alt="Report" className="w-full h-48 object-cover flex-shrink-0 snap-center" />
                    ))}
                  </div>
                  
                  {/* Swipe Message */}
                  {images.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full pointer-events-none">
                       <p className="text-[9px] text-white font-medium">Swipe for more</p>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-1.5">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${
                          report.status === "Pending"
                            ? "bg-orange-50 text-orange-600 border-orange-200"
                            : report.status === "In Review"
                            ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                            : report.status === "Resolved"
                            ? "bg-green-50 text-green-600 border-green-200"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {report.status || "Pending"}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-slate-50 text-slate-500 border border-slate-200">
                        {report.priority || "Low"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase text-slate-800 leading-none">{fullName}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{createdDate}</p>
                      </div>
                      <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        {username.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-md font-bold text-slate-800 mb-1 capitalize line-clamp-1">{report.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{report.description}</p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => handleVote(e, report._id, "upvote")}
                        className={`flex items-center gap-1 transition ${report.votes?.userVote === "upvote" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-indigo-600"}`}
                      >
                        <BiUpvote size={18} />
                        <span className="text-xs font-bold">{report.votes?.upvotes || 0}</span>
                      </button>

                      <button
                        onClick={(e) => handleVote(e, report._id, "downvote")}
                        className={`flex items-center gap-1 transition ${report.votes?.userVote === "downvote" ? "text-red-600 font-bold" : "text-slate-500 hover:text-red-600"}`}
                      >
                        <BiDownvote size={18} />
                        <span className="text-xs font-bold">{report.votes?.downvotes || 0}</span>
                      </button>

                      <div className="flex items-center gap-1 text-slate-400">
                        <BiComment size={16} />
                        <span className="text-xs font-bold">{report.comments?.length || 0}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Details →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ViewComplaints;