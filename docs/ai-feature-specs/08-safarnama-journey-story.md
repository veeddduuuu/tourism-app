# Spec 08 — Safarnama (Journey Story Generator)

**Depends on:** Itinerary JSON; place briefs; optional photos later (vision can wait).

---

## Problem statement

Users finish trips with camera rolls but no story. Writing a travelogue is effort; generic LLM “trip blogs” lack the places Aaroh already knows. Sharing is a growth loop Aaroh is not capturing.

---

## Why

Safarnama turns planner output into **social artifact** — retention and acquisition. Grounding in place briefs keeps the story on-brand and factual enough for a cultural app. Stretch path to multimodal photo captions.

---

## How

v1: from trip itinerary + retrieved briefs for visited/planned stops, generate a titled narrative (short magazine-style sections per day), highlight food/heritage moments, optional pull-quotes. Export as Markdown/JSON for in-app reader or share card. v2 (optional): accept photo list + captions via vision model.

---

## Goal

One-tap story from a demo trip that names real stops and reads like a travel essay, not a bullet itinerary dump.

---

## Context

- Part 2: Safarnama.
- `ai_trips`, places briefs; frontend share sheet nice-to-have.

---

## Requirements

- Prefer catalog place names; don’t invent side trips not in the plan.
- Length controls (short / standard).
- Language: English v1; hook to translation later if desired.

## Non-goals

- Full PDF print pipeline (unless trivial).
- Auto-posting to Instagram/Twitter.
- Replacing the factual itinerary view.

---

## Acceptance criteria

1. Endpoint returns structured story sections from a trip id.
2. Spot-check: stops mentioned ⊆ itinerary stops.
3. Basic in-app or web preview.
4. Note on how photos would plug in later (even if unimplemented).
