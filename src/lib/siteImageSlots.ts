import type { SiteImageSlot } from "@/types/database";

export interface SlotConfig {
  slot: SiteImageSlot;
  label: string;
  fallback: string;
  defaultAlt: string;
  description: string;
}

export const SITE_IMAGE_SLOTS: SlotConfig[] = [
  {
    slot: "hero_bg",
    label: "Hero Background",
    fallback: "",
    defaultAlt: "Ô Batroun Guesthouse",
    description: "Full-screen background image on the homepage hero section (recommended: 1920×1080, JPEG)",
  },
  {
    slot: "logo",
    label: "Logo",
    fallback: "",
    defaultAlt: "Ô Batroun Logo",
    description: "Circular logo used in the navbar, hero, contact, and footer (recommended: 256×256, PNG)",
  },
  {
    slot: "amenity_pool",
    label: "Amenity — Pool",
    fallback: "",
    defaultAlt: "Pool amenity",
    description: "Left image in the amenities showcase grid (recommended: 800×600, JPEG)",
  },
  {
    slot: "amenity_lobby",
    label: "Amenity — Lobby",
    fallback: "",
    defaultAlt: "Lobby amenity",
    description: "Right image in the amenities showcase grid (recommended: 800×600, JPEG)",
  },
  {
    slot: "nearby",
    label: "Nearby Attractions",
    fallback: "",
    defaultAlt: "Batroun Town",
    description: "Large image in the Explore Batroun section (recommended: 800×600, JPEG)",
  },
];

export const SLOT_MAP = Object.fromEntries(
  SITE_IMAGE_SLOTS.map((s) => [s.slot, s])
) as Record<SiteImageSlot, SlotConfig>;
