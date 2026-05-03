import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor, act } from "@testing-library/react";
import { mockSupabase } from "@/test/mocks/supabase";
import { buildChaletWithImages } from "@/test/mocks/factories";
import { renderHookWithProviders } from "@/test/utils/render";

import "@/test/mocks/supabase";
import { useAdminChalets, useAdminChalet, useCreateChalet, useUpdateChalet, useDeleteChalet, useToggleChaletActive } from "@/admin/hooks/useChalets";

describe("useAdminChalets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches chalets with images ordered by display_order", async () => {
    const chalets = [buildChaletWithImages({ name: "Chalet A" }), buildChaletWithImages({ name: "Chalet B" })];
    const chain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: chalets, error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    const { result } = renderHookWithProviders(() => useAdminChalets());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSupabase.from).toHaveBeenCalledWith("chalets");
    expect(chain.select).toHaveBeenCalledWith("*, chalet_images(*)");
    expect(result.current.data).toEqual(chalets);
  });

  it("returns error when fetch fails", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: "Fetch failed" } }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    const { result } = renderHookWithProviders(() => useAdminChalets());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual({ message: "Fetch failed" });
  });
});

describe("useAdminChalet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches single chalet by id", async () => {
    const chalet = buildChaletWithImages({ id: "chalet-1" });
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: chalet, error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    const { result } = renderHookWithProviders(() => useAdminChalet("chalet-1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(chalet);
  });

  it("is disabled when id is undefined", () => {
    const { result } = renderHookWithProviders(() => useAdminChalet(undefined));
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("is disabled when id is 'new'", () => {
    const { result } = renderHookWithProviders(() => useAdminChalet("new"));
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateChalet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts chalet and returns data", async () => {
    const newChalet = { name: "New", slug: "new", tagline: "Fresh", weekday_price: 100, weekend_price: 150 };
    const chain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "new-1", ...newChalet }, error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    const { result } = renderHookWithProviders(() => useCreateChalet());

    await act(async () => {
      result.current.mutate(newChalet as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(chain.insert).toHaveBeenCalledWith(newChalet);
  });
});

describe("useUpdateChalet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates chalet with id and updates", async () => {
    const chain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "c-1", name: "Updated" }, error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    const { result } = renderHookWithProviders(() => useUpdateChalet());

    await act(async () => {
      result.current.mutate({ id: "c-1", updates: { name: "Updated" } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({ name: "Updated", updated_at: expect.any(String) }));
  });
});

describe("useDeleteChalet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes chalet by id", async () => {
    const chain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    const { result } = renderHookWithProviders(() => useDeleteChalet());

    await act(async () => {
      result.current.mutate("c-1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(chain.eq).toHaveBeenCalledWith("id", "c-1");
  });
});

describe("useToggleChaletActive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("toggles active state", async () => {
    const chain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    const { result } = renderHookWithProviders(() => useToggleChaletActive());

    await act(async () => {
      result.current.mutate({ id: "c-1", isActive: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({ is_active: false }));
  });
});
