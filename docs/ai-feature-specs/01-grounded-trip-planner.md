# Spec 01 — Grounded Trip Planner

**Depends on:** Places (and ideally foods/festivals) with names, coords, briefs — full ingest or a curated city pack.

---

## Problem statement

The trip planner already produces structured itineraries via Groq agents, but day plans can invent landmarks, ignore what Aaroh actually stores, and feel generic. Users cannot tell which stops are “in the app” versus model memory. That weakens trust and wastes the content DB once it grows.

---

## Why

Aaroh’s edge is cultural depth and a owned catalog, not another freeform LLM itinerary. Grounding the planner in retrieved places makes plans **checkable, mappable, and consistent** with Discover/map screens. It is the highest-leverage AI improvement for the current product and a natural first step before full vector RAG.

---

## How

Before or during itinerary (and related) agent runs, **retrieve** a shortlist of destination-relevant places from Postgres (by city/region, category, rating/importance). Inject compact rows (id, name, category, brief, lat/lng) into the agent context and instruct the model to **prefer** those ids/names. Persist references to catalog ids on itinerary items when possible. SQL retrieve-then-prompt is enough for v1; semantic search is optional later.

Live tools (weather, safety news) stay as they are — this sheet is about **catalog grounding**, not replacing tools.

---

## Goal

Itineraries for supported cities mostly use real Aaroh places; UI can deep-link or show “from catalog” on stops; hallucination of famous-but-wrong-local sites drops for those cities.

---

## Context

- Backend: `apps/backend` trip planner agents (`itinerary`, hotels, etc.), `POST /ai/trip/plan`, `ai_trips` persistence.
- Data: `places` (+ cities/states); foods/festivals optional extras in context.
- Frontend: itinerary display in the Expo app.

---

## Requirements

- Retrieval scoped to the trip destination (and nearby cities if multi-city).
- Context budgets stay bounded (top N places, truncated briefs).
- Model instructions: prefer retrieved places; if improvising, mark as non-catalog.
- Structured itinerary output remains valid against existing schemas.
- Simple metric or log: fraction of named stops matching catalog names/ids.

## Non-goals

- Full pgvector RAG pipeline (unless you already need it for another sheet).
- Replacing budget/weather/safety agent logic.
- Scraping the web at plan time for place text.

---

## Acceptance criteria

1. For at least one demo city pack, a generated plan’s majority of activity stops resolve to catalog places.
2. Re-run planner still returns schema-valid JSON.
3. Docs/notes explain the retrieve → inject → generate flow and any flags for non-catalog stops.
4. No regression: weather/safety tools still participate when configured.
