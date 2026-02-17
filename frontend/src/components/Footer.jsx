import { Mail, Phone, MapPin } from "lucide-react";
import { FaRoad } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer>
      {/* Main Footer */}
      <div className="bg-indigo-600 text-white">
        <div className="max-w-[1200px] mx-auto px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              {/* Keep original black & white logo */}
              <FaRoad className="h-6 w-6 text-black bg-white p-1 rounded" />
              <div>
                <h2 className="font-bold text-lg">CleanStreet</h2>
                <p className="text-xs text-white/80">
                  make your city clean
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
            <ul className="space-y-1 text-sm text-white/80">
              {["Home", "Dashboard", "Report Issue", "View Complaints", "FAQs"].map(
                (link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition">
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Transparency & Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Transparency & Legal</h3>
            <ul className="space-y-1 text-sm text-white/80">
              {["Privacy Policy", "Terms of Service", "Data Usage Policy"].map(
                (link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition">
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Contact Information</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                support@cleanstreet.in
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +91-XXXXXXXXXX
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                City Civic Office Address
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-gray-200 text-gray-700 text-center text-xs py-2">
        © 2026 Clean Street. All Rights Reserved. Powered by CleanStreet Initiative Made with ❤ for better cities
      </div>
    </footer>
  );
};

export default Footer;
