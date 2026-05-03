import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useTotalPageViews(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["analytics-total", startDate, endDate],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startDate)
        .lte("created_at", endDate);
      if (error) throw error;
      return count || 0;
    },
  });
}

export function useUniqueVisitors(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["analytics-unique", startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("session_id")
        .gte("created_at", startDate)
        .lte("created_at", endDate);
      if (error) throw error;
      const unique = new Set(data?.map((r) => r.session_id));
      return unique.size;
    },
  });
}

export function useDailyPageViews(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["analytics-daily", startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_daily_page_views", {
        start_date: startDate,
        end_date: endDate,
      });
      if (error) throw error;
      return (data as { day: string; count: number }[]) || [];
    },
  });
}

export function useChaletPageViews(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["analytics-chalets", startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_chalet_page_views", {
        start_date: startDate,
        end_date: endDate,
      });
      if (error) throw error;
      return (data as { chalet_slug: string; count: number }[]) || [];
    },
  });
}

export function useTopPages(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["analytics-top-pages", startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("page_path")
        .gte("created_at", startDate)
        .lte("created_at", endDate);
      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach((r) => { counts[r.page_path] = (counts[r.page_path] || 0) + 1; });
      return Object.entries(counts)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
  });
}
