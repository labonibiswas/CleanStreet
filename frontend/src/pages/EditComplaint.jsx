import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  BiSave, BiArrowBack, BiMap, BiCloudUpload, 
  BiCheckShield, BiTrendingUp, BiTrash, BiUndo 
} from "react-icons/bi";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet Icon Setup
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
const RedIcon = L.icon({ 
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] 
});

const EditComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalCoords, setOriginalCoords] = useState([0, 0]);
  
  const [formData, setFormData] = useState({
    title: "", 
    issueType: "Pothole", 
    priority: "medium",
    address: "", 
    landmark: "", 
    description: "",
    imageUrls: [],
    location: { type: "Point", coordinates: [0, 0] },
    status: "", 
    progress: 0 
  });

  const [selectedFiles, setSelectedFiles] = useState([]); // For new uploads

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/issues/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFormData({ ...data, landmark: data.landmark || "" });
        // Set map center (Leaflet is [lat, lng], GeoJSON is [lng, lat])
        setOriginalCoords([data.location.coordinates[1], data.location.coordinates[0]]);
        setLoading(false);
      } catch (err) { 
        console.error("Fetch error:", err);
        navigate(`/complaint/${id}`); 
      }
    };
    fetchIssue();
  }, [id, token, navigate]);

  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        setFormData({
          ...formData,
          location: { ...formData.location, coordinates: [e.latlng.lng, e.latlng.lat] }
        });
      },
    });
    return <Marker position={[formData.location.coordinates[1], formData.location.coordinates[0]]} icon={RedIcon} />;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Using FormData to handle both Text and Files
    const dataToSend = new FormData();
    dataToSend.append("title", formData.title);
    dataToSend.append("issueType", formData.issueType);
    dataToSend.append("priority", formData.priority);
    dataToSend.append("address", formData.address);
    dataToSend.append("landmark", formData.landmark);
    dataToSend.append("description", formData.description);
    
    // Send existing images that weren't deleted
    dataToSend.append("imageUrls", JSON.stringify(formData.imageUrls));
    
    // Send coordinates
    dataToSend.append("longitude", formData.location.coordinates[0]);
    dataToSend.append("latitude", formData.location.coordinates[1]);

    // Attach new files
    selectedFiles.forEach((file) => {
      dataToSend.append("images", file); 
    });

    try {
      const res = await fetch(`http://localhost:5000/api/issues/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }, 
        body: dataToSend,
      });

      if (res.ok) {
        alert("Update Successful");
        navigate(`/complaint/${id}`); 
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to update");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading Form Data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <nav className="bg-white border-b p-4 mb-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(`/complaint/${id}`)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600">
            <BiArrowBack size={20}/> Cancel & Go Back
          </button>
          <h1 className="font-black text-slate-800 uppercase tracking-tight">Edit Complaint Details</h1>
          <div className="w-10"></div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
          
          {/* Section: Photos */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-black text-slate-800 uppercase mb-4 flex items-center gap-2">
              <BiCloudUpload className="text-indigo-500" size={20}/> Evidence & Images
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Existing Images from Cloudinary */}
              {formData.imageUrls.map((url, idx) => (
                <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border">
                  <img src={url} className="w-full h-full object-cover" alt="Current" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, imageUrls: formData.imageUrls.filter((_, i) => i !== idx)})}
                      className="bg-red-500 text-white p-2 rounded-full shadow-lg"
                    >
                      <BiTrash size={18}/>
                    </button>
                  </div>
                </div>
              ))}
              
              {/* New File Upload Button */}
              <label className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                <BiCloudUpload size={30} className="text-slate-400"/>
                <span className="text-[10px] font-bold text-slate-400 mt-1">ADD PHOTO</span>
                <input type="file" multiple className="hidden" onChange={handleFileSelect} accept="image/*" />
              </label>
            </div>
            {selectedFiles.length > 0 && (
              <p className="mt-3 text-xs font-bold text-indigo-600">{selectedFiles.length} new files selected for upload</p>
            )}
          </div>

          {/* Section: Main Content */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Complaint Title</label>
              <input 
                className="text-xl font-bold w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Detailed Description</label>
              <textarea 
                rows="5"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase block mb-2">Issue Type</label>
                <select 
                  className="w-full p-3 bg-slate-50 border rounded-xl outline-none" 
                  value={formData.issueType} 
                  onChange={(e) => setFormData({...formData, issueType: e.target.value})}
                >
                  <option value="Pothole">Pothole</option>
                  <option value="Garbage">Garbage</option>
                  <option value="Street Light">Street Light</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase block mb-2">Priority Level</label>
                <select 
                  className="w-full p-3 bg-slate-50 border rounded-xl outline-none" 
                  value={formData.priority} 
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl transition-all disabled:bg-slate-300"
          >
            {saving ? "Saving Changes..." : "Save and Update Report"}
          </button>
        </form>

        {/* Sidebar: Location */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BiMap className="text-red-500" size={18}/> Geographic Data
              </h2>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, location: { ...formData.location, coordinates: [originalCoords[1], originalCoords[0]] }})}
                className="text-indigo-500 text-[10px] font-bold flex items-center gap-1"
              >
                <BiUndo/> RESET
              </button>
            </div>

            <div className="h-64 rounded-2xl overflow-hidden border border-slate-100 relative z-0">
              <MapContainer center={originalCoords} zoom={15} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={originalCoords} icon={DefaultIcon} /> {/* Original Blue Marker */}
                <LocationPicker /> {/* New Red Marker */}
              </MapContainer>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Full Address</label>
                <input className="w-full p-3 bg-slate-50 border rounded-xl text-xs" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nearby Landmark</label>
                <input className="w-full p-3 bg-slate-50 border rounded-xl text-xs" value={formData.landmark} onChange={(e) => setFormData({...formData, landmark: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Status Display (Read Only) */}
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 opacity-60">
              <BiCheckShield className="text-indigo-500" size={20}/>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Current Status</p>
                <p className="text-xs font-bold text-slate-700">{formData.status}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 opacity-60">
              <BiTrendingUp className="text-emerald-500" size={20}/>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Progress</p>
                <p className="text-xs font-bold text-slate-700">{formData.progress}% Complete</p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default EditComplaint;