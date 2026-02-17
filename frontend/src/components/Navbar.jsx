import { useState } from "react";
import { FaRoad } from "react-icons/fa6";
import { HiMenu, HiX } from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Report Issue", path: "/report" },
    { name: "View Complaints", path: "/complaints" },
  ];

  const getButtonStyles = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "bg-white text-indigo-600 shadow-sm"
      : "text-white hover:text-yellow-300";
  };

  return (
    <nav className="w-full bg-indigo-600 py-3 px-8 shadow-md relative z-50">
      <div className="max-w-[1200px] mx-auto flex items-center">
        
        {/* 1. Logo Section (Left) */}
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <FaRoad className="h-6 w-6 text-black bg-white p-1 rounded" />
            <span className="text-white font-bold text-lg">CleanStreet</span>
          </Link>
        </div>

        {/* 2. Nav Links Section (Center) */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition duration-300 ${getButtonStyles(link.path)}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* 3. Auth Buttons Section (Right) */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <Link
            to="/LoginCard"
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition duration-300 ${getButtonStyles("/LoginCard")}`}
          >
            Login
          </Link>
          <Link
            to="/Register"
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition duration-300 ${getButtonStyles("/Register")}`}
          >
            Register
          </Link>
        </div>

        {/* Mobile Hamburger Icon (Visible only on small screens) */}
        <div className="md:hidden flex flex-1 justify-end items-center">
          <button onClick={toggleMenu} className="text-white text-2xl focus:outline-none">
            {isOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`${isOpen ? "block" : "hidden"} md:hidden bg-indigo-700 absolute top-full left-0 w-full border-t border-indigo-500 shadow-lg`}>
        <div className="flex flex-col p-4 space-y-2">
          {navLinks.concat([{name: "Login", path: "/LoginCard"}, {name: "Register", path: "/Register"}]).map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`px-4 py-3 rounded-lg text-base font-medium transition ${getButtonStyles(link.path)}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;