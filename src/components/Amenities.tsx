import { useEffect, useState } from "react";
import { sharedAmenities } from "@/data/chalets";
import { useSiteImages } from "@/hooks/useSiteImages";
import { useGalleryMedia } from "@/hooks/useGalleryMedia";
import { SLOT_MAP } from "@/lib/siteImageSlots";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Amenities() {
  const { data: siteImages } = useSiteImages();
  const { data: galleryMedia } = useGalleryMedia();
  const [api, setApi] = useState<CarouselApi>();
  const [fullApi, setFullApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

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

  const fallbackImages = [
    {
      src: siteImages?.amenity_pool.url ?? SLOT_MAP.amenity_pool.fallback,
      alt: siteImages?.amenity_pool.alt ?? SLOT_MAP.amenity_pool.defaultAlt,
    },
    {
      src: siteImages?.amenity_lobby.url ?? SLOT_MAP.amenity_lobby.fallback,
      alt: siteImages?.amenity_lobby.alt ?? SLOT_MAP.amenity_lobby.defaultAlt,
    },
  ];

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

        {hasGallery ? (
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
                        <video
                          src={item.url}
                          className="w-full h-80 md:h-[450px] object-cover"
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.title || "Gallery"}
                          className="w-full h-80 md:h-[450px] object-cover"
                          loading={index === 0 ? "eager" : "lazy"}
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
                <Carousel setApi={setFullApi} opts={{ loop: true, startIndex: activeIndex }} className="h-full">
                  <CarouselContent className="h-screen">
                    {galleryMedia.map((item) => (
                      <CarouselItem key={`${item.id}-full`} className="h-screen">
                        <div className="h-full flex items-center justify-center bg-black">
                          {item.type === "video" ? (
                            <video
                              src={item.url}
                              className="max-h-screen w-full object-contain"
                              muted
                              controls
                              autoPlay
                              playsInline
                            />
                          ) : (
                            <img
                              src={item.url}
                              alt={item.title || "Gallery"}
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
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {fallbackImages.map((img, i) => (
              <div key={i} className="rounded-2xl overflow-hidden group">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width={800}
                  height={600}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
