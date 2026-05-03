import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { compressVideo } from "@/lib/videoCompressor";
import { compressImage } from "@/lib/imageCompressor";
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

function uploadWithProgress(
  url: string,
  file: File,
  token: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(xhr.responseText || `Upload failed (${xhr.status})`));
    });
    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));
    xhr.send(file);
  });
}

export function useGalleryMediaUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, title, onProgress }: { file: File; title?: string; onProgress?: (pct: number) => void }) => {
      let processedFile = file;
      const isVideo = file.type.startsWith("video/");

      if (isVideo) {
        onProgress?.(0);
        processedFile = await compressVideo(file, (pct) => {
          onProgress?.(Math.round(pct * 0.5));
        });
      } else {
        processedFile = await compressImage(file);
      }

      const fileExt = processedFile.name.split(".").pop()?.toLowerCase() || "bin";
      const fileName = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const type = isVideo ? "video" : "image";

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const uploadUrl = `${supabaseUrl}/storage/v1/object/gallery-media/${fileName}`;

      await uploadWithProgress(uploadUrl, processedFile, token, (pct) => {
        onProgress?.(isVideo ? 50 + Math.round(pct * 0.5) : pct);
      });

      const { data: urlData } = supabase.storage
        .from("gallery-media")
        .getPublicUrl(fileName);

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
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      await supabase.storage.from("gallery-media").remove([storagePath]);
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
