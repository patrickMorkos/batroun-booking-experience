import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { mockSupabase, ADMIN_TOKEN_KEY } from "@/test/mocks/supabase";
import { buildProfile } from "@/test/mocks/factories";

// Must import the mock before the hook
import "@/test/mocks/supabase";
import { useAuth } from "@/admin/hooks/useAuth";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function makeToken(sub: string, exp = Math.floor(Date.now() / 1000) + 3600) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ role: "authenticated", sub, exp }));
  return `${header}.${payload}.fake-signature`;
}

function mockProfilesTable(chain: Record<string, ReturnType<typeof vi.fn>>) {
  mockSupabase.from.mockImplementation((table: string) => {
    if (table === "profiles") return chain as unknown as ReturnType<typeof mockSupabase.from>;
    return {} as unknown as ReturnType<typeof mockSupabase.from>;
  });
}

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("resolves to no user when no token is stored", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it("fetches profile when a valid token is stored", async () => {
    const mockProfile = buildProfile({ id: "user-1", email: "admin@test.com" });
    localStorage.setItem(ADMIN_TOKEN_KEY, makeToken("user-1"));

    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
    };
    mockProfilesTable(chain);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual({ id: mockProfile.id, email: mockProfile.email });
    expect(result.current.profile).toEqual(mockProfile);
  });

  it("clears an expired token and resolves to no user", async () => {
    localStorage.setItem(ADMIN_TOKEN_KEY, makeToken("user-1", Math.floor(Date.now() / 1000) - 60));

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBeNull();
  });

  it("signIn calls the login RPC and stores the returned token", async () => {
    const mockProfile = buildProfile({ id: "user-1", email: "test@example.com" });
    const token = makeToken("user-1");
    mockSupabase.rpc.mockResolvedValue({ data: token, error: null });

    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
    };
    mockProfilesTable(chain);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.signIn("test@example.com", "password123");
    });

    expect(mockSupabase.rpc).toHaveBeenCalledWith("login", {
      p_email: "test@example.com",
      p_password: "password123",
    });
    expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBe(token);
    expect(result.current.profile).toEqual(mockProfile);
  });

  it("signIn throws when the RPC returns an error", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: "invalid_credentials" } });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      act(async () => {
        await result.current.signIn("bad@test.com", "wrong");
      })
    ).rejects.toThrow("Invalid email or password");
  });

  it("signOut clears the stored token", async () => {
    localStorage.setItem(ADMIN_TOKEN_KEY, makeToken("user-1"));

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.signOut();
    });

    expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it("resetPassword is not available and throws", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      act(async () => {
        await result.current.resetPassword("test@example.com");
      })
    ).rejects.toThrow(/isn't available/i);
  });
});
