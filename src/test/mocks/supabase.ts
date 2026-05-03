import { vi } from "vitest";

function createChainMock() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};

  const methods = ["select", "insert", "update", "delete", "eq", "neq", "gte", "lte", "order", "single", "limit", "maybeSingle"];

  methods.forEach((method) => {
    chain[method] = vi.fn(() => chain);
  });

  // Terminal methods resolve by default
  chain.single = vi.fn().mockResolvedValue({ data: null, error: null });
  chain.select = vi.fn(() => chain);

  // Make the chain thenable so `await supabase.from(...).insert(...)` works
  (chain as any).then = undefined;

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

const authCallbacks: Array<(event: string, session: any) => void> = [];

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

export function triggerAuthEvent(event: string, session: any) {
  authCallbacks.forEach((cb) => cb(event, session));
}

vi.mock("@/lib/supabase", () => ({
  supabase: mockSupabase,
}));
