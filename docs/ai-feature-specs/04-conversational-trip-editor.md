# Spec 04 — Conversational Trip Editor

**Depends on:** Persisted `ai_trips` (or equivalent) with structured itinerary JSON.

---

## Problem statement

Regenerating a full multi-agent plan for every tweak (“make day 2 lighter”, “more temples”, “cheaper food”) is slow, costly, and loses user agency. Users need to **steer** an existing plan in natural language and see a patch, not a brand-new unrelated trip.

---

## Why

Chat-over-itinerary is how people already think (“can we skip the fort?”). It showcases agent memory/state, lowers Groq usage vs full regen, and unlocks retention after the first plan. Works well without requiring vectors on day one.

---

## How

Load saved trip JSON into context (plus optional retrieved places matching edit intent). User sends an instruction; model returns a **structured patch** (replace day, reorder, swap activities, adjust budget notes) validated against schema; apply patch server-side; return updated itinerary. Support a short chat history per trip. Refuse or clarify unsafe/impossible edits (e.g. negative days).

---

## Goal

A user can perform common edits via chat and get a valid updated itinerary without running the full planner pipeline every time.

---

## Context

- `POST /ai/trip/plan`, trip get-by-id, `ai_trips.generated_itinerary`.
- Frontend itinerary screens; add a chat entry point.

---

## Requirements

- Patch validation (Zod/schema) before persist.
- Preserve trip metadata (dates, budget envelope) unless the user explicitly changes them.
- Log/model note when falling back to partial full-regen for hard edits.
- Auth: only owner can edit their trip if auth is enforced.

## Non-goals

- General travel chatbot unrelated to the saved trip.
- Multi-user collaborative editing.
- Voice UI (can compose later with existing voice/translate stack).

---

## Acceptance criteria

1. At least five edit intents work on a demo trip (pace, interest mix, cut cost, swap day theme, remove stop).
2. Invalid model output does not corrupt stored JSON.
3. UI shows before/after or clear updated day cards.
4. Short write-up of patch schema and failure modes.
