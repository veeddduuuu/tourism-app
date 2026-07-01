# AAROH - Cultural Tourism App for India

This is the backend and infrastructure monorepo for the AAROH project. It uses Turborepo to manage the workspace.

## Prerequisites

- Node.js (v20+)
- npm (v10+)
- Docker and Docker Compose

## Structure

```text
aaroh/
├── apps/
│   ├── backend/         # Node.js + Express backend service
│   └── frontend/        # Expo React Native application
├── packages/
│   └── shared/          # Shared TypeScript types and constants
├── docs/                # Project documentation
├── docker-compose.yml
└── turbo.json
```
