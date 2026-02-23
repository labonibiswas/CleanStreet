import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
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
  const [image, setImage] = useState(null);
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
      (pos) => {
        setCoordinates([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        setCoordinates([13.085, 80.2101]);
      }
    );
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coordinates) {
      setMessage("Please select location on map");
      return;
    }

    const token = localStorage.getItem("token");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      data.append(key, value)
    );

    data.append("latitude", coordinates[0]);
    data.append("longitude", coordinates[1]);
    if (image) data.append("image", image);

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("http://localhost:5000/api/issues", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) throw new Error("Failed to submit report");

      setSuccess(true);
      setFormData({
        title: "",
        issueType: "",
        priority: "",
        address: "",
        landmark: "",
        description: "",
      });
      setImage(null);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const token = localStorage.getItem("token");

if (!token) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-red-600 font-medium text-lg">
        You must login to report an issue.
      </p>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-100 relative z-0">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white shadow-xl rounded-2xl p-8">

          <h1 className="text-3xl font-bold mb-2 text-center p-6">
            Report a Civic Issue
          </h1>

          

          {success && (
            <div className="mb-6 bg-green-100 text-green-700 p-3 rounded-lg text-center font-medium">
              We have received your report successfully.
            </div>
          )}

          {message && (
            <div className="mb-6 bg-red-100 text-red-600 p-3 rounded-lg text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-2 gap-10">

              {/* LEFT FORM */}
              <div className="space-y-5">

                {/* Title */}
                <div>
                  <label className="block mb-2 font-medium">
                    Issue Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Issue Type */}
                <div>
                  <label className="block mb-2 font-medium">
                    Issue Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="issueType"
                    value={formData.issueType}
                    className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Issue Type</option>
                    {issueTypes.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block mb-2 font-medium">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Priority</option>
                    {priorityLevels.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block mb-2 font-medium">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Landmark */}
                <div>
                  <label className="flex justify-between mb-2 font-medium">
                    <span>Landmark</span>
                    <span className="text-gray-400 text-sm">Optional</span>
                  </label>
                  <input
                    name="landmark"
                    value={formData.landmark}
                    className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={handleChange}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-2 font-medium">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    rows={4}
                    className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="flex justify-between mb-2 font-medium">
                    <span>Upload Picture</span>
                    <span className="text-gray-400 text-sm">Optional</span>
                  </label>

                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      id="imageUpload"
                      className="hidden"
                      onChange={(e) => setImage(e.target.files[0])}
                    />

                    <label
                      htmlFor="imageUpload"
                      className="cursor-pointer bg-gray-200 text-gray-800 px-4 py-2 rounded-lg border hover:bg-gray-300 transition"
                    >
                      Choose File
                    </label>

                    <span className="text-sm text-gray-600">
                      {image ? image.name : "No file chosen"}
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
                >
                  {loading ? "Submitting..." : "Submit Issue"}
                </button>
              </div>

              {/* RIGHT MAP */}
              <div>
                <h3 className="mb-3 font-medium text-gray-700">
                  Click on Map to Select Location <span className="text-red-500">*</span>
                </h3>

                {coordinates && (
                  <MapContainer
                    center={coordinates}
                    zoom={13}
                    className="h-[500px] rounded-xl shadow-md"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPicker setCoordinates={setCoordinates} />
                    <Marker position={coordinates} />
                  </MapContainer>
                )}

                {coordinates && (
                  <p className="mt-4 text-sm text-gray-600">
                    Lat: {coordinates[0].toFixed(5)} | Lng:{" "}
                    {coordinates[1].toFixed(5)}
                  </p>
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