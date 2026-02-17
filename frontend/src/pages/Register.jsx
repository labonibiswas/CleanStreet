// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    location: "", // New Field
    role: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { firstName, username, email, phone, password, location, role } = formData;

    // --- Validation Patterns ---
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;
    const usernamePattern = /^[a-zA-Z0-9_]{3,15}$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // 1. Mandatory Fields Check
    if (!firstName || !username || !email || !phone || !password || !location || !role) {
      alert("Error: All fields are mandatory! Please fill in every field.");
      return;
    }

    // 2. Username Validation
    if (!usernamePattern.test(username)) {
      alert("Invalid Username: Must be 3-15 characters (letters, numbers, or underscores only).");
      return;
    }
    if (username.startsWith("_") || username.endsWith("_")) {
      alert("Invalid Username: Cannot start or end with an underscore.");
      return;
    }

    // 3. Email Validation
    if (!emailPattern.test(email)) {
      alert("Invalid Email: Please enter a valid email address (e.g., name@example.com).");
      return;
    }

    // 4. Phone Validation
    if (!phonePattern.test(phone)) {
      alert("Invalid Phone: Must be exactly 10 digits.");
      return;
    }

    // 5. Password Validation
    if (!passwordPattern.test(password)) {
      alert("Weak Password: Must be 8+ characters with at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    // 6. Location Validation (Simple length check)
    if (location.trim().length < 3) {
      alert("Invalid Location: Please enter a valid city or area name.");
      return;
    }

    // --- Success Action ---
    // If code reaches here, all validations passed
    alert(`Success! Registration for ${username} was successful.`);
    console.log("Form Data Submitted:", formData);
    
    // Redirect to login after successful registration
    navigate("/LoginCard");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-16">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-2 text-black">
          Register for CleanStreet
        </h2>
        <p className="text-black text-center mb-6">
          Create your account to get started!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullstName"
            placeholder="Full Name *"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="text"
            name="username"
            placeholder="Username *"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address *"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number (10 digits) *"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          {/* New Location Field */}
          <input
            type="text"
            name="location"
            placeholder="Your City / Location *"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password (Min. 8 chars) *"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              formData.role === "" ? "text-gray-500" : "text-black"
            }`}
            required
          >
            <option value="" disabled>Choose your role *</option>
            <option value="citizen">Citizen</option>
            <option value="volunteer">Volunteer</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition duration-300 shadow-md"
          >
            Register Now
          </button>
        </form>

        <p className="text-center text-sm text-black mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/LoginCard")}
            className="text-indigo-600 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
