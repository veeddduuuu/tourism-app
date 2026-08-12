# Aaroh Content Database — Spec

**Out of scope:** RAG, embeddings, vector DBs, scraping social sites, paid Places APIs as the primary source.

---

## Problem

The current DB seed is a small hand-written demo (roughly a dozen states, ~25 cities, ~40 places, a handful of foods/festivals/history rows). Most places lack coordinates. That is enough for UI scaffolding, not for maps, discovery, or grounded trip planning.

Aaroh needs a real content catalog: enough places, foods, festivals, and history that list/map/detail screens and the trip planner can rely on **our data** instead of inventing it.

---

## Goal

Ship an **idempotent ingest layer** that fills NeonDB from free, documented sources plus small curated JSON packs, so re-runs update rather than duplicate.

Rough v1 bar (guidance, not a hard contract):

| Domain | Directionally “good enough” |
|--------|-----------------------------|
| States / cities | Curated tourist-city allowlist with lat/lng (expand beyond the demo set) |
| Places | On the order of **500+** with lat/lng and a real short brief |
| Foods + recipes | Dozens of dishes; many with ingredients/steps; sensible state linkage where known |
| Festivals | Dozens covering national + major regional |
| History | Mix of national timeline + entries linked to important places |

Quality beats raw volume. Empty OSM nodes and junk POIs are worse than fewer solid rows.

---

## Current system (context)

- Monorepo; content lives in `apps/backend` (Drizzle + Neon/Postgres).
- Schema already has: `states`, `cities`, `places`, `history_entries`, `traditional_foods`, `recipes`, `festivals`, `hotels`, `ai_trips`.
- `places` already supports name, category, lat/lng, rating, entry fee, timings, `history_brief`, images, `wikipedia_url`, plus FTS on name/brief.
- Existing `seed.ts` is a wipe-and-insert demo fixture — fine for local smoke tests, **not** the production content path.
- Product plan already assumes free sources: Wikidata, Wikipedia, TheMealDB / Open Food Facts, later Overpass / OpenTripMap for POI densification. Prefer those over inventing new paid pipelines.

Trip planner today is multi-agent LLM + live tools (weather, news). It does **not** yet systematically pull from the places catalog. Once the catalog is real, retrieving nearby/top places for a destination and injecting them into itinerary generation is desirable — still ordinary SQL/API retrieval, not RAG.

---

## Requirements

### Content model

Keep using the existing tables. Extend them only where ingest safety or provenance needs it, for example:

- Stable external id on places (e.g. Wikidata id) and a unique constraint so upserts work.
- `source` (and optionally `updated_at`) on ingested rows.
- Cities/places should not ship without coordinates when they are meant to appear on a map.
- Categories should stay a small controlled set (heritage, temple, nature, beach, hill, museum, fort, other — adjust if the app already uses a fixed set).

Dedupe strategy is part of the design: prefer external id; fall back to something like `(city_id, name)` where needed.

### Ingest vs demo seed

- **Demo seed:** small, local, optional wipe — developer convenience.
- **Ingest:** separate scripts/modules, upsert-oriented, safe to re-run against a populated DB.
- Support a dry-run mode and clear logging (counts inserted/updated/skipped).

### Sources (expected)

| Content | Primary approach |
|---------|------------------|
| Cities | Curated allowlist (JSON or similar) with state, coords; don’t auto-ingest every town in India |
| Places | Wikidata discovery scoped per city / region, then Wikipedia summary for `history_brief`, link, and thumbnail where available |
| Extra POI density (optional later) | OpenTripMap and/or Overpass — only keep rows that still get useful text/coords |
| Food | TheMealDB (Indian) for recipe bodies; curated pack for iconic state dishes and correct state tagging (wrong state is worse than null) |
| Festivals | Curated pack — public APIs are weak here |
| History | Small curated national timeline + place-linked entries for major sites (curated preferred for accuracy) |

Respect rate limits and API etiquette (especially Wikipedia). Cache or backoff as needed during bulk enrich.

### Product behavior once data exists

- Places APIs: filter/search by state, city, category; detail includes brief, images, wiki link when present.
- Map/nearby needs real lat/lng.
- Food/festival/history screens read from DB, not hardcoded frontend lists.
- Trip planner should be able to use destination-relevant places from the DB (names + briefs) when generating itineraries.

### Non-goals

- Vector search / RAG / LangChain / Pinecone.
- Scraping Reddit, Quora, TripAdvisor, etc.
- Google Places (or similar) as the main corpus.
- One giant unfiltered India OSM dump.
- Wiping production tables on every ingest run.

---

## Design expectations (leave room to invent)

Folder layout, script entrypoints, and exact SPARQL/filters are left open. The following are expectations, not a mandated file tree:

- Curated packs live as versioned data files in the backend (cities, foods, festivals, history).
- Ingest code is modular (clients for Wikidata/Wikipedia/MealDB, shared upsert helpers, rate limiting).
- npm/package scripts make common ingest jobs easy to run.
- City-scoped place discovery with a **per-city cap** and type allowlisting beats a single global “LIMIT 500” dump.
- Prefer places that have an English Wikipedia sitelink (better briefs, fewer orphans).
- Images: Wikimedia/Wikipedia thumbnails are fine for v1; don’t reuse one Unsplash URL for everything.
- Idempotency and provenance are mandatory; clever architecture beyond that is optional.

Optional later: admin/CMS for human edits; periodic refresh of Wikipedia briefs; Cloudinary mirroring for images.

---

## Acceptance criteria

Treat these as the bar for “done” for this spec:

1. Re-running ingest does not create duplicate places for the same external id.
2. Catalog size and quality are clearly past the demo seed (hundreds of places with coords + non-empty briefs; foods/festivals/history no longer token samples).
3. A high share of places have a usable image URL and Wikipedia (or equivalent) reference when available.
4. Allowlisted cities used for ingest all have coordinates and valid state FKs.
5. Map/list/detail flows work against ingested data without relying on hardcoded place arrays.
6. README or short ops note documents how to run ingest (env vars, order of jobs if any, dry-run).
7. Demo `seed.ts` remains usable for empty-local bootstraps without being the only content strategy.

---

## Risks (known)

- Wikidata returns noisy POIs → cap per city, filter by type, prefer Wikipedia-linked entities.
- Wrong city attachment → use distance/bbox around the city center; drop outliers.
- Wikipedia throttling → sequential/slow enrich, backoff, optional on-disk cache during a run.
- TheMealDB coverage of Indian regional food is thin → curated JSON is source of truth for identity/state.
- Hotlinked images break → prefer stable Wiki thumbnails; mirror later if needed.

---

## Reference

Broader product/implementation context: `docs/AAROH_Implementation_Plan_Phase1-3.md` (stack choices, example Wikidata/MealDB sketches, milestone “500+ places”). This spec overrides the hand-seed mindset; examples in that plan are starting points, not copy-paste mandates.
