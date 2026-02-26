import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BiUpvote, BiDownvote } from "react-icons/bi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1gkutdgQHhRK_4bHIaWtDRkIgd1Fgquoj-g&s";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");

  // Fetch issue with backend data
  const fetchIssue = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/issues/${id}`);
      if (!res.ok) throw new Error("Failed to fetch issue");
      const data = await res.json();
      setIssue(data);
    } catch (err) {
      console.error("Error fetching issue:", err);
      setIssue(null);
    }
  };

  // Fetch comments from backend
  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${id}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchIssue();
      await fetchComments();
      setLoading(false);
    };
    loadData();
  }, [id]);

  //  Post new comment to backend
  const handleComment = async () => {
    if (!comment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/comments/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: comment }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      setComment("");
      fetchComments(); // refresh comments from backend
    } catch (err) {
      console.error(err);
      alert("Error posting comment");
    }
  };

  // Vote and fetch updated counts from backend
  const handleVote = async (type) => {
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
      setIssue((prev) => ({ ...prev, votes: updated.votes })); // update with backend counts
    } catch (err) {
      console.error(err);
      alert("Error voting");
    }
  };

  if (loading)
    return <div className="text-center py-20 text-slate-600">Loading...</div>;

  if (!issue)
    return <div className="text-center py-20">Issue not found</div>;

  const images = issue.imageUrls?.length > 0 ? issue.imageUrls : [DEFAULT_IMAGE];
  const upvotes = issue.votes?.upvotes || 0;
  const downvotes = issue.votes?.downvotes || 0;

  const coordinates = issue.location?.coordinates || [];
  const lat = coordinates[1];
  const lng = coordinates[0];

  const fullName = issue.reportedBy?.fullName || "Unknown User";
  const username = issue.reportedBy?.username || "U";
  const createdDate = new Date(issue.createdAt).toLocaleDateString();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* BACK BUTTON */}
        <div className="p-6">
          <button
            onClick={() => navigate("/complaints")}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
          >
            &larr; Go Back
          </button>
        </div>

        {/* IMAGE SCROLL */}
        <div className="px-6 pb-6">
          <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 no-scrollbar">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Issue"
                className="w-[350px] h-[220px] object-cover flex-shrink-0 rounded-xl snap-center shadow-md"
              />
            ))}
          </div>
        </div>

        <div className="p-10">
          {/* STATUS + PRIORITY */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-4 py-1 text-xs font-bold uppercase rounded-full bg-blue-100 text-blue-600">
              {issue.status}
            </span>
            <span className="px-4 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 uppercase">
              {issue.priority}
            </span>
          </div>

          {/* TITLE */}
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            {issue.title}
          </h1>

          {/* REPORTER INFO */}
          <div className="flex items-center gap-4 mt-4 mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{fullName}</p>
              <p className="text-sm text-slate-500">
                @{username} • Reported on {createdDate}
              </p>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-slate-700">Progress</span>
              <span className="text-slate-600">{issue.progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${issue.progress}%` }}
              />
            </div>
          </div>

          {/* ISSUE DETAILS */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div>
              <p className="text-sm text-slate-500">Issue Type</p>
              <p className="font-medium">{issue.issueType}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Address</p>
              <p className="font-medium">{issue.address}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Landmark</p>
              <p className="font-medium">{issue.landmark || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Last Updated</p>
              <p className="font-medium">
                {new Date(issue.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* DESCRIPTION */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Issue Description</h2>
            <p className="text-slate-600 leading-relaxed">
              {issue.description}
            </p>
          </section>

          {/* MAP */}
          {lat && lng && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Location</h2>
              <div className="rounded-2xl overflow-hidden border relative z-0">
                <MapContainer
                  center={[lat, lng]}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[lat, lng]}>
                    <Popup>{issue.title}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </section>
          )}

          {/* VOTING */}
          <section className="mb-10 border-t pt-6">
            <h2 className="text-2xl font-bold mb-6">Community Feedback</h2>
            <div className="flex items-center gap-10">
              <button
                onClick={() => handleVote("upvote")}
                className="flex items-center gap-2 text-slate-600 hover:text-indigo-600"
              >
                <BiUpvote size={26} />
                <span className="font-semibold">{upvotes}</span>
              </button>
              <button
                onClick={() => handleVote("downvote")}
                className="flex items-center gap-2 text-slate-600 hover:text-red-600"
              >
                <BiDownvote size={26} />
                <span className="font-semibold">{downvotes}</span>
              </button>
            </div>
          </section>

          {/* COMMENTS */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">
              Comments ({comments.length})
            </h2>

            <div className="flex gap-3 mb-8">
              <input
                type="text"
                placeholder="Write your comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-grow px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                onClick={handleComment}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Post
              </button>
            </div>

            <div className="space-y-4">
              {comments.map((c, index) => (
                <div key={index} className="bg-slate-50 p-5 rounded-xl shadow-sm">
                  <p className="font-semibold">{c.user?.fullName || "User"}</p>
                  <p className="text-slate-600 mt-2">{c.text}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;