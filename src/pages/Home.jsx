import { Plus, Eye, Handshake, MapPin, Camera, CheckCircle, AlertCircle, Trash2, Wrench } from "lucide-react";

const Home = () => {
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

      {/* Features Section */}
      <section className="bg-white py-24 px-8">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
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

      {/* How It Works Section */}
      <section className="bg-gray-50 py-20 px-8">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Simple steps to report and resolve civic issues in your community
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                1. Report Issue
              </h3>
              <p className="text-gray-600 text-sm">
                Take a photo, add location, and describe the civic problem like potholes, garbage dumps, or broken streetlights.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2. Auto-Route to Authority
              </h3>
              <p className="text-gray-600 text-sm">
                Your complaint is automatically sent to the relevant local authority or volunteer for quick action.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3. Track & Resolve
              </h3>
              <p className="text-gray-600 text-sm">
                Track real-time updates, vote on priority issues, and see your community improve day by day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Issue Types Section */}
      <section className="bg-white py-20 px-8">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Report Any Civic Issue
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            From potholes to broken infrastructure, we handle all types of civic problems
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Issue Type 1 */}
            <div className="bg-gray-50 p-6 rounded-lg text-center hover:bg-indigo-50 transition-colors cursor-pointer">
              <Trash2 className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900">Garbage Dumps</h4>
            </div>

            {/* Issue Type 2 */}
            <div className="bg-gray-50 p-6 rounded-lg text-center hover:bg-indigo-50 transition-colors cursor-pointer">
              <AlertCircle className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900">Potholes</h4>
            </div>

            {/* Issue Type 3 */}
            <div className="bg-gray-50 p-6 rounded-lg text-center hover:bg-indigo-50 transition-colors cursor-pointer">
              <Wrench className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900">Water Leakage</h4>
            </div>

            {/* Issue Type 4 */}
            <div className="bg-gray-50 p-6 rounded-lg text-center hover:bg-indigo-50 transition-colors cursor-pointer">
              <Eye className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900">Streetlights</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-indigo-600 py-16 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <h3 className="text-4xl font-bold mb-2">1,250+</h3>
              <p className="text-indigo-100">Issues Reported</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">850+</h3>
              <p className="text-indigo-100">Issues Resolved</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">2,500+</h3>
              <p className="text-indigo-100">Active Citizens</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">95%</h3>
              <p className="text-indigo-100">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
              onClick={() => window.location.href = '/Register'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-10 py-4 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Get Started Today
            </button>
            <button 
              onClick={() => window.location.href = '/Dashboard'}
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