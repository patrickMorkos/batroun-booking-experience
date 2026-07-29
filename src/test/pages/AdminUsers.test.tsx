import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { mockSupabase } from "@/test/mocks/supabase";
import { buildProfile } from "@/test/mocks/factories";
import { renderWithProviders } from "@/test/utils/render";

import "@/test/mocks/supabase";

vi.mock("@/admin/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "u1" },
    profile: { role: "super_admin" },
    session: {},
    isLoading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

import AdminUsers from "@/admin/pages/AdminUsers";

describe("AdminUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user table with data", async () => {
    const users = [
      buildProfile({ first_name: "Alice", last_name: "Smith", email: "alice@test.com", role: "admin" }),
      buildProfile({ first_name: "Bob", last_name: "Jones", email: "bob@test.com", role: "super_admin" }),
    ];
    mockSupabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: users, error: null }),
      }),
    }) as unknown as ReturnType<typeof mockSupabase.from>);

    renderWithProviders(<AdminUsers />, { withSidebar: true });

    await waitFor(() => {
      expect(screen.getByText("alice@test.com")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("shows loading state", () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn(() => new Promise(() => {})),
    };
    mockSupabase.from.mockImplementation(() => chain as unknown as ReturnType<typeof mockSupabase.from>);

    const { container } = renderWithProviders(<AdminUsers />, { withSidebar: true });

    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("has Add User button", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as unknown as ReturnType<typeof mockSupabase.from>);

    renderWithProviders(<AdminUsers />, { withSidebar: true });

    expect(screen.getByRole("button", { name: /add user/i })).toBeInTheDocument();
  });
});
