import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ChaletWithImages, ChaletInsert, ChaletUpdate } from "@/types/database";

export function useAdminChalets() {
  return useQuery({
    queryKey: ["admin-chalets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chalets")
        .select("*, chalet_images(*)")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as ChaletWithImages[];
    },
  });
}

export function useAdminChalet(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-chalet", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chalets")
        .select("*, chalet_images(*)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as ChaletWithImages;
    },
    enabled: !!id && id !== "new",
  });
}

export function useCreateChalet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chalet: ChaletInsert) => {
      const { data, error } = await supabase
        .from("chalets")
        .insert(chalet)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chalets"] });
    },
  });
}

export function useUpdateChalet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ChaletUpdate }) => {
      const { data, error } = await supabase
        .from("chalets")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-chalets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chalet", id] });
    },
  });
}

export function useDeleteChalet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chalets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chalets"] });
    },
  });
}

export function useToggleChaletActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("chalets")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-chalets"] });
      const previous = queryClient.getQueryData<ChaletWithImages[]>(["admin-chalets"]);
      queryClient.setQueryData<ChaletWithImages[]>(["admin-chalets"], (old) =>
        old?.map((c) => (c.id === id ? { ...c, is_active: isActive } : c))
      );
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["admin-chalets"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chalets"] });
    },
  });
}
