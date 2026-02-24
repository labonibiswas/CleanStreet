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

  const [formData, setFormData] = useState({
    title: "",
    issueType: "",
    priority: "",
    address: "",
    landmark: "",
    description: "",
  });

  const [coordinates, setCoordinates] = useState(null);
  // Changed image state to an array for multiple files
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]); // State for image previews
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must login to report an issue.");
      setTimeout(() => navigate("/LoginCard"), 2000);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setCoordinates([pos.coords.latitude, pos.coords.longitude]),
      () => setCoordinates([13.085, 80.2101])
    );
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle multiple image selection
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (images.length + selectedFiles.length > 4) {
      alert("You can only upload a maximum of 4 images.");
      return;
    }

    setImages((prev) => [...prev, ...selectedFiles]);

    // Create preview URLs
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // Remove a specific image
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

    const token = localStorage.getItem("token");
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    data.append("latitude", coordinates[0]);
    data.append("longitude", coordinates[1]);

    // Append multiple images to FormData
    images.forEach((img) => {
      data.append("images", img); // Backend must use upload.array('images', 4)
    });

    try {
      setLoading(true);
      setMessage("");
      const res = await fetch("http://localhost:5000/api/issues", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (!res.ok) throw new Error("Failed to submit report");

      setSuccess(true);
      setFormData({ title: "", issueType: "", priority: "", address: "", landmark: "", description: "" });
      setImages([]);
      setPreviews([]);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative z-0">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2 text-center p-6">Report a Civic Issue</h1>

          {success && (
            <div className="mb-6 bg-green-100 text-green-700 p-3 rounded-lg text-center font-medium">
              We have received your report successfully.
            </div>
          )}

          {message && (
            <div className="mb-6 bg-red-100 text-red-600 p-3 rounded-lg text-center">{message}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-2 gap-10">
              <div className="space-y-5">
                {/* Title, Type, Priority, Address, Landmark, Description (Kept same) */}
                <div>
                  <label className="block mb-2 font-medium">Issue Title <span className="text-red-500">*</span></label>
                  <input name="title" value={formData.title} className="border p-3 rounded-lg w-full" onChange={handleChange} required />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Issue Type <span className="text-red-500">*</span></label>
                  <select name="issueType" value={formData.issueType} className="border p-3 rounded-lg w-full" onChange={handleChange} required>
                    <option value="">Select Issue Type</option>
                    {issueTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Priority <span className="text-red-500">*</span></label>
                  <select name="priority" value={formData.priority} className="border p-3 rounded-lg w-full" onChange={handleChange} required>
                    <option value="">Select Priority</option>
                    {priorityLevels.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Address <span className="text-red-500">*</span></label>
                  <input name="address" value={formData.address} className="border p-3 rounded-lg w-full" onChange={handleChange} required />
                </div>

                <div>
                   <label className="block mb-2 font-medium">Description <span className="text-red-500">*</span></label>
                   <textarea name="description" value={formData.description} rows={3} className="border p-3 rounded-lg w-full" onChange={handleChange} required />
                </div>

                {/* UPDATED MULTI-IMAGE UPLOAD SECTION */}
                <div>
                  <label className="flex justify-between mb-2 font-medium">
                    <span>Upload Pictures (Max 4)</span>
                    <span className="text-gray-400 text-sm">{images.length}/4</span>
                  </label>

                  <div className="space-y-4">
                    <input
                      type="file"
                      id="imageUpload"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={images.length >= 4}
                    />
                    <label
                      htmlFor="imageUpload"
                      className={`cursor-pointer inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded-lg border hover:bg-gray-300 transition ${images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {images.length >= 4 ? "Limit Reached" : "Choose Files"}
                    </label>

                    {/* Image Previews */}
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {previews.map((src, index) => (
                        <div key={index} className="relative group">
                          <img src={src} alt="preview" className="w-full h-20 object-cover rounded-lg border" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-lg"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? "Submitting..." : "Submit Issue"}
                </button>
              </div>

              {/* RIGHT MAP (Kept same) */}
              <div>
                <h3 className="mb-3 font-medium text-gray-700">Click on Map to Select Location <span className="text-red-500">*</span></h3>
                {coordinates && (
                  <MapContainer center={coordinates} zoom={13} className="h-[500px] rounded-xl shadow-md">
                    <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker setCoordinates={setCoordinates} />
                    <Marker position={coordinates} />
                  </MapContainer>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
