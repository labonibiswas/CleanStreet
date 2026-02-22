import { useState } from "react";
import axios from "axios";
import { FiLock } from "react-icons/fi";

const Profile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(storedUser);
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: storedUser?.fullName || "",
    username: storedUser?.username || "",
    phone: storedUser?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleProfileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("storage"));

      setIsEditing(false);
      setMessage("Profile updated successfully!");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
      setMessage("");
    }
  };

  const handlePasswordChange = async () => {
    setMessage("");
    setError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setError("New passwords do not match.");
    }

    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(res.data.message || "Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">
          Account Settings
        </h1>
      </div>

      <div className="max-w-6xl mx-auto mt-8 bg-white rounded-2xl shadow-xl p-8 flex flex-col md:flex-row gap-10">

        {/* LEFT PROFILE CARD */}
        <div className="md:w-1/3 text-center border-r md:pr-8">
          <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {user?.username?.charAt(0).toUpperCase()}
          </div>

          <h2 className="text-xl font-semibold mt-4">
            @{user?.username}
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            {user?.email}
          </p>

          <span className="inline-block mt-3 px-4 py-1 text-sm rounded-full bg-indigo-100 text-indigo-600 capitalize">
            {user?.role}
          </span>
        </div>

        {/* RIGHT SECTION */}
        <div className="md:w-2/3">

          {/* Tabs */}
          <div className="flex gap-8 border-b mb-6">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-2 font-medium transition ${
                activeTab === "details"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-indigo-500"
              }`}
            >
              Personal Details
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`pb-2 font-medium transition ${
                activeTab === "security"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-indigo-500"
              }`}
            >
              Security
            </button>
          </div>

          {/* MESSAGES */}
          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {/* DETAILS TAB */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">

                <div>
                  <label className="text-sm text-gray-500">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`mt-1 w-full p-3 rounded-lg border ${
                      isEditing ? "bg-white" : "bg-gray-100"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-2">
                    Email <FiLock className="text-xs text-gray-400" />
                  </label>
                  <input
                    type="text"
                    value={user?.email}
                    disabled
                    className="mt-1 w-full p-3 rounded-lg border bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`mt-1 w-full p-3 rounded-lg border ${
                      isEditing ? "bg-white" : "bg-gray-100"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`mt-1 w-full p-3 rounded-lg border ${
                      isEditing ? "bg-white" : "bg-gray-100"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-2">
                    Role <FiLock className="text-xs text-gray-400" />
                  </label>
                  <input
                    type="text"
                    value={user?.role}
                    disabled
                    className="mt-1 w-full p-3 rounded-lg border bg-gray-100 capitalize cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleUpdateProfile}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-6 max-w-md">
              <div>
                <label className="text-sm text-gray-500">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="mt-1 w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="mt-1 w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="mt-1 w-full p-3 border rounded-lg"
                />
              </div>

              <button
                onClick={handlePasswordChange}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Change Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;