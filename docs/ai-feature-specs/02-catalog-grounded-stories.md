# Spec 02 — Catalog-Grounded State Stories

**Depends on:** State-linked places and/or `history_entries` with usable text (ingest or curated pack).

---

## Problem statement

State stories today are generated from a system prompt plus the state name. The model invents vivid scenes that may be wrong, uncited, and disconnected from places the user can open in-app. As a cultural product, inaccurate “history audio” is a trust risk.

---

## Why

Stories are a signature emotional feature. Grounding them turns the content DB into **experience**, not just list UI, and gives a clean RAG-or-retrieve demo: same endpoint, better truthfulness, optional citations to places/eras.

---

## How

On story request for a state: retrieve a handful of place briefs and history entries for that state; build a grounded context block; ask the LLM for the existing JSON shape (`title`, `monument`, `narration`) while requiring the monument and facts to come from retrieved material. Optionally return `sources[]` (place ids / titles). Cache results (Redis or DB) by state + content version if useful.

---

## Goal

Story output for covered states is narratively strong **and** traceable to catalog snippets; monument field matches a real place when one exists.

---

## Context

- `generateStory` in backend Groq service; `GET`-style story route under AI routes.
- Tables: `places.history_brief`, `history_entries`, `states`.

---

## Requirements

- Empty catalog → clear fallback or error, not silent hallucination presented as fact.
- Keep response format compatible with current frontend audio/story UX unless you version the API.
- Prefer second-person immersive tone already used in the product.

## Non-goals

- Full audiobook generation or multi-chapter sagas.
- User-uploaded story corpora.
- Multilingual narration (see multilingual Q&A sheet if combining later).

---

## Acceptance criteria

1. For demo states with seeded history/places, narration clearly reflects retrieved facts.
2. Monument corresponds to a catalog place when available.
3. Optional sources list present or documented as follow-up.
4. Rate limiting / caching behavior remains sane under the existing AI limiter.
