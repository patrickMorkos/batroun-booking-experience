# CLAUDE.md

Guidance for AI coding agents (Claude Code) working in this repository.

## Project overview

Marketing and booking site for "Ô Batroun" chalets (Batroun, Lebanon), plus a
password-protected admin panel for managing chalets, media, extras, amenities,
users, and analytics. Originally scaffolded with Lovable (see the
`lovable-tagger` dev dependency and `componentTagger()` Vite plugin in
[vite.config.ts](vite.config.ts), active only in `development` mode).

Stack:
- React 18 + TypeScript + Vite (SWC), React Router v6
- Tailwind CSS + shadcn/ui (Radix primitives) — see [components.json](components.json)
- TanStack Query for all server-state / data fetching
- Supabase: Postgres, Auth, Storage, Edge Functions (Deno)
- Vercel for hosting; GitHub Actions for CI/CD

## Architecture

- **Public site** — [src/pages/](src/pages/) (`Index`, `ChaletDetail`, `NotFound`)
  and [src/components/](src/components/) (marketing sections: `Hero`, `Amenities`,
  `Extras`, `Contact`, `Navbar`, `Footer`, `NearbyAttractions`, `ChaletCard`,
  `ChaletsList`). Data hooks live in [src/hooks/](src/hooks/).
- **`src/components/ui/`** — shadcn/ui-generated primitives. Treat as
  generated code: prefer regenerating/re-copying from shadcn conventions over
  deep structural edits, to keep them diffable against upstream shadcn output.
- **Admin panel** — [src/admin/](src/admin/) (`components/`, `hooks/`,
  `layouts/`, `pages/`), routed under `/admin/*` in [src/App.tsx](src/App.tsx),
  all lazy-loaded via `React.lazy`. Gated by
  [ProtectedRoute.tsx](src/admin/components/ProtectedRoute.tsx) +
  [useAuth.ts](src/admin/hooks/useAuth.ts), which check for a Supabase Auth
  session and a matching `profiles` row (`role`: `admin` | `super_admin`).
- **Data layer** — [src/lib/supabase.ts](src/lib/supabase.ts) creates the
  client from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (anon key only —
  never the service role key). [src/types/database.ts](src/types/database.ts)
  is a **hand-maintained** mirror of the Postgres schema — there is no
  `supabase gen types` script in `package.json`, so this file must be updated
  by hand whenever a table/column changes.
- **Data-fetching convention** — every resource (chalets, extras, amenities,
  gallery media, site images, users) follows the same pattern: a hook file
  with `useQuery` for reads and `useMutation` + `queryClient.invalidateQueries`
  for writes (e.g. [useChalets.ts](src/admin/hooks/useChalets.ts),
  [useExtras.ts](src/admin/hooks/useExtras.ts)). Follow this pattern for new
  resources — see the `add-admin-crud-resource` skill.
- **Media pipeline** — uploads are compressed client-side before hitting
  Storage: images via Canvas/OffscreenCanvas in
  [imageCompressor.ts](src/lib/imageCompressor.ts), video via ffmpeg.wasm in
  [videoCompressor.ts](src/lib/videoCompressor.ts) (loads ffmpeg-core from
  `unpkg.com` at runtime). Storage buckets in use: `chalet-images`,
  `site-images`, `gallery-media`.
- **Backend / Supabase** — [supabase/](supabase/) contains **loose, manually
  run SQL scripts** (`migration.sql`, `seed.sql`, `add-gallery-media.sql`,
  `add-site-images.sql`, `fix-rls-recursion.sql`), applied by pasting into the
  Supabase Dashboard SQL editor. **There is no `supabase/config.toml` and no
  Supabase CLI migrations folder** — schema/RLS changes are not applied
  automatically by CI or by deploying the app. See the
  `change-database-schema` skill and the `database-rls-and-secrets` guardrail.
- **Edge Functions** — [supabase/functions/create-admin-user](supabase/functions/create-admin-user/index.ts)
  (Deno) uses the service-role key server-side to create a user + `profiles`
  row, and itself checks the caller's `profiles.role === 'super_admin'` before
  doing anything. This is the pattern for any privileged, cross-user
  operation: never do privileged mutations from the client with the anon key.
- **Analytics/tracking** — [usePageTracking.ts](src/hooks/usePageTracking.ts)
  writes to `page_views` (session id, path, user agent, referrer) on every
  public-site navigation; social link clicks go to `social_clicks` via
  [trackSocialClick.ts](src/lib/trackSocialClick.ts). Both tables are
  write-open to `anon` and read-restricted to admins by RLS — see the
  `database-rls-and-secrets` guardrail before changing either table or policy.

## Directories/files requiring extra caution

- `supabase/*.sql`, `supabase/functions/` — see the `supabase-agent` and
  `database-rls-and-secrets` guardrail.
