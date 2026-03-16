import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiChevronLeft, BiStar, BiTrash, BiDevices, BiCheckCircle } from "react-icons/bi";
import toast from "react-hot-toast";

const Feedback = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // State updated to handle both form types
  const [formData, setFormData] = useState({ 
    category: "", 
    rating: 0, 
    comment: "",
    location: "", 
    type: "Bug"   
  });

  const selectCategory = (cat) => {
    setFormData({ ...formData, category: cat });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.comment.trim()) {
      return toast.error("Please provide some details before submitting.");
    }
    if (formData.category === "Issue Related" && !formData.location.trim()) {
      return toast.error("Please provide a location or landmark.");
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      // Format the data so the backend just sees one combined "message" string
      const formattedMessage = formData.category === "Issue Related" 
        ? `[Location: ${formData.location}] ${formData.comment}` 
        : `[Type: ${formData.type}] [Rating: ${formData.rating} Stars] ${formData.comment}`;

      const response = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({ 
          message: formattedMessage,   
          category: formData.category  
        }),
      });

      if (response.ok) {
        toast.success("Feedback submitted successfully!"); 
        // Reset form to defaults
        setFormData({ category: "", rating: 0, comment: "", location: "", type: "Bug" });
        setHover(0);
        setStep(3); // Move to success screen
      } else {
        const errorData = await response.json();
        toast.error("Failed: " + errorData.message);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("Server connection lost. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
        
        {/* Header Branding */}
        <div className="bg-indigo-600 p-8 text-white">
          <h1 className="text-2xl font-black tracking-tight">Community Voice</h1>
          <p className="text-indigo-100 text-sm font-medium opacity-80">
            {step === 1 && "Step 1 of 2: Choose Topic"}
            {step === 2 && "Step 2 of 2: Share Details"}
            {step === 3 && "Submission Complete"}
          </p>
        </div>

        <div className="p-8 sm:p-12">
          
          {/* STEP 1: Category Selection */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">What's on your mind?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => selectCategory("Issue Related")}
                  className="group p-6 rounded-3xl border-2 border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BiTrash size={24} className="text-rose-600" />
                  </div>
                  <h3 className="font-bold text-slate-800">Cleanup Quality</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Feedback regarding specific reported issues or work done.</p>
                </button>

                <button 
                  onClick={() => selectCategory("App Experience")}
                  className="group p-6 rounded-3xl border-2 border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BiDevices size={24} className="text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-800">App & General</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Suggestions for the app, bugs, or general praise.</p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Conditional Forms */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-slate-400 font-bold text-xs hover:text-indigo-600 mb-6 transition-colors">
                <BiChevronLeft size={18} /> BACK TO TOPICS
              </button>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* --- FORM A: APP EXPERIENCE --- */}
                {formData.category === "App Experience" && (
                  <>
                    <div className="flex flex-col items-center mb-6">
                      <p className="text-sm font-bold text-slate-500 mb-2">How would you rate the app?</p>
                      <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setFormData({ ...formData, rating: star })}
                            className="transform transition-all active:scale-90"
                          >
                            <BiStar size={44} className={(hover || formData.rating) >= star ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2 ml-1">Feedback Type</label>
                      <select 
                        className="w-full bg-slate-50 border-2 border-slate-50 text-slate-700 p-3 rounded-xl font-medium outline-none focus:bg-white focus:border-indigo-100 transition-colors"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="Bug">Report a Bug</option>
                        <option value="Feature Request">Suggest a Feature</option>
                        <option value="General Praise">General Praise</option>
                      </select>
                    </div>
                  </>
                )}

                {/* --- FORM B: ISSUE RELATED --- */}
                {formData.category === "Issue Related" && (
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2 ml-1">Location or Landmark</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g., Main Street Park, or Issue #1234"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 text-slate-700 font-medium focus:bg-white focus:border-indigo-100 outline-none transition-all"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                )}

                {/* --- SHARED TEXT AREA --- */}
                <div className="relative pt-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2 ml-1">Details</label>
                  <textarea
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 text-slate-700 font-medium focus:bg-white focus:border-indigo-100 outline-none transition-all resize-none min-h-[120px]"
                    placeholder={formData.category === "Issue Related" ? "Describe the problem with the cleanup..." : "Tell us more about your experience..."}
                    required
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  />
                </div>

                <button
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 mt-4 rounded-2xl font-bold text-lg hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Send Feedback"}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center text-center py-6">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <BiCheckCircle size={64} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-3">Feedback Sent!</h2>
              <p className="text-slate-500 font-medium mb-8 max-w-sm">
                Thank you for taking the time to share your thoughts. We review all feedback to make our community better.
              </p>
              
              <div className="flex flex-col w-full gap-3 sm:flex-row justify-center">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors w-full sm:w-auto"
                >
                  Send Another
                </button>
                <button 
                  onClick={() => navigate("/dashboard")} 
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all w-full sm:w-auto"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Feedback;