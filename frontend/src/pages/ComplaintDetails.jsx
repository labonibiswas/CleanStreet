import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  BiUpvote, BiDownvote, BiArrowBack, BiMap, BiTimeFive, 
  BiInfoCircle, BiNavigation, BiTargetLock, 
  BiCategoryAlt, BiCalendarCheck, BiTrendingUp, BiEditAlt, BiTrash
} from "react-icons/bi";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon, shadowUrl: markerShadow,
});

const DEFAULT_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1gkutdgQHhRK_4bHIaWtDRkIgd1Fgquoj-g&s";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const token = localStorage.getItem("token");

  const getCurrentUserId = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      return payload.id;
    } catch (e) { return null; }
  };

  const currentUserId = getCurrentUserId();
  const isOwner = issue && issue.reportedBy?._id === currentUserId;

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIssue(data);
      
      const commRes = await fetch(`http://localhost:5000/api/comments/${id}`);
      const commData = await commRes.json();
      setComments(Array.isArray(commData) ? commData : []);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleVote = async (type) => {
    try {
      const res = await fetch(`http://localhost:5000/api/votes/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ voteType: type }),
      });
      const updated = await res.json();
      setIssue((prev) => (prev ? { ...prev, votes: updated.votes } : prev));
    } catch (err) { alert("Error voting"); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Permanent delete?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/issues/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) navigate("/complaints");
    } catch (err) { alert("Delete failed"); }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      await fetch(`http://localhost:5000/api/comments/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: comment }),
      });
      setComment("");
      const commRes = await fetch(`http://localhost:5000/api/comments/${id}`);
      const commData = await commRes.json();
      setComments(Array.isArray(commData) ? commData : []);
    } catch (err) { alert("Error posting comment"); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-slate-500 font-medium">Loading details...</div>;
  if (!issue) return <div className="flex items-center justify-center min-h-screen text-slate-500">Issue not found</div>;

  const images = issue.imageUrls?.length > 0 ? issue.imageUrls : [DEFAULT_IMAGE];

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-800 pb-8">
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {/* HEADER*/}
      <header className="bg-white px-5 py-2.5 border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/complaints")} className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors font-semibold text-sm">
              <BiArrowBack size={18} /> Back
            </button>
            
            {isOwner && (
              <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
                <button 
                  onClick={() => navigate(`/edit-complaint/${id}`)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-bold hover:bg-indigo-100 transition-all"
                >
                  <BiEditAlt size={14} /> Edit
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-bold hover:bg-red-100 transition-all"
                >
                  <BiTrash size={14} /> Delete
                </button>
              </div>
            )}
          </div>
          
          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button onClick={() => handleVote("upvote")} className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${issue.votes?.userVote === 'upvote' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              <BiUpvote size={16} /> <span className="text-sm font-bold">{issue.votes?.upvotes || 0}</span>
            </button>
            <button onClick={() => handleVote("downvote")} className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${issue.votes?.userVote === 'downvote' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              <BiDownvote size={16} /> <span className="text-sm font-bold">{issue.votes?.downvotes || 0}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-sm">
            <div className="flex gap-2 mb-3">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-indigo-50 text-indigo-700">{issue.status}</span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-slate-100 text-slate-600">{issue.priority}</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-4 leading-snug">{issue.title}</h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
                {(issue.reportedBy?.username || "U").charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-medium">
                <span className="text-indigo-600 font-semibold">{issue.reportedBy?.fullName || "Anonymous"}</span>
                <span className="mx-2 text-slate-300">|</span>
                <span className="text-slate-500 text-xs inline-flex items-center gap-1"><BiTimeFive /> {new Date(issue.createdAt).toLocaleDateString()}</span>
              </p>
            </div>

            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {images.map((img, i) => (
                  <img key={i} src={img} alt="Evidence" className="h-32 w-52 object-cover rounded-lg border border-slate-200 flex-shrink-0" />
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                <BiInfoCircle className="text-indigo-500" /> Description
              </h3>
              <p className="text-base text-slate-600 leading-relaxed font-normal">{issue.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 border-t border-slate-100">
              <div className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Type</p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <BiCategoryAlt className="text-indigo-500" /> {issue.issueType}
                </div>
              </div>
              <div className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Landmark</p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <BiTargetLock className="text-red-400" /> {issue.landmark || "N/A"}
                </div>
              </div>
              <div className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Progress</p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <BiTrendingUp className="text-green-500" /> {issue.progress}%
                </div>
              </div>
              <div className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Updated</p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <BiCalendarCheck className="text-blue-400" /> {new Date(issue.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <BiMap className="text-red-500" /> Location Details
            </div>
            {issue.location?.coordinates && (
              <div className="h-36 w-full relative z-0">
                <MapContainer center={[issue.location.coordinates[1], issue.location.coordinates[0]]} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <Marker position={[issue.location.coordinates[1], issue.location.coordinates[0]]} />
                </MapContainer>
              </div>
            )}
            <div className="p-3.5"><p className="text-xs font-medium text-slate-600 leading-normal">{issue.address}</p></div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-[400px] shadow-sm">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Discussion ({comments.length})</h3>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar">
              {comments.map((c, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-md bg-slate-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                    {(c.user?.username || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 w-full">
                    <p className="text-[11px] font-semibold text-indigo-600 mb-0.5">{c.user?.fullName || "User"}</p>
                    <p className="text-xs text-slate-600 leading-snug">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t bg-white">
              <div className="relative">
                <input type="text" placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium" />
                <button onClick={handleComment} className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600"><BiNavigation size={18} className="rotate-90" /></button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComplaintDetails;