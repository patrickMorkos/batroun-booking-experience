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

export function useUploadExtraMedia() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `extras/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(fileName, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("site-images")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    },
  });
}
