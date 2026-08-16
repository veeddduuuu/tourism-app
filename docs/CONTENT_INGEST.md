# Catalog ingest (ops)

This is the **production content path** for Neon/Postgres. It upserts curated JSON plus Wikidata/Wikipedia (places) and TheMealDB (optional recipe bodies). It does **not** wipe tables.

The old `src/db/seed.ts` path is a **demo fixture** only (wipe-and-insert). Use it to bootstrap an empty laptop DB, not to fill maps or the trip planner.

Spec: [`docs/CONTENT_DB_INGEST_SPEC.md`](./CONTENT_DB_INGEST_SPEC.md).

## Prerequisites

- `DATABASE_URL` in the repo-root `.env` (same as the API).
- Schema applied: `cd apps/backend && npm run db:push`
- Outbound HTTPS to:
  - `https://query.wikidata.org/sparql`
  - `https://en.wikipedia.org/w/api.php` (Action API; batched extracts)
  - `https://www.themealdb.com/api/json/v1/1/` (foods job)

Optional env:

```bash
# Wikimedia wants a descriptive User-Agent (contact or project URL)
INGEST_USER_AGENT=AarohCatalogIngest/1.0 (you@example.com; catalog ingest)
# Pause between Wikipedia batches (default 1500)
# INGEST_WIKI_GAP_MS=2000
```

## Order of jobs

Default `npm run ingest` runs:

1. `states` — curated `apps/backend/content/states.json`
2. `cities` — tourist allowlist with lat/lng (`content/cities.json`)
3. `places` — per-city Wikidata around-query + Wikipedia summaries
4. `foods` — curated dishes, recipes filled from JSON and/or TheMealDB
5. `festivals` — curated pack
6. `history` — national timeline + place-linked rows (matches `places.external_id` / name when present)

Places need cities (with coordinates) already in the DB. History can run without place matches; `place_id` stays null until a later re-run.

## Commands

From `apps/backend` (after `npm install` at repo root):

```bash
npm run ingest:dry                 # fetch + log counts, no writes for new/updated rows still hit SELECT
npm run ingest                     # full upsert
npm run ingest -- --jobs states,cities
npm run ingest -- --city Jaipur    # one allowlisted city (places + that city row)
npm run ingest -- --cap 8          # override per-city place cap
npm run ingest -- --skip-wikipedia # coords/names only (briefs will be skipped — not for prod)
npm run ingest -- --refresh-wikipedia # re-fetch briefs even if the row already has one
npm run ingest -- --skip-mealdb    # curated recipes only
```

Dry-run still needs `DATABASE_URL` so it can classify inserted vs updated.

Re-running ingest is safe: rows key off `external_id` (Wikidata QID for places, stable slugs for foods/festivals/history) and fall back to `(city_id, name)` for places left over from demo seed.

## What “good” looks like

After a successful places job you should see hundreds of places with `lat`/`lng`, non-empty `history_brief`, and many `wikipedia_url` / image URLs. Logs print `inserted` / `updated` / `skipped` / `failed` per job.

Skipped places are usually missing a usable English Wikipedia extract (by design).

## Demo seed (wipe)

```bash
cd apps/backend
npm run db:seed -- --wipe
# or: SEED_WIPE=1 npm run db:seed
```

Do **not** run this against a populated ingest catalog unless you intend to delete it.

## Rate limits

Places use the **MediaWiki Action API** in batches of 15 titles (not `rest_v1/page/summary`, which 429s quickly). On HTTP 429 the client waits for `Retry-After` (default 60s) and retries. Summaries are cached under `apps/backend/.cache/` so a restarted ingest does not re-hit Wikipedia. Places that already have a `history_brief` are skipped unless you pass `--refresh-wikipedia`.

If you are already being 429'd, stop the run, wait a few minutes, then `npm run ingest -- --jobs places` — it will resume from cache + existing rows.

Wikidata SPARQL is sequential with backoff. If SPARQL times out for one city, that city is logged as failed and the run continues.

## Editing packs

Version the JSON under `apps/backend/content/`:

| File | Role |
|------|------|
| `states.json` | Name is the upsert key (must match city/food/festival `state` strings) |
| `cities.json` | Allowlist only — lat/lng required; `placeCap` / `radiusKm` optional |
| `foods.json` | `externalId` + optional `mealDbName`, ingredients, steps |
| `festivals.json` | `externalId`; set `isNational` or a `state` |
| `history.json` | `externalId`; optional `placeExternalId` (Wikidata QID) or `placeName` |
