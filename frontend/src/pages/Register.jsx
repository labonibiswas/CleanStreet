// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    location: null, 
  });

  const [locationCaptured, setLocationCaptured] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setFormData((prev) => ({
          ...prev,
          location: {
            type: "Point",
            coordinates: [longitude, latitude], 
          },
        }));

        setLocationCaptured(true);
      },
      () => {
        alert("Please allow location access.");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const { fullName, username, email, phone, password, role, location } =
      formData;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;
    const usernamePattern = /^[a-zA-Z0-9_]{3,15}$/;
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    let newErrors = {};

    if (!fullName) newErrors.fullName = "Full name is required.";
    if (!username) newErrors.username = "Username is required.";
    else if (!usernamePattern.test(username))
      newErrors.username =
        "3-15 characters (letters, numbers, underscores only).";

    if (!email) newErrors.email = "Email is required.";
    else if (!emailPattern.test(email))
      newErrors.email = "Enter valid email.";

    if (!phone) newErrors.phone = "Phone required.";
    else if (!phonePattern.test(phone))
      newErrors.phone = "Must be 10 digits.";

    if (!password) newErrors.password = "Password required.";
    else if (!passwordPattern.test(password))
      newErrors.password =
        "8+ chars, uppercase, lowercase, number & special char.";

    if (!role) newErrors.role = "Select role.";
    if (!location) newErrors.location = "Please capture your location.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch(
  "http://localhost:5000/api/auth/register",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  }
);

let data;

try {
  data = await response.json();
} catch (err) {
  throw new Error("Server error — not valid JSON response");
}

if (!response.ok) {
  throw new Error(data.message || "Registration failed");
}

      

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      navigate("/LoginCard");
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-16">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">

        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-black">
            Register for CleanStreet
          </h1>
          <p className="text-black text-sm mt-2">
            Create your account to get started!
          </p>
        </div>

        {serverError && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            name="fullName"
            placeholder="Full Name *"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm">{errors.fullName}</p>
          )}

          <input
            type="text"
            name="username"
            placeholder="Username *"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300"
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username}</p>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}

          <input
            type="tel"
            name="phone"
            placeholder="Phone *"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone}</p>
          )}

          {/* 📍 Location Capture Button */}
          <div className="flex items-center gap-3">
  <button
    type="button"
    onClick={handleGetLocation}
    className="flex items-center gap-2 px-5 py-2.5 
               bg-gradient-to-r from-indigo-500 to-purple-600 
               text-white font-medium rounded-full 
               shadow-md hover:shadow-lg 
               hover:scale-105 transition-all duration-300"
  >
    <FaMapMarkerAlt className="text-white text-lg" />
    Capture Location
  </button>

  {locationCaptured && (
    <span className="text-green-600 text-sm font-semibold animate-pulse">
      Location captured ✅
    </span>
  )}
</div>

          {errors.location && (
            <p className="text-red-500 text-sm">{errors.location}</p>
          )}

          <input
            type="password"
            name="password"
            placeholder="Password *"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300"
          >
            <option value="">Choose your role *</option>
            <option value="citizen">Citizen</option>
            <option value="volunteer">Volunteer</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm">{errors.role}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold"
          >
            {loading ? "Registering..." : "Register Now"}
          </button>
        </form>

        <p className="text-center text-sm text-black mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/LoginCard")}
            className="text-purple-600 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;