---
last_updated: 2026-04-26
total_pages: 24
total_sources: 3
---

# Wiki Index

_This file is maintained by the LLM. Updated after every ingest, query filing, or lint pass._

## Entities

- [Wehrung's](entities/wehrungs.md) — First pilot supplier partner; building material dealer using Epicor; active sales opportunity as of April 2026
- [Epicor](entities/epicor.md) — ERP system used by Wehrung's; Deckmetry integration target via 4-phase strategy
- [RDI Finyl Line](entities/rdi-finyl-line.md) — Vinyl railing brand (white + black round balusters); named contractor preference in Wehrung's pilot context
- [Deckmetry BOM Engine](entities/deckmetry-bom-engine.md) — Core calculation module producing categorized BOM from wizard input
- [Trex](entities/trex.md) — Market-leading composite decking brand, 5 collections, 23 colors
- [TimberTech](entities/timbertech.md) — Premium composite brand (AZEK), 3 collections, 12 colors
- [Deckorators](entities/deckorators.md) — Value-to-mid composite brand, 3 collections, 12 colors

## Concepts

- [Supplier-Embedded Portal](concepts/supplier-embedded-portal.md) — Deckmetry's go-to-market architecture: platform lives on supplier website, supplier controls catalog/contractors/pricing
- [Pilot Validation Framework](concepts/pilot-validation-framework.md) — 60–90 day paid validation with Wehrung's; 4-phase structure; success metrics defined
- [B2B2C Lead Funnel](concepts/b2b2c-lead-funnel.md) — Homeowner demand → BOM/lead → contractor assignment → supplier material order
- [Phased ERP Integration](concepts/phased-erp-integration.md) — 4-phase Epicor integration strategy; Phase 1 = no integration (CSV exports); Phase 4 = full quote/order sync
- [Contractor Discount Model](concepts/contractor-discount-model.md) — Single % discount per contractor against catalog base price; full price snapshot frozen on every order
- [BOM Generation](concepts/bom-generation.md) — How deck dimensions + material selections become a purchasable material list; includes railing section logic
- [Prescriptive Span Tables](concepts/prescriptive-span-tables.md) — IRC-based lookup tables for joist and beam sizing
- [Deck Structural Engineering](concepts/deck-structural-engineering.md) — Load path design: footings → posts → beams → joists → deck surface
- [Guard Railing Requirements](concepts/guard-railing-requirements.md) — IRC R312.1: guards required when deck > 30" above grade
- [Breaker Board Layout](concepts/breaker-board-layout.md) — Zoning wide decks (>20') with perpendicular solid boards
- [Waste Factors in Construction](concepts/waste-factors.md) — Percentage markups: framing 5%, decking 7%, fascia 10%, railing by kit count
- [Deck Foundation Design](concepts/deck-foundation-design.md) — Sonotubes, concrete, post bases, jurisdiction-dependent frost depth
- [Picture Frame Decking](concepts/picture-frame-decking.md) — Solid-edge perimeter boards as design upgrade

## Sources

- [Deckmetry Context Pack](sources/deckmetry-context-pack.md) — Ingested 2026-04-26; 13-doc strategy package covering Wehrung's opportunity, system overview, BOM logic, Epicor integration, pilot pricing
- [Deckmetry Wehrung's MVP Build Spec](sources/deckmetry-wehrungs-mvp-build-spec.md) — Ingested 2026-04-26; JSON build spec defining roles, dashboards, status pipeline, catalog, discount model, database schema, phase 1/2 build priorities
- [Deckmetry BOM Engine Source](sources/deckmetry-bom-engine-source.md) — Ingested 2026-04-10 from lib/calculations.ts, catalog.ts, types.ts, store.ts

## Analyses

_(none yet)_

## Outputs

_(none yet)_
