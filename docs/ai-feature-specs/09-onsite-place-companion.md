# Spec 09 — On-Site Place Companion

**Depends on:** Place detail records with briefs/history; optional audio TTS already in app stack  
**Out of scope:** Full offline museum headset product; AR overlays (separate roadmap)

---

## Problem statement

Standing at a monument, users open a thin detail card or a wall of Wikipedia. They want a short, spoken-friendly “what am I looking at?”, plus a few grounded FAQs, without leaving the cultural moment for a search engine.

---

## Why

Converts the content DB into a **live guide**. High emotional impact, clear retrieve-then-generate pattern, and pairs with translation/voice later. Strong “why Aaroh on-site” story.

---

## How

1. Context: `place_id` (from detail screen) or resolved place from search.
2. Retrieve brief, history entries, timings/fee if present.
3. Generate: (a) ~60–90s narration script, (b) 3–5 FAQ Q&As strictly from retrieved text.
4. Optional: device TTS / existing speech pipeline.
5. Cite source fields; if unknown (“exact construction cost”), say unknown.

---

## Goal

From any rich place page, one tap yields narration + FAQ that don’t invent major facts beyond the catalog.

---

## Context

- Place detail routes/UI in the Expo app  
- History entries linked to places  
- Overlaps Spec 02 techniques but scoped to one place, not a whole state

---

## Requirements

- Works with `place_id` as primary key.
- FAQ answers include “based on Aaroh brief / history entry” style grounding.
- Latency suitable for on-site use; cache per place where sensible.
- Language: English v1; hook for Spec 11 later.

## Non-goals

- Real-time crowd agent.
- Indoor navigation blue-dot.
- Replacing professional licensed guides’ livelihoods with false authority claims — tone should stay assistive.

---

## Acceptance criteria

1. For 5 seeded places, narration references entities present in briefs.
2. FAQ refuses or hedges when not in corpus.
3. UI entry point from place detail.
4. Documented prompt + retrieval query.
