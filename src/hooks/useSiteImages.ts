import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SLOT_MAP } from "@/lib/siteImageSlots";
import type { SiteImage, SiteImageSlot } from "@/types/database";

type SiteImageMap = Record<SiteImageSlot, { url: string; alt: string }>;

export function useSiteImages() {
  return useQuery({
    queryKey: ["site-images"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_images").select("*");
      if (error) throw error;

      const map = {} as SiteImageMap;
      for (const [slot, config] of Object.entries(SLOT_MAP)) {
        const dbRow = (data as SiteImage[]).find((r) => r.slot === slot);
        map[slot as SiteImageSlot] = {
          url: dbRow?.url ?? config.fallback,
          alt: dbRow?.alt || config.defaultAlt,
        };
      }
      return map;
    },
    staleTime: 10 * 60 * 1000,
  });
}
