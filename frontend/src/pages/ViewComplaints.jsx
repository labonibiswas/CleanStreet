import { useEffect, useState } from "react";

const ViewComplaints = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/issues");
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="text-center py-20 font-medium text-slate-600">Loading community reports...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Community Reports</h1>
        <p className="text-slate-500 font-medium">Browse issues reported by the community and track their status.</p>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reports.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-400">No reports found.</div>
        ) : (
          reports.map((report) => (
            <div key={report._id} className="bg-white rounded-[2rem] p-3 shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              
              {/* Header: Status & Dynamic User Info */}
              <div className="p-4 flex justify-between items-center">
                <span className={`px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                  report.status === 'Resolved' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {report.status || "Pending"}
                </span>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    {/* 1. DISPLAY THE ACTUAL USERNAME */}
                    <p className="text-[11px] font-bold text-slate-800 uppercase">
                      {report.reportedBy?.name || "laboni"} 
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* 2. DYNAMIC AVATAR INITIAL */}
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    {report.reportedBy?.name?.charAt(0).toUpperCase() || "L"}
                  </div>
                </div>
              </div>

              {/* Multiple Image Gallery */}
              <div className="px-2">
                <div className="flex gap-2 overflow-x-auto snap-x scrollbar-hide rounded-2xl">
                  {report.imageUrls && report.imageUrls.length > 0 ? (
                    report.imageUrls.map((url, index) => (
                      <img 
                        key={index}
                        src={url} 
                        alt={`Evidence ${index + 1}`} 
                        className="w-full h-48 object-cover rounded-2xl snap-center flex-shrink-0"
                      />
                    ))
                  ) : (
                    <div className="w-full h-48 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-sm font-medium">
                      No images provided
                    </div>
                  )}
                </div>
                {report.imageUrls?.length > 1 && (
                  <p className="text-[10px] text-center mt-2 text-slate-400 font-bold uppercase tracking-widest">
                    Swipe to see more ({report.imageUrls.length} images)
                  </p>
                )}
              </div>

              {/* Content Section */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-800 mb-1 capitalize">{report.title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10 leading-relaxed">
                  {report.description}
                </p>
                
                <div className="flex items-center text-slate-400 text-[11px] mb-6 font-bold uppercase truncate">
                  <span className="mr-1 text-sm">📍</span>
                  {report.address}
                </div>

                {/* Dynamic Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                    <span>Progress</span>
                    {/* Displaying the numeric progress value from DB */}
                    <span>{report.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ${report.status === 'Resolved' ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${report.progress || 0}%` }} // Inline style for dynamic width
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewComplaints;