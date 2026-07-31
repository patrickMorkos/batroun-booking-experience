import { useEffect, useState } from "react";
import { useAmenities } from "@/hooks/useAmenities";
import { useGalleryMedia } from "@/hooks/useGalleryMedia";
import { useSwipeDismiss } from "@/hooks/useSwipeDismiss";
import OptimizedImage from "@/components/OptimizedImage";
import LazyVideo from "@/components/LazyVideo";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Amenity } from "@/types/database";

export default function Amenities() {
  const { data: amenities } = useAmenities();
  const { data: galleryMedia } = useGalleryMedia();
  const [api, setApi] = useState<CarouselApi>();
  const [fullApi, setFullApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api]);

  useEffect(() => {
    if (!fullApi) return;
    const onSelect = () => {
      const idx = fullApi.selectedScrollSnap();
      setActiveIndex(idx);
      api?.scrollTo(idx);
    };
    onSelect();
    fullApi.on("select", onSelect);
    return () => { fullApi.off("select", onSelect); };
  }, [fullApi, api]);

  useEffect(() => {
    if (isFullscreenOpen) fullApi?.scrollTo(activeIndex);
  }, [isFullscreenOpen, activeIndex, fullApi]);

  useEffect(() => {
    if (!api || isFullscreenOpen) return;
    const timer = window.setInterval(() => api.scrollNext(), 3000);
    return () => window.clearInterval(timer);
  }, [api, isFullscreenOpen]);

  const openFullscreenAt = (index: number) => {
    setActiveIndex(index);
    setIsFullscreenOpen(true);
    api?.scrollTo(index);
  };

  const { elRef: swipeRef, onTouchStart, onTouchMove, onTouchEnd } = useSwipeDismiss(
    () => setIsFullscreenOpen(false)
  );

  const hasGallery = galleryMedia && galleryMedia.length > 0;

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
          {amenities?.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelectedAmenity(a)}
              className="bg-card rounded-2xl p-6 text-center hover:border-primary border border-border transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
            >
              <div className="text-4xl mb-3">{a.icon}</div>
              <p className="text-sm font-medium text-foreground">{a.name}</p>
            </button>
          ))}
        </div>

        {hasGallery && (
          <div className="mx-auto max-w-4xl">
            <Carousel
              setApi={setApi}
              opts={{ loop: true, duration: 45 }}
              className="w-full"
            >
              <CarouselContent>
                {galleryMedia.map((item, index) => (
                  <CarouselItem key={item.id}>
                    <button
                      type="button"
                      onClick={() => openFullscreenAt(index)}
                      className="w-full rounded-2xl overflow-hidden border border-border/60 cursor-pointer"
                    >
                      {item.type === "video" ? (
                        <LazyVideo
                          src={item.url}
                          className="w-full h-[70vh] md:h-[550px] object-contain bg-black"
                        />
                      ) : (
                        <OptimizedImage
                          src={item.url}
                          alt={item.title || "Gallery"}
                          width={1200}
                          height={1600}
                          priority={index === 0}
                          sizes="(max-width: 768px) 100vw, 800px"
                          containerClassName="w-full h-[70vh] md:h-[550px]"
                        />
                      )}
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-black/20 px-2 py-1">
                {galleryMedia.map((item, index) => (
                  <button
                    key={`${item.id}-dot`}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => { setActiveIndex(index); api?.scrollTo(index); }}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${activeIndex === index ? "bg-white" : "bg-white/45 hover:bg-white/70"}`}
                  />
                ))}
              </div>
            </Carousel>

            <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
              <DialogContent className="max-w-[100vw] w-screen h-screen rounded-none border-none p-0 bg-black">
                <div
                  ref={swipeRef}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  className="h-full"
                >
                  <Carousel setApi={setFullApi} opts={{ loop: true, startIndex: activeIndex }} className="h-full">
                    <CarouselContent className="h-screen">
                      {galleryMedia.map((item) => (
                        <CarouselItem key={`${item.id}-full`} className="h-screen">
                          <div className="h-full flex items-center justify-center bg-black">
                            {item.type === "video" ? (
                              <video
                                src={item.url}
                                width={1920}
                                height={1080}
                                className="max-h-screen w-full object-contain"
                                muted
                                controls
                                autoPlay
                                playsInline
                                preload="metadata"
                              />
                            ) : (
                              <img
                                src={item.url}
                                alt={item.title || "Gallery"}
                                width={1920}
                                height={1080}
                                loading="lazy"
                                decoding="async"
                                className="max-h-screen w-full object-contain"
                              />
                            )}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4 md:left-6 bg-background/70 hover:bg-background border-border" />
                    <CarouselNext className="right-4 md:right-6 bg-background/70 hover:bg-background border-border" />
                  </Carousel>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Dialog open={!!selectedAmenity} onOpenChange={(v) => !v && setSelectedAmenity(null)}>
        <DialogContent className="sm:max-w-sm max-w-[90vw] rounded-2xl p-0 overflow-hidden">
          {selectedAmenity?.image_url ? (
            <div>
              <img
                src={selectedAmenity.image_url}
                alt={selectedAmenity.name}
                width={720}
                height={1280}
                loading="lazy"
                decoding="async"
                className="w-full aspect-[9/16] object-cover"
              />
              <div className="p-4 text-center">
                <p className="font-heading text-lg font-semibold">{selectedAmenity.name}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center aspect-[9/16] px-6">
              <span className="text-7xl mb-4">{selectedAmenity?.icon}</span>
              <p className="font-heading text-xl font-semibold">{selectedAmenity?.name}</p>
              <p className="text-sm text-muted-foreground mt-1">Photo coming soon</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
