---
type: concept
sources: [deckmetry-bom-engine-source.md, deckmetry-context-pack.md]
last_updated: 2026-04-26
---

# Waste Factors in Construction Estimation

## Definition

Waste factors are percentage markups applied to raw material counts to account for cuts, breakage, defects, and installation losses. In deck construction, different material categories have different waste rates based on how the material is installed and how much cutting is required.

## Strategic Importance

Waste factors directly impact the accuracy and competitiveness of estimates. Too low = the contractor runs short on materials (costly site delays, extra delivery charges). Too high = the bid is inflated and less competitive. Industry-standard factors balance these risks.

## How It Appears in the Data

### Deckmetry Waste Factors

| Category | Waste Factor | Rationale |
|----------|-------------|-----------|
| Framing | 5% | Large pieces, minimal cuts. Applied to joist count and blocking |
| Decking | 7% | More cutting at edges, around obstacles. Applied to all board types |
| Fascia | 10% | Highest waste — miter cuts at corners, irregular stair angles, visible grade selection |
| Railing | 3% | Lowest waste — pre-manufactured sections with minimal field cutting |

### How Factors Are Applied

The engine applies waste factors by multiplying raw counts:
```
finalQuantity = Math.ceil(rawCount * (1 + wasteFactor))
```

This is applied per line item, not per category total, so rounding errors compound slightly in favor of having enough material (conservative).

### Industry Comparison

These values align with standard construction estimation guides:
- AWC (American Wood Council) recommends 5-10% for framing
- DCA 6 (Prescriptive Residential Wood Deck Construction Guide) uses similar ranges
- Composite decking manufacturers typically recommend 10% waste for complex shapes, 5-7% for rectangles

## Deckmetry Implications

- Waste factors are currently hardcoded in `catalog.ts` — should be configurable per jurisdiction or project type
- Contractor overrides (the `editable` flag on BOM items) effectively allow manual waste adjustment
- Future: shape-based waste factors (rectangular = 7%, L-shaped = 12%, angled = 15%)
- Future: track actual vs. estimated waste per project to refine factors over time

## Related Concepts

- [BOM Generation](bom-generation.md) — Waste factors are applied during BOM assembly
- [Prescriptive Span Tables](prescriptive-span-tables.md) — Span tables don't include waste; it's added separately

## Related Entities

- [Deckmetry BOM Engine](../entities/deckmetry-bom-engine.md) — Implements waste factors via `wasteFactors` constant

## Source References

- [Deckmetry BOM Engine Source](../sources/deckmetry-bom-engine-source.md)
- [Deckmetry Context Pack](../sources/deckmetry-context-pack.md) — confirms decking 5–10%, fascia 5–10%, framing 5%; railing calculated by kit count not percentage
