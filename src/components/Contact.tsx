import { Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Contact() {
  return (
    <section id="contact" className="py-20 px-4 bg-card/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get in <span className="text-primary">Touch</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Ready to book your Mediterranean escape? Reach out to us anytime.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-card rounded-2xl border border-border p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="Ô Batroun" className="w-20 h-20 rounded-full" />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp / Phone</p>
                <a href="tel:+96181522115" className="text-foreground font-medium hover:text-primary transition-colors">
                  +961 81 522 115
                </a>
                <span className="mx-2 text-muted-foreground">|</span>
                <a href="tel:+96176363237" className="text-foreground font-medium hover:text-primary transition-colors">
                  76 363 237
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-foreground font-medium">Batroun, Lebanon</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a
              href="https://wa.me/96181522115"
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-gold text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
