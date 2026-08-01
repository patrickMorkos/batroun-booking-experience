import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { uploadFile, deleteFile } from "@/lib/storage";
import { compressImage } from "@/lib/imageCompressor";
import { compressVideo } from "@/lib/videoCompressor";
import type { GalleryMedia } from "@/types/database";

export function useAdminGalleryMedia() {
  return useQuery({
    queryKey: ["admin-gallery-media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_media")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as GalleryMedia[];
    },
  });
}

export function useGalleryMediaUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, title, onProgress }: { file: File; title?: string; onProgress?: (pct: number) => void }) => {
      let processedFile = file;
      const isVideo = file.type.startsWith("video/");

      if (isVideo) {
        processedFile = await compressVideo(file, onProgress);
      } else {
        processedFile = await compressImage(file);
      }

      const fileExt = processedFile.name.split(".").pop()?.toLowerCase() || "bin";
      const baseName = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const fileName = `gallery/${baseName}.${fileExt}`;
      const type = isVideo ? "video" : "image";

      await uploadFile("gallery-media", fileName, processedFile, processedFile.type, onProgress);

      const { data: urlData } = supabase.storage
        .from("gallery-media")
        .getPublicUrl(fileName);

      let thumbnailUrl: string | null = null;
      let thumbnailStoragePath: string | null = null;

      if (!isVideo) {
        const thumbnail = await compressImage(file, 480, 480, 0.75);
        const thumbnailExt = thumbnail.name.split(".").pop()?.toLowerCase() || "jpg";
        const thumbnailFileName = `gallery/${baseName}-thumb.${thumbnailExt}`;

        await uploadFile("gallery-media", thumbnailFileName, thumbnail, thumbnail.type);

        const { data: thumbnailUrlData } = supabase.storage
          .from("gallery-media")
          .getPublicUrl(thumbnailFileName);

        thumbnailUrl = thumbnailUrlData.publicUrl;
        thumbnailStoragePath = thumbnailFileName;
      }

      const { data: maxOrder } = await supabase
        .from("gallery_media")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextOrder = (maxOrder?.display_order ?? -1) + 1;

      const { data, error } = await supabase
        .from("gallery_media")
        .insert({
          url: urlData.publicUrl,
          storage_path: fileName,
          thumbnail_url: thumbnailUrl,
          thumbnail_storage_path: thumbnailStoragePath,
          type,
          title: title ?? "",
          display_order: nextOrder,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery-media"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-media"] });
    },
  });
}

export function useGalleryMediaDelete() {
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
      await deleteFile("gallery-media", storagePath);
      if (thumbnailStoragePath) {
        try {
          await deleteFile("gallery-media", thumbnailStoragePath);
        } catch {
          // Non-blocking: thumbnail may already be gone or not yet backfilled.
        }
      }
      const { error } = await supabase.from("gallery_media").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery-media"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-media"] });
    },
  });
}

export function useGalleryMediaReorder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: { id: string; display_order: number }[]) => {
      const updates = items.map((item) =>
        supabase
          .from("gallery_media")
          .update({ display_order: item.display_order })
          .eq("id", item.id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery-media"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-media"] });
    },
  });
}

export function useGalleryMediaUpdateTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from("gallery_media")
        .update({ title })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery-media"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-media"] });
    },
  });
}
