# Spec 14 — Photo → Place → Context

**Depends on:** Vision-capable API (or caption model); place catalog for retrieval; camera permissions  
**Out of scope:** Perfect recognition of obscure unmarked ruins; AR reconstruction (Kaal Darshan-style) as v1

---

## Problem statement

Users shoot a temple or fort façade and still don’t know what it is — or they know the name but want instant grounded context. Typing search mid-street is clumsy; pure vision models hallucinate monument names.

---

## Why

Viral, highly demoable, India-visual-rich. Combines **vision** with **retrieval** (match to catalog / wiki title → brief). Multimodal work that still ends in Aaroh place pages.

---

## How

1. Client uploads image (compressed) or sends to backend.
2. Vision step: propose candidate landmark labels / descriptions (and confidence).
3. Match candidates against `places` (name FTS, geo if GPS available, aliases).
4. On match: return place card + short companion blurb (Spec 09 style) from DB.
5. On low confidence: ask user to confirm top-2 candidates or fall back to text search — **don’t** assert a wrong famous name.

---

## Goal

In pilot cities with distinctive monuments, a photo often resolves to the correct `place_id` with grounded text; failures stay honest.

---

## Context

- Place images and names in DB  
- Optional GPS from phone to constrain search  
- Part 2 mentions vision for Safarnama; this is the sharper recognition product

---

## Requirements

- Privacy: images retention policy documented (process & delete vs short cache).
- Confidence thresholds and user confirmation UX.
- Works on mid-range Android under reasonable lighting for famous sites.
- Rate limit uploads.

## Non-goals

- Training a custom India landmark CNN as a blocker (API vision OK for v1).
- Identifying individual people.
- Full offline vision pack in v1 (see Spec 15 for offline text packs).

---

## Acceptance criteria

1. Labeled test set of ≥15 photos across ≥5 monuments; report top-1 accuracy after retrieval match.
2. Wrong high-confidence assertions minimized (prefer abstain).
3. Successful match opens/returns Aaroh place context.
4. Privacy note in README.
