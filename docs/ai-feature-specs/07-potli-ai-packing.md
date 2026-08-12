# Spec 07 — Potli AI (Smart Packing)

**Depends on:** Saved or draft itinerary; weather forecast; small cultural-rules pack.

---

## Problem statement

Generic packing lists (“bring a jacket”) ignore Indian trip realities: temple dress codes, monsoon days on specific dates, hill vs plains legs, festival colors, barefoot zones. Users either overpack or get turned away at entrances.

---

## Why

High user delight, fast to ship, and a crisp AI story: structured inputs → practical checklist. Complements planner and weather without needing a huge RAG corpus. Easy demo for stakeholders.

---

## How

Input: trip id or itinerary JSON + dates. Pull daily weather summaries; retrieve cultural rules matching stop categories/cities (head covering, modest dress, rain gear for Western Ghats monsoon, etc.). LLM returns day-aware packing list grouped by essentials / clothing / documents / cultural must-haves, with reasons tied to days or places. Persist optional packing result on the trip.

---

## Goal

Given a demo itinerary, user gets a specific, justified packing list — not a generic worldwide template.

---

## Context

- Part 2: Potli AI.
- Open-Meteo / weather agent outputs; places categories; trip JSON.

---

## Requirements

- Reasons must reference itinerary days and/or weather/rules.
- Rules file is data, not hard-coded in prompts only.
- Support family vs solo traveler count if present on trip.

## Non-goals

- E-commerce checkout for packing items.
- Airline baggage fee optimization.
- Medical advice beyond trivial altitude/rain notes (and those should be sourced).

---

## Acceptance criteria

1. API + simple UI section on itinerary.
2. Demo shows temple dress + rain items when relevant.
3. Rules pack documented and editable.
4. Output structured (JSON) for rendering checklists.
