# LLM Wiki — Operating Instructions

> **Domain:** Deckmetry business intelligence — deck-building SaaS, multi-user roles (homeowner/contractor/supplier), building codes, competitive landscape, and supply chain intelligence.

---

## 1. Project Overview

This is a **persistent, compounding knowledge base** for business and competitive intelligence, following the Karpathy LLM Wiki pattern.

- **`raw/`** contains immutable source documents. Never edit them.
- **`wiki/`** is the structured wiki. The LLM writes and maintains everything here.
- The human curates sources and asks questions. The LLM does all writing, cross-referencing, and maintenance.

### Domain Focus

This wiki tracks intelligence relevant to Deckmetry's three personas and competitive position:

- **Deck-building industry** — materials, brands (Trex, TimberTech, Deckorators), supply chain dynamics
- **Building codes & regulations** — IRC residential deck codes, jurisdictional requirements, permit processes, load calculations, frost depth requirements
- **SaaS competitive landscape** — deck estimator tools, contractor management platforms, supplier portals
- **Multi-user role patterns** — homeowner self-service, contractor workflows, supplier order management, B2B2C marketplace dynamics
- **Technology & integrations** — BOM engines, PDF generation, payment processing, realtime collaboration

---

## 2. Directory Conventions

| Directory | Contents | Filename Convention |
|-----------|----------|-------------------|
| `wiki/entities/` | One page per named entity: company, person, product, market, regulatory body, building code | `slug-name.md` |
| `wiki/concepts/` | One page per strategic concept, framework, or recurring theme | `concept-name.md` |
| `wiki/sources/` | One summary page per ingested raw document | Mirrors the raw filename |
| `wiki/analyses/` | Outputs of queries filed back into the wiki (comparisons, syntheses, strategic memos) | `analysis-topic-YYYY-MM-DD.md` |
| `wiki/outputs/` | Generated Marp slide decks and matplotlib chart images | `slides-topic-date.md` or `chart-topic-date.png` |
| `raw/assets/` | Locally downloaded images referenced by raw source files | Original filenames |

### Domain-Specific Entity Categories

Beyond standard categories, this wiki uses these entity subtypes:

- **`category: building-code`** — IRC sections, ASCE standards, jurisdictional amendments
- **`category: material`** — composite decking, pressure-treated lumber, fasteners, railing systems
- **`category: brand`** — Trex, TimberTech, Deckorators, Fortress, and competitors
- **`category: tool`** — competing SaaS platforms, estimator tools, contractor management software
- **`category: jurisdiction`** — states/provinces/counties with specific deck building requirements

---

## 3. Page Format Standards

### Entity Pages

```markdown
---
type: entity
category: [company | person | product | market | regulator | building-code | material | brand | tool | jurisdiction]
role: [competitor | customer | partner | regulator | investor | supplier | market]
aliases: []
sources: []
last_updated: YYYY-MM-DD
---

# Entity Name

## Overview

## Key Facts

## Strategic Relevance

## Activity Log (chronological notes)

## Related Entities

## Related Concepts

## Source References
```

### Concept Pages

```markdown
---
type: concept
sources: []
last_updated: YYYY-MM-DD
---

# Concept Name

## Definition

## Strategic Importance

## How It Appears in the Data

## Deckmetry Implications

## Related Concepts

## Related Entities

## Source References
```

### Source Summary Pages

```markdown
---
type: source
original_file: raw/filename.md
date_ingested: YYYY-MM-DD
source_type: [article | paper | report | transcript | dataset | image | code-standard | regulation]
entities_mentioned: []
concepts_mentioned: []
---

# [Title of Source]

## Summary

## Key Takeaways

## Notable Data Points or Quotes

## Competitive Signals

## What This Changes or Confirms in the Wiki

## Links to Updated Wiki Pages
```

### Analysis Pages

```markdown
---
type: analysis
query_date: YYYY-MM-DD
related_entities: []
related_concepts: []
---

# [Analysis Title]

## Question Asked

## Methodology

## Findings

## Caveats

## Further Questions Raised
```

---

## 4. Workflow: Ingest

When the human says "ingest [filename]" or drops a new file in `raw/`:

1. Read the source document fully.
2. Briefly discuss key takeaways with the human before writing anything.
3. Create a summary page in `wiki/sources/`.
4. For each entity mentioned: update or create its page in `wiki/entities/`. Add the source to its `sources:` frontmatter list.
5. For each concept mentioned: update or create its page in `wiki/concepts/`. Maintain cross-references.
6. Update `wiki/index.md` — add entries for every new or significantly updated page.
7. Append an entry to `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | [Source title]
   - Summary page: wiki/sources/filename.md
   - New pages: [list]
   - Updated pages: [list]
   ```
8. If the source contains images, note them and tell the human to run the Obsidian "Download attachments" hotkey to save them to `raw/assets/`.

A single source will typically touch 8-15 wiki pages. That is expected.

### Domain-Specific Ingest Rules

