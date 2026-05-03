import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Extra } from "@/types/database";

export function useExtras() {
  return useQuery({
    queryKey: ["extras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extras")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Extra[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
