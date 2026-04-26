---
type: source
original_file: raw/deckmetry-bom-engine-source.md
date_ingested: 2026-04-10
source_type: code-standard
entities_mentioned: [Deckmetry BOM Engine, Trex, TimberTech, Deckorators]
concepts_mentioned: [BOM Generation, Prescriptive Span Tables, Deck Structural Engineering, Breaker Board Layout, Guard Railing Requirements, Waste Factors, Deck Foundation Design, Picture Frame Decking]
---

# Deckmetry BOM Engine — Source Code Ingestion

## Summary

The Deckmetry BOM engine is a ~1,100-line TypeScript calculation module (`lib/calculations.ts`) that takes a 6-step wizard input and produces a complete Bill of Materials for residential deck construction. It references a hardcoded product catalog (`lib/catalog.ts`) covering 3 composite decking brands, 4 railing materials, and IRC-based structural span tables.

The engine is **purely computational** — no API calls, no database queries. It runs identically on client (real-time preview) and server (authoritative saves). The single entry point is `calculateEstimate(input): EstimateOutput`.

## Key Takeaways

1. **Structural sizing follows IRC prescriptive tables** — joist sizes (2x6 to 2x12) selected by span and spacing (12" or 16" OC), beams are 3-ply built-up (3-2x8 to 3-2x12) selected by joist span bucket and beam span.
2. **Load assumptions are conservative** — 40 psf live + 10 psf dead, No. 2 grade lumber, wet service condition.
3. **30-inch height is the guard trigger** — matches IRC R312.1. When deck height > 30", guards are required on all open sides.
4. **Breaker board algorithm handles wide decks** — when deck width exceeds max board length (20'), the engine zones the deck into sections and inserts solid breaker boards between zones.
5. **Waste factors are hardcoded** — framing 5%, decking 7%, fascia 10%, railing 3%. These are industry-standard conservative values.
6. **Foundation uses standard footings** — 16" diameter x 36" depth sonotubes. Post spacing capped at 9' on center. Concrete bags calculated by cylindrical volume.
7. **Railing section optimization** — prefers fewer 8' sections over more 6' sections. Corner posts are shared between adjacent sides to avoid double-counting.
8. **Stair stringer count = width + 1** — a 4-foot-wide stair gets 5 stringers. Standard 10" tread depth assumed.
9. **Lighting is transformer-sized** — total wattage calculated from post cap (1.5W), stair (1W), and accent (2W) lights, then 1.2x safety factor applied to select transformer.
10. **Catalog supports 3 brands** — Trex (5 collections, 27 colors), TimberTech (3 collections, 12 colors), Deckorators (3 collections, 12 colors). All boards available in 12', 16', 20' grooved and 20' solid.

## Notable Data Points

- **Joist span table (12" OC):** 2x6=9.5', 2x8=12.5', 2x10=15.67', 2x12=18'
- **Joist span table (16" OC):** 2x6=8.33', 2x8=11.08', 2x10=13.58', 2x12=15.75'
- **Beam inset:** 1'-6" inside from deck projection edge
- **Footing inset:** 1'-6" inside from deck width edges
- **Max post spacing:** 9' on center
- **Max deck dimensions before warning:** 24' width, 18' projection, 96" height
- **Fastener rate:** 1 Camo bucket per 500 sf
- **Screw/plug rate:** 1 box per 50 LF of picture frame, 1 box per 5 stair steps
- **East Coast default jurisdiction:** 2000 psf soil bearing, 36" frost depth, 48" default sonotube

## Competitive Signals

- The engine assumes **composite decking only** (no pressure-treated deck boards) — positions Deckmetry in the premium/mid-tier market segment.
- **No pricing data** in the BOM — quantities only. Pricing is deferred to the contractor quote workflow.
- **Single-level rectangular only** — multi-level, angled, and curved decks are not yet supported. This is a significant gap vs. competitors like Trex Deck Designer.
- **Jurisdiction is hardcoded** to East Coast — no geographic customization yet. This limits accuracy for western/southern/coastal regions.

## What This Changes or Confirms in the Wiki

- Establishes the algorithmic foundation that all wiki pages about structural calculations, material selection, and BOM categories reference.
- Confirms that building code compliance is prescriptive (span tables), not performance-based (engineering calculations).
- Confirms waste factors align with industry standards (DCA6, AWC guidelines).

## Links to Updated Wiki Pages

- [Deckmetry BOM Engine](../entities/deckmetry-bom-engine.md)
- [Trex](../entities/trex.md)
- [TimberTech](../entities/timbertech.md)
- [Deckorators](../entities/deckorators.md)
- [BOM Generation](../concepts/bom-generation.md)
- [Prescriptive Span Tables](../concepts/prescriptive-span-tables.md)
- [Deck Structural Engineering](../concepts/deck-structural-engineering.md)
- [Breaker Board Layout](../concepts/breaker-board-layout.md)
- [Guard Railing Requirements](../concepts/guard-railing-requirements.md)
- [Waste Factors in Construction](../concepts/waste-factors.md)
- [Deck Foundation Design](../concepts/deck-foundation-design.md)
- [Picture Frame Decking](../concepts/picture-frame-decking.md)