- **Building code documents**: Extract specific section numbers (e.g., IRC R507), load requirements, span tables, fastener schedules. Create entity pages for each major code section.
- **Product catalogs/spec sheets**: Extract SKUs, dimensions, warranty terms, price points, installation requirements. Link to brand entity pages.
- **Competitor analysis**: Tag with `role: competitor` and extract pricing, features, target personas, and market positioning.
- **Jurisdiction-specific regulations**: Create jurisdiction entity pages with frost depth, soil bearing capacity, permit requirements, and inspection processes.

---

## 5. Workflow: Query

When the human asks a question against the wiki:

1. Read `wiki/index.md` to identify relevant pages.
2. Read those pages fully before answering.
3. Synthesize an answer with citations to specific wiki pages.
4. Choose the right output format:
   - **Factual/analytical question** -> markdown answer + offer to file as an analysis page.
   - **Comparison or structured overview** -> markdown table or structured page in `wiki/analyses/`.
   - **Presentation request** -> Marp slide deck saved to `wiki/outputs/slides-[topic]-[date].md`.
   - **Data visualization request** -> matplotlib Python script, execute it, save the `.png` to `wiki/outputs/chart-[topic]-[date].png`.
5. Ask the human if the output should be filed back into the wiki. If yes, save it to `wiki/analyses/` and update `wiki/index.md` and `wiki/log.md`.

---

## 6. Workflow: Lint

When the human asks for a "lint" or "health check":

Run these checks across all wiki pages:

1. **Contradictions** — flag pages that make conflicting claims about the same entity or fact.
2. **Stale data** — identify claims that newer sources have superseded.
3. **Orphan pages** — find pages with no inbound links from other wiki pages.
4. **Missing pages** — identify entities or concepts frequently mentioned but lacking their own page.
5. **Broken cross-references** — find links that point to non-existent pages.
6. **Data gaps** — identify key attributes that are blank or unknown and could be filled with a web search.
7. **Code version drift** — flag building code references that may have been superseded by newer code cycles.

Produce a lint report as `wiki/analyses/lint-report-[date].md` and append to `wiki/log.md`.

---

## 7. Cross-Referencing Rules

- Every entity page must link to all concepts it exemplifies.
- Every concept page must link to the top entities that illustrate it.
- Every source summary page must link to all entity and concept pages it informed.
- When updating a page, scan all pages that reference this entity/concept and update their summaries if the new information changes the picture significantly.
- Use relative markdown links: `[Company Name](../entities/company-name.md)`.

---

## 8. Business & Domain Intelligence Conventions

### General BI Rules
- Always include a **"Strategic Relevance"** section on entity pages — one paragraph on why this entity matters to Deckmetry competitively.
- Tag entities with competitive roles: `role: [competitor | customer | partner | regulator | investor | supplier | market]`.
- For **market pages**, maintain a structured competitive landscape section listing key players, positioning, and estimated share/strength.
- When ingesting **financial reports or analyst reports**, extract: revenue figures, growth rates, margin trends, forward guidance, and management signals.
- When ingesting **news articles**, tag the event type: `event_type: [funding | acquisition | product_launch | executive_change | regulatory | partnership | other]`.
- Flag any **competitive threat signals** explicitly in source summary pages under `## Competitive Signals`.

### Deck-Building Domain Rules
- **Building codes** must reference the specific IRC/IBC edition year and section numbers.
- **Material specs** must include: dimensions, weight per unit, warranty length, price range, and installation method.
- **Jurisdiction profiles** must include: frost depth, soil bearing capacity, snow load, wind speed zone, and permit requirements.
- **Competitor tools** must be evaluated against Deckmetry's three personas: what do they offer homeowners, contractors, and suppliers?

### Multi-User Role Intelligence
- Track how competitors handle **role-based access and workflows** — who can see what, approval chains, collaboration patterns.
- Document **pricing models** across the industry: per-project, subscription, transaction fees, freemium tiers.
- Note **integration patterns**: what tools connect to what (e.g., estimator -> ordering -> delivery tracking).

---

## 9. Index and Log Maintenance Rules

- `wiki/index.md` must be updated after every ingest, query filing, or lint pass — never let it go stale.
- `wiki/log.md` is append-only — never delete or edit past entries.
- Log entry prefixes must follow the pattern `## [YYYY-MM-DD] [operation] | [title]` so they are grep-parseable.

---

## Constraints (Always Enforce)

- **Never edit files in `raw/`.** They are the immutable source of truth.
- **Never summarize the wiki from memory.** Always read `wiki/index.md` before answering queries.
- **Always update `wiki/index.md` and `wiki/log.md`** after any write operation.
- **All wiki files use relative links** — never absolute paths.
- **Marp slides** must begin with `---\nmarp: true\n---` and use consistent styling across decks.
- **Matplotlib charts** must be saved as `.png` to `wiki/outputs/` and the generating `.py` script saved alongside as `chart-[topic]-[date].py` for reproducibility.
- When in doubt about a cross-reference, add it — over-linking is better than orphan pages.
