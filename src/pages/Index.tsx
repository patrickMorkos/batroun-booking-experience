import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Amenities from "@/components/Amenities";
import ChaletsList from "@/components/ChaletsList";
import NearbyAttractions from "@/components/NearbyAttractions";
import Extras from "@/components/Extras";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* Featured Chalets */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our <span className="text-primary">Chalets</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From cozy rooms to luxurious duplex suites — find the perfect space for your Mediterranean getaway.
            </p>
          </div>
          <ChaletsList limit={3} />
          <div className="text-center mt-12">
            <Link
              to="/chalets"
              className="inline-block border-2 border-primary text-primary px-8 py-3 rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
            >
              View All Chalets
            </Link>
          </div>
        </div>
      </section>

      <Amenities />
      <Extras />
      <NearbyAttractions />
      <Contact />
      <Footer />
    </div>
  );
}
