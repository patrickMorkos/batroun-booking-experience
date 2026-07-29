import { vi } from "vitest";

export type SupabaseChainMock = Record<string, ReturnType<typeof vi.fn>> & { then?: undefined };

function createChainMock() {
  const chain: SupabaseChainMock = {};

  const methods = ["select", "insert", "update", "delete", "eq", "neq", "gte", "lte", "order", "single", "limit", "maybeSingle"];

  methods.forEach((method) => {
    chain[method] = vi.fn(() => chain);
  });

  // Terminal methods resolve by default
  chain.single = vi.fn().mockResolvedValue({ data: null, error: null });
  chain.select = vi.fn(() => chain);

  // Make the chain thenable so `await supabase.from(...).insert(...)` works
  chain.then = undefined;

  return chain;
}

const chainInstances: Record<string, ReturnType<typeof createChainMock>> = {};

export function getChainFor(table: string) {
  if (!chainInstances[table]) {
    chainInstances[table] = createChainMock();
  }
  return chainInstances[table];
}

export function resetChains() {
  Object.keys(chainInstances).forEach((key) => delete chainInstances[key]);
}

const authCallbacks: Array<(event: string, session: unknown) => void> = [];

export const mockSupabase = {
  from: vi.fn((table: string) => getChainFor(table)),
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn((callback) => {
      authCallbacks.push(callback);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ data: { path: "test-path" }, error: null }),
      remove: vi.fn().mockResolvedValue({ data: [], error: null }),
      getPublicUrl: vi.fn((path: string) => ({ data: { publicUrl: `https://test.supabase.co/storage/v1/object/public/chalet-images/${path}` } })),
    })),
  },
  rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  functions: {
    invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
  },
};

export function triggerAuthEvent(event: string, session: unknown) {
  authCallbacks.forEach((cb) => cb(event, session));
}

export const ADMIN_TOKEN_KEY = "obatroun_admin_token";

vi.mock("@/lib/supabase", () => ({
  supabase: mockSupabase,
  ADMIN_TOKEN_KEY: "obatroun_admin_token",
}));
