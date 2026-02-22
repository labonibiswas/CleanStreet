import { Menu, User } from "lucide-react";
import { Link } from "react-router-dom";

const navItems = ["Home", "Dashboard", "Report Issue", "View Complaints"];

const Navbar = () => {
  return (
    <nav className="bg-navbar flex items-center justify-between px-6" style={{ height: 64 }}>
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-10 w-11 rounded">
          <svg viewBox="0 0 44 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-11">
            <path d="M8 38h28l4-22H4l4 22z" fill="#1E293B"/>
            <rect x="14" y="8" width="4" height="14" rx="2" fill="white"/>
            <rect x="26" y="8" width="4" height="14" rx="2" fill="white"/>
            <path d="M16 0h12v6H16z" fill="#1E293B" rx="2"/>
            <circle cx="22" cy="28" r="3" fill="white"/>
          </svg>
        </div>
        <span className="text-navbar-foreground font-semibold text-lg">CleanStreet</span>
      </div>

      {/* Center: Menu */}
      <ul className="hidden md:flex items-center gap-8">
        {navItems.map((item) =>
        <li key={item}>
            <Link
            to="#"
            className={`text-sm font-medium hover:opacity-80 transition-opacity ${
            item === "Report Issue" ? "text-navbar-active" : "text-navbar-foreground"}`
            }>

              {item}
            </Link>
          </li>
        )}
      </ul>

      {/* Right: User icon */}
      <div className="flex items-center">
        <div className="hidden md:flex h-9 w-9 rounded-full border-2 border-navbar-foreground/40 items-center justify-center">
          <User className="h-5 w-5 text-navbar-foreground" />
        </div>
        <button className="md:hidden text-navbar-foreground">
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </nav>);

};

export default Navbar;