# Aaroh frontend

Expo Router (React Native) client for Aaroh.

Setup, env vars, and monorepo layout live in the **[root README](../../README.md)**. Contribution norms: **[CONTRIBUTING.md](../../CONTRIBUTING.md)**.

## Run

From the repo root (after `npm install` and a configured `.env`):

```bash
cd apps/frontend
npm start
```

Set `EXPO_PUBLIC_API_URL` so the device/emulator can reach the backend (see root README).

## Layout

| Path | Role |
|------|------|
| `app/` | Screens (Expo Router) |
| `services/` | HTTP client + API endpoints |
| `stores/` | Client app state |
| `constants/` | Shared UI / trip city lists |
| `components/` | Reusable UI |
