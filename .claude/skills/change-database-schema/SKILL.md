---
name: change-database-schema
description: Add/change a Postgres table, column, RLS policy, or storage bucket for this Supabase project. Use whenever a task needs new or different data shape, not just new UI. This repo has no migration runner — schema changes are hand-written SQL files run manually in the Supabase Dashboard — and has a documented history of an RLS infinite-recursion bug, so follow this procedure rather than writing ad hoc SQL.
---

# Purpose

Keep schema/RLS changes consistent with how this project actually manages
its database: incremental, manually-run SQL files, RLS-by-default, and
role checks via `SECURITY DEFINER` helper functions instead of inline
subqueries (the latter caused a real recursion bug, fixed in
`fix-rls-recursion.sql`).

# When to use it

Any task that needs a new table, a new/changed column, a new/changed RLS
policy, or a new/changed Storage bucket or bucket policy. If the task is
purely "query an existing table differently," this skill isn't needed —
just write the query.

# Preconditions

- Read [supabase/migration.sql](../../../supabase/migration.sql) (base
  schema + original RLS + `is_admin()`/`is_super_admin()` helpers),
  [supabase/fix-rls-recursion.sql](../../../supabase/fix-rls-recursion.sql)
  (the incident and its fix), and any other `add-*.sql` files, in that
  order, to reconstruct the current schema. There is no single
  authoritative schema file — [src/types/database.ts](../../../src/types/database.ts)
  is the closest thing to one, but it's hand-maintained and can drift.
- Confirm with the user (or from context) whether the target Supabase
  project already has this change applied out-of-band — this agent/skill
  cannot query the live database (no `supabase/config.toml`, no linked CLI
  project, no service-role key available locally).

# Relevant files

- [supabase/migration.sql](../../../supabase/migration.sql) — base schema,
  RLS, and the `is_admin()`/`is_super_admin()` `SECURITY DEFINER` functions
- [supabase/add-gallery-media.sql](../../../supabase/add-gallery-media.sql),
  [supabase/add-site-images.sql](../../../supabase/add-site-images.sql) —
  examples of the incremental-file pattern to copy for a new table
- [supabase/fix-rls-recursion.sql](../../../supabase/fix-rls-recursion.sql)
  — what NOT to do (inline `SELECT ... FROM profiles` inside a policy on
  `profiles`) and the correct fix
- [src/types/database.ts](../../../src/types/database.ts) — TypeScript
  mirror to update in the same change
- [supabase/functions/create-admin-user/index.ts](../../../supabase/functions/create-admin-user/index.ts)
  — pattern for privileged operations that need to run as service role

# Step-by-step procedure

1. Write a new SQL file under `supabase/` named `add-<feature>.sql` (or
   `fix-<issue>.sql` for a targeted fix) — don't edit `migration.sql` or
   `seed.sql` in place unless the user is doing a from-scratch project
   setup, since other scripts and this project's history assume those ran
   once, as-is, already.
2. For a new table: define columns with explicit types/defaults matching
   the style in `migration.sql` (UUID PK via `gen_random_uuid()`,
   `TIMESTAMPTZ NOT NULL DEFAULT now()` for timestamps,
   `display_order INTEGER NOT NULL DEFAULT 0` if orderable), then
   immediately:
   - `ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;`
   - A `SELECT` policy — public tables (chalets, gallery media, amenities,
     extras) use `USING (true)` or `is_active`-style checks for `anon`;
     admin-only tables use `public.is_admin()`.
   - `INSERT`/`UPDATE`/`DELETE` policies gated by `public.is_admin()` (or
     `public.is_super_admin()` for anything touching `profiles`/roles),
     matching the pattern in `migration.sql`.
   - If any policy needs to check the caller's role, reuse
     `public.is_admin()` / `public.is_super_admin()` — do not write a new
     `SELECT ... FROM public.profiles WHERE id = auth.uid()` inline inside a
     policy defined on `public.profiles` itself (this is exactly what
     caused the recursion bug). If you need a genuinely new role check,
     write a new `SECURITY DEFINER` function following the same shape as
     `is_admin()`/`is_super_admin()`.
3. For a new Storage bucket: follow the `add-gallery-media.sql` shape —
   `INSERT INTO storage.buckets (id, name, public) VALUES (...) ON CONFLICT (id) DO NOTHING;`
   then SELECT/INSERT/UPDATE/DELETE policies on `storage.objects` scoped by
   `bucket_id = '<bucket>'` and `public.is_admin()` for writes.
4. Update `src/types/database.ts`: add/update the `Row`/`Insert`/`Update`
   shape for the table under `Database.public.Tables`, and any exported
   type aliases at the bottom of the file (e.g. `export type X = ...`).
5. If a new privileged/cross-user operation is needed, add or edit an
   Edge Function under `supabase/functions/`, using the same two-client
   pattern as `create-admin-user/index.ts`: an anon-key client to verify
   `auth.getUser()` + the caller's `profiles.role`, then a service-role
   client only for the actual privileged action, only after the check
   passes.
6. Tell the user explicitly which new SQL file(s) need to be run in the
   Supabase Dashboard SQL editor, and in what order relative to any other
   pending file.

# Validation commands

```bash
npm run lint
npm run test
```

(TypeScript-only — there is no automated SQL test harness in this repo.)
For the SQL itself, there is no substitute for the user running it against
a real (ideally staging/dev) Supabase project and confirming both the
intended access works and unintended access is still denied.

# Failure checks

- A table has `ENABLE ROW LEVEL SECURITY` but no policies for an operation
  the app performs — that operation will silently fail for everyone
  (including admins) rather than erroring loudly.
- A policy on `profiles` (or any table joined back to `profiles` for a role
  check) queries `profiles` directly instead of via
  `is_admin()`/`is_super_admin()` — infinite recursion (see
  `fix-rls-recursion.sql`).
- `src/types/database.ts` and the SQL disagree on nullability or optional-
  on-insert fields — TanStack Query code will compile but misbehave at
  runtime since Supabase's client trusts the generic type parameter.
- Storage bucket created without matching `storage.objects` policies —
  uploads/downloads fail even though the bucket exists.

# Completion criteria

- New SQL file(s) added under `supabase/`, following the existing naming
  and RLS-by-default conventions.
- `src/types/database.ts` updated to match.
- Any new privileged operation goes through an Edge Function with the
  caller-role-check pattern, never a client-side call with elevated
  privilege.
- The user has been told explicitly which file(s) still need to be run
  manually against the live Supabase project — this skill never runs SQL
  against a live database itself.

# Applicable guardrails

- `database-rls-and-secrets` — read in full before starting; covers the
  secrets/service-role-key rules and destructive-SQL restrictions that apply
  throughout this procedure.

# Recommended agent

`supabase-agent`.
