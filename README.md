# Aaroh

India cultural tourism app — Expo frontend + Express backend in a Turborepo monorepo. Plan trips with a multi-agent AI pipeline, browse places/foods/festivals/history, and get state stories and translations.

## Prerequisites

- **Node.js** 20+
- **npm** 10+
- **Docker** + Docker Compose (Redis; optional full stack)
- **Expo Go** (or Android/iOS emulator) for the mobile app
- A **Postgres** database (e.g. [Neon](https://neon.tech)) — set `DATABASE_URL`
- **Groq** API key for trip planning and stories

Optional: Bhashini (translation/ASR), Clerk (auth / trip history), NewsAPI (safety headlines), OpenTripMap.

## What’s where

```text
aaroh/
├── apps/
│   ├── backend/                 # Express API (:3000)
│   │   ├── content/             # Curated JSON packs (cities, foods, …)
│   │   └── src/
│   │       ├── routes/          # HTTP routers under /api/*
│   │       ├── tripPlanner/     # Multi-agent trip planner (Groq + tools)
│   │       ├── services/        # Groq stories, Bhashini, translation
│   │       ├── db/              # Drizzle schema, Redis, demo seed
│   │       ├── ingest/          # Idempotent catalog ingest CLI
│   │       └── middleware/      # Auth, rate limit, errors
│   └── frontend/                # Expo Router app (React Native)
│       ├── app/                 # Screens (file-based routes)
│       ├── services/            # API client + endpoint modules
│       ├── stores/              # App state (Zustand-style store)
│       └── constants/           # Trip cities, shared UI constants
├── packages/
│   └── shared/                  # Shared TypeScript contracts (@aaroh/shared)
├── docs/
│   ├── CONTENT_DB_INGEST_SPEC.md
│   ├── ai-feature-specs/        # Product specs for AI features
│   └── …                        # Plans / notes (not all tracked)
├── docker-compose.yml           # frontend, backend, redis
├── .env.example                 # Copy → .env at repo root
├── CONTRIBUTING.md
└── turbo.json
```

### Backend API surface

| Prefix | Role |
|--------|------|
| `GET /health` | Liveness |
| `/api/places` | Places catalog |
| `/api/foods` | Foods |
| `/api/festivals` | Festivals |
| `/api/history` | History entries |
| `/api/search` | Full-text search |
| `/api/ai/trip/plan` | Multi-agent trip planner |
| `/api/ai/trip/history` | Saved trips (Clerk user) |
| `/api/ai/story` | State storytelling |
| `/api/translate`, `/api/translation` | Bhashini translation / ASR |

Trip planner pipeline (in `apps/backend/src/tripPlanner/`): weather ∥ travel ∥ safety → hotels → itinerary → budget (revise if needed) → critic.

### Frontend entry points

| Path | Screen |
|------|--------|
| `app/welcome.tsx`, `app/state-selector.tsx` | Onboarding / destination |
| `app/trip-preferences.tsx` | Trip prefs → planner |
| `app/itinerary.tsx` | Rendered multi-agent plan |
| `app/story.tsx` | State story |
| `app/(tabs)/` | Home, food, festivals, history, profile |
| `services/http.ts` + `services/endpoints/` | Backend client |

Point the app at the API with `EXPO_PUBLIC_API_URL` (default `http://localhost:3000/api`).

## Quick start

### 1. Clone and install

```bash
git clone <repo-url> aaroh
cd aaroh
npm install
cp .env.example .env
```

Edit `.env` — at minimum:

```bash
DATABASE_URL="postgresql://…"
GROQ_API_KEY=…
REDIS_URL=redis://localhost:6379   # local Redis; use redis://redis:6379 inside Compose
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

For a **physical device**, use your machine’s LAN IP instead of `localhost` (e.g. `http://192.168.1.10:3000/api`). Android emulator often needs `http://10.0.2.2:3000/api`.

### 2. Database

From `apps/backend`:

```bash
cd apps/backend
npm run db:push      # apply Drizzle schema
# optional: demo seed (WIPES catalog tables) / Drizzle studio
# npm run db:seed -- --wipe
npm run db:studio

# catalog ingest (idempotent; not the demo seed)
npm run ingest:dry
npm run ingest
```

### 3. Redis

```bash
docker compose up redis -d
```

Or run Redis another way and set `REDIS_URL` accordingly.

### 4. Backend (local)

From the **repo root**:

```bash
npm run dev -- --filter=backend
# or: cd apps/backend && npm run dev
```

API: [http://localhost:3000](http://localhost:3000) — check `GET /health`.

### 5. Frontend

```bash
cd apps/frontend
npm start          # Expo (tunnel script in package.json)
# or: npm run android | npm run ios | npm run web
```

Ensure `EXPO_PUBLIC_API_URL` matches how the device/emulator reaches the backend.

### Docker Compose (full stack)

```bash
cp .env.example .env   # REDIS_URL=redis://redis:6379 for in-compose backend
docker compose up --build
```

- Backend: `http://localhost:3000`
- Frontend Expo: `http://localhost:8081`
- Redis: `localhost:6379`

## Common scripts

| Command | Where | What |
|---------|--------|------|
| `npm run dev` | root | Turbo `dev` for workspaces |
| `npm run build` | root | Turbo build |
| `npm run lint` | root | Lint workspaces |
| `npm run dev` | `apps/backend` | `ts-node-dev` API |
| `npm run db:push` | `apps/backend` | Push schema to Postgres |
| `npm run ingest` / `ingest:dry` | `apps/backend` | Catalog ingest (Wikidata/Wikipedia + JSON packs) |
| `npm run db:seed -- --wipe` | `apps/backend` | Demo fixture only (deletes catalog tables) |
| `npm start` | `apps/frontend` | Expo start |

## Docs

- [Content DB ingest spec](docs/CONTENT_DB_INGEST_SPEC.md) — catalog / ingest expectations
- [Catalog ingest ops](docs/CONTENT_INGEST.md) — how to run ingest (jobs, dry-run, env)
- [AI feature specs](docs/ai-feature-specs/README.md) — product sheets for AI capabilities
- [Contributing](CONTRIBUTING.md) — branch, commit, and PR conventions

## License

Private / unpublished unless noted otherwise.
