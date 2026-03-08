import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import LoginCard from "./pages/LoginCard";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";


import ReportIssue from "./pages/ReportIssue";
import ComplaintDetails from "./pages/ComplaintDetails";
import ViewComplaints from "./pages/ViewComplaints";
import EditComplaint from "./pages/EditComplaint";
import AdminPanel from "./pages/AdminPanel";

function App() {

  return (
    <>
        <Router>
          <Navbar /> 
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/LoginCard" element={<LoginCard />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/report" element={<ReportIssue />} />
                <Route path="/complaints" element={<ViewComplaints />} />
                <Route path="/complaint/:id" element={<ComplaintDetails />} />
                <Route path="/edit-complaint/:id" element={<EditComplaint />} />
                <Route path="/admin-panel" element={<AdminPanel />} />
              </Routes>
            </main>
          <Footer />
        </Router>
    </>
  )
}

export default App