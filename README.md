# AAROH - Cultural Tourism App for India

This is the backend and infrastructure monorepo for the AAROH project. It uses [Turborepo](https://turbo.build/) to manage the workspace.

## Prerequisites

- Node.js (v20+)
- npm (v10+)
- Docker and Docker Compose

## Structure

```
aaroh/
├── apps/
│   └── backend/         # Node.js + Express backend service
├── packages/
│   └── shared/          # Shared TypeScript types and constants
├── docs/                # Project documentation
└── docker-compose.yml   # Docker compose configuration
```

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build all packages:
   ```bash
   npm run build
   ```

3. Start services via Docker Compose:
   ```bash
   docker compose up -d
   ```

   This will start:
   - **Backend API**: http://localhost:3000 (Healthcheck: http://localhost:3000/health)
   - **Redis**: localhost:6379
   - **LibreTranslate**: http://localhost:5000

4. Stop services:
   ```bash
   docker compose down
   ```

## Development without Docker (Backend only)

You can run the backend service in dev mode (which uses `ts-node-dev` for hot reloading):

```bash
cd apps/backend
npm run dev
```

Note: Ensure you have Redis and other required services running or configured via environment variables.

## Environment Variables

Create a `.env` file in the root of the project using the following as a template (see `.env.example`):

```env
PORT=3000
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
REDIS_URL="redis://localhost:6379"
```
