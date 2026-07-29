import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { mockSupabase } from "@/test/mocks/supabase";
import { buildChaletWithImages } from "@/test/mocks/factories";
import { renderWithProviders } from "@/test/utils/render";

import "@/test/mocks/supabase";
import ChaletsList from "@/components/ChaletsList";

describe("ChaletsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeletons while fetching", () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn(() => new Promise(() => {})), // never resolves
    };
    mockSupabase.from.mockImplementation(() => chain as unknown as ReturnType<typeof mockSupabase.from>);

    const { container } = renderWithProviders(<ChaletsList />);

    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty state when no chalets returned", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as unknown as ReturnType<typeof mockSupabase.from>);

    renderWithProviders(<ChaletsList />);

    await waitFor(() => {
      expect(screen.getByText("No chalets available at the moment.")).toBeInTheDocument();
    });
  });

  it("renders chalet cards when data is available", async () => {
    const chalets = [
      buildChaletWithImages({ name: "Villa A", slug: "villa-a" }),
      buildChaletWithImages({ name: "Villa B", slug: "villa-b" }),
    ];
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: chalets, error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as unknown as ReturnType<typeof mockSupabase.from>);

    renderWithProviders(<ChaletsList />);

    await waitFor(() => {
      expect(screen.getByText("Villa A")).toBeInTheDocument();
      expect(screen.getByText("Villa B")).toBeInTheDocument();
    });
  });
});
