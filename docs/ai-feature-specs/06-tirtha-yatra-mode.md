# Spec 06 — Tirtha Yatra (Pilgrimage Mode)

**Depends on:** Temple/place data; curated temple rules & calendar constraints; optional panchang/auspicious-date API.

---

## Problem statement

Standard trip planners optimize for sightseeing pace and Instagram stops. Pilgrimage travel (Char Dham, temple circuits, Gurpurab travel, etc.) needs **ritual calendars, dress codes, queue realities, and resting patterns** that generic itineraries ignore — a large underserved India segment.

---

## Why

Tirtha Yatra positions Aaroh on a culturally specific wedge competitors skip. It is AI + structured knowledge (rules DB) more than open-web chat, and pairs well with festivals/places already in the schema.

---

## How

Add a planning mode/flag: inputs include circuit or destination, dates, mobility, sect/tradition notes if offered. Retrieve relevant temples/places + **rules documents** (dress, photography, prasadam, closure days). Optionally call a panchang/auspicious API. LLM produces a pilgrimage-aware itinerary (darshan windows, rest days, packing/cultural notes) with citations to rules entries. Keep output schema close to normal trips for UI reuse where possible.

---

## Goal

A demo circuit (e.g. a small South India temple loop or Golden Temple–centered trip) yields a plan that respects documented rules and date constraints better than the default planner.

---

## Context

- Part 2: Tirtha Yatra AI; Drik Panchang mentioned as optional.
- Reuse trip planner agents with different system prompts + retrieval packs.

---

## Requirements

- Rules corpus is curated and citable (no invented temple law).
- Sensitive handling: no sectarian judgment; factual logistics only.
- Explicit limitations when rules data is missing.

## Non-goals

- Religious authority or personalized spiritual advice.
- Payment/donation integrations.
- Crowdsourced theology debates.

---

## Acceptance criteria

1. Mode selectable in API and/or UI.
2. At least one circuit demo with rules citations in output.
3. Dress/closure constraints appear when present in corpus.
4. Short ethics/limitations note in README for the feature.
