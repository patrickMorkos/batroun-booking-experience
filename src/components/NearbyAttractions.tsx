import { nearbyPlaces } from "@/data/chalets";
import batrounImg from "@/assets/batroun-town.jpg";

export default function NearbyAttractions() {
  return (
    <section id="nearby" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Explore <span className="text-primary">Batroun</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover the charm of one of Lebanon's most beautiful coastal towns, just minutes from your door.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="rounded-2xl overflow-hidden">
            <img
              src={batrounImg}
              alt="Batroun Town"
              className="w-full h-full object-cover min-h-[300px]"
              loading="lazy"
              width={800}
              height={600}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {nearbyPlaces.map((p) => (
              <div
                key={p.name}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all hover:-translate-y-1"
              >
                <div className="text-2xl mb-2">{p.icon}</div>
                <h4 className="font-heading font-semibold text-foreground text-sm mb-1">{p.name}</h4>
                <p className="text-xs text-muted-foreground">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
