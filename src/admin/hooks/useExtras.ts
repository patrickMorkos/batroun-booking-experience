import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Extra, ExtraInsert, ExtraUpdate } from "@/types/database";

export function useAdminExtras() {
  return useQuery({
    queryKey: ["admin-extras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extras")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Extra[];
    },
  });
}

export function useCreateExtra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ExtraInsert) => {
      const { error } = await supabase.from("extras").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-extras"] });
      queryClient.invalidateQueries({ queryKey: ["extras"] });
    },
  });
}

export function useUpdateExtra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ExtraUpdate }) => {
      const { error } = await supabase.from("extras").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-extras"] });
      queryClient.invalidateQueries({ queryKey: ["extras"] });
    },
  });
}

export function useDeleteExtra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("extras").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-extras"] });
      queryClient.invalidateQueries({ queryKey: ["extras"] });
    },
  });
}
