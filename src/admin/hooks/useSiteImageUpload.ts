import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { uploadFile, deleteFile } from "@/lib/storage";
import { compressImage } from "@/lib/imageCompressor";
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

      const compressed = await compressImage(file);
      const fileExt = compressed.name.split(".").pop()?.toLowerCase() || "jpg";
      const baseName = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const fileName = `${slot}/${baseName}.${fileExt}`;

      await uploadFile("site-images", fileName, compressed, compressed.type);

      const { data: urlData } = supabase.storage
        .from("site-images")
        .getPublicUrl(fileName);

      let thumbnailUrl: string | null = null;
      let thumbnailStoragePath: string | null = null;

      if (file.type.startsWith("image/")) {
        const thumbnail = await compressImage(file, 480, 480, 0.75);
        const thumbnailExt = thumbnail.name.split(".").pop()?.toLowerCase() || "jpg";
        const thumbnailFileName = `${slot}/${baseName}-thumb.${thumbnailExt}`;

        await uploadFile("site-images", thumbnailFileName, thumbnail, thumbnail.type);

        const { data: thumbnailUrlData } = supabase.storage
          .from("site-images")
          .getPublicUrl(thumbnailFileName);

        thumbnailUrl = thumbnailUrlData.publicUrl;
        thumbnailStoragePath = thumbnailFileName;
      }

      if (existing.data) {
        await deleteFile("site-images", existing.data.storage_path);
        if (existing.data.thumbnail_storage_path) {
          try {
            await deleteFile("site-images", existing.data.thumbnail_storage_path);
          } catch {
            // Non-blocking: old thumbnail may already be gone or not yet backfilled.
          }
        }

        const { data, error } = await supabase
          .from("site_images")
          .update({
            url: urlData.publicUrl,
            storage_path: fileName,
            thumbnail_url: thumbnailUrl,
            thumbnail_storage_path: thumbnailStoragePath,
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
          thumbnail_url: thumbnailUrl,
          thumbnail_storage_path: thumbnailStoragePath,
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
    mutationFn: async ({
      id,
      storagePath,
      thumbnailStoragePath,
    }: {
      id: string;
      storagePath: string;
      thumbnailStoragePath?: string | null;
    }) => {
      await deleteFile("site-images", storagePath);
      if (thumbnailStoragePath) {
        try {
          await deleteFile("site-images", thumbnailStoragePath);
        } catch {
          // Non-blocking: thumbnail may already be gone or not yet backfilled.
        }
      }
      const { error } = await supabase.from("site_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-images"] });
      queryClient.invalidateQueries({ queryKey: ["site-images"] });
    },
  });
}
