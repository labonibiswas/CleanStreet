import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import LoginCard from "./pages/LoginCard";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

/*import ReportIssue from "./pages/ReportIssue";
import ViewComplaint from "./pages/ViewComplaint";*/

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
                <Route path="/dashboard" element={<Dashboard />} />
                {/*<Route path="/ReportIssue" element={<ReportIssue />} />
                <Route path="/ViewComplaint" element={<ViewComplaint />} />*/}
              </Routes>
            </main>
          <Footer />
        </Router>
    </>
  )
}

export default App