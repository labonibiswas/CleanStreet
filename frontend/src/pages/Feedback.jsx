import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { BiChevronLeft, BiStar, BiDevices, BiCheckCircle, BiUpload, BiX, BiTask } from "react-icons/bi";
import toast from "react-hot-toast";

const Feedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [searchParams] = useSearchParams();
  const complaintIdFromUrl = searchParams.get("id");
  const complaintTitleFromUrl = searchParams.get("title");
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  const [complaintsList, setComplaintsList] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  const initialCategory = location.state?.prefillCategory || (complaintIdFromUrl ? "Complaint Resolution" : "");
  const initialStep = initialCategory ? 2 : 1;
  const initialRef = location.state?.complaintId || complaintIdFromUrl || "";

  const [step, setStep] = useState(initialStep);

  const [formData, setFormData] = useState({
    category: initialCategory,
    rating: 0, // This is for App Experience (Stars)
    comment: "",
    type: "Bug",
    platform: "Mobile App (iOS)",
    complaintRef: initialRef, // This will hold the complaint ID for "Complaint Resolution" feedback
    volunteerRating: 0, // NEW: Numeric rating for Volunteers
    resolutionSpeed: "Fast (1-2 Days)",
    workQuality: "Good",
  });

  // Star Rating Component for inner use
  const StarRating = ({ rating, setRating }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
            className="transform transition-all active:scale-90"
          >
            <BiStar
              size={32}
              className={(hover || rating) >= star ? "text-amber-400 fill-amber-400" : "text-slate-200"}
            />
          </button>
        ))}
      </div>
    );
  };

