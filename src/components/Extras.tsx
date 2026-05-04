import { useState } from "react";
import { includedAmenities } from "@/data/chalets";
import { useExtras } from "@/hooks/useExtras";
import { Check, Clock, Eye } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import type { Extra } from "@/types/database";

export default function Extras() {
  const { data: extras } = useExtras();
  const [selectedExtra, setSelectedExtra] = useState<Extra | null>(null);

  const hasMedia = (e: Extra) => e.media_urls && e.media_urls.length > 0;

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
              {extras?.map((e) => {
                const clickable = hasMedia(e);
                const Wrapper = clickable ? "button" : "div";

                return (
                  <Wrapper
                    key={e.id}
                    type={clickable ? "button" : undefined}
                    onClick={clickable ? () => setSelectedExtra(e) : undefined}
                    className={`flex items-center gap-3 text-foreground ${clickable ? "w-full rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 cursor-pointer hover:bg-primary/10 hover:border-primary/60 transition-all" : ""}`}
                  >
                    {e.available ? (
                      <Check size={18} className="text-primary flex-shrink-0" />
                    ) : (
                      <Clock size={18} className="text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={clickable ? "font-medium" : ""}>{e.name}</span>
                    {e.available && e.price > 0 && (
                      <span className="text-xs font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full">${e.price}</span>
                    )}
                    {e.note && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{e.note}</span>
                    )}
                    {clickable && (
                      <Eye size={16} className="ml-auto text-primary/60 flex-shrink-0" />
                    )}
                  </Wrapper>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedExtra} onOpenChange={(v) => !v && setSelectedExtra(null)}>
        <DialogContent className="sm:max-w-sm max-w-[90vw] rounded-2xl p-0 overflow-hidden">
          {selectedExtra?.media_urls && selectedExtra.media_urls.length > 0 ? (
            selectedExtra.media_urls.length === 1 ? (
              <div>
                <img
                  src={selectedExtra.media_urls[0]}
                  alt={selectedExtra.name}
                  className="w-full aspect-[9/16] object-cover"
                />
                <div className="p-4 text-center">
                  <p className="font-heading text-lg font-semibold">{selectedExtra.name}</p>
                </div>
              </div>
            ) : (
              <div>
                <Carousel opts={{ loop: true }} className="w-full">
                  <CarouselContent>
                    {selectedExtra.media_urls.map((url, i) => (
                      <CarouselItem key={i}>
                        <img
                          src={url}
                          alt={`${selectedExtra.name} ${i + 1}`}
                          className="w-full aspect-[9/16] object-cover"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
                <div className="p-4 text-center">
                  <p className="font-heading text-lg font-semibold">{selectedExtra.name}</p>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center aspect-[9/16] px-6">
              <p className="font-heading text-xl font-semibold">{selectedExtra?.name}</p>
              <p className="text-sm text-muted-foreground mt-1">Coming soon</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
