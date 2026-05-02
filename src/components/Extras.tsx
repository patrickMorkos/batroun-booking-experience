import { extras, includedAmenities } from "@/data/chalets";
import { Check, Clock } from "lucide-react";

export default function Extras() {
  return (
    <section className="py-20 px-4 bg-card/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            What's <span className="text-primary">Included</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div>
            <h3 className="font-heading text-2xl font-semibold text-foreground mb-6">In Every Chalet</h3>
            <div className="space-y-3">
              {includedAmenities.map((a) => (
                <div key={a} className="flex items-center gap-3 text-foreground">
                  <Check size={18} className="text-primary flex-shrink-0" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading text-2xl font-semibold text-foreground mb-6">Extras & Add-ons</h3>
            <div className="space-y-3">
              {extras.map((e) => (
                <div key={e.name} className="flex items-center gap-3 text-foreground">
                  {e.available ? (
                    <Check size={18} className="text-primary flex-shrink-0" />
                  ) : (
                    <Clock size={18} className="text-muted-foreground flex-shrink-0" />
                  )}
                  <span>{e.name}</span>
                  {e.note && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{e.note}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
