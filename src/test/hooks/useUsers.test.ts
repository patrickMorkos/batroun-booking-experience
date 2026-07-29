import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor, act } from "@testing-library/react";
import { mockSupabase } from "@/test/mocks/supabase";
import { buildProfile } from "@/test/mocks/factories";
import { renderHookWithProviders } from "@/test/utils/render";

import "@/test/mocks/supabase";
import { useAdminUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/admin/hooks/useUsers";

describe("useAdminUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches profiles ordered by created_at desc", async () => {
    const profiles = [buildProfile({ first_name: "Alice" }), buildProfile({ first_name: "Bob" })];
    const chain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: profiles, error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as unknown as ReturnType<typeof mockSupabase.from>);

    const { result } = renderHookWithProviders(() => useAdminUsers());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
    expect(chain.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result.current.data).toEqual(profiles);
  });
});

describe("useCreateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls create_admin_user RPC with user data", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: "new-user-id", error: null });

    const { result } = renderHookWithProviders(() => useCreateUser());

    await act(async () => {
      result.current.mutate({
        email: "new@test.com",
        password: "password123",
        first_name: "New",
        last_name: "User",
        role: "admin",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      "create_admin_user",
      expect.objectContaining({ p_email: "new@test.com", p_role: "admin" })
    );
  });

  it("throws when the RPC returns an error", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: "Email taken" } });

    const { result } = renderHookWithProviders(() => useCreateUser());

    await act(async () => {
      result.current.mutate({
        email: "taken@test.com",
        password: "pass",
        first_name: "X",
        last_name: "Y",
        role: "admin",
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Email taken");
  });
});

describe("useUpdateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates profile fields", async () => {
    const chain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as unknown as ReturnType<typeof mockSupabase.from>);

    const { result } = renderHookWithProviders(() => useUpdateUser());

    await act(async () => {
      result.current.mutate({ id: "user-1", updates: { first_name: "Updated" } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({ first_name: "Updated", updated_at: expect.any(String) }));
  });
});

describe("useDeleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls delete_admin_user RPC", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

    const { result } = renderHookWithProviders(() => useDeleteUser());

    await act(async () => {
      result.current.mutate("user-1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSupabase.rpc).toHaveBeenCalledWith("delete_admin_user", { p_id: "user-1" });
  });
});
