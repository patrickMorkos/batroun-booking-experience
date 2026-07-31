// Minimal PostgREST client. Replaces @supabase/supabase-js now that the
// backend is self-hosted Postgres + PostgREST instead of Supabase — this
// implements only the query-builder surface this codebase actually uses
// (select/insert/update/delete/eq/order/limit/single/maybeSingle/rpc),
// talking to PostgREST's REST conventions directly over fetch.

const API_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const ADMIN_TOKEN_KEY = "obatroun_admin_token";

export interface PostgrestError {
  message: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}

interface PostgrestResult<T> {
  data: T | null;
  error: PostgrestError | null;
  count?: number;
}

function getAuthToken(): string {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || ANON_KEY;
}

function parseCount(contentRange: string | null): number | undefined {
  if (!contentRange) return undefined;
  const total = contentRange.split("/")[1];
  if (!total || total === "*") return undefined;
  const n = parseInt(total, 10);
  return Number.isNaN(n) ? undefined : n;
}

type FilterOp = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in";

// Row shape is untyped here (unlike postgrest-js, we don't derive it from the
// Database schema) — every call site already casts the result to a concrete
// type, so this only needs to avoid blocking property access.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

class QueryBuilder<T = Row> implements PromiseLike<PostgrestResult<T>> {
  private method: "GET" | "POST" | "PATCH" | "DELETE" = "GET";
  private selectCols: string | null = null;
  private filters: Array<[string, FilterOp, string]> = [];
  private orderParam: string | null = null;
  private limitParam: number | null = null;
  private countMode: "exact" | null = null;
  private headOnly = false;
  private singleMode: "single" | "maybeSingle" | null = null;
  private body: unknown;
  private wantsRepresentation = false;

  constructor(private table: string) {}

  select(columns = "*", opts?: { count?: "exact"; head?: boolean }) {
    this.selectCols = columns;
    if (opts?.count) this.countMode = opts.count;
    if (opts?.head) this.headOnly = true;
    if (this.method !== "GET") this.wantsRepresentation = true;
    return this;
  }

  insert(values: unknown) {
    this.method = "POST";
    this.body = values;
    return this;
  }

  update(values: unknown) {
    this.method = "PATCH";
    this.body = values;
    return this;
  }

  delete() {
    this.method = "DELETE";
    return this;
  }

  private filter(column: string, op: FilterOp, value: unknown) {
    this.filters.push([column, op, Array.isArray(value) ? `(${value.join(",")})` : String(value)]);
    return this;
  }

  eq(column: string, value: unknown) { return this.filter(column, "eq", value); }
  neq(column: string, value: unknown) { return this.filter(column, "neq", value); }
  gt(column: string, value: unknown) { return this.filter(column, "gt", value); }
  gte(column: string, value: unknown) { return this.filter(column, "gte", value); }
  lt(column: string, value: unknown) { return this.filter(column, "lt", value); }
  lte(column: string, value: unknown) { return this.filter(column, "lte", value); }
  like(column: string, value: unknown) { return this.filter(column, "like", value); }
  ilike(column: string, value: unknown) { return this.filter(column, "ilike", value); }
  in(column: string, values: unknown[]) { return this.filter(column, "in", values); }

  order(column: string, opts?: { ascending?: boolean }) {
    this.orderParam = `${column}.${opts?.ascending === false ? "desc" : "asc"}`;
    return this;
  }

  limit(n: number) {
    this.limitParam = n;
    return this;
  }

  single() {
    this.singleMode = "single";
    return this;
  }

  maybeSingle() {
    this.singleMode = "maybeSingle";
    return this;
  }

  private buildUrl() {
    const params = new URLSearchParams();
    if (this.selectCols) params.set("select", this.selectCols);
    if (this.orderParam) params.set("order", this.orderParam);
    if (this.limitParam != null) params.set("limit", String(this.limitParam));
    for (const [column, op, value] of this.filters) params.append(column, `${op}.${value}`);
    const qs = params.toString();
    return `${API_URL}/rest/v1/${this.table}${qs ? `?${qs}` : ""}`;
  }

  private async execute(): Promise<PostgrestResult<T>> {
    const headers: Record<string, string> = { Authorization: `Bearer ${getAuthToken()}` };

    const prefer: string[] = [];
    if (this.countMode) prefer.push(`count=${this.countMode}`);
    if (this.method !== "GET") prefer.push(this.wantsRepresentation ? "return=representation" : "return=minimal");
    if (prefer.length) headers.Prefer = prefer.join(",");
    if (this.singleMode) headers.Accept = "application/vnd.pgrst.object+json";
    if (this.body !== undefined) headers["Content-Type"] = "application/json";

    const res = await fetch(this.buildUrl(), {
      method: this.headOnly ? "HEAD" : this.method,
      headers,
      body: this.body !== undefined ? JSON.stringify(this.body) : undefined,
    });

    if (this.headOnly) {
      return { data: null, error: res.ok ? null : { message: `HTTP ${res.status}` }, count: parseCount(res.headers.get("content-range")) };
    }

    const text = await res.text();
    const parsed = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const error: PostgrestError = parsed ?? { message: `HTTP ${res.status}` };
      if (this.singleMode === "maybeSingle" && error.code === "PGRST116") {
        return { data: null, error: null };
      }
      return { data: null, error };
    }

    return { data: parsed, error: null, count: this.countMode ? parseCount(res.headers.get("content-range")) : undefined };
  }

  then<TResult1 = PostgrestResult<T>, TResult2 = never>(
    onfulfilled?: ((value: PostgrestResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

async function rpc<T = Row>(fn: string, args?: Record<string, unknown>): Promise<PostgrestResult<T>> {
  const res = await fetch(`${API_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args ?? {}),
  });
  const text = await res.text();
  const parsed = text ? JSON.parse(text) : null;
  if (!res.ok) return { data: null, error: parsed ?? { message: `HTTP ${res.status}` } };
  return { data: parsed, error: null };
}

export const supabase = {
  from<T = Row>(table: string) {
    return new QueryBuilder<T>(table);
  },
  rpc,
  storage: {
    from(bucket: string) {
      return {
        getPublicUrl(path: string) {
          return { data: { publicUrl: `${API_URL}/storage/v1/object/public/${bucket}/${path}` } };
        },
      };
    },
  },
};
