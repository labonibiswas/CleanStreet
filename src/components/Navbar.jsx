import { FaRoad } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full bg-indigo-600 py-3 px-8 shadow-md">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <FaRoad className="h-6 w-6 text-black bg-white p-1 rounded" />
          <span className="text-white font-bold text-lg">
            CleanStreet
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          
          <Link
            to="/"
            className="text-white hover:text-yellow-300 text-sm font-medium transition"
          >
            Home
          </Link>

          <Link
            to="#"
            className="text-white hover:text-yellow-300 text-sm font-medium transition"
          >
            Dashboard
          </Link>

          <Link
            to="#"
            className="text-white hover:text-yellow-300 text-sm font-medium transition"
          >
            Report Issue
          </Link>

          <Link
            to="#"
            className="text-white hover:text-yellow-300 text-sm font-medium transition"
          >
            View Complaints
          </Link>

          {/* Login Button */}
         <Link
            to="/LoginCard"
             className="bg-white text-indigo-600 px-5 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-100 transition"
          >
          Login
          </Link>


          {/* Register */}
          <Link
            to="/Register"
            className="text-white hover:text-yellow-300 text-sm font-semibold transition"
          >
            Register
          </Link>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
