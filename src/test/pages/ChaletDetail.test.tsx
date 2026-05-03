import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { mockSupabase } from "@/test/mocks/supabase";
import { buildChaletWithImages, buildChaletImage } from "@/test/mocks/factories";

import "@/test/mocks/supabase";
import ChaletDetail from "@/pages/ChaletDetail";

function renderChaletDetail(slug: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/chalets/${slug}`]}>
        <Routes>
          <Route path="/chalets/:slug" element={<ChaletDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("ChaletDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state while fetching", () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() => new Promise(() => {})),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    const { container } = renderChaletDetail("beach-house");

    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders chalet details when loaded", async () => {
    const chalet = buildChaletWithImages({
      name: "Beach House",
      slug: "beach-house",
      tagline: "Stunning ocean views",
      weekday_price: 200,
      weekend_price: 300,
      features: ["Pool", "WiFi"],
      chalet_images: [
        buildChaletImage({ url: "https://example.com/1.jpg", is_primary: true }),
      ],
    });
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: chalet, error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    renderChaletDetail("beach-house");

    await waitFor(() => {
      expect(screen.getByText("Beach House")).toBeInTheDocument();
    });
  });

  it("shows not found when chalet does not exist", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found", code: "PGRST116" } }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    renderChaletDetail("nonexistent");

    await waitFor(() => {
      expect(screen.getByText(/not found|no chalet|doesn't exist/i)).toBeInTheDocument();
    });
  });
});
