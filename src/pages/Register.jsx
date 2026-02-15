// src/pages/Register.jsx
import React, { useState } from "react";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { firstName, username, email, phone, password, role } = formData;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;
    const usernamePattern = /^[a-zA-Z0-9_]{3,15}$/;
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!firstName || !username || !email || !phone || !password || !role) {
      alert("All fields are required!");
      return;
    }

    if (!usernamePattern.test(username)) {
      alert(
        "Username must be 3-15 characters and contain only letters, numbers, or underscore."
      );
      return;
    }

    if (username.startsWith("_") || username.endsWith("_")) {
      alert("Username cannot start or end with underscore.");
      return;
    }

    if (!emailPattern.test(email)) {
      alert("Please enter a valid email!");
      return;
    }

    if (!phonePattern.test(phone)) {
      alert("Phone number must be exactly 10 digits!");
      return;
    }

    if (!passwordPattern.test(password)) {
      alert(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character!"
      );
      return;
    }

    console.log("Form submitted successfully:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-2">
          Register for CleanStreet
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Create your account to get started!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="firstName"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Choose your role</option>
            <option value="citizen">Citizen</option>
            <option value="admin">Volunteer</option>
            <option value="worker">Admin</option>
          </select>
          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-semibold bg-indigo-600 hover:opacity-90 transition duration-300"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <span className="text-purple-600 font-semibold cursor-pointer hover:underline">
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;