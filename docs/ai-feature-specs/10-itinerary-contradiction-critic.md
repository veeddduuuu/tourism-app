# Spec 10 — Itinerary Contradiction Critic

**Depends on:** Generated itinerary; catalog places with coords; weather/safety outputs when available  
**Out of scope:** Guaranteeing perfect real-world logistics; live traffic ETA as v1 requirement

---

## Problem statement

Multi-agent planners can emit plans that look coherent but hide contradictions: too many distant sights in one morning, outdoor treks on red-alert rain days, ignored safety notes, or stops not open in spirit (festival closures) without any warning to the user.

---

## Why

Trust is the scarce resource in AI travel. A **critic layer** that outputs structured issues is good engineering (eval harness), good UX (warnings), and good science (measurable precision/recall on synthetic bad plans). Complements Spec 01 rather than replacing it.

---

## How

1. Input: full trip memory / itinerary JSON (+ weather, safety, retrieved place coords).
2. Deterministic checks where possible (haversine distance vs pace, duplicate stops, empty days).
3. LLM critic for softer issues (theme mismatch, cultural sensitivity hints) constrained by retrieved facts.
4. Output: `issues[]` with severity, day index, message, optional `related_place_ids`.
5. Optionally feed issues back for one revision pass (careful with cost/loops).

---

## Goal

An API (or planner stage) that flags real problems on imperfect plans with structured, testable output — usable as a badge/warning list in UI.

---

## Context

- Existing `critic` agent in `tripPlanner` can be extended or replaced thoughtfully  
- Spec 01’s place ids make distance checks meaningful  
- Safety/weather agents already populate memory

---

## Requirements

- Machine-readable issue schema.
- Mix of rule-based and LLM checks; don’t LLM things arithmetic can do.
- Golden set of ≥10 synthetic “broken” itineraries for regression.
- Critic must not invent POIs; only comment on the plan + retrieved context.

## Non-goals

- Auto-fixing every issue without user consent.
- Legal liability disclaimers as the only output.
- Becoming a general fact-checker for all of India.

---

## Acceptance criteria

1. Golden set: majority of planted issues detected; false-positive rate discussed honestly.
2. UI or JSON consumer can list warnings by day.
3. Runs within acceptable extra latency (document p50/p95 on sample).
4. Clear separation: deterministic vs model judgments.
