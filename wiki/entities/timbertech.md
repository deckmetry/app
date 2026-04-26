---
type: entity
category: brand
role: supplier
aliases: [TimberTech Decking, AZEK TimberTech]
sources: [deckmetry-bom-engine-source.md]
last_updated: 2026-04-10
---

# TimberTech

## Overview

TimberTech is a premium composite decking brand owned by The AZEK Company. In Deckmetry's catalog, TimberTech is the second brand with 3 collections spanning value to premium tiers.

## Key Facts

- **Collections in Deckmetry catalog (3):**
  - **Prime+** — 5.36" x 0.94", 3 colors (Coconut Husk, Sea Salt Gray, Dark Cocoa)
  - **Terrain+** — 5.36" x 0.94", 5 colors (Sandy Birch, Stone Ash, Silver Maple, Brown Oak, Rustic Elm)
  - **Landmark** — 5.5" x 1.0", 4 colors (Boardwalk, French White Oak, Castle Gate, American Walnut)
- **Total colors:** 12
- **Board lengths:** 12', 16', 20' (grooved); 20' (solid)
- **Fascia options:** 1x12x12 only (no 1x8x12 unlike Trex)
- **Board width note:** Prime+ and Terrain+ use 5.36" face width (narrower than standard 5.5")

## Strategic Relevance

TimberTech's narrower board width (5.36" vs 5.5") on value lines means slightly more boards per row and a different board count calculation. The Deckmetry engine handles this through the `boardFaceWidthIn` property per collection. TimberTech's Landmark collection competes directly with Trex Signature at the premium tier.

## Activity Log

- **2026-04-10** — Entity created from catalog.ts analysis. 3 collections, 12 colors cataloged.

## Related Entities

- [Trex](trex.md) — Primary competitor
- [Deckorators](deckorators.md) — Competitor
- [Deckmetry BOM Engine](deckmetry-bom-engine.md) — Engine that consumes this catalog data

## Related Concepts

- [BOM Generation](../concepts/bom-generation.md)

## Source References

- [Deckmetry BOM Engine Source](../sources/deckmetry-bom-engine-source.md)
