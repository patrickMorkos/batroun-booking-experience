import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { mockSupabase } from "@/test/mocks/supabase";
import { buildChaletWithImages } from "@/test/mocks/factories";
import { renderWithProviders } from "@/test/utils/render";

import "@/test/mocks/supabase";

vi.mock("@/admin/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "u1" },
    profile: { role: "admin" },
    session: {},
    isLoading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

import AdminChalets from "@/admin/pages/AdminChalets";

describe("AdminChalets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeletons while fetching", () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn(() => new Promise(() => {})),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    const { container } = renderWithProviders(<AdminChalets />, { withSidebar: true });

    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders chalets in table when loaded", async () => {
    const chalets = [
      buildChaletWithImages({ name: "Beach Villa", weekday_price: 200, weekend_price: 300, capacity: "6" }),
      buildChaletWithImages({ name: "Mountain Lodge", weekday_price: 150, weekend_price: 250, capacity: "4" }),
    ];
    const chain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: chalets, error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    renderWithProviders(<AdminChalets />, { withSidebar: true });

    await waitFor(() => {
      expect(screen.getByText("Beach Villa")).toBeInTheDocument();
      expect(screen.getByText("Mountain Lodge")).toBeInTheDocument();
    });
  });

  it("shows empty state when no chalets exist", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    renderWithProviders(<AdminChalets />, { withSidebar: true });

    await waitFor(() => {
      expect(screen.getByText("No chalets yet.")).toBeInTheDocument();
    });
  });

  it("has Add Chalet button linking to new", () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    renderWithProviders(<AdminChalets />, { withSidebar: true });

    const addButton = screen.getByRole("link", { name: /add chalet/i });
    expect(addButton).toHaveAttribute("href", "/admin/chalets/new");
  });
});
