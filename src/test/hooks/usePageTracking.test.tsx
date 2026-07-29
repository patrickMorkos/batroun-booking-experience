import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { mockSupabase } from "@/test/mocks/supabase";
import React from "react";

import "@/test/mocks/supabase";
import { usePageTracking } from "@/hooks/usePageTracking";

function createWrapper(route: string) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;
  };
}

describe("usePageTracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    const chain = {
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as unknown as ReturnType<typeof mockSupabase.from>);
  });

  it("inserts page view for public routes", () => {
    renderHook(() => usePageTracking(), { wrapper: createWrapper("/") });

    expect(mockSupabase.from).toHaveBeenCalledWith("page_views");
  });

  it("does not track /admin routes", () => {
    renderHook(() => usePageTracking(), { wrapper: createWrapper("/admin/chalets") });

    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it("extracts chalet_slug from /chalets/:slug paths", () => {
    const chain = {
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as unknown as ReturnType<typeof mockSupabase.from>);

    renderHook(() => usePageTracking(), { wrapper: createWrapper("/chalets/beach-house") });

    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
      page_path: "/chalets/beach-house",
      chalet_slug: "beach-house",
    }));
  });

  it("sets chalet_slug to null for non-chalet pages", () => {
    const chain = {
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as unknown as ReturnType<typeof mockSupabase.from>);

    renderHook(() => usePageTracking(), { wrapper: createWrapper("/contact") });

    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
      page_path: "/contact",
      chalet_slug: null,
    }));
  });

  it("uses session_id from sessionStorage or creates one", () => {
    const chain = {
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    mockSupabase.from.mockImplementation(() => chain as unknown as ReturnType<typeof mockSupabase.from>);

    renderHook(() => usePageTracking(), { wrapper: createWrapper("/") });

    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
      session_id: expect.any(String),
    }));

    const sessionId = sessionStorage.getItem("session_id");
    expect(sessionId).toBeTruthy();
  });
});
