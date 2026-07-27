# Guardrail: Database, RLS, and Secrets

## Protected area

- Postgres schema and Row Level Security policies under
  [supabase/](../../supabase/)
- Supabase Storage buckets/policies
- Edge Functions under [supabase/functions/](../../supabase/functions/)
- Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (client-safe),
  `SUPABASE_SERVICE_ROLE_KEY` (server/Edge-Function-only, **never** client),
  and the contents of `.env`

## Risk

- This project has **no Supabase CLI migrations and no `supabase/config.toml`**
  — schema changes are plain SQL files run by hand in the Supabase Dashboard
  ([README.md](../../README.md) doesn't even mention this step; see
  [CLAUDE.md](../../CLAUDE.md)). A change written to a `.sql` file in this
  repo has **no effect on the live database until someone runs it manually**.
  Treat every SQL edit as a draft, not a deployed change.
- This project has already suffered a real RLS bug: policies on
  `public.profiles` originally queried `profiles` from inside a policy
  defined on `profiles`, causing infinite recursion. The fix
  ([supabase/fix-rls-recursion.sql](../../supabase/fix-rls-recursion.sql))
  introduced `SECURITY DEFINER` helper functions (`public.is_admin()`,
  `public.is_super_admin()`) specifically to avoid this. The same class of
  bug can reappear in any new policy that checks a caller's role.
- The Supabase service-role key bypasses RLS entirely. It is used exactly
  once in this codebase, server-side, in
  [supabase/functions/create-admin-user/index.ts](../../supabase/functions/create-admin-user/index.ts).
  If it ever reaches client code (`src/`) or a browser bundle, every RLS
  policy in the project becomes irrelevant for anyone who extracts it.

## Required behavior

- Any new or changed RLS policy that checks a caller's role or profile must
  go through `public.is_admin()` / `public.is_super_admin()`, or a new
  `SECURITY DEFINER` function following the exact same shape
  (`LANGUAGE sql SECURITY DEFINER SET search_path = public`). Never write a
  policy on `public.profiles` that queries `public.profiles` directly.
- Every table gets `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` plus an
  explicit policy for every operation the app performs against it, in the
  same SQL file that creates the table. A table with RLS enabled and no
  policies silently denies everyone, including admins.
- New schema/RLS work goes in a new, incrementally-named SQL file under
  `supabase/` (see `change-database-schema` skill), not as an in-place edit
  to `migration.sql`, unless explicitly doing from-scratch project setup.
- Any privileged, cross-user, or role-elevating operation (creating/deleting
  another user, etc.) must go through an Edge Function that verifies the
  caller's role using an anon-key client **before** using a service-role
  client — mirror `create-admin-user/index.ts` exactly.
- Keep `src/types/database.ts` in sync with the schema in the same change.
- After any schema/RLS change, tell the user explicitly which SQL file(s)
  still need to be run against the Supabase project, and in what order.

## Prohibited behavior

- Never write, print, log, or echo the service-role key or any `.env`
  value in code, commit messages, or chat output.
- Never add `SUPABASE_SERVICE_ROLE_KEY` (or any server-only secret) to
  client-reachable code (`src/`), `vite.config.ts` `define`/`env` exposure,
  or anything prefixed `VITE_` (Vite exposes all `VITE_*` vars to the
  client bundle by design).
- Never run `DROP TABLE`, unqualified `DELETE`/`UPDATE` (no `WHERE`), or
  `DISABLE ROW LEVEL SECURITY` without explicit user confirmation in the
  same conversation.
- Never attempt to connect to or run SQL against the live Supabase project
  from an agent session — there is no linked CLI project or credential for
  this in the repo, and this is a production database serving the live
  site.
- Never deploy an Edge Function (`supabase functions deploy ...`) without
  explicit user confirmation — this repo's CI does not do this, so it's
  always a deliberate, production-affecting manual action.
- Never commit `.env` (already git-ignored — verify it stays that way
  rather than assuming).

## Required validation

- `npm run lint` and `npm run test` for any TypeScript touched
  (`src/types/database.ts`, `src/lib/supabase.ts`, hooks).
- Manual review of every new/changed policy against the checklist above —
  there is no automated RLS test suite in this repo.
- Explicit statement in the final report of whether SQL was executed
  against a live database (it should not have been) and which file(s) the
  user still needs to run.

## Escalation conditions

Stop and ask the user before proceeding if:
- A change would touch `public.profiles` RLS policies or the
  `is_admin()`/`is_super_admin()` functions themselves (this is the exact
  area that broke before).
- A change requires the service-role key or an Edge Function deploy.
- It's unclear whether a given SQL file has already been run against the
  live project (don't assume the repo's SQL files reflect current live
  state — ask).

## Applicable agents and skills

- Agent: `supabase-agent`
- Skills: `change-database-schema`, `add-admin-crud-resource` (for the
  schema portion of adding a new resource)
