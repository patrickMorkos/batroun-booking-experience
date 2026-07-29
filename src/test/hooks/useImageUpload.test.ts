import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor, act } from "@testing-library/react";
import { mockSupabase } from "@/test/mocks/supabase";
import { buildChaletImage } from "@/test/mocks/factories";
import { renderHookWithProviders } from "@/test/utils/render";

import "@/test/mocks/supabase";

vi.mock("@/lib/storage", () => ({
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
}));

import { uploadFile, deleteFile } from "@/lib/storage";
import { useImageUpload } from "@/admin/hooks/useImageUpload";

describe("useImageUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("upload", () => {
    it("uploads file to storage and inserts DB record", async () => {
      vi.mocked(uploadFile).mockResolvedValue(undefined);

      const insertedImage = buildChaletImage({ chalet_id: "chalet-1" });
      const chain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: insertedImage, error: null }),
      };
      mockSupabase.from.mockImplementation(() => chain as unknown as ReturnType<typeof mockSupabase.from>);

      const { result } = renderHookWithProviders(() => useImageUpload());

      const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });

      await act(async () => {
        result.current.upload.mutate({ file, chaletId: "chalet-1", displayOrder: 0 });
      });

      await waitFor(() => expect(result.current.upload.isSuccess).toBe(true));

      expect(uploadFile).toHaveBeenCalledWith(
        "chalet-images",
        expect.stringContaining("chalet-1/"),
        expect.anything(),
        expect.any(String)
      );
      expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
        chalet_id: "chalet-1",
        display_order: 0,
        is_primary: true,
      }));
    });

    it("throws when storage upload fails", async () => {
      vi.mocked(uploadFile).mockRejectedValue(new Error("Upload failed"));

      const { result } = renderHookWithProviders(() => useImageUpload());
      const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });

      await act(async () => {
        result.current.upload.mutate({ file, chaletId: "chalet-1", displayOrder: 0 });
      });

      await waitFor(() => expect(result.current.upload.isError).toBe(true));
      expect(result.current.upload.error).toEqual(new Error("Upload failed"));
    });
  });

  describe("deleteImage", () => {
    it("removes from storage and deletes DB record", async () => {
      vi.mocked(deleteFile).mockResolvedValue(undefined);

      const chain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.from.mockImplementation(() => chain as unknown as ReturnType<typeof mockSupabase.from>);

      const { result } = renderHookWithProviders(() => useImageUpload());

      await act(async () => {
        result.current.deleteImage.mutate({ imageId: "img-1", storagePath: "chalet-1/img.jpg" });
      });

      await waitFor(() => expect(result.current.deleteImage.isSuccess).toBe(true));

      expect(deleteFile).toHaveBeenCalledWith("chalet-images", "chalet-1/img.jpg");
      expect(chain.eq).toHaveBeenCalledWith("id", "img-1");
    });
  });

  describe("reorder", () => {
    it("updates display_order and is_primary for all images", async () => {
      const chain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.from.mockImplementation(() => chain as unknown as ReturnType<typeof mockSupabase.from>);

      const { result } = renderHookWithProviders(() => useImageUpload());

      const orderedImages = [
        { id: "img-1", display_order: 0, is_primary: true },
        { id: "img-2", display_order: 1, is_primary: false },
      ];

      await act(async () => {
        result.current.reorder.mutate(orderedImages);
      });

      await waitFor(() => expect(result.current.reorder.isSuccess).toBe(true));

      expect(chain.update).toHaveBeenCalledTimes(2);
      expect(chain.update).toHaveBeenCalledWith({ display_order: 0, is_primary: true });
      expect(chain.update).toHaveBeenCalledWith({ display_order: 1, is_primary: false });
    });
  });
});
