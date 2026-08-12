# Spec 05 — Sthanik Gyaan (Ask a Local)

**Depends on:** Curated tip documents per city; optional later community submissions. Content ingest helps but tips are a **separate corpus**.

---

## Problem statement

Generic travel LLMs and TripAdvisor-style lists push the same tourist-trap answers. Locals know cheaper, better, weirder places — but that knowledge is scattered and not in Aaroh’s product loop. Users asking “where do locals eat chaat in Lucknow?” get unreliable freeform answers.

---

## Why

This is the clearest **RAG** story in the roadmap: retrieve verified local tips, then generate. It differentiates Aaroh as cultural/local, creates a community flywheel later, and is the natural home for pgvector if the team wants vector search experience.

---

## How

Build a tip corpus (JSON/Markdown chunks: city, topic tags, text, source, trust). Ingest into Postgres (FTS and/or `pgvector`). On question: embed or keyword-retrieve top chunks for that city → LLM answers **only** from chunks, with citations. Empty retrieval → refuse or ask clarifying question. Optional: flag tourist-trap tips via trust sheet (#12).

Start with 2–3 cities and ~50–100 tips each; quality over national scale.

---

## Goal

In demo cities, local questions return cited answers grounded in the tip corpus, not generic web lore.

---

## Context

- Part 2 product narrative: “Sthanik Gyaan / Ask a Local.”
- Stack freedom: LangChain optional; raw retrieve + Groq is fine.
- Frontend: simple ask box on city or Discover.

---

## Requirements

- Every answer lists supporting tip ids/snippets.
- City scoping is mandatory (no cross-city contamination without intent).
- Moderation path documented for future user-submitted tips (even if v1 is curated-only).
- Eval set: 10–20 questions with expected tip references.

## Non-goals

- Live scraping of Reddit/Quora as production corpus.
- Fine-tuning a full local LLM.
- Replacing the main trip planner.

---

## Acceptance criteria

1. End-to-end ask → retrieve → answer → citations for ≥2 cities.
2. Held-out questions show grounding (manual or scripted check).
3. Clear docs for adding tips and re-indexing.
4. Rate limits on the ask endpoint.
