import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSiteImages } from "@/hooks/useSiteImages";
import { SLOT_MAP } from "@/lib/siteImageSlots";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Chalets", href: "/#chalets" },
  { label: "Amenities", href: "/#amenities" },
  { label: "Nearby", href: "/#nearby" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: images } = useSiteImages();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.slice(1);
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);

  const handleClick = useCallback((href: string) => {
    setOpen(false);

    if (href === "/") {
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        if (location.hash) {
          window.history.replaceState(null, "", "/");
        }
        return;
      }
      navigate("/");
      return;
    }

    if (href.startsWith("/#")) {
      const id = href.slice(2);
      if (location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState(null, "", href);
        return;
      }
      navigate(href);
    }
  }, [location.pathname, location.hash, navigate]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" onClick={() => handleClick("/")} className="flex items-center gap-3">
          <img src={images?.logo.url ?? SLOT_MAP.logo.fallback} alt={images?.logo.alt ?? SLOT_MAP.logo.defaultAlt} className="h-12 w-12 rounded-full" />
          <span className="font-heading text-xl font-semibold text-primary">Ô Batroun</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              onClick={(e) => { e.preventDefault(); handleClick(l.href); }}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {l.label}
            </Link>
          ))}
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
              <button
                key={l.label}
                onClick={() => handleClick(l.href)}
                className="text-left text-foreground/80 hover:text-primary transition-colors py-2"
              >
                {l.label}
              </button>
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
