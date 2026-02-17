import { Plus, Eye, Handshake } from "lucide-react";

const Home = () => {
  return (
    <div className="bg-white">
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
              onClick={() => window.location.href = '/ReportIssue'}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Report an Issue
            </button>
            <button 
              onClick={() => window.location.href = '/ViewComplaint'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              View Reports
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 px-8">
        <div className="max-w-[1000px] mx-auto">
          
          {/* --- New Heading Section --- */}
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-black mb-4">
              How CleanStreet Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to make a difference in your community
            </p>
          </div>
          {/* --------------------------- */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 text-center">
            {/* Report Issues */}
            <div className="flex flex-col items-center">
              <Plus className="w-16 h-16 text-black stroke-[2.5] mb-4" />
              <h3 className="text-2xl font-medium text-black mb-2">
                Report Issues
              </h3>
              <p className="text-gray-600 max-w-[200px]">
                Easily report local problems like potholes or garbage dumps.
              </p>
            </div>

            {/* Track Progress */}
            <div className="flex flex-col items-center">
              <Eye className="w-16 h-16 text-black stroke-[2.5] mb-4" />
              <h3 className="text-2xl font-medium text-black mb-2">
                Track Progress
              </h3>
              <p className="text-gray-600 max-w-[200px]">
                See real-time status updates on all reported complaints.
              </p>
            </div>

            {/* Community Impact */}
            <div className="flex flex-col items-center">
              <Handshake className="w-16 h-16 text-black stroke-[2.5] mb-4" />
              <h3 className="text-2xl font-medium text-black mb-2">
                Community Impact
              </h3>
              <p className="text-gray-600 max-w-[200px]">
                Engage with your neighbors to build a better city.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;