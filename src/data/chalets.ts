import chalet101 from "@/assets/chalet-101.jpg";
import chalet201 from "@/assets/chalet-201.jpg";
import chalet202 from "@/assets/chalet-202.jpg";
import chaletPrivate from "@/assets/chalet-private.jpg";

export interface Chalet {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  capacity?: number;
  image: string;
  features: string[];
  weekdayPrice: number;
  weekendPrice: number;
  checkIn: string;
  checkOut: string;
}

export const chalets: Chalet[] = [
  {
    id: "101",
    name: "Ô Batroun 101",
    slug: "101",
    tagline: "Cozy ground-floor retreat with wooden mezzanine",
    capacity: 5,
    image: chalet101,
    features: [
      "Fits up to 5 people",
      "Ground floor",
      "1 bed with wooden mezzanine",
      "1 sofa bed 2×2",
      "TV unit",
      "Kitchenette equipped for light meals",
      "Cozy and comfortable ambiance",
      "Pool access",
      "Lobby access with billiards and babyfoot",
      "Big garden access",
    ],
    weekdayPrice: 50,
    weekendPrice: 100,
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
  },
  {
    id: "102",
    name: "Ô Batroun 102",
    slug: "102",
    tagline: "Charming ground-floor chalet with mezzanine",
    capacity: 5,
    image: chalet101,
    features: [
      "Fits up to 5 people",
      "Ground floor",
      "1 bed with wooden mezzanine",
      "1 sofa bed 2×2",
      "TV unit",
      "Kitchenette equipped for light meals",
      "Cozy and comfortable ambiance",
      "Pool access",
      "Lobby access with billiards and babyfoot",
      "Big garden access",
    ],
    weekdayPrice: 50,
    weekendPrice: 100,
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
  },
  {
    id: "103",
    name: "Ô Batroun 103",
    slug: "103",
    tagline: "Warm ground-floor escape with kitchenette",
    capacity: 5,
    image: chalet101,
    features: [
      "Fits up to 5 people",
      "Ground floor",
      "1 bed with wooden mezzanine",
      "1 sofa bed 2×2",
      "TV unit",
      "Kitchenette equipped for light meals",
      "Cozy and comfortable ambiance",
      "Pool access",
      "Lobby access with billiards and babyfoot",
      "Big garden access",
    ],
    weekdayPrice: 50,
    weekendPrice: 100,
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
  },
  {
    id: "201",
    name: "Ô Batroun 201",
    slug: "201",
    tagline: "Duplex luxury getaway with jacuzzi & fireplace",
    image: chalet201,
    features: [
      "Duplex luxury getaway",
      "Huge chalet",
      "3 bedrooms",
      "3 bathrooms",
      "3 balconies",
      "Jacuzzi",
      "Chimney / fireplace",
      "Jacuzzi with TV and fireplace view",
      "Huge terrace with pool & panoramic views",
      "Spacious kitchen",
      "Pool and garden access",
      "Lobby access with billiards and babyfoot",
    ],
    weekdayPrice: 50,
    weekendPrice: 100,
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
  },
  {
    id: "202",
    name: "Ô Batroun 202",
    slug: "202",
    tagline: "Cozy room with elegant vibes & private terrace",
    image: chalet202,
    features: [
      "Cozy room with elegant vibes",
      "1 comfortable bed",
      "TV unit",
      "Luxury decoration",
      "Private terrace perfect for BBQ",
      "Pool access",
      "Lobby access with billiards and babyfoot",
      "Big garden access",
    ],
    weekdayPrice: 50,
    weekendPrice: 100,
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
  },
  {
    id: "203",
    name: "Ô Batroun 203",
    slug: "203",
    tagline: "Cozy suite with hammock & BBQ terrace",
    image: chalet202,
    features: [
      "Cozy suite with 2 sleeping rooms",
      "Hammock in the living room",
      "TV unit",
      "Luxury decoration",
      "Private terrace perfect for BBQ",
      "Pool access",
      "Lobby access with billiards and babyfoot",
      "Big garden access",
    ],
    weekdayPrice: 50,
    weekendPrice: 100,
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
  },
  {
    id: "204",
    name: "Ô Batroun 204",
    slug: "204",
    tagline: "Suite with balcony & relaxing living room",
    image: chalet202,
    features: [
      "Cozy suite with 1 bedroom",
      "Living room with relaxing setup",
      "Small balcony with beautiful view",
      "TV unit",
      "Luxury decoration",
      "Private terrace perfect for BBQ",
      "Pool access",
      "Lobby access with billiards and babyfoot",
      "Big garden access",
    ],
    weekdayPrice: 50,
    weekendPrice: 100,
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
  },
  {
    id: "205",
    name: "Ô Batroun 205",
    slug: "205",
    tagline: "Cozy room with kitchenette & balcony",
    image: chalet202,
    features: [
      "Cozy room facing a kitchenette",
      "1 main bed",
      "1 extra bed",
      "Small balcony",
      "TV unit",
      "Luxury decoration",
      "Pool access",
      "Lobby access with billiards and babyfoot",
      "Big garden access",
    ],
    weekdayPrice: 50,
    weekendPrice: 100,
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
  },
  {
    id: "private",
    name: "Ô Batroun Private Chalet",
    slug: "private",
    tagline: "Exclusive family chalet with private pool",
    image: chaletPrivate,
    features: [
      "2 bedrooms",
      "Private pool",
      "Comfortable living space",
      "Ideal for families and private stays",
      "Full privacy",
      "Garden access",
    ],
    weekdayPrice: 50,
    weekendPrice: 100,
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
  },
];

export const includedAmenities = ["Soap", "Shampoo", "Shower gel", "Towels"];

export const extras = [
  { name: "Dental Kit", available: true },
  { name: "Shisha / Chicha", available: true },
  { name: "Loofa", available: true },
  { name: "Snack Menu", available: false, note: "Coming Soon" },
];

export const sharedAmenities = [
  { name: "Shared Pool", icon: "🏊" },
  { name: "Private Pool", icon: "🏖️" },
  { name: "Gym", icon: "💪" },
  { name: "Lobby with Billiards & Games", icon: "🎱" },
  { name: "Restaurant", icon: "🍽️" },
  { name: "Big Garden", icon: "🌿" },
];

export const nearbyPlaces = [
  { name: "Batroun Souks", description: "Traditional markets just 5 minutes away", icon: "🛍️" },
  { name: "Beaches & Beach Clubs", description: "Crystal-clear Mediterranean waters", icon: "🏖️" },
  { name: "Restaurants & Nightlife", description: "Vibrant dining and entertainment scene", icon: "🍷" },
  { name: "Hardini & Rafka", description: "Sacred pilgrimage sites nearby", icon: "⛪" },
  { name: "Historical Churches", description: "Ancient monasteries and churches", icon: "🏛️" },
  { name: "Old Town Walks", description: "Charming cobblestone streets to explore", icon: "🚶" },
  { name: "Sea Activities", description: "Diving, kayaking, and boat tours", icon: "🚤" },
  { name: "Sunset Experiences", description: "Breathtaking Mediterranean sunsets", icon: "🌅" },
];
