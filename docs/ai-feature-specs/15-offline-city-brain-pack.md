# Spec 15 — Offline City Brain Pack

**Depends on:** Per-city export of places briefs, tips, key phrases, festival snippets  
**Out of scope:** Full offline LLM weights on device as a must; entire India offline in v1

---

## Problem statement

India travel often hits weak connectivity exactly where guidance is needed (hills, old cities, rural approaches). Online-only AI and APIs fail; users need a **downloadable city pack** that still answers basic questions or powers a tiny local retrieve-then-generate / template flow.

---

## Why

Matches Aaroh’s offline content ambition and is a systems-y AI project (packaging, versioning, sync, size budgets). Differentiates from cloud-only travel GPT wrappers. Complements Spec 05/09 when the network drops.

---

## How

1. Define pack format (JSON/SQLite): places, briefs, tips chunks, metadata, version, city id.
2. Server job: build pack from DB for allowlisted cities; measure MB size.
3. App: download / update / delete packs; show storage use.
4. Offline UX v1: local search + scripted or small-model answers from retrieved chunks; if no on-device LLM, show retrieved snippets + canned “guide cards” without pretending live chat.
5. Stretch: tiny on-device model or edge cache — optional, not required for acceptance.

---

## Goal

At least one city pack downloadable and usable offline for browse + grounded Q&A-or-cards without network.

---

## Context

- Market docs mention offline state/content packs  
- Expo app storage / file system APIs  
- Content ingest quality caps pack usefulness

---

## Requirements

- Pack versioning and update check.
- Size budget target documented (e.g. aim under a stated MB for pilot city).
- Clear UI when offline vs online AI.
- License/source attribution preserved in pack.

## Non-goals

- Shipping a 7B model inside the APK as v1.
- Offline maps tileset as part of this spec (can link to existing map offline work if any).

---

## Acceptance criteria

1. Airplane-mode demo: place list/briefs for pilot city work from pack.
2. Offline “answer” or card flow uses only pack text (no silent cloud fallback).
3. Pack build script reproducible from DB.
4. Size + version documented.
