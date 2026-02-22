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
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition"
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>

                <span className="text-white font-semibold">
                  @{user?.username}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl py-2">
                  <NavLink
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 ${
                        isActive ? "bg-indigo-50 text-indigo-600" : "hover:bg-indigo-50"
                      }`
                    }
                  >
                    <FiUser /> Profile
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50"
                  >
                    <FiLogOut /> Logout
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
