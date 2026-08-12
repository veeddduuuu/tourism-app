# Spec 12 — Trust & Tourist-Trap Ranking

**Depends on:** Places and/or tips collections; optional user auth for flags  
**Out of scope:** Defamation warfare; paid “boost listing” marketplace as v1

---

## Problem statement

Not all sources are equal. Community tips and LLM suggestions can push tourist traps. Without trust signals, Spec 01/05 retrieval treats every row the same — and bad tips poison the product.

---

## Why

Makes RAG/retrieval **honest**. Supports the Part 2 “anti-tourist-trap” idea and creates a ranking/ML-lite project (weights, moderation) alongside generative AI. Improves planner and Ask a Local quality without new prose generation.

---

## How

1. Define signals: source tier (manual curated > wiki-linked place > community), user trap flags, report counts, recency, moderator state.
2. Store on places/tips: `trust_score` or equivalent components.
3. Retrieval sorts/filters by trust; planner down-ranks low trust.
4. Optional: LLM classifies incoming community tips as spam/scam-report/tip (moderation assist only).
5. User affordance: “Mark as tourist trap” / “Useful tip” with rate limits.

---

## Goal

Pilot city where retrieval and recommendations visibly prefer high-trust rows and expose a simple flagging loop.

---

## Context

- Spec 05 community flywheel  
- Spec 01 ranking of candidate places  
- Auth via existing Clerk (or project auth) if flags are per-user

---

## Requirements

- Transparent-ish scoring (document formula).
- Abuse resistance: rate limits, auth for votes.
- No hard deletion of places on a single flag — weight decay.
- Admin or script path to reset/curate scores.

## Non-goals

- Full review platform like Google Reviews.
- Selling rank to businesses in v1.

---

## Acceptance criteria

1. Formula documented; sample data shows reordering before/after flags.
2. Flag API + basic persistence works.
3. Planner or Ask a Local uses scores in ranking.
4. Spam classification (if any) evaluated on a tiny labeled set.
