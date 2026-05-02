import Navbar from "@/components/Navbar";
import ChaletsList from "@/components/ChaletsList";
import Footer from "@/components/Footer";

export default function ChaletsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              All <span className="text-primary">Chalets</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Browse our full collection of chalets and suites. Each one offers a unique Mediterranean experience.
            </p>
          </div>
          <ChaletsList />
        </div>
      </div>
      <Footer />
    </div>
  );
}
