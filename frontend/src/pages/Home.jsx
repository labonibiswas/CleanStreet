import { Plus, Eye, Handshake, MapPin, Camera, CheckCircle, AlertCircle, Trash2, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate(); 

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#dbeafe] py-20 px-8">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-4 leading-tight">
            Make Your City Cleaner & Smarter
          </h1>
          <p className="text-lg md:text-xl text-black mb-8 max-w-3xl mx-auto font-medium">
            Report civic issues, track progress, and help build a better community together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/ReportIssue')}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Report an Issue
            </button>

            <button 
              onClick={() => navigate('/ViewComplaint')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              View Reports
            </button>
          </div>
        </div>
      </section>

      
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 py-20 px-8">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of citizens working together to build cleaner, safer, and smarter communities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/Register')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-10 py-4 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Get Started Today
            </button>

            <button 
              onClick={() => navigate('/Dashboard')}
              className="bg-white hover:bg-gray-50 text-indigo-600 font-semibold px-10 py-4 rounded-lg transition-all shadow-md hover:shadow-lg border-2 border-indigo-600"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
