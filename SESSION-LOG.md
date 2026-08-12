# Ô Batroun — Supabase-to-self-hosted migration session log

**Repo:** `batroun-booking-experience`
**Scope of this session:** diagnosing a Supabase free-tier outage, migrating the whole app off Supabase to a self-hosted VPS stack, fixing the production incidents that followed, then a round of feature work, performance work, and a security review.

---

## 1. Background

The site (marketing + booking for "Ô Batroun" chalets, React/Vite/TS frontend on Vercel, originally Supabase Postgres/Auth/Storage on the backend) hit a Supabase free-tier outage. Rather than migrate to another managed provider, the user had an already-paid-for, always-on Contabo VPS (Windows Server) and chose to self-host instead.

## 2. Infrastructure migration

Built a full replacement stack on the VPS with **no Docker** (nested virtualization unavailable on the Contabo plan):

- **Postgres** — the database itself, schema + data migrated over from Supabase via `pg_dump`.
- **PostgREST** — auto-generated REST API in front of Postgres, mounted at `/rest/v1/*` (matches Supabase's URL convention so the existing `supabase-js`-shaped client code kept working during the transition).
- **Caddy** — reverse proxy in front of PostgREST and the storage server; also serves uploaded files directly as static assets at `/storage/v1/object/public/{bucket}/{path}`, matching Supabase Storage's public URL shape.
- **Custom storage server** — a small dependency-free Node.js service handling authenticated upload/delete for the three storage buckets (`chalet-images`, `site-images`, `gallery-media`).
- **Custom auth** — Supabase Auth (GoTrue) was replaced entirely with hand-written Postgres functions: `login(email, password)` returns a signed JWT; `pgcrypto`'s `crypt()`/`gen_salt('bf')` (bcrypt) hashes/verifies passwords against a `profiles.password_hash` column; `is_admin()` / `is_super_admin()` are `SECURITY DEFINER` helpers used by RLS policies and privileged RPCs; `create_admin_user()` / `delete_admin_user()` are the privileged-operation equivalents of what used to be Supabase Edge Functions.
- **Roles**: `anon` (public reads), `authenticated` (logged-in admin), `authenticator` — same three-role PostgREST convention Supabase itself uses.

The frontend's `.env` was repointed from the Supabase project URL/anon key to `https://api.obatroun.com` and a locally-generated anon-role JWT (signed with the same secret PostgREST is configured with).

## 3. The production outage (post-migration)

After the initial cutover, `obatroun.com` went down hard: `Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL` in the browser console, blank page.

Root-caused after several false leads (build cache, Vercel's native Git integration racing the custom deploy pipeline, env var scoping) to: **Vercel's CLI silently substitutes the literal string `"[SENSITIVE]"` for any environment variable flagged "Sensitive" when pulled via `vercel pull` in a non-interactive/CI context**, instead of the real value. The GitHub Actions workflow was pulling `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` this way before building, so the production bundle had `"[SENSITIVE]"` baked in as the literal Supabase URL.

**Fix:** stopped relying on `vercel pull` for those two variables; pass them directly from GitHub Actions secrets via `env:` in the build step of `.github/workflows/vercel-production.yml`. Verified as a genuine fix (not a lucky race) by pushing a trivial commit and polling the live bundle hash for ~8 minutes with zero errors.

## 4. Media migration (Supabase Storage → VPS)

Wrote a one-off Node script that read every row referencing a `supabase.co` storage URL across `chalet_images`, `site_images`, `gallery_media`, and `extras.media_urls`, downloaded each file, re-uploaded it to the new storage server, and repointed the DB row's URL — **99 files, 116.79 MB, zero failures**. Verified afterward that zero requests to `supabase.co` remain anywhere on the live site.

## 5. Removing `@supabase/supabase-js`

Replaced the Supabase JS client entirely with a small hand-written PostgREST client (`src/lib/supabase.ts`) implementing just the query-builder surface the app actually uses (`select/insert/update/delete/eq/order/limit/single/maybeSingle`, `.rpc()`, `.storage.from().getPublicUrl()`) over plain `fetch`. Package removed from `package.json`.

While doing this, found and fixed a real bug: two admin upload hooks (`useUploadAmenityImage`, `useUploadExtraMedia`) were still calling `supabase.storage.from().upload()` directly — meaning **new amenity/extra image uploads were silently still landing on Supabase** even after the "migration" was supposedly done. Fixed to use the same custom upload path as every other resource.

Also fixed the "Forgot Password" page, which still promised an email reset link that self-service reset no longer supports (now a static message pointing to another admin).

## 6. Admin feature work

- **Password-set/rotation for admin users**: there was previously no way to change a password after account creation. Added `update_admin_password(p_id, p_password)` (Postgres function, super_admin-only, same bcrypt scheme as `login`) plus a "Set Password" action in the admin Users page.
- **Logout bug**: clicking "Sign out" would spin forever and never actually return to the login screen unless the page was manually refreshed. Root cause: `useAuth()` was a plain hook with its own local `useState` — `ProtectedRoute` and `AdminSidebar` each held an **independent copy** of auth state, so signing out in the sidebar never told `ProtectedRoute` the token was gone. Fixed by converting `useAuth` to a React Context provider (`AuthProvider`) wrapping the whole app, so all consumers share one source of truth.

## 7. Image/video loading performance

User reported images loading slowly. An audit found several real issues:

- **Videos falsely labeled "lazy"**: `LazyVideo.tsx` rendered `<video preload="auto" autoPlay>` unconditionally — every gallery/amenity video (several 10MB+ `.mov` files) started downloading and playing the instant it mounted, regardless of visibility. Fixed by wiring in an existing-but-unused `useVideoAutoplay` IntersectionObserver hook, so videos only buffer/play once actually near/in view.
- **Video uploads never compressed**: only images went through the compression pipeline; videos uploaded raw up to 50MB. Wired in an existing-but-unused `compressVideo` (ffmpeg.wasm) function.
- **Missing `loading`/`width`/`height`** on several raw `<img>`/`<video>` tags across public pages and admin previews that bypassed the site's existing `OptimizedImage` lazy-loading pattern — added throughout.
- Removed a dead no-op image-optimization stub (`src/lib/imageUtils.ts`) with zero call sites.
- Fixed `useSiteImageUpload` never compressing the full image at all (only chalet/gallery uploads were compressed).

All verified live in production via Playwright: zero eager video network requests on page load, confirmed videos do start buffering/playing once scrolled near/into view, zero console errors.

## 8. Real thumbnail pipeline

Every uploaded image was previously served at one fixed compressed size (~1600×1200) everywhere — from a 40px admin table thumbnail up to an 800px chalet card. Added a proper second, smaller variant:

- Schema: `thumbnail_url` / `thumbnail_storage_path` (nullable) added to `chalet_images`, `site_images`, `gallery_media` (SQL run manually against the VPS Postgres, per this repo's no-migration-runner convention).
- Upload hooks generate a 480×480 @ quality 0.75 JPEG thumbnail alongside the full image, upload both, clean up both on delete.
- Display components (chalet cards, admin thumbnails/previews) prefer `thumbnail_url` with a fallback to the full `url` for any row not yet backfilled.
- **Backfilled all 91 pre-existing images** via a Node+Playwright script (real browser Canvas resize, matching the exact client-side compression logic) — zero failures. Notable savings: hero background 2.4MB → 35KB thumbnail; one amenity photo 2.9MB → 38KB.
- Verified live: homepage chalet cards confirmed actually requesting the `-thumb.jpeg` variant, not the full image.

Left out of scope (different schema shape — array-of-strings / single nullable column instead of the row-per-image pattern the other three tables use): `extras.media_urls`, `amenities.image_url`.

## 9. Security review

At the user's request, checked two things:

**Secrets in the repo — clean.**
`.env` is gitignored and was never committed; `.env.example` only ever had placeholders; the exposed VPS Postgres password from earlier in this conversation was only ever pasted in chat, never committed to a file; the only JWT ever committed anywhere in git history is the intentionally-public anon key.

**Server exposure — one real finding.**
Port-scanned the VPS's public IP:
- Postgres (5432) correctly **not** reachable from the internet — only via PostgREST. Good.
- **RDP (3389) and WinRM-HTTPS (5986) are both open to the entire internet.** This is the one significant, actionable finding — RDP exposed publicly is one of the most commonly attacked entry points on Windows servers. Recommended restricting both to a trusted IP (or VPN) via Windows Firewall.

Also directly tested (not just inspected) the app's write/read protections against the live database using the public anon key:
- Anon INSERT on `chalets` → correctly rejected (RLS policy violation).
- Anon UPDATE/DELETE on `chalets` → returned HTTP 204 but **verified afterward that no actual data changed** (price and row count both confirmed unchanged) — this is Postgres RLS silently filtering the target row out, a known PostgREST response quirk, not a real vulnerability.
- Anon reads of `profiles`, `page_views`, `social_clicks` → correctly empty.
- Anon/no-auth storage upload and delete → correctly rejected with 401; the target file was confirmed still intact afterward.
- Anon call to `create_admin_user` → fails (ugly generic error, not a clean 403, but confirmed no rogue account was created).

Secondary findings, lower priority:
- No rate-limiting/lockout on the `login()` RPC — a few manual failed-login attempts showed no throttling beyond bcrypt's inherent ~0.4–0.6s cost per attempt.
- API domain missing some defense-in-depth HTTP headers (`X-Content-Type-Options`, HSTS) — minor, not urgent for a JSON/file API.
- `is_super_admin()` throws a raw Postgres error instead of a clean message when called with no valid auth at all — cosmetic only, unauthorized callers are still correctly blocked.

---

## Current status / what's left

**High priority**
1. Restrict RDP (3389) / WinRM-HTTPS (5986) on the VPS to trusted IPs only. *(In progress — was mid-flow confirming whether a Contabo VNC/KVM console fallback exists before touching the firewall, to avoid risking a lockout.)*

**Medium priority**
2. Add rate-limiting/lockout to the `login()` RPC.

**Low priority / optional**
3. Add missing security headers on the API domain.
4. Clean up `is_super_admin()`'s error message for fully-unauthenticated callers.
5. Extend the thumbnail pipeline to `extras.media_urls` / `amenities.image_url` if wanted later.
6. Decide whether to reconnect or formally leave disabled Vercel's native Git integration (GitHub Actions has been the sole, reliable deploy path since the outage).
7. Add test coverage for `useSiteImageUpload.ts`, `useGalleryMedia.ts`, `AdminGallery.tsx`, `AdminSiteImages.tsx` (pre-existing gap).

**Already resolved / decided**
- Supabase project: paused (not deleted) — kept as a passive backup, no longer in the request path anywhere.
- The exposed VPS DB password from earlier in this conversation is moot now that the Supabase project is paused.
- Admin JWTs pasted in this chat for testing expire on their own (~1 week from issuance); no action needed.
