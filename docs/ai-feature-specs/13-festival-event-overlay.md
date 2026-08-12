# Spec 13 — Festival & Event Overlay

**Depends on:** `festivals` table (or pack) with months/dates; trip date range; city/state linkage  
**Out of scope:** Full ticketed events marketplace; live concert scrapers

---

## Problem statement

Trips are planned on calendar dates, but itineraries often ignore that the user will be in Kolkata during Durga Puja or Jaipur near a major mela. Users miss once-a-year cultural peaks — or get surprised by closures and crowds.

---

## Why

Festivals are core Aaroh DNA (calendar feature already envisioned). Overlaying them onto AI plans is a concrete retrieve-then-reason feature with seasonal delight and practical warnings.

---

## How

1. Given trip `start_date` / `end_date` and destinations, retrieve overlapping festivals (month/date rules; lunar approx OK if documented).
2. Inject into planner or a post-pass: suggest day shifts, festival-specific activities, crowd/closure cautions.
3. UI: chips on days (“Onam week”) linking to festival detail.
4. LLM phrases suggestions; festival facts come from DB rows only.

---

## Goal

Plans (or a post-process panel) that mention real overlapping festivals with ids and optional schedule tweaks.

---

## Context

- `festivals` schema and discover/calendar UI  
- Trip planner date fields already on `TripParams`  
- Content ingest/curated festival pack quality matters

---

## Requirements

- Overlap logic testable without LLM.
- Festival suggestions carry `festival_id`.
- Distinguish “celebrate this” vs “expect crowds/closures”.
- Handle national vs state-scoped festivals.

## Non-goals

- Exact tithi-perfect astronomy for every festival in v1 (approximate + disclaimer OK).
- Booking puja tickets.

---

## Acceptance criteria

1. Fixed trip dates in a festival-heavy region surface the right festival row(s).
2. Itinerary or overlay UI shows them.
3. No festival invented off-DB.
4. Unit tests for date overlap helper.