- `src/types/database.ts`, `src/lib/supabase.ts` — must stay in sync with the
  live Postgres schema by hand.
- `.env` / `.env.example` — never commit real secrets; only
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` belong on the client. The
  Supabase service-role key is Edge-Function-only.
- `.github/workflows/vercel-production.yml`, `vercel.json` — every push to
  `main` runs lint/test/build and then **deploys to production** if it's
  green. See the `deployment-and-ci` guardrail.
- `src/components/ui/` — shadcn-generated; avoid unrelated refactors here.

## Verified commands

From [package.json](package.json):

```bash
npm install              # install dependencies
npm run dev               # vite dev server, http://localhost:8080
npm run build              # production build (vite build)
npm run build:dev          # development-mode build
npm run lint                # eslint .
npm run test                 # vitest run (single pass)
npm run test:watch            # vitest watch mode
npm run test:coverage          # vitest run --coverage
npm run preview                 # preview a production build locally
```

There is **no dedicated typecheck script**. `npm run build` uses
`@vitejs/plugin-react-swc`, which transpiles but does not type-check, and
`eslint.config.js` does not set a type-aware `parserOptions.project`. This
means a type error can pass lint, test, and build. If you need a real type
check, run `npx tsc -b --noEmit` manually (uses the existing
[tsconfig.json](tsconfig.json) project references) — it is not part of any
npm script or CI step, so don't claim "types check out" from `npm run build`
or `npm run lint` alone.

## Coding conventions

- Path alias `@/*` → `src/*` (see [vite.config.ts](vite.config.ts),
  [vitest.config.ts](vitest.config.ts), [tsconfig.app.json](tsconfig.app.json)).
  Use it instead of relative `../../` imports.
- TypeScript is configured loosely on purpose: `strict: false`,
  `noImplicitAny: false`, `strictNullChecks: false`,
  `noUnusedLocals`/`noUnusedParameters: false`, and
  `@typescript-eslint/no-unused-vars` is explicitly turned off in
  [eslint.config.js](eslint.config.js). Don't introduce stricter local
  patterns (e.g. hand-rolled strict-null helpers) that fight this baseline.
- Forms use `react-hook-form` + `zod` via `@hookform/resolvers/zod`, with
  shadcn's `Form`/`FormField`/`FormItem` wrappers — see
  [ChaletForm.tsx](src/admin/components/ChaletForm.tsx) as the template.
- User-facing feedback (success/error toasts) uses `toast` from `sonner`
  (`import { toast } from "sonner"`), used consistently across every admin
  page/component. The shadcn `use-toast`/`<Toaster />` pair also exists and is
  rendered in [App.tsx](src/App.tsx), but `sonner` is the convention actually
  used in application code — match it for new code.
- Mutations that change list order or active/visible state use optimistic
  updates via `onMutate`/`onError`/`onSettled` (see
  `useToggleChaletActive` in [useChalets.ts](src/admin/hooks/useChalets.ts)) —
  follow this pattern for similar toggle/reorder operations rather than
  waiting on a full refetch.
- Storage object keys follow `{scope}/{Date.now()}-{random}.{ext}` (e.g.
  `${chaletId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`) —
  reuse this convention for new upload paths so objects sort roughly by
  upload time and never collide.

## Testing

- Vitest + `@testing-library/react`, jsdom environment, config in
  [vitest.config.ts](vitest.config.ts) and mirrored in
  [vite.config.ts](vite.config.ts) (coverage excludes `src/test/**`,
  `src/types/**`, `src/components/ui/**`).
  [src/test/setup.ts](src/test/setup.ts) stubs `matchMedia`, `crypto`,
  `sessionStorage`, `IntersectionObserver`, `ResizeObserver`, and the Supabase
  env vars — extend it rather than re-stubbing globals per test file.
- Supabase is never hit in tests. [src/test/mocks/supabase.ts](src/test/mocks/supabase.ts)
  provides a chainable mock (`from(table).select().eq()...`) via
  `vi.mock("@/lib/supabase", ...)`, plus `getChainFor`/`resetChains` and
  `triggerAuthEvent` for auth-state-change tests. Import and configure this
  mock instead of hand-rolling a new Supabase double.
- [src/test/mocks/factories.ts](src/test/mocks/factories.ts) has
  `buildChalet`/`buildChaletImage`/`buildProfile`/`buildPageView` builders —
  use and extend these instead of inlining fixture objects.
- Tests live under [src/test/](src/test/) mirroring `components/`, `hooks/`,
  `pages/`, not next to the source files.
- CI (`npm run test` = `vitest run`) gates the production deploy — see the
  `deployment-and-ci` guardrail. Don't leave `.only`/`.skip` in committed
  tests.

## Known limitations / uncertainties

- **As of 2026-07-27, `npm run lint` and `npm run test` both fail on `main`
  with no changes applied** — this is pre-existing, not something introduced
  by AI-agent config work:
  - `npm run lint`: 59 errors, almost all `@typescript-eslint/no-explicit-any`
    across `src/admin/**`, `src/test/**`, plus one
    `@typescript-eslint/no-require-imports` in
    [tailwind.config.ts](tailwind.config.ts).
  - `npm run test`: 5 test files / 4 tests failing:
    `useAuth.test.ts` (whole file), `usePageTracking.test.ts` (whole file),
    `useImageUpload.test.ts` (2 tests), `AdminUsers.test.tsx` (1 test),
    `ChaletDetail.test.tsx` (1 test).
  - Don't assume "my change made lint/test fail" — check whether the failure
    predates your change. Conversely, don't claim a change is "fully lint/test
    clean" without noting this baseline; the honest bar is "no *new* failures
    beyond this baseline," not a clean run, unless you were explicitly asked
    to fix this debt.
  - This also means the `.github/workflows/vercel-production.yml` quality
    gate would currently fail on a push to `main` (i.e. production would not
    auto-deploy until this is fixed) — worth surfacing to the user if
    deployment comes up, since it's a standing blocker independent of any
    single feature change.
- The two failing whole-file suites above (`useAuth.test.ts`,
  `usePageTracking.test.ts`) are also the two hooks with a duplicate
  `.tsx`-suffixed test file covering the same hook
  (`useAuth.test.tsx`, `usePageTracking.test.tsx`) under
  [src/test/hooks/](src/test/hooks/) — both extensions match Vitest's include
  glob and both run. This looks like leftover duplication where the `.ts`
  version is stale/broken and the `.tsx` version is the current one, but
  confirm with the user before deleting either — don't delete a failing file
  just to make `npm run test` go green.
- `useDeleteUser` in [useUsers.ts](src/admin/hooks/useUsers.ts) invokes a
  `delete-admin-user` Edge Function, but no corresponding source exists under
  `supabase/functions/` in this repo (only `create-admin-user` does). It's
  presumably deployed out-of-band directly to the Supabase project. If you
  touch user deletion, verify the deployed function's behavior with the user
  before assuming parity with `create-admin-user`'s auth checks.
- `.github/workflows/vercel-production.yml` triggers only on `push` to `main`
  (plus manual `workflow_dispatch`); there is no separate workflow file
  running lint/test on pull requests, so PR branches are not verified by CI
  the way `main` is.

## Common implementation workflows

- Adding/editing an admin-managed resource (new table + CRUD UI): use the
  `add-admin-crud-resource` skill.
- Adding a column/table or changing an RLS policy: use the
  `change-database-schema` skill, and read the `database-rls-and-secrets`
  guardrail first — this project has already hit an RLS infinite-recursion
  bug once (see [supabase/fix-rls-recursion.sql](supabase/fix-rls-recursion.sql)).
- Frontend-only UI/content work (public pages, marketing components, admin UI
  that doesn't touch schema/RLS/auth): use the `frontend-agent`.
- Anything touching `supabase/`, RLS, Edge Functions, or the service-role key:
  use the `supabase-agent`.

## Available specialized agents

- **frontend-agent** ([.claude/agents/frontend-agent.md](.claude/agents/frontend-agent.md))
  — React/Tailwind/shadcn UI work across the public site and admin panel that
  does not change the database schema, RLS policies, auth flow, or
  Edge Functions.
- **supabase-agent** ([.claude/agents/supabase-agent.md](.claude/agents/supabase-agent.md))
  — Postgres schema, RLS policies, Storage buckets/policies, Edge Functions,
  and the Supabase client/types layer. Higher-risk, security-sensitive
  domain; kept separate so schema/auth changes get deliberate, security-first
  handling instead of being mixed into general UI work.

Both agents can hand off to each other (e.g. a new admin resource needs a
new table from `supabase-agent` before `frontend-agent` builds the CRUD UI),
and both should flag anything destructive or production-affecting for human
review rather than acting on it directly.

## Definition of done

- `npm run lint` and `npm run test` introduce **no new failures** beyond the
  pre-existing baseline described in "Known limitations" above — the repo is
  not currently lint/test-clean, so don't chase that as a side effect of an
  unrelated task, but don't add to it either.
- `npm run build` succeeds (with `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`
  set, as CI does).
- New/changed data-fetching code follows the `useQuery`/`useMutation` +
  `invalidateQueries` convention and has tests using the shared Supabase mock
  and factories.
- Any schema/RLS change has a corresponding new SQL file under `supabase/`
  (this repo has no migration runner — see `change-database-schema`), and the
  human operator has been told it still needs to be run manually against the
  Supabase project.
- No secret (service-role key, `.env` contents) appears in a commit, log, or
  chat output.
