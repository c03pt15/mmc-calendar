### Prompts for deployment and CI (Vercel + GitHub, main branch)

Use these ready-to-paste prompts. Replace bracketed values.

#### Vercel project setup (Production = main, Preview = PRs)
“Configure a Vercel project for my React + Vite app. Production branch is `main`. Enable preview deployments for all pull requests. Set environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in both Production and Preview. Confirm build command `vite build`, install command `npm install`, and output directory `dist`. Provide step-by-step instructions and screenshots references for where to set envs and branch settings in Vercel.”

#### Vercel env management
“List all environment variables the app needs, which scopes they belong to (Production on `main`, Preview on PRs), and default fallbacks for local dev via `.env`. Provide a checklist I can follow in Vercel to set them and verify at runtime.”

#### GitHub repo wiring
“Give me exact commands to initialize git, create initial commit, set remote `https://github.com/[org]/[repo].git`, and push the `main` branch. Add a short section explaining repository visibility and branch protection rules for `main`.”

#### GitHub Actions: CI for PRs against main
“Create a `/.github/workflows/ci.yml` workflow that runs on `pull_request` to `main` and on `push` to `main`. Jobs: (1) Install Node 18, (2) cache npm, (3) npm ci, (4) npm run typecheck, (5) npm run lint, (6) npm run build. Do not publish artifacts. Make it fast and dependable.”

#### GitHub Actions: Preview comment with Vercel URL (optional)
“Add a step in the CI to post a comment on PRs linking to the Vercel preview deployment. Assume Vercel GitHub App is installed and comment only when a preview URL exists. Provide the minimal configuration and required permissions.”

#### Release checklist (manual)
“Write a short release checklist for merging into `main`: (1) ensure PR CI passed, (2) verify preview deployment, (3) squash-and-merge to `main`, (4) confirm Vercel production deployment triggered from `main`, (5) smoke test production, (6) tag release `vX.Y.Z`.”

#### Example CI config (copy-ready)
“Output a copy-ready `/.github/workflows/ci.yml` that uses Node 18 and runs on `pull_request` to `main` and `push` to `main`, with steps: checkout, setup-node, cache, npm ci, typecheck, lint, build. Use problem matchers and proper `actions/setup-node@v4`. Include a brief note on adding `TURBO_TOKEN`/`TURBO_TEAM` if monorepo.”

#### Vercel production protection
“Explain how to require approvals before production deploys by using Vercel’s Protection Rules or branch protections in GitHub for `main`. Provide step-by-step guidance and decision tradeoffs.”

---

#### Example: minimal CI for Vite app (targets main)
```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck --if-present
      - run: npm run lint --if-present
      - run: npm run build
```

#### Example: Vercel settings summary
- Production branch: `main`
- Preview deployments: enabled for all PRs
- Build command: `vite build`
- Install command: `npm install`
- Output dir: `dist`
- Env vars (Production + Preview): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`


