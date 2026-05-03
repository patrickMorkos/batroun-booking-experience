import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";
import type { ChaletWithImages } from "@/types/database";

interface Props {
  chalet: ChaletWithImages;
}

export default function ChaletCard({ chalet }: Props) {
  const primaryImage = chalet.chalet_images?.find((img) => img.is_primary) || chalet.chalet_images?.[0];

  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 group">
      <div className="relative overflow-hidden h-56">
        {primaryImage ? (
          <OptimizedImage
            src={primaryImage.url}
            alt={chalet.name}
            width={800}
            height={600}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="group-hover:scale-110 transition-transform duration-700"
            containerClassName="w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm text-primary font-semibold px-3 py-1 rounded-full text-sm">
          From ${chalet.weekday_price}/night
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
