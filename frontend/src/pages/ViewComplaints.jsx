import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BiUpvote, BiDownvote, BiComment } from "react-icons/bi";

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

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/issues");
        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();

        // Fetch comments count for each report
        const reportsWithComments = await Promise.all(
          data.map(async (report) => {
            try {
              const resComments = await fetch(
                `http://localhost:5000/api/comments/${report._id}`
              );
              const commentsData = await resComments.json();
              return { ...report, comments: commentsData };
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
  }, []);

  // VOTE FUNCTION 
const handleVote = async (e, id, type) => {
  e.stopPropagation();

  try {
    const token = localStorage.getItem("token");

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
    console.error("Voting failed", err);
    alert("Error voting");
  }
};
  const filteredReports = useMemo(() => {
    let filtered = [...reports];

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
  }, [reports, statusFilter, priorityFilter, searchTerm, sortOrder]);

  if (loading)
    return (
      <div className="text-center py-20 text-slate-600">
        Loading community reports...
      </div>
    );

  if (error)
    return (
      <div className="text-center py-20 text-red-500">{error}</div>
    );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2">
            Community Reports
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Browse and track issues reported by the community.
          </p>
        </div>

        {/* SEARCH + FILTERS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-10">
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="All">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Newest">Newest First</option>
              <option value="Oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredReports.map((report, index) => {
            const fullName = report?.reportedBy?.fullName || "Unknown User";
            const username = report?.reportedBy?.username || "U";

            const createdDate = report?.createdAt
              ? new Date(report.createdAt).toLocaleDateString()
              : "Unknown Date";

            const status = report?.status || "Pending";
            const priority = report?.priority || "Low";

            const images =
              report?.imageUrls?.length > 0
                ? report.imageUrls
                : [DEFAULT_IMAGE];

           
            const upvotes = report?.votes?.upvotes || 0;
            const downvotes = report?.votes?.downvotes || 0;

            const commentsCount = report?.comments?.length || 0;

            return (
              <div
                key={report?._id || index}
                onClick={() => navigate(`/complaint/${report._id}`)}
                className="bg-white rounded-3xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden flex flex-col"
              >
                {/* IMAGE SCROLL */}
                <div className="relative h-56 overflow-hidden">
                  <div className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth no-scrollbar h-56">
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Report"
                        className="w-full h-56 object-cover flex-shrink-0 snap-center"
                      />
                    ))}
                  </div>

                  {images.length > 1 && (
                    <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-white/80 px-3 py-1 rounded-full text-slate-600 font-medium">
                      Swipe to view more ({images.length})
                    </p>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-blue-100 text-blue-600">
                        {status}
                      </span>
                      <span className="ml-2 px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
                        {priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase text-slate-800">
                          {fullName}
                        </p>
                        <p className="text-[10px] text-slate-400">{createdDate}</p>
                      </div>

                      <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow">
                        {username.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-2 capitalize">
                    {report.title}
                  </h3>

                  <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                    {report.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={(e) => handleVote(e, report._id, "upvote")}
                        className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition"
                      >
                        <BiUpvote size={20} />
                        <span>{upvotes}</span>
                      </button>

                      <button
                        onClick={(e) => handleVote(e, report._id, "downvote")}
                        className="flex items-center gap-1 text-slate-600 hover:text-red-600 transition"
                      >
                        <BiDownvote size={20} />
                        <span>{downvotes}</span>
                      </button>

                      {/* COMMENT ICON */}
                      <div className="flex items-center gap-1 text-slate-600">
                        <BiComment size={20} />
                        <span>{commentsCount}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/complaint/${report._id}`);
                      }}
                      className="text-sm font-semibold text-indigo-600 hover:underline"
                    >
                      View Details →
                    </button>
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