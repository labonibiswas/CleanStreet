// src/pages/Profile.jsx
import { useState } from "react";
import axios from "axios";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("details");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = async () => {
    setMessage("");
    setError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setError("New passwords do not match.");
    }

    if (passwordData.newPassword.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || "Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">

      {/* Page Title */}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">
          Account Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your profile details and security.
        </p>
      </div>

      <div className="max-w-6xl mx-auto mt-8 bg-white rounded-2xl shadow-xl p-8 flex flex-col md:flex-row gap-10">

        {/* LEFT SIDE - Profile Card */}
        <div className="md:w-1/3 text-center border-r md:pr-8">

          <div className="w-28 h-28 mx-auto rounded-full border-4 border-indigo-200 flex items-center justify-center text-4xl font-bold text-indigo-600">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>

          <h2 className="text-xl font-semibold mt-4">
            {user?.fullName}
          </h2>

          <p className="text-gray-500 text-sm">
            {user?.email}
          </p>

          <span className="inline-block mt-3 px-4 py-1 text-sm rounded-full bg-indigo-100 text-indigo-600 capitalize">
            {user?.role}
          </span>
        </div>

        {/* RIGHT SIDE - Details */}
        <div className="md:w-2/3">

          {/* Tabs */}
          <div className="flex gap-6 border-b mb-6">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-2 font-medium ${
                activeTab === "details"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500"
              }`}
            >
              Personal Details
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`pb-2 font-medium ${
                activeTab === "security"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500"
              }`}
            >
              Security
            </button>
          </div>

          {/* Personal Details */}
          {activeTab === "details" && (
            <div className="space-y-6">

              <div className="grid md:grid-cols-2 gap-6">

                <div>
                  <label className="text-sm text-gray-500">Full Name</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                    {user?.fullName}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Email Address</label>
                  <div className="mt-1 p-3 bg-gray-100 rounded-lg border cursor-not-allowed">
                    {user?.email}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Username</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                    {user?.username}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                    {user?.phone}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Role</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border capitalize">
                    {user?.role}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
  <div className="space-y-6 max-w-md">

    {message && (
      <div className="p-3 bg-green-100 text-green-700 rounded-lg">
        {message}
      </div>
    )}

    {error && (
      <div className="p-3 bg-red-100 text-red-600 rounded-lg">
        {error}
      </div>
    )}

    <div>
      <label className="text-sm text-gray-500">
        Current Password
      </label>
      <input
        type="password"
        name="currentPassword"
        value={passwordData.currentPassword}
        onChange={handleChange}
        className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
        onChange={handleChange}
        className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
      />
    </div>

    <div>
      <label className="text-sm text-gray-500">
        Confirm New Password
      </label>
      <input
        type="password"
        name="confirmPassword"
        value={passwordData.confirmPassword}
        onChange={handleChange}
        className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
      />
    </div>

    <button
      onClick={handlePasswordChange}
      className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300"
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