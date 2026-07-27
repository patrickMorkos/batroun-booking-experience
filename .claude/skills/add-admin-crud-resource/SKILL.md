---
name: add-admin-crud-resource
description: Add a new admin-managed resource (table + CRUD hook + admin page/form) following this repo's existing pattern (chalets, extras, amenities, gallery media, site images, users). Use when asked to add a new manageable entity to the admin panel.
---

# Purpose

Every admin-managed resource in this repo (chalets, extras, amenities,
gallery media, site images, users) is built from the same four pieces: a
Postgres table with RLS, a TanStack Query hook file, a form component, and an
admin page wired into routing. This skill captures that recurring shape so a
new resource stays consistent with the other seven implementations instead
of inventing a new pattern.

# When to use it

The user asks to add a new manageable "thing" to the admin panel — e.g. "add
an admin section for testimonials" or "let admins manage FAQs." Not for
adding a field to an *existing* resource (that's a smaller, one-off change —
just follow the existing hook/form for that resource) and not for anything
that's read-only/public-only (skip the admin page/hook, just add a public
hook under `src/hooks/`).

# Preconditions

- The new table (with RLS enabled and policies) must exist or be created as
  part of this work — if it doesn't exist yet, do the schema part first via
  the `change-database-schema` skill (typically the `supabase-agent`'s job),
  then come back here for the UI/hook part (typically `frontend-agent`'s
  job). Don't write hooks against a table that doesn't exist yet.
- Know whether the resource needs file uploads (image/video) — if so, reuse
  [imageCompressor.ts](../../../src/lib/imageCompressor.ts) /
  [videoCompressor.ts](../../../src/lib/videoCompressor.ts), don't write new
  compression logic.

# Relevant files

Reference implementation (simplest full example, no image upload):
- Hook: [src/admin/hooks/useExtras.ts](../../../src/admin/hooks/useExtras.ts)
- Page: [src/admin/pages/AdminExtras.tsx](../../../src/admin/pages/AdminExtras.tsx)

Reference implementation with image upload + reordering:
- Hooks: [src/admin/hooks/useChalets.ts](../../../src/admin/hooks/useChalets.ts),
  [src/admin/hooks/useImageUpload.ts](../../../src/admin/hooks/useImageUpload.ts)
- Form: [src/admin/components/ChaletForm.tsx](../../../src/admin/components/ChaletForm.tsx)
- Uploader: [src/admin/components/ImageUploader.tsx](../../../src/admin/components/ImageUploader.tsx)
- Reorder list: [src/admin/components/ImageSortableList.tsx](../../../src/admin/components/ImageSortableList.tsx)
  (uses `@dnd-kit/*`, already a dependency)
- Page: [src/admin/pages/AdminChaletEdit.tsx](../../../src/admin/pages/AdminChaletEdit.tsx)

Types: [src/types/database.ts](../../../src/types/database.ts) — add
`Row`/`Insert`/`Update` types and the exported type aliases for the new
table here.

Routing: [src/App.tsx](../../../src/App.tsx) — add a lazy-loaded route under
the existing `/admin` `ProtectedRoute` + `AdminLayout` nesting.

Sidebar nav: [src/admin/components/AdminSidebar.tsx](../../../src/admin/components/AdminSidebar.tsx)
— add the nav entry so the page is reachable.

# Step-by-step procedure

1. Confirm the table exists in `src/types/database.ts` (and in the SQL under
   `supabase/`, per `change-database-schema`). Note its exact columns/types.
2. Create `src/admin/hooks/use<Resource>.ts`:
   - `useAdmin<Resource>s()` — `useQuery`, `queryKey: ["admin-<resource>s"]`,
     `.order("display_order", { ascending: true })` if the table has one.
   - `useCreate<Resource>()` / `useUpdate<Resource>()` / `useDelete<Resource>()`
     — `useMutation`, each invalidating `["admin-<resource>s"]` (and any
     public-facing query key that reads the same table, e.g. `useExtras.ts`
     invalidates both `admin-extras` and `extras`).
   - If uploads are involved, a `useUpload<Resource>Media()` following
     `useUploadExtraMedia` in `useExtras.ts` — bucket name, path convention
     `{scope}/{Date.now()}-{random}.{ext}`, `getPublicUrl` afterward.
   - For reorderable/toggleable state, mirror `useToggleChaletActive`'s
     optimistic-update shape (`onMutate`/`onError`/`onSettled`) rather than
     waiting on a refetch.
3. Create the form component (`src/admin/components/<Resource>Form.tsx`) if
   the resource has more than one or two fields: `zod` schema +
   `zodResolver` + `react-hook-form`, shadcn `Form`/`FormField`/`FormItem`,
   following `ChaletForm.tsx`. For very simple resources, an inline form in
   the page component (see `AdminExtras.tsx`) is fine — don't over-engineer.
4. Create the admin page (`src/admin/pages/Admin<Resource>s.tsx`): list view
   + create/edit + delete, using `toast` from `sonner` for feedback, loading
   states via the query's `isLoading`/mutation's `isPending`.
5. Wire routing in `App.tsx` (lazy import + `<Route>` under the existing
   `ProtectedRoute`/`AdminLayout` nesting) and add the sidebar link in
   `AdminSidebar.tsx`.
6. Write tests under `src/test/hooks/use<Resource>.test.ts` and
   `src/test/pages/Admin<Resource>s.test.tsx`, using
   `src/test/mocks/supabase.ts` (`getChainFor`/`resetChains`) and adding a
   builder to `src/test/mocks/factories.ts` if none fits.

# Validation commands

```bash
npm run lint
npm run test
npm run build
```

For manual verification: `npm run dev`, sign in at `/admin/login`, exercise
the new page's create/edit/delete/reorder paths.

# Failure checks

- Query keys used for invalidation don't match the keys used in `useQuery` —
  double-check exact string arrays, TanStack Query matches by deep equality.
- RLS blocks the operation because the new table's policies don't grant the
  operation to `authenticated`/`is_admin()` — confirms schema work (see
  `change-database-schema`) must land and be run in Supabase before hooks are
  testable end-to-end (tests use the mock, so this only surfaces manually or
  in the real app).
- Forgetting `updated_at: new Date().toISOString()` on update mutations for
  tables that have that column (see `useUpdateChalet`).
- New page not added to `AdminSidebar.tsx` — page works but is unreachable
  from the UI.

# Completion criteria

- Lint, test, and build introduce no *new* failures (the repo has a
  pre-existing lint/test baseline — see [CLAUDE.md](../../../CLAUDE.md)'s
  "Known limitations").
- The resource is reachable from the admin sidebar, and create/edit/delete
  (and reorder, if applicable) all work against a real Supabase project.
- New hook(s) have test coverage using the shared mock/factories, not ad hoc
  mocks.
- `src/types/database.ts` reflects the table exactly if it's new.

# Applicable guardrails

- `database-rls-and-secrets` — if this work involves any new table/column or
  policy, not just UI.

# Recommended agent

- `frontend-agent` for the hook/form/page/routing work described here.
- `supabase-agent` first, if the underlying table doesn't exist yet.
