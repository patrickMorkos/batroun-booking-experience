import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { chalets, includedAmenities } from "@/data/chalets";
import { Calendar } from "@/components/ui/calendar";
import { Check, ArrowLeft, Clock, Users, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { DateRange } from "react-day-picker";

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday & Saturday (Lebanese weekend)
}

function calculatePrice(checkIn: Date, checkOut: Date, weekdayPrice: number, weekendPrice: number) {
  let total = 0;
  let nights = 0;
  const current = new Date(checkIn);
  while (current < checkOut) {
    total += isWeekend(current) ? weekendPrice : weekdayPrice;
    nights++;
    current.setDate(current.getDate() + 1);
  }
  return { total, nights };
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function ChaletDetail() {
  const { slug } = useParams();
  const chalet = chalets.find((c) => c.slug === slug);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const pricing = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to || !chalet) return null;
    return calculatePrice(dateRange.from, dateRange.to, chalet.weekdayPrice, chalet.weekendPrice);
  }, [dateRange, chalet]);

  if (!chalet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="font-heading text-3xl text-foreground mb-4">Chalet not found</h2>
          <Link to="/chalets" className="text-primary hover:underline">Back to Chalets</Link>
        </div>
      </div>
    );
  }

  const whatsappMessage = pricing && dateRange?.from && dateRange?.to
    ? encodeURIComponent(
        `Hello Ô Batroun, I would like to book ${chalet.name} from ${formatDate(dateRange.from)} to ${formatDate(dateRange.to)}. Total nights: ${pricing.nights}. Estimated price: $${pricing.total}. Please confirm availability.`
      )
    : encodeURIComponent(`Hello Ô Batroun, I am interested in booking ${chalet.name}. Please share availability.`);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <Link
            to="/chalets"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={18} /> Back to Chalets
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image & Info */}
            <div>
              <div className="rounded-2xl overflow-hidden mb-6">
                <img
                  src={chalet.image}
                  alt={chalet.name}
                  className="w-full h-80 md:h-[450px] object-cover"
                  width={800}
                  height={600}
                />
              </div>

              <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-2">{chalet.name}</h1>
              <p className="text-lg text-muted-foreground mb-6">{chalet.tagline}</p>

              <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
                {chalet.capacity && (
                  <span className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full border border-border">
                    <Users size={14} /> Up to {chalet.capacity} guests
                  </span>
                )}
                <span className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full border border-border">
                  <Clock size={14} /> Check-in: {chalet.checkIn}
                </span>
                <span className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full border border-border">
                  <Clock size={14} /> Check-out: {chalet.checkOut}
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

            {/* Booking */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">Book Your Stay</h3>
                <div className="flex gap-4 mb-6 text-sm">
                  <span className="text-muted-foreground">Weekdays: <strong className="text-primary">${chalet.weekdayPrice}/night</strong></span>
                  <span className="text-muted-foreground">Weekends: <strong className="text-primary">${chalet.weekendPrice}/night</strong></span>
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
