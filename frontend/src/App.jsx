import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

import Home from "./pages/Home";
import LoginCard from "./pages/LoginCard";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import FeedbackForm from "./pages/Feedback";
import AdminFeedback from './pages/AdminFeedback';

import ReportIssue from "./pages/ReportIssue";
import ComplaintDetails from "./pages/ComplaintDetails";
import ViewComplaints from "./pages/ViewComplaints";
import EditComplaint from "./pages/EditComplaint";

function App() {

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  return (

    <Router>

      <Navbar />

      <main className="min-h-screen">

        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/LoginCard" element={<LoginCard />} />

          <Route path="/Register" element={<Register />} />

          <Route path="/profile" element={<Profile />} />

          {/* USER DASHBOARD */}

          <Route
            path="/dashboard"
            element={role === "admin" ? <AdminPanel /> : <Dashboard />}
          />

          {/* ADMIN PANEL DIRECT ROUTE */}

          <Route
            path="/admin-panel"
            element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            }
          />

          <Route path="/report" element={<ReportIssue />} />

          <Route path="/complaints" element={<ViewComplaints />} />

          <Route path="/complaint/:id" element={<ComplaintDetails />} />

          <Route path="/edit-complaint/:id" element={<EditComplaint />} />

          <Route path="/feedback" element={<FeedbackForm />} />

          <Route path="/admin-feedback" element={<AdminFeedback />} />

        </Routes>

      </main>

      <Footer />

    </Router>
  );
}

export default App;