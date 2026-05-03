import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils/render";
import { mockSupabase } from "@/test/mocks/supabase";
import { buildChaletImage } from "@/test/mocks/factories";

import "@/test/mocks/supabase";
import ImageSortableList from "@/admin/components/ImageSortableList";

describe("ImageSortableList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no images provided", () => {
    renderWithProviders(<ImageSortableList images={[]} />);

    expect(screen.getByText("No images uploaded yet.")).toBeInTheDocument();
  });

  it("renders images in a grid", () => {
    const images = [
      buildChaletImage({ id: "img-1", url: "https://example.com/1.jpg", is_primary: true }),
      buildChaletImage({ id: "img-2", url: "https://example.com/2.jpg", is_primary: false }),
    ];

    const { container } = renderWithProviders(<ImageSortableList images={images} />);

    const imgElements = container.querySelectorAll("img");
    expect(imgElements).toHaveLength(2);
    expect(imgElements[0]).toHaveAttribute("src", "https://example.com/1.jpg");
  });

  it("shows primary badge on primary image", () => {
    const images = [
      buildChaletImage({ id: "img-1", is_primary: true }),
    ];

    renderWithProviders(<ImageSortableList images={images} />);

    expect(screen.getByText("Primary")).toBeInTheDocument();
  });

  it("does not show primary badge on non-primary images", () => {
    const images = [
      buildChaletImage({ id: "img-1", is_primary: false }),
    ];

    renderWithProviders(<ImageSortableList images={images} />);

    expect(screen.queryByText("Primary")).not.toBeInTheDocument();
  });
});
