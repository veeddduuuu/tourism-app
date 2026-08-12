# Spec 03 — Weather Reroute Brain

**Depends on:** Trip itinerary structure, Open-Meteo (or existing weather tool), places with categories + coords.

---

## Problem statement

Bad weather ruins outdoor-heavy days. Users get a forecast or alert but not **actionable swaps** tied to where they already are in the plan. Generic “visit a museum” advice is useless without real nearby indoor options Aaroh knows about.

---

## Why

Weather-aware rerouting is a planned product differentiator and a concrete AI+tools story: live forecast + catalog retrieval + LLM ranking. It makes the planner feel alive after generation, not one-shot.

---

## How

Given a trip id (or day payload) and a weather-stressed date: detect outdoor-leaning activities; retrieve candidate places near that day’s city/coords filtered toward indoor/covered/flexible categories (museum, fort interiors, temple, food experiences, etc.); LLM returns ranked alternatives with short reasons and optional “replace activity X.” Expose as an API the frontend can call from weather UI or itinerary day cards.

---

## Goal

For a demo trip in a known city, a rainy/high-precip day yields 3 concrete, mappable alternatives from the catalog (or clearly labeled fallbacks).

---

## Context

- Weather tool / Open-Meteo already in planner ecosystem.
- Places categories and lat/lng; itinerary days with themes/activities.
- Implementation plan mentions weather alternatives as an AI route.

---

## Requirements

- Use real weather signals (precip, alerts), not vibes-only prompts.
- Alternatives should include place id/name when from catalog.
- Keep suggestions geographically plausible (same city / short radius).
- Graceful behavior if few indoor places exist in DB.

## Non-goals

- Automatic silent rewrite of the whole trip without user confirm.
- Airline/train rebooking.
- Training a custom weather model.

---

## Acceptance criteria

1. API accepts trip/day context and returns structured alternatives.
2. At least one demo path shows catalog-backed indoor options under bad forecast.
3. Reasons reference weather + place type.
4. Documented how categories/radius were chosen.
