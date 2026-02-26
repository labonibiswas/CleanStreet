import { useEffect, useState, useRef } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Eye,
  Pencil,
  Trash2,
  Send,
  X,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ArrowRight,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react";

/* ───────────────────────── Helper: Time Ago ───────────────────────── */
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

/* ───────── Helper: Status Config ───────── */
const statusConfig = {
  Pending: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    dot: "bg-amber-400",
    ring: "ring-amber-100",
  },
  "In Review": {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    dot: "bg-blue-400",
    ring: "ring-blue-100",
  },
  Resolved: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
    ring: "ring-emerald-100",
  },
};

/* ───────── Helper: Priority Config ───────── */
const priorityConfig = {
  low: { bg: "bg-slate-100", text: "text-slate-600", label: "Low" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium" },
  high: { bg: "bg-orange-100", text: "text-orange-700", label: "High" },
  critical: { bg: "bg-red-100", text: "text-red-700", label: "Critical" },
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  Image Gallery — always-visible dots + counter badge               */
/* ═══════════════════════════════════════════════════════════════════ */
const ImageGallery = ({ images, height = "h-52" }) => {
  const [idx, setIdx] = useState(0);
  const count = images?.length || 0;

  if (count === 0) {
    return (
      <div className={`w-full ${height} bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-300`}>
        <Eye className="h-8 w-8 mb-2" />
        <span className="text-sm font-medium">No images provided</span>
      </div>
    );
  }

  return (
    <div className="relative group rounded-2xl overflow-hidden">
      <img
        src={images[idx]}
        alt={`Evidence ${idx + 1}`}
        className={`w-full ${height} object-cover transition-all duration-500`}
      />
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

      {/* Image counter badge — always visible */}
      {count > 1 && (
        <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {idx + 1} / {count}
        </span>
      )}

      {/* Nav arrows */}
      {count > 1 && (
        <>
          <button
            onClick={() => setIdx((p) => (p === 0 ? count - 1 : p - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          >
            <ChevronLeft className="h-4 w-4 text-slate-700" />
          </button>
          <button
            onClick={() => setIdx((p) => (p === count - 1 ? 0 : p + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          >
            <ChevronRight className="h-4 w-4 text-slate-700" />
          </button>

          {/* Dots — always visible */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`block rounded-full transition-all duration-300 ${
                  i === idx ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  Details Modal — full info + comments live here now                 */
/* ═══════════════════════════════════════════════════════════════════ */
const DetailsModal = ({ report, comments, onAddComment, onClose }) => {
  const [commentText, setCommentText] = useState("");
  const inputRef = useRef(null);
  const commentsEndRef = useRef(null);

  if (!report) return null;
  const status = statusConfig[report.status] || statusConfig["Pending"];
  const priority = priorityConfig[report.priority] || priorityConfig["low"];

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    onAddComment(report._id, commentText.trim());
    setCommentText("");
    setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Sticky Header ── */}
        <div className="flex-shrink-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-slate-800">Report Details</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition text-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Image */}
          <ImageGallery images={report.imageUrls} height="h-64" />

          {/* Title */}
          <h3 className="text-xl font-extrabold text-slate-800 capitalize leading-snug">
            {report.title}
          </h3>

          {/* All Badges — status + priority + type shown here */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ring-1 ${status.bg} ${status.text} ${status.ring}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {report.status || "Pending"}
            </span>
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold ring-1 ring-transparent ${priority.bg} ${priority.text}`}>
              {priority.label} Priority
            </span>
            {report.issueType && (
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 capitalize">
                {report.issueType}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="bg-slate-50/70 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Description
            </p>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>
          </div>

          {/* Location & Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50/70 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Location
              </p>
              <p className="text-sm font-medium text-slate-700 flex items-start gap-1.5">
                <MapPin className="h-4 w-4 mt-0.5 text-indigo-500 flex-shrink-0" />
                {report.address}
              </p>
            </div>
            {report.landmark && (
              <div className="bg-slate-50/70 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Landmark
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {report.landmark}
                </p>
              </div>
            )}
          </div>

          {/* Reporter */}
          <div className="flex items-center gap-3 bg-slate-50/70 rounded-2xl p-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
              {report.reportedBy?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">
                {report.reportedBy?.name || "Anonymous"}
              </p>
              <p className="text-xs text-slate-400">
                Reported on{" "}
                {new Date(report.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Progress — only show when > 0 */}
          {(report.progress || 0) > 0 && (
            <div className="bg-slate-50/70 rounded-2xl p-4">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                <span>Resolution Progress</span>
                <span className="text-indigo-600">{report.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    report.status === "Resolved"
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                      : "bg-gradient-to-r from-indigo-400 to-indigo-600"
                  }`}
                  style={{ width: `${report.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Comments Section — lives inside modal now ── */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Comments ({comments.length})
            </p>

            {comments.length > 0 ? (
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1 mb-3">
                {comments.map((c, i) => (
                  <div key={i} className="flex gap-3 group/comment">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 text-[11px] font-bold flex-shrink-0 mt-0.5">
                      {c.author?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0 bg-slate-50/70 rounded-2xl px-4 py-3">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <p className="text-xs font-bold text-slate-700">
                          {c.author || "You"}
                        </p>
                        <p className="text-[10px] text-slate-300 font-medium">{c.time}</p>
                      </div>
                      <p className="text-sm text-slate-600 break-words leading-relaxed">
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50/50 rounded-2xl mb-3">
                <MessageCircle className="h-6 w-6 text-slate-200 mx-auto mb-1.5" />
                <p className="text-xs text-slate-400 font-medium">
                  No comments yet. Start the conversation.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Sticky Comment Input Footer ── */}
        <div className="flex-shrink-0 border-t border-slate-100 px-6 py-4 bg-white rounded-b-3xl">
          <div className="flex items-center gap-2.5">
            <input
              ref={inputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment..."
              className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />
            <button
              onClick={handleSubmit}
              disabled={!commentText.trim()}
              className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition flex-shrink-0 shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  Edit Modal                                                        */
/* ═══════════════════════════════════════════════════════════════════ */
const EditModal = ({ report, onClose, onSave }) => {
  const [title, setTitle] = useState(report.title);
  const [description, setDescription] = useState(report.description);
  const [address, setAddress] = useState(report.address);

  const handleSave = () => {
    onSave(report._id, { title, description, address });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Edit Report</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none transition"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-[0.98] transition shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  Delete Confirmation Modal                                         */
/* ═══════════════════════════════════════════════════════════════════ */
const DeleteModal = ({ report, onClose, onDelete }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
      <div className="mx-auto h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-800">Delete Report?</h3>
      <p className="text-sm text-slate-500 mt-2 mb-6">
        This will permanently remove <strong>"{report.title}"</strong>. This
        action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onDelete(report._id);
            onClose();
          }}
          className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 active:scale-[0.98] transition shadow-sm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════ */
/*  Complaint Card — clean, sculptured, minimal                       */
/* ═══════════════════════════════════════════════════════════════════ */
const ComplaintCard = ({
  report,
  likes,
  dislikes,
  commentCount,
  onLike,
  onDislike,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const status = statusConfig[report.status] || statusConfig["Pending"];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col group/card">
      {/* ── Card Header ── */}
      <div className="px-5 pt-4 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
            {report.reportedBy?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">
              {report.reportedBy?.name || "Anonymous"}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              {timeAgo(report.createdAt)}
            </p>
          </div>
        </div>

        {/* Status badge — the ONLY badge on the card */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ring-1 ${status.bg} ${status.text} ${status.ring}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot} animate-pulse`} />
          {report.status || "Pending"}
        </span>
      </div>

      {/* ── Image ── */}
      <div className="px-3 pb-1">
        <ImageGallery images={report.imageUrls} />
      </div>

      {/* ── Content ── */}
      <div className="px-5 pt-3 pb-2 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-[15px] font-bold text-slate-800 capitalize leading-snug mb-1">
          {report.title}
        </h3>

        {/* Description — 2-line clamp */}
        <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-2 mb-3 flex-1">
          {report.description}
        </p>

        {/* Location pill */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
          <MapPin className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
          <span className="truncate font-medium">{report.address}</span>
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="px-5 py-3 border-t border-slate-100/80 flex items-center justify-between">
        {/* Left: reactions */}
        <div className="flex items-center gap-0.5">
          {/* Like */}
          <button
            onClick={() => onLike(report._id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-90 ${
              likes.active
                ? "bg-indigo-50 text-indigo-600 shadow-inner"
                : "text-slate-400 hover:bg-slate-50 hover:text-indigo-600"
            }`}
          >
            <ThumbsUp className={`h-3.5 w-3.5 ${likes.active ? "fill-indigo-600" : ""}`} />
            <span>{likes.count}</span>
          </button>

          {/* Dislike */}
          <button
            onClick={() => onDislike(report._id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-90 ${
              dislikes.active
                ? "bg-red-50 text-red-500 shadow-inner"
                : "text-slate-400 hover:bg-slate-50 hover:text-red-500"
            }`}
          >
            <ThumbsDown className={`h-3.5 w-3.5 ${dislikes.active ? "fill-red-500" : ""}`} />
            <span>{dislikes.count}</span>
          </button>

          {/* Comment count — clicking opens details modal */}
          <button
            onClick={() => onViewDetails(report)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-90"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{commentCount}</span>
          </button>

          {/* 3-dot menu */}
          <div className="relative ml-0.5">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="h-7 w-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition"
            >
              <MoreHorizontal className="h-4 w-4 text-slate-300" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute left-0 bottom-8 z-20 bg-white rounded-xl shadow-xl border border-slate-100 py-1 w-32">
                  <button
                    onClick={() => { onEdit(report); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 transition"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => { onDelete(report); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Read More */}
        <button
          onClick={() => onViewDetails(report)}
          className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-all active:scale-95 group/btn"
        >
          Read More
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  Main Page                                                         */
/* ═══════════════════════════════════════════════════════════════════ */
const ViewComplaints = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local state maps
  const [likesMap, setLikesMap] = useState({});
  const [dislikesMap, setDislikesMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({});

  // Modals
  const [viewReport, setViewReport] = useState(null);
  const [editReport, setEditReport] = useState(null);
  const [deleteReport, setDeleteReport] = useState(null);

  /* ── Fetch Reports ── */
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/issues");
        const data = await response.json();
        setReports(data);

        const lm = {}, dm = {}, cm = {};
        data.forEach((r) => {
          lm[r._id] = { count: 0, active: false };
          dm[r._id] = { count: 0, active: false };
          cm[r._id] = [];
        });
        setLikesMap(lm);
        setDislikesMap(dm);
        setCommentsMap(cm);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  /* ── Handlers ── */
  const handleLike = (id) => {
    setLikesMap((prev) => {
      const cur = prev[id];
      return {
        ...prev,
        [id]: { count: cur.active ? cur.count - 1 : cur.count + 1, active: !cur.active },
      };
    });
    setDislikesMap((prev) =>
      prev[id]?.active ? { ...prev, [id]: { count: prev[id].count - 1, active: false } } : prev
    );
  };

  const handleDislike = (id) => {
    setDislikesMap((prev) => {
      const cur = prev[id];
      return {
        ...prev,
        [id]: { count: cur.active ? cur.count - 1 : cur.count + 1, active: !cur.active },
      };
    });
    setLikesMap((prev) =>
      prev[id]?.active ? { ...prev, [id]: { count: prev[id].count - 1, active: false } } : prev
    );
  };

  const handleAddComment = (id, text) => {
    setCommentsMap((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), { author: "You", text, time: "Just now" }],
    }));
  };

  const handleSaveEdit = (id, updates) => {
    setReports((prev) => prev.map((r) => (r._id === id ? { ...r, ...updates } : r)));
  };

  const handleDelete = (id) => {
    setReports((prev) => prev.filter((r) => r._id !== id));
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">
            Loading community reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ── Page Header ── */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Community Reports
          </h1>
          <p className="mt-2 text-slate-500 font-medium text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Browse issues reported by the community, share your opinion, and
            track their progress.
          </p>
        </div>

        {/* ── Reports Grid ── */}
        {reports.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <MessageCircle className="h-7 w-7 text-slate-300" />
            </div>
            <p className="text-lg font-semibold text-slate-400">
              No reports found
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Be the first to report an issue in your community.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <ComplaintCard
                key={report._id}
                report={report}
                likes={likesMap[report._id] || { count: 0, active: false }}
                dislikes={dislikesMap[report._id] || { count: 0, active: false }}
                commentCount={(commentsMap[report._id] || []).length}
                onLike={handleLike}
                onDislike={handleDislike}
                onViewDetails={setViewReport}
                onEdit={setEditReport}
                onDelete={setDeleteReport}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {viewReport && (
        <DetailsModal
          report={viewReport}
          comments={commentsMap[viewReport._id] || []}
          onAddComment={handleAddComment}
          onClose={() => setViewReport(null)}
        />
      )}
      {editReport && (
        <EditModal
          report={editReport}
          onClose={() => setEditReport(null)}
          onSave={handleSaveEdit}
        />
      )}
      {deleteReport && (
        <DeleteModal
          report={deleteReport}
          onClose={() => setDeleteReport(null)}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
};

export default ViewComplaints;