# Spec 11 — Multilingual Cultural Q&A

**Depends on:** Retrievable English (or bilingual) corpus — place briefs, tips (Spec 05), rules packs; Bhashini/Groq translation  
**Out of scope:** Perfect literary translation; speech UI as hard requirement (nice stretch)

---

## Problem statement

Many travelers and domestic tourists think in Hindi or regional languages, but Aaroh’s knowledge is largely English. Translating the UI is not enough if **answers** to cultural questions aren’t available in the user’s language or aren’t grounded.

---

## Why

India-first product credibility. Combines retrieval + translation (already on the roadmap) into one feature. Distinct from Spec 05 by centering **language**, not only hyperlocal tips.

---

## How

1. Detect or accept `question` + `language` (+ optional `city` / `place_id`).
2. Retrieve relevant chunks in the corpus language (typically English).
3. Generate answer grounded in chunks (cite ids).
4. Translate answer (and optionally citations’ titles) via Bhashini or Groq translation service already in backend.
5. Return bilingual payload if useful (`answer_native`, `answer_en`, `citations`).

Retrieval first, then translate — don’t translate the whole DB up front for v1.

---

## Goal

Ask a cultural/travel question in at least 2 Indian languages for a pilot city/place and get a grounded answer in that language.

---

## Context

- Existing translation services / Bhashini path in backend  
- Voice pipeline in product plan can wrap this later  
- Corpus may be place briefs and/or Sthanik tips

---

## Requirements

- Supported language list explicit (start small: Hindi + English, then one South Indian language if translation quality allows).
- Grounding + citation rules same as other RAG sheets.
- Clear failure when retrieval empty (translated “I don’t know”).

## Non-goals

- Offline on-device LLM for all 22 scheduled languages on day one.
- Translating the entire catalog into 22 languages as a blocker.

---

## Acceptance criteria

1. Test set of questions in Hindi (and one more if claimed) with citation-backed answers.
2. Untranslatable / failed MT path handled.
3. English baseline still works.
4. Latency and MT provider documented.
