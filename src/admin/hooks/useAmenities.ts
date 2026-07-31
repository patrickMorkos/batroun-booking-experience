import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { uploadFile } from "@/lib/storage";
import type { Amenity, AmenityInsert, AmenityUpdate } from "@/types/database";

export function useAdminAmenities() {
  return useQuery({
    queryKey: ["admin-amenities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("amenities")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Amenity[];
    },
  });
}

export function useCreateAmenity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AmenityInsert) => {
      const { error } = await supabase.from("amenities").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-amenities"] });
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
    },
  });
}

export function useUpdateAmenity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AmenityUpdate }) => {
      const { error } = await supabase.from("amenities").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-amenities"] });
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
    },
  });
}

export function useDeleteAmenity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("amenities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-amenities"] });
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
    },
  });
}

export function useUploadAmenityImage() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `amenities/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      await uploadFile("site-images", fileName, file, file.type);

      const { data: urlData } = supabase.storage
        .from("site-images")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    },
  });
}
