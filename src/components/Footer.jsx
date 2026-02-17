import { Mail, Phone, MapPin } from "lucide-react";
import { FaRoad } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-[#2d2d3f] text-white">
      {/* Top accent line */}
      <div className="h-1 bg-yellow-400"></div>

      <div className="max-w-[1200px] mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-indigo-600 rounded-md p-1.5">
              <FaRoad className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">CleanStreet</span>
          </div>
          <p className="text-gray-400 text-sm">
            make your city clean
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-bold text-sm mb-4 text-white">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            {["Home", "Dashboard", "Report Issue", "View Complaints", "FAQs"].map(
              (link) => (
                <li key={link}>
                  <a href="#" className="hover:text-yellow-400 transition-colors">
                    {link}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Transparency & Legal */}
        <div>
          <h3 className="font-bold text-sm mb-4 text-white">Transparency & Legal</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            {["Privacy Policy", "Terms of Service", "Data Usage Policy"].map(
              (link) => (
                <li key={link}>
                  <a href="#" className="hover:text-yellow-400 transition-colors">
                    {link}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-sm mb-4 text-white">Contact Information</h3>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-yellow-400" /> support@cleanstreet.in
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-yellow-400" /> +91-XXXXXXXXXX
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-yellow-400" /> City Civic Office Address
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 py-4 text-center text-xs text-gray-500">
        © 2026 Clean Street. All Rights Reserved. Powered by CleanStreet Initiative Made with ❤ for better cities
      </div>
    </footer>
  );
};

export default Footer;