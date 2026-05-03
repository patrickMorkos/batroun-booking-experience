import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { mockSupabase } from "@/test/mocks/supabase";
import { renderHookWithProviders } from "@/test/utils/render";

import "@/test/mocks/supabase";
import { useTotalPageViews, useUniqueVisitors, useDailyPageViews, useChaletPageViews, useTopPages } from "@/admin/hooks/useAnalytics";

describe("useTotalPageViews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns total count from supabase", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockResolvedValue({ count: 42, error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    const { result } = renderHookWithProviders(() => useTotalPageViews("2024-01-01", "2024-01-31"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(42);
  });
});

describe("useUniqueVisitors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts unique session_ids", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockResolvedValue({
        data: [{ session_id: "a" }, { session_id: "b" }, { session_id: "a" }],
        error: null,
      }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    const { result } = renderHookWithProviders(() => useUniqueVisitors("2024-01-01", "2024-01-31"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(2);
  });
});

describe("useDailyPageViews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls RPC with date range", async () => {
    const rpcData = [{ day: "2024-01-01", count: 10 }, { day: "2024-01-02", count: 5 }];
    mockSupabase.rpc.mockResolvedValue({ data: rpcData, error: null });

    const { result } = renderHookWithProviders(() => useDailyPageViews("2024-01-01", "2024-01-31"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSupabase.rpc).toHaveBeenCalledWith("get_daily_page_views", {
      start_date: "2024-01-01",
      end_date: "2024-01-31",
    });
    expect(result.current.data).toEqual(rpcData);
  });
});

describe("useChaletPageViews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls RPC for chalet views", async () => {
    const rpcData = [{ chalet_slug: "beach", count: 20 }];
    mockSupabase.rpc.mockResolvedValue({ data: rpcData, error: null });

    const { result } = renderHookWithProviders(() => useChaletPageViews("2024-01-01", "2024-01-31"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSupabase.rpc).toHaveBeenCalledWith("get_chalet_page_views", {
      start_date: "2024-01-01",
      end_date: "2024-01-31",
    });
    expect(result.current.data).toEqual(rpcData);
  });
});

describe("useTopPages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates and sorts page paths by count", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockResolvedValue({
        data: [
          { page_path: "/" },
          { page_path: "/" },
          { page_path: "/chalets" },
          { page_path: "/" },
          { page_path: "/chalets" },
          { page_path: "/contact" },
        ],
        error: null,
      }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    const { result } = renderHookWithProviders(() => useTopPages("2024-01-01", "2024-01-31"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
      { path: "/", count: 3 },
      { path: "/chalets", count: 2 },
      { path: "/contact", count: 1 },
    ]);
  });
});
