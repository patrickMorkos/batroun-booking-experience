import { Link } from "react-router-dom";
import type { Chalet } from "@/data/chalets";
import { Users } from "lucide-react";

interface Props {
  chalet: Chalet;
}

export default function ChaletCard({ chalet }: Props) {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 group">
      <div className="relative overflow-hidden h-56">
        <img
          src={chalet.image}
          alt={chalet.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          width={800}
          height={600}
        />
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm text-primary font-semibold px-3 py-1 rounded-full text-sm">
          From ${chalet.weekdayPrice}/night
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-heading text-xl font-semibold text-foreground mb-1">{chalet.name}</h3>
        <p className="text-muted-foreground text-sm mb-4">{chalet.tagline}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          {chalet.capacity && (
            <span className="flex items-center gap-1">
              <Users size={14} /> Up to {chalet.capacity}
            </span>
          )}
        </div>
        <Link
          to={`/chalets/${chalet.slug}`}
          className="block text-center gradient-gold text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
