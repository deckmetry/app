# Activity Log

_Append-only. Format: `## [YYYY-MM-DD] [operation] | [title]`_
_Operations: ingest | query | lint | setup_

---

## [2026-04-10] setup | Initial wiki scaffolding

- Directory structure created: raw/, raw/assets/, wiki/entities/, wiki/concepts/, wiki/sources/, wiki/analyses/, wiki/outputs/, tools/
- wiki/WIKI-CLAUDE.md written with 9 sections covering all operating instructions.
- wiki/index.md initialized.
- wiki/log.md initialized.
- tools/search.py created.
- Domain focus: deck-building SaaS, multi-user roles, building codes, competitive intelligence.
- Wiki is ready for first ingest.

## [2026-04-10] ingest | Deckmetry BOM Engine Source Code

- Summary page: wiki/sources/deckmetry-bom-engine-source.md
- New entity pages:
  - wiki/entities/deckmetry-bom-engine.md
  - wiki/entities/trex.md
  - wiki/entities/timbertech.md
  - wiki/entities/deckorators.md
- New concept pages:
  - wiki/concepts/bom-generation.md
  - wiki/concepts/prescriptive-span-tables.md
  - wiki/concepts/deck-structural-engineering.md
  - wiki/concepts/guard-railing-requirements.md
  - wiki/concepts/breaker-board-layout.md
  - wiki/concepts/waste-factors.md
  - wiki/concepts/deck-foundation-design.md
  - wiki/concepts/picture-frame-decking.md
- Total: 1 source page, 4 entity pages, 8 concept pages (13 pages created)
- Raw source: raw/deckmetry-bom-engine-source.md (pointer to lib/calculations.ts, catalog.ts, types.ts, store.ts)
