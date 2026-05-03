import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { mockSupabase } from "@/test/mocks/supabase";
import { buildProfile } from "@/test/mocks/factories";

// Must import the mock before the hook
import "@/test/mocks/supabase";
import { useAuth } from "@/admin/hooks/useAuth";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mockSupabase.auth.onAuthStateChange.mockImplementation(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    }));
  });

  it("starts in loading state and resolves to no user when no session", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it("fetches profile when session exists", async () => {
    const mockProfile = buildProfile({ id: "user-1", email: "admin@test.com" });
    const mockSession = { user: { id: "user-1" }, access_token: "token" };

    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });

    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
    };
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "profiles") return chain as any;
      return {} as any;
    });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockSession.user);
    expect(result.current.profile).toEqual(mockProfile);
  });

  it("signIn calls supabase auth with credentials", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.signIn("test@example.com", "password123");
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("signIn throws when supabase returns error", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: "Invalid credentials" },
    });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      act(async () => {
        await result.current.signIn("bad@test.com", "wrong");
      })
    ).rejects.toEqual({ message: "Invalid credentials" });
  });

  it("signOut calls supabase auth signOut", async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it("resetPassword calls resetPasswordForEmail", async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.resetPassword("test@example.com");
    });

    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "test@example.com",
      expect.objectContaining({ redirectTo: expect.stringContaining("/admin/login") })
    );
  });
});
