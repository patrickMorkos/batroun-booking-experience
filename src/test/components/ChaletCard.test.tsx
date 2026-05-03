import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { mockSupabase } from "@/test/mocks/supabase";
import { buildChaletWithImages } from "@/test/mocks/factories";
import { renderWithProviders } from "@/test/utils/render";

import "@/test/mocks/supabase";
import ChaletCard from "@/components/ChaletCard";

describe("ChaletCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders chalet name and tagline", () => {
    const chalet = buildChaletWithImages({ name: "Beach Villa", tagline: "Ocean view paradise" });

    renderWithProviders(<ChaletCard chalet={chalet} />);

    expect(screen.getByText("Beach Villa")).toBeInTheDocument();
    expect(screen.getByText("Ocean view paradise")).toBeInTheDocument();
  });

  it("renders weekday price", () => {
    const chalet = buildChaletWithImages({ weekday_price: 250 });

    renderWithProviders(<ChaletCard chalet={chalet} />);

    expect(screen.getByText("From $250/night")).toBeInTheDocument();
  });

  it("renders primary image", () => {
    const chalet = buildChaletWithImages({
      name: "Mountain Lodge",
      chalet_images: [
        { id: "img-1", chalet_id: "c-1", storage_path: "p.jpg", url: "https://example.com/photo.jpg", display_order: 0, is_primary: true, created_at: "" },
      ],
    });

    renderWithProviders(<ChaletCard chalet={chalet} />);

    const img = screen.getByRole("img", { name: "Mountain Lodge" });
    expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
  });

  it("shows 'No image' when no images exist", () => {
    const chalet = buildChaletWithImages({ chalet_images: [] });

    renderWithProviders(<ChaletCard chalet={chalet} />);

    expect(screen.getByText("No image")).toBeInTheDocument();
  });

  it("renders capacity when provided", () => {
    const chalet = buildChaletWithImages({ capacity: "8 guests" });

    renderWithProviders(<ChaletCard chalet={chalet} />);

    expect(screen.getByText(/Up to 8 guests/)).toBeInTheDocument();
  });

  it("links to chalet detail page", () => {
    const chalet = buildChaletWithImages({ slug: "sunset-villa" });

    renderWithProviders(<ChaletCard chalet={chalet} />);

    const link = screen.getByRole("link", { name: "View Details" });
    expect(link).toHaveAttribute("href", "/chalets/sunset-villa");
  });
});
