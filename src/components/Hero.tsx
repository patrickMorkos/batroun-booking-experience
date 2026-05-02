import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="Ô Batroun Guesthouse" className="w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto fade-in">
        <img src={logo} alt="Ô Batroun Logo" className="w-28 h-28 mx-auto mb-6 rounded-full shadow-2xl" />
        <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4">
          <span className="text-foreground">Ô Batroun</span>{" "}
          <span className="text-primary italic">Guesthouse</span>
        </h1>
        <p className="text-lg md:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
          Your premium Mediterranean retreat in the heart of Batroun, Lebanon. Unwind in elegance, comfort, and coastal charm.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/chalets"
            className="gradient-gold text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg"
          >
            Explore Chalets
          </Link>
          <a
            href="https://wa.me/96181522115"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-primary text-primary px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Book on WhatsApp
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-primary/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
