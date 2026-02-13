import { Home } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="w-full bg-primary py-3 px-8">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-primary-foreground/20 rounded-md p-1">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-primary-foreground font-bold text-lg">
            CleanStreet
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-0">
          <a href="#" className="text-primary-foreground/90 hover:text-primary-foreground px-4 py-2 text-sm font-medium">
            Home
          </a>
          <a href="#" className="text-primary-foreground/90 hover:text-primary-foreground px-4 py-2 text-sm font-medium">
            Dashboard
          </a>
          <a href="#" className="text-primary-foreground/90 hover:text-primary-foreground px-4 py-2 text-sm font-medium">
            Report Issue
          </a>
          <a href="#" className="text-primary-foreground/90 hover:text-primary-foreground px-4 py-2 text-sm font-medium">
            View Complaints
          </a>
          <a
            href="#"
            className="bg-primary-foreground text-primary px-5 py-1.5 rounded-full text-sm font-semibold ml-3"
          >
            Login
          </a>
          <a
            href="#"
            className="text-yellow-400 px-4 py-2 text-sm font-semibold"
          >
            Register
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