useEffect(() => {
  // 1. Priority: URL params (from Notification click)
  if (complaintIdFromUrl) {
    setFormData(prev => ({
      ...prev,
      category: "Complaint Resolution",
      complaintRef: complaintIdFromUrl,
    }));
    setStep(2);
  } 
  // 2. Secondary: Location State (from View Complaints button)
  else if (location.state?.prefillCategory === "Complaint Resolution") {
    setFormData(prev => ({
      ...prev,
      category: "Complaint Resolution",
      complaintRef: location.state.complaintId || "",
    }));
    setStep(2);
  }
}, [complaintIdFromUrl, location.state]);
  // NEW EFFECT: If we are pre-filling, we must also fetch the complaints list 
  // so the form doesn't error out when submitting.
  useEffect(() => {
    if (formData.category === "Complaint Resolution") {
      const fetchComplaints = async () => {
        setLoadingComplaints(true);
        try {
          const token = localStorage.getItem("token");
          const res = await fetch("http://localhost:5000/api/issues", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          // Filter to only show 'Resolved' complaints
          const resolvedComplaints = Array.isArray(data) 
            ? data.filter(c => c.status === "Resolved") 
            : [];
          setComplaintsList(resolvedComplaints);
        } catch (err) {
          toast.error("Could not load your complaints.");
        } finally {
          setLoadingComplaints(false);
        }
      };
      fetchComplaints();
    }
  }, [formData.category]);

  const selectCategory = (cat) => {
    setFormData({ ...formData, category: cat });
    setStep(2);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 3) return toast.error("Max 3 files allowed.");
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.comment.trim()) return toast.error("Please provide details.");
    if (formData.category === "Complaint Resolution" && !formData.complaintRef) return toast.error("Select a complaint.");

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      let formattedMessage = "";
      if (formData.category === "Complaint Resolution") {
        formattedMessage = `[Complaint Ref: ${formData.complaintRef}] [Star Rating: ${formData.volunteerRating}/5] [Speed: ${formData.resolutionSpeed}] [Quality: ${formData.workQuality}] Details: ${formData.comment}`;
      } else {
        formattedMessage = `[Type: ${formData.type}] [Platform: ${formData.platform}] [Star Rating: ${formData.rating}/5] Details: ${formData.comment}`;
      }

      const submitData = new FormData();
      submitData.append("message", formattedMessage);
      submitData.append("category", formData.category);

      if (formData.category === "Complaint Resolution") {
        const resolvedId = location.state?.complaintId || formData.complaintRef;
        submitData.append("complaintId", resolvedId);
      }

      files.forEach((f) => submitData.append("images", f));

      const response = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      if (response.ok) {
        toast.success("Feedback submitted!");
        setStep(3);
      } else {
        const errorData = await response.json();
        toast.error("Failed: " + errorData.message);
      }
    } catch (error) {
      toast.error("Server connection lost.");
    } finally {
      setLoading(false);
    }
  };


  const inputClasses = "w-full bg-slate-50 border-2 border-slate-50 text-slate-700 p-3 rounded-xl font-medium outline-none focus:bg-white focus:border-indigo-200 transition-colors";
  const labelClasses = "text-xs font-black text-slate-400 uppercase tracking-wider block mb-2 ml-1";
  const sectionTitleClasses = "text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 mt-6";

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 p-8 text-white">
          <h1 className="text-2xl font-black tracking-tight">Community Voice</h1>
          <p className="text-indigo-100 text-sm opacity-80 mt-1">
            {step === 1 && "Step 1: Choose a category"}
            {step === 2 && "Step 2: Share your experience"}
            {step === 3 && "Done!"}
          </p>
        </div>

        <div className="p-6 sm:p-10">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => selectCategory("Complaint Resolution")} className="group p-6 rounded-3xl border-2 border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all text-left">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BiTask size={28} className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-800">Complaint Resolution</h3>
                <p className="text-sm text-slate-500 mt-2">Rate a volunteer's work and cleanup quality.</p>
              </button>
              <button onClick={() => selectCategory("App Experience")} className="group p-6 rounded-3xl border-2 border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all text-left">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BiDevices size={28} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-800">App & General</h3>
                <p className="text-sm text-slate-500 mt-2">Glitch reports or feature ideas for developers.</p>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <button onClick={() => { navigate('/feedback', { replace: true }); setStep(1); }} className="flex items-center gap-1 text-slate-400 font-bold text-xs hover:text-indigo-600 mb-2 transition-colors">
                <BiChevronLeft size={18} /> {location.state?.prefillCategory ? "BACK TO COMPLAINTS" : "CHANGE CATEGORY"}
              </button>

              <form onSubmit={handleSubmit} className="space-y-4">
                {formData.category === "App Experience" && (
                  <>
                    <div className="flex flex-col items-center mb-4 pt-4">
                      <p className="text-sm font-bold text-slate-500 mb-2">Overall App Rating</p>
                      <StarRating rating={formData.rating} setRating={(val) => setFormData({ ...formData, rating: val })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClasses}>Feedback Type</label>
                        <select className={inputClasses} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                          <option value="Bug">Report a Bug / Crash</option>
                          <option value="Feature Request">Suggest a Feature</option>
                          <option value="General Praise">General Praise</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClasses}>Platform</label>
                        <select className={inputClasses} value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })}>
                          <option value="Mobile App (iOS)">Mobile App (iOS)</option>
                          <option value="Mobile App (Android)">Mobile App (Android)</option>
                          <option value="Web Browser">Web Browser</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {formData.category === "Complaint Resolution" && (
                  <>
                    <div className="flex flex-col items-center mb-4 pt-4">
                      <p className="text-sm font-bold text-slate-500 mb-2">Rate the Volunteer's Work</p>
                      <StarRating rating={formData.volunteerRating} setRating={(val) => setFormData({ ...formData, volunteerRating: val })} />
                    </div>
                    <h3 className={sectionTitleClasses}>Resolution Details</h3>
                    <div>
                      <label className={labelClasses}>Select Complaint</label>
                      
                      {/* If we have a Title from the URL or state, show a pretty read-only box */}
                      {(complaintTitleFromUrl || location.state?.complaintTitle) ? (
                        <div className="flex items-center justify-between bg-indigo-50 border-2 border-indigo-100 p-3 rounded-xl">
                          <span className="text-indigo-900 font-bold text-sm">
                             Reviewing: {complaintTitleFromUrl || location.state.complaintTitle}
                          </span>
                          <BiCheckCircle className="text-indigo-500" size={20} />
                        </div>
                      ) : (
                        /* Otherwise show the standard dropdown */
                        <select 
                          required 
                          className={inputClasses} 
                          value={formData.complaintRef} 
                          onChange={(e) => setFormData({ ...formData, complaintRef: e.target.value })}
                        >
                          <option value="">-- Choose a resolved complaint --</option>
                          {loadingComplaints ? <option disabled>Loading...</option> : complaintsList.map((c) => (
                            <option key={c._id} value={c._id}>{c.title}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className={labelClasses}>Resolution Speed</label>
                        <select className={inputClasses} value={formData.resolutionSpeed} onChange={(e) => setFormData({ ...formData, resolutionSpeed: e.target.value })}>
                          <option value="Very Fast (Same Day)">Very Fast (Same Day)</option>
                          <option value="Fast (1-2 Days)">Fast (1-2 Days)</option>
                          <option value="Average (3-5 Days)">Average (3-5 Days)</option>
                          <option value="Slow (Over a week)">Slow (Over a week)</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClasses}>Work Quality</label>
                        <select className={inputClasses} value={formData.workQuality} onChange={(e) => setFormData({ ...formData, workQuality: e.target.value })}>
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Average">Average</option>
                          <option value="Incomplete">Incomplete / Missed Spots</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <h3 className={sectionTitleClasses}>Description & Attachments</h3>
                <textarea className={`${inputClasses} resize-none min-h-[100px]`} placeholder="Additional comments..." required value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} />

                <div>
                  <label className={labelClasses}>Upload Photos (Max 3)</label>
                  <div onClick={() => fileInputRef.current.click()} className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                    <BiUpload size={24} className="mx-auto text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-500">Click to upload photos</span>
                    <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  </div>
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button type="button" onClick={() => removeFile(i)} className="hover:text-rose-500"><BiX size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button disabled={loading} className="w-full bg-slate-900 text-white py-4 mt-8 rounded-2xl font-bold text-lg hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50">
                  {loading ? "Submitting..." : "Submit Feedback"}
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center text-center py-10">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <BiCheckCircle size={64} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-3">Feedback Received</h2>
              <p className="text-slate-500 font-medium mb-8 max-w-md">Thank you for helping us keep our community clean!</p>
              <button onClick={() => navigate("/dashboard")} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all">Return to Dashboard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;