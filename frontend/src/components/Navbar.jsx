import { useState, useEffect } from "react";
import { FaRoad } from "react-icons/fa6";
import { HiMenu, HiX } from "react-icons/hi";
import { FiLogOut, FiUser } from "react-icons/fi";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { BiBell, BiComment } from "react-icons/bi";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    return token && storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
    // Optional: Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const syncUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    };

    window.addEventListener("storage", syncUser);
    syncUser();

    return () => window.removeEventListener("storage", syncUser);
  }, []);

  // Add this block after your existing useEffects
useEffect(() => {
  const handleClickOutside = (event) => {
    // Close notifications if clicking outside
    if (showNotifs && !event.target.closest(".notification-container")) {
      setShowNotifs(false);
    }
    // Close profile dropdown if clicking outside
    if (dropdownOpen && !event.target.closest(".profile-container")) {
      setDropdownOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [showNotifs, dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    setIsOpen(false);
    navigate("/LoginCard");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Report Issue", path: "/report" },
    { name: "View Complaints", path: "/complaints" },
  ];

  const desktopActive = "bg-white text-indigo-600 shadow-md";
  const desktopInactive = "text-white hover:text-yellow-300";

  const mobileActive = "bg-white text-indigo-600";
  const mobileInactive = "text-white hover:bg-indigo-600";

  return (
    <nav className="w-full bg-indigo-600 py-3 px-6 shadow-md sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <FaRoad className="h-7 w-7 text-indigo-600 bg-white p-1.5 rounded-lg shadow" />
          <span className="text-white font-bold text-xl tracking-wide">
            CleanStreet
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === "/"}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition ${
                  isActive ? desktopActive : desktopInactive
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* Admin Link - Desktop */}
{user?.role === "admin" && (
  <NavLink
    to="/admin-feedback"   
    className={({ isActive }) =>
      `px-4 py-2 rounded-full text-sm font-medium transition ${
        isActive ? desktopActive : desktopInactive
      }`
    }
  >
    Manage Feedback
  </NavLink>
)}

{/* Volunteer Specific Link - Desktop */}
{user?.role === "volunteer" && (
  <NavLink
    to="/my-ratings"
    className={({ isActive }) =>
      `px-4 py-2 rounded-full text-sm font-medium transition ${
        isActive ? desktopActive : desktopInactive
      }`
    }
  >
    My Ratings
  </NavLink>
)}
        </div>

<div className="flex items-center gap-3 notification-container">
  {/* Feedback Icon */}
  <Link
    to="/feedback"
    className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all group relative"
  >
    <BiComment size={20} className="group-hover:scale-110 transition-transform" />
    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      Feedback
    </span>
  </Link>

  {/* Notifications Icon */}
  <div className="relative">
    <button
      onClick={() => setShowNotifs(!showNotifs)}
      className={`p-2.5 rounded-xl transition-all ${
        showNotifs ? "bg-white text-indigo-600 shadow-inner" : "text-white/80 hover:text-white hover:bg-white/10"
      }`}
    >
      <BiBell size={22} />
      {unreadCount > 0 && (
        <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-indigo-600">
          {unreadCount}
        </span>
      )}
    </button>

    {showNotifs && (
      <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Notifications</h3>
          <button 
            onClick={() => {
               // Call your markAllAsRead function here
               const markAll = async () => {
                 try {
                   await fetch("http://localhost:5000/api/notifications/mark-all-read", {
                     method: "PUT",
                     headers: { Authorization: `Bearer ${token}` },
                   });
                   setNotifications(notifications.map(n => ({ ...n, read: true })));
                 } catch (e) { console.error(e); }
               };
               markAll();
            }}
            className="text-[10px] font-bold text-indigo-600 hover:underline"
          >
            Mark all read
          </button>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400">No new alerts</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => markAsRead(n._id)}
                className={`p-4 border-b border-slate-50 cursor-pointer transition-colors ${
                  n.read ? "opacity-40" : "bg-indigo-50/30 hover:bg-indigo-50/50"
                }`}
              >
                <p className="text-[13px] text-slate-700 font-medium leading-snug">{n.message}</p>
                <span className="text-[9px] text-slate-400 font-bold uppercase mt-2 block">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    )}
  </div>
</div>
      {/* Desktop Auth */}
<div className="hidden md:flex items-center gap-4">
  {!user ? (
    <>
      <NavLink
        to="/LoginCard"
        className={({ isActive }) =>
          `px-4 py-2 rounded-full text-sm font-medium ${
            isActive ? desktopActive : desktopInactive
          }`
        }
      >
        Login
      </NavLink>

      <NavLink
        to="/Register"
        className={({ isActive }) =>
          `px-4 py-2 rounded-full text-sm font-medium ${
            isActive ? desktopActive : desktopInactive
          }`
        }
      >
        Register
      </NavLink>
    </>
  ) : (
    <div className="relative profile-container">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-1.5 pr-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all active:scale-95"
      >
        {/* Avatar Box - Using Optional Chaining to prevent "Object" error */}
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-400 to-orange-500 text-white font-black shadow-lg shadow-orange-500/20">
          {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
        </div>

        {/* Name and Role Labels */}
        <div className="hidden sm:block text-left">
          <p className="text-[13px] font-black text-white leading-none">
            @{user?.username || "User"}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest">
              {user?.role || "User"}
            </p>
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl py-2 border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-2 border-b border-slate-50 mb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Account</p>
          </div>
          <NavLink
            to="/profile"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <FiUser className="text-lg" /> Profile
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-slate-50"
          >
            <FiLogOut className="text-lg" /> Logout
          </button>
        </div>
      )}
    </div>
  )}
</div>
        {/* Mobile Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white text-3xl"
          >
            {isOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-4 bg-indigo-700 rounded-xl p-4">

          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === "/"}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg ${
                  isActive ? mobileActive : mobileInactive
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* Admin Link - Mobile (Same Styling) */}
          {user?.role === "admin" && (
            <NavLink
              to="/admin-feedback"  
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg ${
                  isActive ? mobileActive : mobileInactive
                }`
              }
            >
              Admin Panel
            </NavLink>
          )}

          {/* Volunteer Specific Link - Mobile */}
          {user?.role === "volunteer" && (
            <NavLink
              to="/my-ratings"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg ${
                  isActive ? mobileActive : mobileInactive
                }`
              }
            >
              My Ratings
            </NavLink>
          )}

          <div className="border-t border-indigo-500 pt-4">
            {!user ? (
              <>
                <NavLink
                  to="/LoginCard"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg ${
                      isActive ? mobileActive : mobileInactive
                    }`
                  }
                >
                  Login
                </NavLink>

                <NavLink
                  to="/Register"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg ${
                      isActive ? mobileActive : mobileInactive
                    }`
                  }
                >
                  Register
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg ${
                      isActive ? mobileActive : mobileInactive
                    }`
                  }
                >
                  Profile
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="block text-red-300 py-2 px-4"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;