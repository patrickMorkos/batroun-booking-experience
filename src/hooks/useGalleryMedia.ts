import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { GalleryMedia } from "@/types/database";

export function useGalleryMedia() {
  return useQuery({
    queryKey: ["gallery-media"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_media")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as GalleryMedia[];
    },
  });
}
