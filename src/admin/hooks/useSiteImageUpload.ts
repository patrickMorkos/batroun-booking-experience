import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { SiteImage, SiteImageSlot } from "@/types/database";

export function useAdminSiteImages() {
  return useQuery({
    queryKey: ["admin-site-images"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_images").select("*");
      if (error) throw error;
      return data as SiteImage[];
    },
  });
}

export function useSiteImageUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, slot, alt }: { file: File; slot: SiteImageSlot; alt?: string }) => {
      const existing = await supabase
        .from("site_images")
        .select("*")
        .eq("slot", slot)
        .maybeSingle();

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${slot}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(fileName, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("site-images")
        .getPublicUrl(fileName);

      if (existing.data) {
        await supabase.storage.from("site-images").remove([existing.data.storage_path]);

        const { data, error } = await supabase
          .from("site_images")
          .update({
            url: urlData.publicUrl,
            storage_path: fileName,
            alt: alt ?? existing.data.alt,
            updated_at: new Date().toISOString(),
          })
          .eq("slot", slot)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from("site_images")
        .insert({
          slot,
          url: urlData.publicUrl,
          storage_path: fileName,
          alt: alt ?? "",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-images"] });
      queryClient.invalidateQueries({ queryKey: ["site-images"] });
    },
  });
}

export function useSiteImageDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      await supabase.storage.from("site-images").remove([storagePath]);
      const { error } = await supabase.from("site_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-images"] });
      queryClient.invalidateQueries({ queryKey: ["site-images"] });
    },
  });
}
