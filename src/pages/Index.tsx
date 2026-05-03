import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Amenities from "@/components/Amenities";
import ChaletsList from "@/components/ChaletsList";
import NearbyAttractions from "@/components/NearbyAttractions";
import Extras from "@/components/Extras";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Index() {
  return (
    <div id="top" className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      <section id="chalets" className="py-20 px-4 scroll-mt-28">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our <span className="text-primary">Chalets</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From cozy rooms to luxurious duplex suites — find the perfect space for your Mediterranean getaway.
            </p>
          </div>
          <ChaletsList />
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
