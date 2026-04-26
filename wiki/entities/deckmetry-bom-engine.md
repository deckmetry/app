---
type: entity
category: product
role: product
aliases: [BOM Engine, Calculation Engine, calculateEstimate]
sources: [deckmetry-bom-engine-source.md]
last_updated: 2026-04-10
---

# Deckmetry BOM Engine

## Overview

The BOM engine is the core computational module of the Deckmetry platform. Located at `lib/calculations.ts`, it takes a structured `EstimateInput` from the 6-step wizard and produces a complete `EstimateOutput` containing a categorized Bill of Materials, derived structural values, assumptions, and warnings.

The engine is **isomorphic** — it runs identically on client (browser, for real-time preview) and server (for authoritative persistence). It has no external dependencies beyond the hardcoded product catalog.

## Key Facts

- **Entry point:** `calculateEstimate(input: EstimateInput): EstimateOutput`
- **Size:** ~1,100 lines of TypeScript
- **Dependencies:** `catalog.ts` (product data), `types.ts` (type definitions)
- **BOM categories:** foundation, framing, decking, fascia, fasteners, railing, add-ons
- **Output:** `assumptions[]`, `warnings[]`, `bom: BomItem[]`, `derived: DerivedValues`
- **Supports:** Single-level rectangular decks (attached or freestanding)
- **Does NOT support:** Multi-level, angled, curved, or irregular shapes

### Calculation Pipeline

1. **Structural sizing** — Joist size by span/spacing → beam size by joist span bucket → post size by height/type
2. **Foundation** — Sonotube count, concrete volume, post bases
3. **Decking** — Board rows, breaker board zones, length optimization, picture frame
4. **Fasteners** — Hidden fastener buckets, screw/plug kits
5. **Fascia** — 1x12 for perimeter, 1x8 for stair risers
6. **Stairs** — Stringer count, tread/riser counts, diagonal calculations
7. **Railing** — Guard requirement check, section optimization, post count with corner sharing
8. **Lighting** — Post cap, stair, accent light quantities and transformer sizing
9. **BOM assembly** — All items collected into categorized `BomItem[]`

### Key Constants & Thresholds

| Parameter | Value | Source |
|-----------|-------|--------|
| Guard height trigger | 30" | IRC R312.1 |
| Max post spacing | 9' OC | Conservative prescriptive |
| Beam inset from edge | 1'-6" | Standard practice |
| Standard footing | 16" x 36" | East Coast default |
| Max width before warning | 24' | Engineering review threshold |
| Max projection before warning | 18' | Engineering review threshold |
| Fastener rate | 1 bucket / 500 sf | Camo specification |
| Tread depth | 10" | IRC R311.7.5.2 |

## Strategic Relevance

The BOM engine is Deckmetry's core intellectual property. Its accuracy directly determines contractor trust and adoption. Currently limited to rectangular single-level decks, which covers ~60-70% of residential projects. Expanding to multi-level and L-shaped decks is the highest-impact product gap.

The isomorphic architecture (client+server) is a significant advantage — contractors see real-time BOM updates as they adjust dimensions, creating a "calculator feel" that competitors with server-only engines can't match.

## Activity Log

- **2026-04-10** — Initial wiki page created from source code analysis. Engine confirmed functional for rectangular decks with full material takeoff.

## Related Entities

- [Trex](trex.md) — Primary brand in catalog
- [TimberTech](timbertech.md) — Secondary brand in catalog
- [Deckorators](deckorators.md) — Tertiary brand in catalog

## Related Concepts

- [BOM Generation](../concepts/bom-generation.md)
- [Prescriptive Span Tables](../concepts/prescriptive-span-tables.md)
- [Deck Structural Engineering](../concepts/deck-structural-engineering.md)
- [Breaker Board Layout](../concepts/breaker-board-layout.md)
- [Guard Railing Requirements](../concepts/guard-railing-requirements.md)
- [Waste Factors in Construction](../concepts/waste-factors.md)
- [Deck Foundation Design](../concepts/deck-foundation-design.md)
- [Picture Frame Decking](../concepts/picture-frame-decking.md)

## Source References

- [Deckmetry BOM Engine Source](../sources/deckmetry-bom-engine-source.md)
