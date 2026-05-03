import { Link } from "react-router-dom";
import { useSiteImages } from "@/hooks/useSiteImages";
import { SLOT_MAP } from "@/lib/siteImageSlots";
import { WA_LINK_1, WA_LINK_2 } from "@/lib/utils";

export default function Footer() {
  const { data: images } = useSiteImages();

  return (
    <footer className="bg-card border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8 text-center">
          <div className="flex flex-col items-center">
            <Link to="/" className="flex items-center gap-3 mb-4 justify-center">
              <img src={images?.logo.url ?? SLOT_MAP.logo.fallback} alt={images?.logo.alt ?? SLOT_MAP.logo.defaultAlt} className="h-10 w-10 rounded-full" />
              <span className="font-heading text-lg font-semibold text-primary">Ô Batroun</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your premium Mediterranean retreat in the heart of Batroun, Lebanon.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <h4 className="font-heading font-semibold text-foreground mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/#top" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
              <Link to="/#chalets" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Chalets</Link>
              <a href="/#amenities" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Amenities</a>
              <a href="/#contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <h4 className="font-heading font-semibold text-foreground mb-4">Our Socials</h4>
            <div className="flex items-center justify-center gap-4 mb-4">
              <a
                href="https://www.instagram.com/o_batroun.lb"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-10 w-10 rounded-full text-white bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)] shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden="true">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.9 1.35a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2ZM12 7a5 5 0 1 1-5 5 5 5 0 0 1 5-5Zm0 1.8A3.2 3.2 0 1 0 15.2 12 3.2 3.2 0 0 0 12 8.8Z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@obatroun.leb"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="h-10 w-10 rounded-full bg-black text-white shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current drop-shadow-[1px_0_0_#FE2C55] drop-shadow-[-1px_0_0_#25F4EE]" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.26v13.01a2.89 2.89 0 1 1-2.89-2.89c.29 0 .57.04.84.13V8.92a6.2 6.2 0 0 0-.84-.06A6.15 6.15 0 1 0 15.82 15V8.29a8.16 8.16 0 0 0 4.77 1.53V6.69z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61586135083737#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="h-10 w-10 rounded-full bg-[#1877F2] text-white shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden="true">
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.25.2 2.25.2v2.46h-1.27c-1.25 0-1.64.77-1.64 1.57V12h2.79l-.45 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
                </svg>
              </a>
              <div className="relative">
                <a
                  href={WA_LINK_1}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp 1"
                  className="h-10 w-10 rounded-full bg-[#25D366] text-white shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden="true">
                    <path d="M20.52 3.48A11.92 11.92 0 0 0 12.03 0C5.42 0 .06 5.36.06 11.97c0 2.11.55 4.17 1.6 5.99L0 24l6.2-1.63a11.91 11.91 0 0 0 5.83 1.48h.01c6.61 0 11.97-5.36 11.97-11.97 0-3.2-1.25-6.2-3.49-8.4Zm-8.49 18.37h-.01a9.93 9.93 0 0 1-5.06-1.39l-.36-.21-3.68.97.98-3.58-.24-.37a9.9 9.9 0 0 1-1.53-5.3c0-5.49 4.47-9.96 9.97-9.96 2.66 0 5.16 1.03 7.04 2.92a9.88 9.88 0 0 1 2.92 7.04c0 5.49-4.47 9.96-9.97 9.96Zm5.46-7.43c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.68-2.1-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.05 1.03-1.05 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.21 5.09 4.5.71.31 1.27.5 1.7.64.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.12-.27-.2-.57-.35Z" />
                  </svg>
                </a>
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-background border border-border text-[10px] font-semibold text-foreground flex items-center justify-center">1</span>
              </div>
              <div className="relative">
                <a
                  href={WA_LINK_2}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp 2"
                  className="h-10 w-10 rounded-full bg-[#25D366] text-white shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden="true">
                    <path d="M20.52 3.48A11.92 11.92 0 0 0 12.03 0C5.42 0 .06 5.36.06 11.97c0 2.11.55 4.17 1.6 5.99L0 24l6.2-1.63a11.91 11.91 0 0 0 5.83 1.48h.01c6.61 0 11.97-5.36 11.97-11.97 0-3.2-1.25-6.2-3.49-8.4Zm-8.49 18.37h-.01a9.93 9.93 0 0 1-5.06-1.39l-.36-.21-3.68.97.98-3.58-.24-.37a9.9 9.9 0 0 1-1.53-5.3c0-5.49 4.47-9.96 9.97-9.96 2.66 0 5.16 1.03 7.04 2.92a9.88 9.88 0 0 1 2.92 7.04c0 5.49-4.47 9.96-9.97 9.96Zm5.46-7.43c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.68-2.1-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.05 1.03-1.05 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.21 5.09 4.5.71.31 1.27.5 1.7.64.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.12-.27-.2-.57-.35Z" />
                  </svg>
                </a>
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-background border border-border text-[10px] font-semibold text-foreground flex items-center justify-center">2</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ô Batroun Guesthouse. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Website developed by{" "}
            <a
              href="https://www.linkedin.com/in/patrick-morkos-75104420b/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              LinkedIn
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
