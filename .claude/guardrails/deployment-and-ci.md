# Guardrail: Deployment and CI

## Protected area

- [.github/workflows/vercel-production.yml](../../.github/workflows/vercel-production.yml)
- [vercel.json](../../vercel.json)
- GitHub repository secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`,
  `VERCEL_PROJECT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- `package.json` `scripts` (`lint`, `test`, `build`) — these are exactly what
  CI runs as the quality gate

## Risk

Per [README.md](../../README.md) and the workflow file itself: **every push
to `main` automatically runs lint → test → build, and if all three pass,
deploys straight to Vercel production.** There is no staging environment or
manual approval step in this pipeline. Merging a PR into `main` deploys to
production with no further human checkpoint. The workflow also only triggers
on `push` to `main` (plus manual `workflow_dispatch`) — there is no separate
CI workflow that runs on pull requests, so a PR branch is not verified by
this pipeline until it's merged.

**As of 2026-07-27, the `quality-gate` job would currently fail on a push to
`main`**: `npm run lint` has 59 pre-existing errors and `npm run test` has 5
failing test files, unrelated to any in-flight feature work (see
[CLAUDE.md](../../CLAUDE.md)'s "Known limitations"). In practice this means
production is not currently auto-deploying from `main` until that debt is
addressed — worth surfacing to the user if a deploy is expected to happen
automatically.

## Required behavior

- Treat any change that affects what runs in `npm run lint` / `npm run test`
  / `npm run build`, or the workflow file itself, as directly affecting
  whether the next merge to `main` succeeds and deploys.
- Run `npm run lint`, `npm run test`, and `npm run build` locally before
  telling the user work is ready to merge — don't rely on CI to discover a
  failure for the first time, since a green run on `main` deploys
  immediately.
- If asked to change the workflow (e.g. add a step, change triggers), keep
  the `quality-gate` job (lint/test/build) as a hard prerequisite
  (`needs: quality-gate`) for the `deploy-production` job — don't let a
  change accidentally allow deploy-on-failure.
- Remember `npm run build` does not type-check (see
  [CLAUDE.md](../../CLAUDE.md) — SWC transpiles without checking types, and
  ESLint isn't configured type-aware here). Passing CI is not proof the
  types are correct; say so if relevant rather than implying full
  verification.

## Prohibited behavior

- Never push directly to `main` or merge a PR into `main` on the user's
  behalf — that is what triggers the production deploy, and is the user's
  call, not this agent's.
- Never run `vercel deploy`, `vercel --prod`, or any direct Vercel CLI
  deploy command yourself — the documented path is push-to-`main`-triggers-CI,
  not manual CLI deploys from a dev machine.
- Never add `--no-verify`/skip hooks, weaken the lint/test/build gate, or
  remove the `needs: quality-gate` dependency in the workflow, to "get a
  change through" — if lint/test/build is genuinely failing for a reason
  unrelated to the current task, fix or flag it, don't bypass it.
- Never print or hardcode `VERCEL_TOKEN`, `VERCEL_ORG_ID`, or
  `VERCEL_PROJECT_ID` — they belong only in GitHub repository secrets and
  the local, git-ignored `.vercel/project.json` created by `npx vercel link`.
- Never commit `.vercel/` (already covered by `.gitignore`'s `.vercel`
  entry — verify it stays that way).

## Required validation

- `npm run lint`, `npm run test`, `npm run build` run locally, with no *new*
  failures introduced relative to the pre-existing baseline, before
  suggesting a merge to `main`. Given that baseline is currently non-clean
  (see Risk above), don't imply "CI will pass" without qualifying that the
  gate is already red for reasons predating your change.
- Any workflow-file change reviewed line-by-line with the user before
  committing, given it directly controls production deploys.

## Escalation conditions

- Any request to push to `main`, merge a PR, or trigger a deploy — confirm
  with the user first even if they've asked for the underlying code change;
  approval to change code is not approval to deploy it.
- Any request to change `.github/workflows/vercel-production.yml` or
  `vercel.json` — these are low-frequency, high-blast-radius files; walk the
  user through the diff rather than applying and moving on.
- Any CI failure whose cause isn't obviously related to the current change —
  investigate before assuming it's fine to retry/ignore.

## Applicable agents and skills

- Applies to both `frontend-agent` and `supabase-agent` — neither should
  push to `main`, deploy, or touch workflow/Vercel config without the
  escalation above. Deployment/CI config changes themselves aren't owned by
  either agent's normal scope; treat them as a direct user conversation.
