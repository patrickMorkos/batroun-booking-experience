import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/imageCompressor";
import type { ChaletImageInsert } from "@/types/database";

export function useImageUpload() {
  const queryClient = useQueryClient();

  const uploadImage = async (file: File, chaletId: string, displayOrder: number) => {
    const compressed = await compressImage(file);
    const fileExt = compressed.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${chaletId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("chalet-images")
      .upload(fileName, compressed, { contentType: compressed.type, upsert: false });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("chalet-images")
      .getPublicUrl(fileName);

    const imageRecord: ChaletImageInsert = {
      chalet_id: chaletId,
      storage_path: fileName,
      url: urlData.publicUrl,
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
    mutationFn: async ({ imageId, storagePath }: { imageId: string; storagePath: string }) => {
      await supabase.storage.from("chalet-images").remove([storagePath]);
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
