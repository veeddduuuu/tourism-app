# Aaroh AI & RAG Feature Specs

Product specifications for AI-facing capabilities on Aaroh (India cultural tourism app). Each sheet is a **spec** — problem, rationale, approach, and acceptance bar — not an implementation tutorial.

Related: content catalog work is specified in [`../CONTENT_DB_INGEST_SPEC.md`](../CONTENT_DB_INGEST_SPEC.md). Several features assume places/foods/history eventually have real briefs; a small curated city pack can unblock AI work beforehand.

---

## Spec sheet structure

| Section | Purpose |
|---------|---------|
| **Problem statement** | What is broken or missing for the user / product today |
| **Why** | Why this feature matters for Aaroh |
| **How** | Intended approach at product + system level — not a mandated file tree |
| **Goal** | What “done” roughly looks like |
| **Context** | Hooks into current product surfaces |
| **Requirements / Non-goals** | Scope fences |
| **Acceptance criteria** | Definition of done for review |

---

## Spec index

### Deepen what exists

| # | Spec | Focus |
|---|------|--------|
| 01 | [Grounded trip planner](./01-grounded-trip-planner.md) | Retrieve catalog places into itinerary agents |
| 02 | [Catalog-grounded state stories](./02-catalog-grounded-stories.md) | Narrations from DB history, not pure LLM memory |
| 03 | [Weather reroute brain](./03-weather-reroute-brain.md) | Bad-weather day → real indoor/nearby alternatives |
| 04 | [Conversational trip editor](./04-conversational-trip-editor.md) | Chat patches on a saved itinerary |

### On-roadmap / Part 2 style

| # | Spec | Focus |
|---|------|--------|
| 05 | [Sthanik Gyaan — Ask a Local](./05-sthanik-gyaan-ask-a-local.md) | Classic city-tip RAG |
| 06 | [Tirtha Yatra pilgrimage mode](./06-tirtha-yatra-mode.md) | Faith-travel planner + rules knowledge |
| 07 | [Potli AI packing](./07-potli-ai-packing.md) | Itinerary + weather + cultural rules → pack list |
| 08 | [Safarnama journey story](./08-safarnama-journey-story.md) | Shareable trip narrative from plan + place briefs |

### Newer rich bets

| # | Spec | Focus |
|---|------|--------|
| 09 | [On-site place companion](./09-onsite-place-companion.md) | “Explain this place” + short FAQ |
| 10 | [Itinerary contradiction critic](./10-itinerary-contradiction-critic.md) | Fact/distance/safety issue finder |
| 11 | [Multilingual cultural Q&A](./11-multilingual-cultural-qa.md) | Ask in Indian languages; answer grounded + translated |
| 12 | [Trust / tourist-trap ranking](./12-trust-tourist-trap-ranking.md) | Signals that change recommendation weight |
| 13 | [Festival & event overlay](./13-festival-event-overlay.md) | Align trip days with festivals on dates |
| 14 | [Photo → place → context](./14-photo-place-context.md) | Vision ID + retrieved place context |
| 15 | [Offline city brain pack](./15-offline-city-brain-pack.md) | Downloadable per-city knowledge for weak networks |
