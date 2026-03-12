import { useState, useEffect } from "react";
import { FaRoad } from "react-icons/fa6";
import { HiMenu, HiX } from "react-icons/hi";
import { FiLogOut, FiUser } from "react-icons/fi";
import { NavLink, Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    return token && storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    const syncUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    };

    window.addEventListener("storage", syncUser);
    syncUser();

    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setDropdownOpen(false);
    setIsOpen(false);

    navigate("/LoginCard");
  };

  /* USER LINKS */
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Report Issue", path: "/report" },
    { name: "View Complaints", path: "/complaints" },
  ];

  /* ADMIN LINKS */
  const adminLinks = [
    { name: "Home", path: "/" },
    { name: "Admin Dashboard", path: "/dashboard" },
  ];

  const links = user?.role === "admin" ? adminLinks : navLinks;

  const desktopActive = "bg-white text-indigo-600 shadow-md";
  const desktopInactive = "text-white hover:text-yellow-300";

  const mobileActive = "bg-white text-indigo-600";
  const mobileInactive = "text-white hover:bg-indigo-600";

  return (
    <nav className="w-full bg-indigo-600 py-3 px-6 shadow-md sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-2">
          <FaRoad className="h-7 w-7 text-indigo-600 bg-white p-1.5 rounded-lg shadow" />
          <span className="text-white font-bold text-xl tracking-wide">
            CleanStreet
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition duration-300 ${
                  isActive ? desktopActive : desktopInactive
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-white font-semibold hover:text-yellow-300 transition"
              >
                <FiUser className="w-5 h-5" />
                {user.username}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden py-1 border border-gray-100">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/LoginCard"
              className="bg-yellow-400 text-indigo-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-300 shadow-md transition"
            >
              Login
            </Link>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white hover:text-yellow-300 transition"
        >
          {isOpen ? <HiX className="w-7 h-7" /> : <HiMenu className="w-7 h-7" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden mt-4 bg-indigo-700 rounded-lg p-4 flex flex-col gap-3 shadow-inner">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition duration-300 ${
                  isActive ? mobileActive : mobileInactive
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ${mobileInactive}`}
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="mt-2 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 shadow-md transition"
              >
                <FiLogOut className="w-5 h-5" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/LoginCard"
              onClick={() => setIsOpen(false)}
              className="mt-2 text-center bg-yellow-400 text-indigo-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-300 shadow-md transition"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;