import { Home, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-[1200px] mx-auto px-8 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary-foreground/20 rounded-md p-1">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">CleanStreet</span>
          </div>
          <p className="text-primary-foreground/70 text-sm">
            make your city clean
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
          <ul className="space-y-1.5 text-sm text-primary-foreground/70">
            {["Home", "Dashboard", "Report Issue", "View Complaints", "FAQs"].map(
              (link) => (
                <li key={link}>
                  <a href="#" className="hover:text-primary-foreground transition-colors">
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
          <ul className="space-y-1.5 text-sm text-primary-foreground/70">
            {["Privacy Policy", "Terms of Service", "Data Usage Policy"].map(
              (link) => (
                <li key={link}>
                  <a href="#" className="hover:text-primary-foreground transition-colors">
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
          <ul className="space-y-1.5 text-sm text-primary-foreground/70">
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> support@cleanstreet.in
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" /> +91-XXXXXXXXXX
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> City Civic Office Address
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15 py-3 text-center text-xs text-primary-foreground/60">
        © 2026 Clean Street. All Rights Reserved. Powered by CleanStreet Initiative Made with ❤ for better cities
      </div>
    </footer>
  );
};

export default Footer;
