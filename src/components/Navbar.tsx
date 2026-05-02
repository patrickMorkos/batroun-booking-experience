import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Chalets", href: "/chalets" },
  { label: "Amenities", href: "/#amenities" },
  { label: "Nearby", href: "/#nearby" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  const handleClick = (href: string) => {
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      if (location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    }
    setOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Ô Batroun" className="h-12 w-12 rounded-full" />
          <span className="font-heading text-xl font-semibold text-primary">Ô Batroun</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) =>
            l.href.startsWith("/#") ? (
              <Link
                key={l.label}
                to={l.href}
                onClick={() => handleClick(l.href)}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            ) : (
              <Link
                key={l.label}
                to={l.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            )
          )}
          <a
            href="https://wa.me/96181522115"
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-gold text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Book Now
          </a>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background/98 backdrop-blur-md border-t border-border">
          <div className="flex flex-col p-4 gap-4">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                onClick={() => handleClick(l.href)}
                className="text-foreground/80 hover:text-primary transition-colors py-2"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://wa.me/96181522115"
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-gold text-primary-foreground px-5 py-3 rounded-full text-sm font-semibold text-center"
            >
              Book Now
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
