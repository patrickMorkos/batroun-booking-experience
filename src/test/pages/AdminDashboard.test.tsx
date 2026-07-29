import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { screen, waitFor } from "@testing-library/react";
import { mockSupabase } from "@/test/mocks/supabase";
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

import AdminDashboard from "@/admin/pages/AdminDashboard";

// Mock recharts to avoid ResizeObserver issues in jsdom
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div data-testid="chart-container">{children}</div>,
  LineChart: ({ children }: { children: ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  BarChart: ({ children }: { children: ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders stats cards and date range buttons", async () => {
    // Mock all analytics calls
    const countChain = {
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockResolvedValue({ count: 100, data: [{ session_id: "a" }, { session_id: "b" }], error: null }),
    };
    mockSupabase.from.mockImplementation(() => countChain as unknown as ReturnType<typeof mockSupabase.from>);
    mockSupabase.rpc.mockResolvedValue({ data: [{ day: "2024-01-01", count: 10 }], error: null });

    renderWithProviders(<AdminDashboard />, { withSidebar: true });

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("7 days")).toBeInTheDocument();
    expect(screen.getByText("30 days")).toBeInTheDocument();
    expect(screen.getByText("90 days")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Total Page Views")).toBeInTheDocument();
      expect(screen.getByText("Unique Visitors")).toBeInTheDocument();
    });
  });

  it("shows 'No data' messages when no analytics available", async () => {
    const countChain = {
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockResolvedValue({ count: 0, data: [], error: null }),
    };
    mockSupabase.from.mockImplementation(() => countChain as unknown as ReturnType<typeof mockSupabase.from>);
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

    renderWithProviders(<AdminDashboard />, { withSidebar: true });

    await waitFor(() => {
      expect(screen.getByText("No data for this period")).toBeInTheDocument();
      expect(screen.getByText("No chalet views for this period")).toBeInTheDocument();
    });
  });
});
