import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils/render";
import { mockSupabase } from "@/test/mocks/supabase";
import userEvent from "@testing-library/user-event";

import "@/test/mocks/supabase";
import ImageUploader from "@/admin/components/ImageUploader";

describe("ImageUploader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders drop zone with instructions", () => {
    renderWithProviders(<ImageUploader chaletId="chalet-1" currentImageCount={0} />);

    expect(screen.getByText(/drag & drop images here/i)).toBeInTheDocument();
    expect(screen.getByText("Choose Files")).toBeInTheDocument();
    expect(screen.getByText(/max 5mb/i)).toBeInTheDocument();
  });

  it("shows file previews after selecting files", async () => {
    const user = userEvent.setup();

    renderWithProviders(<ImageUploader chaletId="chalet-1" currentImageCount={0} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["pixels"], "photo.jpg", { type: "image/jpeg" });

    await user.upload(input, file);

    expect(screen.getByText(/upload 1 image/i)).toBeInTheDocument();
  });

  it("shows upload button with correct count for multiple files", async () => {
    const user = userEvent.setup();

    renderWithProviders(<ImageUploader chaletId="chalet-1" currentImageCount={0} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [
      new File(["a"], "a.jpg", { type: "image/jpeg" }),
      new File(["b"], "b.png", { type: "image/png" }),
    ];

    await user.upload(input, files);

    expect(screen.getByText(/upload 2 images/i)).toBeInTheDocument();
  });
});
