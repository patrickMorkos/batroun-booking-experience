import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { uploadFile, deleteFile } from "@/lib/storage";
import { compressImage } from "@/lib/imageCompressor";
import type { ChaletImageInsert } from "@/types/database";

export function useImageUpload() {
  const queryClient = useQueryClient();

  const uploadImage = async (file: File, chaletId: string, displayOrder: number) => {
    const compressed = await compressImage(file);
    const fileExt = compressed.name.split(".").pop()?.toLowerCase() || "jpg";
    const baseName = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const fileName = `${chaletId}/${baseName}.${fileExt}`;

    await uploadFile("chalet-images", fileName, compressed, compressed.type);

    const { data: urlData } = supabase.storage
      .from("chalet-images")
      .getPublicUrl(fileName);

    let thumbnailUrl: string | null = null;
    let thumbnailStoragePath: string | null = null;

    if (file.type.startsWith("image/")) {
      const thumbnail = await compressImage(file, 480, 480, 0.75);
      const thumbnailExt = thumbnail.name.split(".").pop()?.toLowerCase() || "jpg";
      const thumbnailFileName = `${chaletId}/${baseName}-thumb.${thumbnailExt}`;

      await uploadFile("chalet-images", thumbnailFileName, thumbnail, thumbnail.type);

      const { data: thumbnailUrlData } = supabase.storage
        .from("chalet-images")
        .getPublicUrl(thumbnailFileName);

      thumbnailUrl = thumbnailUrlData.publicUrl;
      thumbnailStoragePath = thumbnailFileName;
    }

    const imageRecord: ChaletImageInsert = {
      chalet_id: chaletId,
      storage_path: fileName,
      url: urlData.publicUrl,
      thumbnail_url: thumbnailUrl,
      thumbnail_storage_path: thumbnailStoragePath,
      display_order: displayOrder,
      is_primary: displayOrder === 0,
    };

    const { data, error: insertError } = await supabase
      .from("chalet_images")
      .insert(imageRecord)
      .select()
      .single();
    if (insertError) throw insertError;

    return data;
  };

  const uploadMutation = useMutation({
    mutationFn: async ({ file, chaletId, displayOrder }: { file: File; chaletId: string; displayOrder: number }) => {
      return uploadImage(file, chaletId, displayOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chalets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chalet"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({
      imageId,
      storagePath,
      thumbnailStoragePath,
    }: {
      imageId: string;
      storagePath: string;
      thumbnailStoragePath?: string | null;
    }) => {
      await deleteFile("chalet-images", storagePath);
      if (thumbnailStoragePath) {
        try {
          await deleteFile("chalet-images", thumbnailStoragePath);
        } catch {
          // Non-blocking: thumbnail may already be gone or not yet backfilled.
        }
      }
      const { error } = await supabase.from("chalet_images").delete().eq("id", imageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chalets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chalet"] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedImages: { id: string; display_order: number; is_primary: boolean }[]) => {
      const results = await Promise.all(
        orderedImages.map((img) =>
          supabase
            .from("chalet_images")
            .update({ display_order: img.display_order, is_primary: img.is_primary })
            .eq("id", img.id)
        )
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chalets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chalet"] });
    },
  });

  return {
    upload: uploadMutation,
    deleteImage: deleteMutation,
    reorder: reorderMutation,
  };
}
