import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { mockSupabase } from "@/test/mocks/supabase";
import { buildChaletWithImages } from "@/test/mocks/factories";
import { renderHookWithProviders } from "@/test/utils/render";

import "@/test/mocks/supabase";
import { usePublicChalets, usePublicChalet } from "@/hooks/useChalets";

describe("usePublicChalets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches active chalets ordered by display_order", async () => {
    const chalets = [buildChaletWithImages({ is_active: true })];
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: chalets, error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    const { result } = renderHookWithProviders(() => usePublicChalets());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSupabase.from).toHaveBeenCalledWith("chalets");
    expect(chain.eq).toHaveBeenCalledWith("is_active", true);
    expect(chain.order).toHaveBeenCalledWith("display_order", { ascending: true });
    expect(result.current.data).toEqual(chalets);
  });

  it("throws when supabase returns error", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: "Network error" } }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    const { result } = renderHookWithProviders(() => usePublicChalets());

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("usePublicChalet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches a single chalet by slug", async () => {
    const chalet = buildChaletWithImages({ slug: "beach-house" });
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: chalet, error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as any);

    const { result } = renderHookWithProviders(() => usePublicChalet("beach-house"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(chalet);
  });

  it("is disabled when slug is undefined", () => {
    const { result } = renderHookWithProviders(() => usePublicChalet(undefined));
    expect(result.current.fetchStatus).toBe("idle");
  });
});
