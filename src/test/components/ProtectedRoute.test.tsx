import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { mockSupabase } from "@/test/mocks/supabase";

import "@/test/mocks/supabase";

vi.mock("@/admin/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import ProtectedRoute from "@/admin/components/ProtectedRoute";
import { useAuth } from "@/admin/hooks/useAuth";

const mockedUseAuth = vi.mocked(useAuth);

function renderProtected(authState: any) {
  mockedUseAuth.mockReturnValue(authState);

  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<div>Admin Content</div>} />
        </Route>
        <Route path="/admin/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading spinner when auth is loading", () => {
    renderProtected({ user: null, profile: null, session: null, isLoading: true, signIn: vi.fn(), signOut: vi.fn(), resetPassword: vi.fn() });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to login when no user", () => {
    renderProtected({ user: null, profile: null, session: null, isLoading: false, signIn: vi.fn(), signOut: vi.fn(), resetPassword: vi.fn() });

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders children when user is authenticated", () => {
    renderProtected({ user: { id: "u1" }, profile: { role: "admin" }, session: {}, isLoading: false, signIn: vi.fn(), signOut: vi.fn(), resetPassword: vi.fn() });

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });
});
