import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ChaletWithImages } from "@/types/database";

export function usePublicChalets() {
  return useQuery({
    queryKey: ["public-chalets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chalets")
        .select("*, chalet_images(*)")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as ChaletWithImages[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicChalet(slug: string | undefined) {
  return useQuery({
    queryKey: ["public-chalet", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chalets")
        .select("*, chalet_images(*)")
        .eq("slug", slug!)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data as ChaletWithImages;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
