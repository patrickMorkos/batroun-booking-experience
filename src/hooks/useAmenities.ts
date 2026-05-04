import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Amenity } from "@/types/database";

export function useAmenities() {
  return useQuery({
    queryKey: ["amenities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("amenities")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Amenity[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
