import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const issueTypes = [
  { value: "pothole", label: "Pothole" },
  { value: "garbage", label: "Garbage Dump" },
  { value: "streetlight", label: "Broken Streetlight" },
  { value: "drainage", label: "Drainage Issue" },
  { value: "other", label: "Other" },
];

const priorityLevels = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const LocationPicker = ({ setCoordinates }) => {
  useMapEvents({
    click(e) {
      setCoordinates([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const ReportIssue = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    issueType: "",
    priority: "",
    address: "",
    landmark: "",
    description: "",
  });

  const [coordinates, setCoordinates] = useState(null);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage("You must login to report an issue.");
      const timer = setTimeout(() => navigate("/LoginCard"), 2000);
      return () => clearTimeout(timer); // Corrected timer cleanup
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setCoordinates([pos.coords.latitude, pos.coords.longitude]),
      () => setCoordinates([13.085, 80.2101])
    );
  }, [navigate, token]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-3xl font-bold">!</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">{message || "Redirecting to login..."}</p>
          <div className="animate-spin inline-block w-6 h-6 border-[3px] border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (images.length + selectedFiles.length > 4) {
      alert("You can only upload a maximum of 4 images.");
      return;
    }
    setImages((prev) => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coordinates) {
      setMessage("Please select location on map");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    data.append("latitude", coordinates[0]);
    data.append("longitude", coordinates[1]);
    images.forEach((img) => data.append("images", img));

    try {
      setLoading(true);
      setMessage("");
      const res = await fetch("http://localhost:5000/api/issues", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit report");
      }

      setSuccess(true);
      // Optional: Redirect to dashboard after 3 seconds
      setTimeout(() => navigate("/complaints"), 3000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative z-0">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 md:p-10">
          
          {success ? (
            <div className="py-12 text-center space-y-4">
               <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
               </div>
               <h2 className="text-3xl font-bold text-slate-900">Report Submitted!</h2>
               <p className="text-slate-500">Thank you for helping us improve. Redirecting to your complaints...</p>
               <button onClick={() => navigate("/complaints")} className="text-indigo-600 font-bold hover:underline">Go now</button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-8 text-slate-900 text-center">Report a Civic Issue</h1>

              {message && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100 font-medium">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block mb-2 text-sm font-bold text-slate-700">Issue Title <span className="text-red-500">*</span></label>
                      <input name="title" value={formData.title} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" onChange={handleChange} placeholder="Brief title of the problem" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Issue Type */}
                      <div>
                        <label className="block mb-2 text-sm font-bold text-slate-700">Type <span className="text-red-500">*</span></label>
                        <select name="issueType" value={formData.issueType} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" onChange={handleChange} required>
                          <option value="">Select Type</option>
                          {issueTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block mb-2 text-sm font-bold text-slate-700">Priority <span className="text-red-500">*</span></label>
                        <select name="priority" value={formData.priority} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" onChange={handleChange} required>
                          <option value="">Select Priority</option>
                          {priorityLevels.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Address & Landmark */}
                    <div>
                      <label className="block mb-2 text-sm font-bold text-slate-700">Address <span className="text-red-500">*</span></label>
                      <input name="address" value={formData.address} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none mb-4" onChange={handleChange} placeholder="Street name, Area..." required />
                      
                      <label className="block mb-2 text-sm font-bold text-slate-700">Landmark <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input name="landmark" value={formData.landmark} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none" onChange={handleChange} placeholder="Near XYZ store..." />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block mb-2 text-sm font-bold text-slate-700">Description <span className="text-red-500">*</span></label>
                      <textarea name="description" value={formData.description} rows={3} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none" onChange={handleChange} placeholder="Describe the issue in detail..." required />
                    </div>

                    {/* Image Upload */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-bold text-slate-700">Evidence Pictures</span>
                        <span className="text-xs text-slate-400">{images.length}/4</span>
                      </div>
                      <input type="file" id="imageUpload" multiple accept="image/*" className="hidden" onChange={handleImageChange} disabled={images.length >= 4} />
                      <label htmlFor="imageUpload" className={`w-full text-center py-3 rounded-xl border-2 border-dashed border-slate-300 block cursor-pointer hover:bg-white transition-all font-semibold text-slate-600 ${images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {images.length >= 4 ? "Upload Limit Reached" : "+ Add Images"}
                      </label>

                      {previews.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-4">
                          {previews.map((src, index) => (
                            <div key={index} className="relative group aspect-square">
                              <img src={src} alt="preview" className="w-full h-full object-cover rounded-lg border border-slate-200" />
                              <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-md hover:bg-red-600">✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all active:scale-[0.98]">
                      {loading ? "Processing..." : "Submit Report"}
                    </button>
                  </div>

                  {/* Map Column */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h3 className="font-bold text-slate-700">Pinpoint Location <span className="text-red-500">*</span></h3>
                       {coordinates && <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">Lat: {coordinates[0].toFixed(4)} Lng: {coordinates[1].toFixed(4)}</span>}
                    </div>
                    {coordinates && (
                      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner h-[500px]">
                        <MapContainer center={coordinates} zoom={14} style={{ height: "100%", width: "100%" }}>
                          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                          <LocationPicker setCoordinates={setCoordinates} />
                          <Marker position={coordinates} />
                        </MapContainer>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 text-center italic">Tip: Click on the map if the marker is not exactly on the spot.</p>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
