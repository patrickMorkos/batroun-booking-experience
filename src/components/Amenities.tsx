import { sharedAmenities } from "@/data/chalets";
import poolImg from "@/assets/pool.jpg";
import lobbyImg from "@/assets/lobby.jpg";

const images = [poolImg, lobbyImg];

export default function Amenities() {
  return (
    <section id="amenities" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Shared <span className="text-primary">Amenities</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Enjoy premium facilities shared across our guesthouse, designed for relaxation and entertainment.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {sharedAmenities.map((a) => (
            <div
              key={a.name}
              className="bg-card rounded-2xl p-6 text-center hover:border-primary border border-border transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="text-4xl mb-3">{a.icon}</div>
              <p className="text-sm font-medium text-foreground">{a.name}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {images.map((img, i) => (
            <div key={i} className="rounded-2xl overflow-hidden group">
              <img
                src={img}
                alt="Amenity"
                className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
