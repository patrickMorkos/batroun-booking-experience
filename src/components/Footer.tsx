import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Ô Batroun" className="h-10 w-10 rounded-full" />
              <span className="font-heading text-lg font-semibold text-primary">Ô Batroun</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your premium Mediterranean retreat in the heart of Batroun, Lebanon.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
              <Link to="/chalets" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Chalets</Link>
              <a href="/#amenities" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Amenities</a>
              <a href="/#contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Follow Us</h4>
            <div className="space-y-2">
              <a
                href="https://www.instagram.com/o_batroun.lb"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                📸 Instagram
              </a>
              <a
                href="https://www.tiktok.com/@obatroun.leb"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                🎵 TikTok @obatroun.leb
              </a>
              <a
                href="https://www.tiktok.com/@o_batroun_guesthouse"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                🎵 TikTok @o_batroun_guesthouse
              </a>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-sm text-muted-foreground">📞 +961 81 522 115</p>
              <p className="text-sm text-muted-foreground">📞 76 363 237</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ô Batroun Guesthouse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
