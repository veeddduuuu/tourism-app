# Contributing to Aaroh

Thanks for helping build Aaroh. This guide covers how to work in the monorepo, what goes where, and how we land changes.

## Before you start

1. Read the root [README](README.md) for setup and architecture.
2. Use Node 20+ and npm 10+.
3. Copy `.env.example` → `.env` at the **repo root** (backend loads it from there). Never commit secrets.
4. Prefer small, reviewable PRs over large mixed dumps.

## Repo layout (where to change what)

| Area | Path | Notes |
|------|------|--------|
| API routes | `apps/backend/src/routes/` | Mounted under `/api` via `routes/index.ts` |
| Trip planner | `apps/backend/src/tripPlanner/` | Agents, tools, orchestrator — keep route thin |
| LLM / Bhashini helpers | `apps/backend/src/services/` | Shared non-route services |
| DB schema | `apps/backend/src/db/schema.ts` | Drizzle; run `db:push` / `db:generate` as needed |
| App screens | `apps/frontend/app/` | Expo Router file-based routes |
| API client | `apps/frontend/services/` | `http.ts` + `endpoints/*` + `contracts.ts` |
| Shared types | `packages/shared/` | Only truly cross-cutting contracts |
| Product specs | `docs/ai-feature-specs/` | Specs, not implementation tutorials |
| Content ingest | `docs/CONTENT_DB_INGEST_SPEC.md` | Catalog / ingest expectations |

Do **not** commit:

- `.env`, credentials, or local lockfiles like `docs/.~lock.*`
- Merged dump docs unless the team explicitly wants them tracked
- Generated noise (`node_modules`, `.expo`, `dist`, `.turbo`)

## Local workflow

```bash
npm install
cp .env.example .env          # fill DATABASE_URL, GROQ_API_KEY, REDIS_URL, …
docker compose up redis -d
npm run dev -- --filter=backend
cd apps/frontend && npm start
```

- Health check: `GET http://localhost:3000/health`
- Trip plan: `POST http://localhost:3000/api/ai/trip/plan` (see frontend `services/endpoints/trip.ts` for body shape)
- Schema changes: `cd apps/backend && npm run db:push` (and generate migrations when you introduce them)

If the app runs on a phone, set `EXPO_PUBLIC_API_URL` to your LAN IP (or `10.0.2.2` for Android emulator).

## Branching

- Branch from `main` (or the agreed base): `feat/…`, `fix/…`, `docs/…`, `refactor/…`
- Keep one concern per branch when you can (easier review and revert)

## Commits

- Prefer [Conventional Commits](https://www.conventionalcommits.org/)-style subjects:
  - `feat(backend): …`
  - `feat(frontend): …`
  - `refactor(shared): …`
  - `docs: …`
  - `fix: …`
- Subject: short, imperative, focus on **why** when it isn’t obvious
- Stage related files together; split unrelated work into multiple commits
- Do **not** add Co-authored-by / “Made with Cursor” / AI attribution trailers unless a maintainer asks

Example:

```bash
git add apps/backend/src/tripPlanner/agents/weather.ts
git commit -m "$(cat <<'EOF'
feat(backend): harden weather agent geocoding for India aliases

EOF
)"
```

## Pull requests

1. Rebase or merge latest `main` so the branch is clean.
2. Open a PR with:
   - **Summary** — what and why (bullets are fine)
   - **Test plan** — how you verified (API call, Expo screen, Docker, etc.)
3. Call out env/schema changes (new keys in `.env.example`, Drizzle pushes).
4. Keep docs in sync when behavior or run steps change (`README.md`, specs under `docs/`).

## Code guidelines

- **Backend:** validate inputs (Zod), keep route handlers thin, put agent/LLM logic in `tripPlanner/` or `services/`. Respect rate limits and degrade gracefully when optional keys (`NEWS_API_KEY`, Clerk) are missing.
- **Frontend:** talk to the backend through `services/http.ts` and `services/endpoints/*`; keep types aligned with `contracts.ts` / `@aaroh/shared`.
- **Shared:** only put types/constants that both apps need; avoid dragging UI or Node-only code into `packages/shared`.
- Match existing style in the file you touch; don’t drive-by reformat unrelated code.
- No secrets in source. Use `.env.example` for new public config knobs (document purpose in a comment).

## Docs contributions

- AI product ideas → `docs/ai-feature-specs/` (follow the README sheet structure there)
- Content/catalog ingest → `docs/CONTENT_DB_INGEST_SPEC.md`
- How to run / map of the repo → update root `README.md`

## Questions / blockers

If setup fails, note OS, Node version, whether you’re on Docker vs local, and the exact error from `/health` or Expo. Include whether `DATABASE_URL` / Redis / Groq are configured (not the secret values).
