### Prompts to create a new project (Supabase + Vercel + GitHub)

Use these as ready-to-paste messages. Replace bracketed values.

#### Bold ask: Create project + infra
“Create a new React + Vite + TypeScript app named [app-name]. Use Tailwind. Configure Supabase as the DB (auth + SQL schema). Set up GitHub repo [github-org/repo-name]. Configure Vercel deployment with Preview and Production environments. Add ENV management (.env, .env.example) and README. Include minimal example CRUD using Supabase. Initialize CI with Vercel/GitHub integration.”

#### Environment and secrets
“Generate .env.example for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Add instructions to fetch values from Supabase dashboard. Make app crash-safe if envs are missing.”

#### Database schema and SQL
“Create SQL for tables: [tables + fields]. Provide idempotent scripts and a quick seed script. Include migration notes and how to apply in Supabase SQL editor.”

#### Auth (optional)
“Add Supabase Auth with email/password + magic link. Provide protected route example and session handling.”

#### Deployment
“Add Vercel config for React + Vite. Document how to set envs in Vercel (Preview vs Prod). Include commands to run locally and build.”

#### GitHub repo setup
“Provide exact steps to init git, add remote origin `https://github.com/[org]/[repo].git`, first commit, and push. Add a basic PR checklist template.”

#### DX and scripts
“Add npm scripts: dev, build, preview, typecheck, lint, format. Include Prettier + ESLint presets.”

#### README
“Write a concise README covering setup, envs, scripts, schema, deploy, and troubleshooting.”

#### Optional extras
“Add GitHub Actions for typecheck/lint on PRs. Add basic Playwright test for one page. Provide sample `.vscode` settings.”

#### Example full prompt to paste
“Create a new React + Vite + TypeScript app named mmc-calendar. Use Tailwind. Set up Supabase (URL/key via env), create tables tasks(id pk, title text, description text, status text, date date), and seed with 5 rows. Add minimal CRUD in a page and a `supabaseClient.ts` that fails clearly if envs are missing. Produce .env.example and instructions to fill from Supabase. Prepare for Vercel deployment with separate Preview/Production envs; document how to add envs in Vercel. Initialize GitHub repo ghislaingirard/mmc-calendar and include steps to push. Add scripts: dev, build, preview, typecheck, lint, format; include ESLint + Prettier. Provide a README with all steps. Finally, give me the commands to run locally.”

#### Follow-up prompts you can use
- “Generate the SQL and seed data only.”
- “Create the Supabase auth wiring and a protected route example.”
- “Add a GitHub Actions workflow for lint/typecheck on pull_request.”
- “Configure Vercel project settings and list exact env variables to set.”
- “Write the full README now.”


