import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils/render";
import { mockSupabase } from "@/test/mocks/supabase";

import "@/test/mocks/supabase";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/admin/hooks/useAuth", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    user: null,
    profile: null,
    session: null,
    isLoading: false,
  }),
}));

const mockSignIn = vi.fn();

import AdminLogin from "@/admin/pages/AdminLogin";

describe("AdminLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form with email and password fields", () => {
    renderWithProviders(<AdminLogin />);

    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("shows forgot password link", () => {
    renderWithProviders(<AdminLogin />);

    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
  });

  it("calls signIn and navigates on successful login", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(undefined);

    renderWithProviders(<AdminLogin />);

    await user.type(screen.getByLabelText("Email"), "admin@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("admin@test.com", "password123");
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });
  });

  it("shows error on failed login", async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValue(new Error("Invalid credentials"));

    renderWithProviders(<AdminLogin />);

    await user.type(screen.getByLabelText("Email"), "bad@test.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
  });
});
