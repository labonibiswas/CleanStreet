import { useState, useEffect, useRef } from "react";
import { FaRoad } from "react-icons/fa6";
import { HiMenu, HiX } from "react-icons/hi";
import { FiLogOut, FiUser } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [location]);

  
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
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

  const getButtonStyles = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "bg-white text-indigo-600 shadow-md"
      : "text-white hover:text-yellow-300";
  };

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
            <Link
              key={link.name}
              to={link.path}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${getButtonStyles(link.path)}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <Link
                to="/LoginCard"
                className="text-white font-medium hover:text-yellow-300 transition"
              >
                Login
              </Link>
              <Link
                to="/Register"
                className="bg-white text-indigo-600 px-5 py-2 rounded-full font-semibold shadow hover:scale-105 transition"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar Button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-md">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>

                <span className="text-white font-semibold tracking-wide">
                  @{user?.username}
                </span>
              </button>

              {/* Desktop Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl py-2 border border-gray-100">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition rounded-xl mx-2"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FiUser className="text-lg" />
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition rounded-xl mx-2"
                  >
                    <FiLogOut className="text-lg" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
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
        <div className="md:hidden mt-4 bg-indigo-700 rounded-xl shadow-lg py-4 px-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block text-white py-2 px-3 rounded-lg hover:bg-indigo-600 transition"
            >
              {link.name}
            </Link>
          ))}

          <hr className="border-indigo-500 my-2" />

          {!isLoggedIn ? (
            <>
              <Link
                to="/LoginCard"
                onClick={() => setIsOpen(false)}
                className="block text-white py-2 px-3 rounded-lg hover:bg-indigo-600 transition"
              >
                Login
              </Link>

              <Link
                to="/Register"
                onClick={() => setIsOpen(false)}
                className="block bg-white text-indigo-600 py-2 px-3 rounded-lg font-semibold text-center"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-medium">
                  @{user?.username}
                </span>
              </div>

              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="block text-white py-2 px-3 rounded-lg hover:bg-indigo-600 transition"
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left text-red-300 py-2 px-3 rounded-lg hover:bg-red-500 hover:text-white transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;