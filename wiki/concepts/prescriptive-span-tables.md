---
type: concept
sources: [deckmetry-bom-engine-source.md]
last_updated: 2026-04-10
---

# Prescriptive Span Tables

## Definition

Prescriptive span tables are pre-calculated lookup tables published in building codes (primarily IRC Section R507) that tell builders what size lumber to use for a given span and spacing. They eliminate the need for structural engineering calculations on standard residential decks by providing conservative, code-compliant member sizes.

## Strategic Importance

Prescriptive tables are the foundation of automated deck estimation. They allow Deckmetry's BOM engine to size joists and beams without a licensed structural engineer, making the tool accessible to homeowners and contractors who need quick, code-compliant estimates.

The trade-off is conservatism — prescriptive tables assume worst-case conditions (No. 2 grade, wet service), which may oversize members compared to what an engineer would specify. This means slightly higher material costs but zero liability risk.

## How It Appears in the Data

### Joist Span Table (Deckmetry Implementation)

Based on conservative prescriptive profile (No. 2 PT lumber, wet service, 40 psf live + 10 psf dead load):

| Joist Size | Max Span @ 12" OC | Max Span @ 16" OC |
|------------|-------------------|-------------------|
| 2x6 | 9'-6" | 8'-4" |
| 2x8 | 12'-6" | 11'-1" |
| 2x10 | 15'-8" | 13'-7" |
| 2x12 | 18'-0" | 15'-9" |

### 3-Ply Beam Span Table (Joists from One Side)

| Joist Span Bucket | 3-2x8 | 3-2x10 | 3-2x12 |
|-------------------|-------|--------|--------|
| 6' | 9'-5" | 11'-9" | 13'-8" |
| 8' | 8'-3" | 10'-2" | 11'-10" |
| 10' | 7'-4" | 9'-1" | 10'-6" |
| 12' | 6'-8" | 8'-3" | 9'-7" |
| 14' | 6'-2" | 7'-7" | 8'-10" |
| 16' | 5'-9" | 7'-1" | 8'-3" |
| 18' | 5'-5" | 6'-8" | 7'-10" |

### Selection Algorithm

1. Engine receives `deckProjectionFt` (joist span) and `joistSpacingIn` (12 or 16)
2. Iterates joist sizes smallest to largest: 2x6 → 2x8 → 2x10 → 2x12
3. Selects first size whose max span ≥ required span
4. Falls back to 2x12 if nothing qualifies (triggers warning for manual review)
5. Beam selection uses "joist span bucket" (rounded up to nearest 2') to index the beam table

## Deckmetry Implications

- Tables are currently hardcoded in `catalog.ts` — planned migration to `jurisdiction_profiles` database table
- Only covers rectangular decks with joists spanning in one direction
- Southern Pine and Douglas Fir have different span values — current tables are conservative across species
- Future: jurisdiction-specific tables (e.g., coastal wind zones reduce allowable spans)

## Related Concepts

- [Deck Structural Engineering](deck-structural-engineering.md) — The broader engineering context
- [BOM Generation](bom-generation.md) — How span tables feed into material quantities
- [Guard Railing Requirements](guard-railing-requirements.md) — Another code-driven calculation

## Related Entities

- [Deckmetry BOM Engine](../entities/deckmetry-bom-engine.md) — Implements these tables in `selectJoistSize()` and `selectBeamSize()`

## Source References

- [Deckmetry BOM Engine Source](../sources/deckmetry-bom-engine-source.md)
- IRC R507.5 (Deck Joist Spans) — external reference, not yet ingested
