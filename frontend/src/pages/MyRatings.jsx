import { useState, useEffect, useMemo } from "react";
import { BiStar, BiTrophy, BiBarChartAlt2, BiUser, BiCheckShield } from "react-icons/bi";
import toast from "react-hot-toast";

const parseMessage = (rawStr) => {
  const tags = [];
  const regex = /\[(.*?)\]/g;
  let match;
  while ((match = regex.exec(rawStr)) !== null) { tags.push(match[1]); }
  
  // Extract the number from "[Star Rating: 5/5]"
  const starMatch = rawStr.match(/\[Star Rating: (\d+)\/5\]/);
  const numericRating = starMatch ? parseInt(starMatch[1]) : 0;
  
  const cleanText = rawStr.replace(/\[.*?\]/g, '').replace(/Details:\s*/i, '').trim();
  return { tags, cleanText, numericRating };
};

const MyRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRatings();
  }, []);

  const fetchMyRatings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/feedback/my-ratings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) setRatings(await res.json());
    } catch (err) {
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate Average Rating
  const stats = useMemo(() => {
    if (ratings.length === 0) return { avg: 0, total: 0 };
    const parsed = ratings.map(r => parseMessage(r.message).numericRating);
    const sum = parsed.reduce((a, b) => a + b, 0);
    return {
      avg: (sum / ratings.length).toFixed(1),
      total: ratings.length
    };
  }, [ratings]);

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-400">Analyzing your impact...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-black mb-1">Your Impact Score</h1>
              <p className="text-indigo-100 text-sm opacity-80">Real-time cleanup feedback from citizens</p>
              <div className="flex items-end gap-2 mt-6">
                <span className="text-6xl font-black">{stats.avg}</span>
                <div className="mb-2">
                  <div className="flex text-amber-400 text-xl mb-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < Math.round(stats.avg) ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Average Rating</p>
                </div>
              </div>
            </div>
            <BiTrophy className="absolute -right-4 -bottom-4 text-indigo-500 opacity-20" size={180} />
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
              <BiBarChartAlt2 size={24} />
            </div>
            <p className="text-3xl font-black text-slate-800">{stats.total}</p>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Reviews</p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-4">Recent Feedback</h2>
          {ratings.map((item) => {
            const { tags, cleanText, numericRating } = parseMessage(item.message);
            return (
              <div key={item._id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                      <BiUser size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">@{item.user?.username}</h4>
                      <p className="text-[10px] font-black text-indigo-500 uppercase">{item.complaintId?.title}</p>
                    </div>
                  </div>
                  <div className="text-amber-400 font-bold flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full text-xs">
                    <BiStar /> {numericRating}/5
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-4 italic">"{cleanText}"</p>

                <div className="flex flex-wrap gap-2">
                  {tags.filter(t => !t.includes("Star")).map((tag, i) => (
                    <span key={i} className="text-[10px] font-black bg-slate-50 text-slate-500 px-3 py-1 rounded-lg border border-slate-100 uppercase">
                      {tag}
                    </span>
                  ))}
                </div>

                {item.adminReply && (
                  <div className="mt-4 pt-4 border-t border-slate-50 flex gap-3">
                    <BiCheckShield className="text-emerald-500 shrink-0" size={18} />
                    <p className="text-xs text-slate-500"><span className="font-bold text-emerald-600">Admin:</span> {item.adminReply}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyRatings;