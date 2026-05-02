# Batroun Booking Experience

## Local development

1. Install dependencies:

	```bash
	npm install
	```

2. Start dev server:

	```bash
	npm run dev
	```

## Production deploy pipeline (Vercel + GitHub Actions)

This repository is configured with a GitHub Actions workflow at `.github/workflows/vercel-production.yml`.

Behavior:
- Every push to `main` runs lint, test, and build.
- If checks pass, the workflow deploys to Vercel production.
- Merging a PR into `main` triggers this automatically.

### One-time setup

1. Create a Vercel project and connect this repo.
2. From your local machine, link the project once:

	```bash
	npx vercel link
	```

	This creates `.vercel/project.json` locally with your IDs.

3. Add these GitHub repository secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

How to get values:
- `VERCEL_TOKEN`: Vercel dashboard -> Settings -> Tokens.
- `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`: from `.vercel/project.json` after `npx vercel link`.

4. Push to `main` (or merge a PR into `main`) to trigger production deployment.
