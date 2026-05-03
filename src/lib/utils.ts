import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const WA_MESSAGE = encodeURIComponent("Hello! I'd like to book a chalet at \u00D4 Batroun Guesthouse");
export const WA_LINK_1 = `https://wa.me/96181522115?text=${WA_MESSAGE}`;
export const WA_LINK_2 = `https://wa.me/96176363237?text=${WA_MESSAGE}`;
