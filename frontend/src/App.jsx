import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

import Home from "./pages/Home";
import LoginCard from "./pages/LoginCard";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";

import ReportIssue from "./pages/ReportIssue";
import ComplaintDetails from "./pages/ComplaintDetails";
import ViewComplaints from "./pages/ViewComplaints";
import EditComplaint from "./pages/EditComplaint";

/* ─────────────────────────────────────────────────────────────────
   DYNAMIC DASHBOARD ROUTER
   This wrapper guarantees we read the freshest user data from 
   localStorage exactly when the user navigates to "/dashboard".
───────────────────────────────────────────────────────────────── */
const DashboardRouter = () => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!user) {
    return <Navigate to="/LoginCard" />;
  }

  if (user.role === "admin") {
    return <AdminPanel />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <Router>
      <Navbar />

      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/LoginCard" element={<LoginCard />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />

          {/* DYNAMIC DASHBOARD ROUTE */}
          <Route path="/dashboard" element={<DashboardRouter />} />

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
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;