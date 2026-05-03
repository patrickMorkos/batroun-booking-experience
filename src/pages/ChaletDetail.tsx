import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { usePublicChalet } from "@/hooks/useChalets";
import { includedAmenities } from "@/data/chalets";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ArrowLeft, Clock, Users, MessageCircle } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { DateRange } from "react-day-picker";

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6;
}

function calculatePrice(checkIn: Date, checkOut: Date, weekdayPrice: number, weekendPrice: number) {
  let total = 0;
  let nights = 0;
  let weekdayNights = 0;
  let weekendNights = 0;
  const current = new Date(checkIn);
  while (current < checkOut) {
    if (isWeekend(current)) {
      weekendNights++;
      total += weekendPrice;
    } else {
      weekdayNights++;
      total += weekdayPrice;
    }
    nights++;
    current.setDate(current.getDate() + 1);
  }
  return { total, nights, weekdayNights, weekendNights };
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function ChaletDetail() {
  const { slug } = useParams();
  const { data: chalet, isLoading, isError } = usePublicChalet(slug);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [galleryApi, setGalleryApi] = useState<CarouselApi>();
  const [fullApi, setFullApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const images = useMemo(() => {
    if (!chalet?.chalet_images) return [];
    return [...chalet.chalet_images].sort((a, b) => a.display_order - b.display_order);
  }, [chalet]);

  const pricing = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to || !chalet) return null;
    return calculatePrice(dateRange.from, dateRange.to, chalet.weekday_price, chalet.weekend_price);
  }, [dateRange, chalet]);

  useEffect(() => {
    if (!galleryApi) return;
    const onSelect = () => setActiveIndex(galleryApi.selectedScrollSnap());
    onSelect();
    galleryApi.on("select", onSelect);
    return () => { galleryApi.off("select", onSelect); };
  }, [galleryApi]);

  useEffect(() => {
    if (!fullApi) return;
    const onSelect = () => {
      const nextIndex = fullApi.selectedScrollSnap();
      setActiveIndex(nextIndex);
      galleryApi?.scrollTo(nextIndex);
    };
    onSelect();
    fullApi.on("select", onSelect);
    return () => { fullApi.off("select", onSelect); };
  }, [fullApi, galleryApi]);

  useEffect(() => {
    if (isFullscreenOpen) fullApi?.scrollTo(activeIndex);
  }, [isFullscreenOpen, activeIndex, fullApi]);

  useEffect(() => {
    if (!galleryApi || isFullscreenOpen) return;
    const timer = window.setInterval(() => galleryApi.scrollNext(), 2500);
    return () => window.clearInterval(timer);
  }, [galleryApi, isFullscreenOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-4">
          <div className="container mx-auto">
            <Skeleton className="h-6 w-40 mb-8" />
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <Skeleton className="h-[450px] w-full rounded-2xl mb-6" />
                <Skeleton className="h-10 w-2/3 mb-4" />
                <Skeleton className="h-5 w-full mb-6" />
              </div>
              <Skeleton className="h-[500px] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!chalet && isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="font-heading text-3xl text-foreground mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">We couldn't load this chalet. Please try again.</p>
          <Link to="/#chalets" className="text-primary hover:underline">Back to Chalets</Link>
        </div>
      </div>
    );
  }

  if (!chalet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="font-heading text-3xl text-foreground mb-4">Chalet not found</h2>
          <Link to="/#chalets" className="text-primary hover:underline">Back to Chalets</Link>
        </div>
      </div>
    );
  }

  const whatsappMessage = pricing && dateRange?.from && dateRange?.to
    ? encodeURIComponent(
        [
          `Hello! I'd like to book a chalet at \u00D4 Batroun Guesthouse`,
          ``,
          `*Chalet:* ${chalet.name}`,
          ``,
          `*Check-in:* ${formatDate(dateRange.from)}`,
          `*Check-out:* ${formatDate(dateRange.to)}`,
          `*Nights:* ${pricing.nights}`,
          ``,
          `*Price Breakdown:*`,
          pricing.weekdayNights > 0 ? `  \u2022 ${pricing.weekdayNights} weekday night${pricing.weekdayNights > 1 ? "s" : ""} \u00D7 $${chalet.weekday_price} = $${pricing.weekdayNights * chalet.weekday_price}` : null,
          pricing.weekendNights > 0 ? `  \u2022 ${pricing.weekendNights} weekend night${pricing.weekendNights > 1 ? "s" : ""} \u00D7 $${chalet.weekend_price} = $${pricing.weekendNights * chalet.weekend_price}` : null,
          ``,
          `*Total: $${pricing.total}*`,
          ``,
          `Please confirm availability. Thank you!`,
        ].filter(Boolean).join("\n")
      )
    : encodeURIComponent(`Hello! I'd like to book a chalet at \u00D4 Batroun Guesthouse\n\nI'm interested in *${chalet.name}*. Please share availability.`);

  const openFullscreenAt = (index: number) => {
    setActiveIndex(index);
    setIsFullscreenOpen(true);
    galleryApi?.scrollTo(index);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <Link
            to="/#chalets"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={18} /> Back to Chalets
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              {images.length > 0 && (
                <div className="mb-6 space-y-4">
                  <Carousel
                    setApi={setGalleryApi}
                    opts={{ loop: true, startIndex: activeIndex, duration: 45 }}
                    className="w-full"
                  >
                    <CarouselContent>
                      {images.map((image, index) => (
                        <CarouselItem key={image.id}>
                          <button
                            type="button"
                            onClick={() => openFullscreenAt(index)}
                            className="w-full rounded-2xl overflow-hidden border border-border/60"
                          >
                            <OptimizedImage
                              src={image.url}
                              alt={`${chalet.name} photo ${index + 1}`}
                              width={1600}
                              height={1000}
                              priority={index === 0}
                              sizes="(max-width: 768px) 100vw, 50vw"
                              containerClassName="w-full h-80 md:h-[450px]"
                            />
                          </button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-black/20 px-2 py-1">
                      {images.map((image, index) => (
                        <button
                          key={`${image.id}-dot`}
                          type="button"
                          aria-label={`Go to image ${index + 1}`}
                          onClick={() => { setActiveIndex(index); galleryApi?.scrollTo(index); }}
                          className={`h-1.5 w-1.5 rounded-full transition-all ${activeIndex === index ? "bg-white" : "bg-white/45 hover:bg-white/70"}`}
                        />
                      ))}
                    </div>
                  </Carousel>
                </div>
              )}

              <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
                <DialogContent className="max-w-[100vw] w-screen h-screen rounded-none border-none p-0 bg-black">
                  <Carousel setApi={setFullApi} opts={{ loop: true, startIndex: activeIndex }} className="h-full">
                    <CarouselContent className="h-screen">
                      {images.map((image, index) => (
                        <CarouselItem key={`${image.id}-full`} className="h-screen">
                          <div className="h-full flex items-center justify-center bg-black">
                            <img
                              src={image.url}
                              alt={`${chalet.name} fullscreen ${index + 1}`}
                              className="max-h-screen w-full object-contain"
                              decoding="async"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4 md:left-6 bg-background/70 hover:bg-background border-border" />
                    <CarouselNext className="right-4 md:right-6 bg-background/70 hover:bg-background border-border" />
                  </Carousel>
                </DialogContent>
              </Dialog>

              <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-2">{chalet.name}</h1>
              <p className="text-lg text-muted-foreground mb-6">{chalet.tagline}</p>

              <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
                {chalet.capacity && (
                  <span className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full border border-border">
                    <Users size={14} /> Up to {chalet.capacity} guests
                  </span>
                )}
                <span className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full border border-border">
                  <Clock size={14} /> Check-in: {chalet.check_in}
                </span>
                <span className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full border border-border">
                  <Clock size={14} /> Check-out: {chalet.check_out}
                </span>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6 mb-6">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-4">Features & Amenities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {chalet.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-4">Included in Stay</h3>
                <div className="flex flex-wrap gap-3">
                  {includedAmenities.map((a) => (
                    <span key={a} className="flex items-center gap-1 text-sm text-foreground/80 bg-primary/10 px-3 py-1.5 rounded-full">
                      <Check size={14} className="text-primary" /> {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">Book Your Stay</h3>
                <div className="flex gap-4 mb-6 text-sm">
                  <span className="text-muted-foreground">Weekdays: <strong className="text-primary">${chalet.weekday_price}/night</strong></span>
                  <span className="text-muted-foreground">Weekends: <strong className="text-primary">${chalet.weekend_price}/night</strong></span>
                </div>

                <div className="flex justify-center mb-6">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    disabled={{ before: new Date() }}
                    className="rounded-xl border border-border"
                  />
                </div>

                {dateRange?.from && dateRange?.to && pricing && (
                  <div className="bg-primary/10 rounded-xl p-4 mb-6 space-y-2">
                    <div className="flex justify-between text-sm text-foreground">
                      <span>Check-in</span>
                      <span className="font-medium">{formatDate(dateRange.from)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-foreground">
                      <span>Check-out</span>
                      <span className="font-medium">{formatDate(dateRange.to)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-foreground">
                      <span>Nights</span>
                      <span className="font-medium">{pricing.nights}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between text-lg font-semibold text-foreground">
                      <span>Total</span>
                      <span className="text-primary">${pricing.total}</span>
                    </div>
                  </div>
                )}

                <a
                  href={`https://wa.me/96181522115?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full gradient-gold text-primary-foreground py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
                >
                  <MessageCircle size={20} /> Book via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
