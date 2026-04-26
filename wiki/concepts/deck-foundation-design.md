---
type: concept
sources: [deckmetry-bom-engine-source.md]
last_updated: 2026-04-10
---

# Deck Foundation Design

## Definition

Deck foundations transfer the deck's load to the ground through a system of footings (concrete piers), post bases, and support posts. The IRC requires footings to extend below the frost line and bear on soil with adequate capacity. Foundation design determines the number, size, and depth of piers.

## Strategic Importance

Foundation is the first and most geographically variable part of a deck estimate. Frost depth varies from 0" (southern Florida) to 72" (northern Minnesota). Soil bearing capacity varies from 1,000 psf (loose fill) to 4,000+ psf (rock). Getting the foundation right is essential for code compliance and cost accuracy across different markets.

## How It Appears in the Data

### Deckmetry Foundation Calculation

| Parameter | Value | Notes |
|-----------|-------|-------|
| Sonotube diameter | 16" | Standard, not calculated from load |
| Sonotube depth | 36" | East Coast default frost depth |
| Soil bearing capacity | 2,000 psf | Conservative default |
| Post spacing max | 9' on center | Along beam line |
| Beam inset | 1'-6" from deck edge | Standard practice |
| Footing inset | 1'-6" from width edges | Standard practice |

### Footing Count Algorithm

**Attached deck:**
```
effectiveWidth = deckWidth - (2 x footingInset)
sections = ceil(effectiveWidth / maxPostSpacing)
postCount = sections + 1
sonotubeQty = postCount  (one beam line)
```

**Freestanding deck:**
```
sonotubeQty = postCount x 2  (two beam lines)
```

### Concrete Volume Calculation

```
tubeRadius = diameter / 2  (in feet)
volumePerFooting = π x r² x depth  (cubic feet)
totalVolume = volumePerFooting x sonotubeQty
bags80lb = ceil(totalVolume / yieldPerBag)  // yield = 0.6 cf per 80lb bag
```

### Stair Footings

- 2 landing footings per stair section (when deck height ≥ 30")
- Same diameter and depth as deck footings

### Jurisdiction Profile

The current implementation uses a single hardcoded profile:

```
East Coast Default:
  soilBearingPsf: 2000
  frostDepthIn: 36
  defaultSonotubeLengthIn: 48
  coastalMode: false
  bagYieldCf80: 0.6 cf
  bagYieldCf60: 0.45 cf
```

## Deckmetry Implications

- **Critical gap:** Foundation is hardcoded to East Coast — will produce incorrect depth/size for other regions
- The `jurisdiction_profiles` table in the database schema is designed to fix this but not yet implemented
- Future: soil bearing affects sonotube diameter (lower bearing = wider footings)
- Future: coastal mode would trigger different fastener requirements (stainless vs. galvanized)
- Footing diameter is fixed at 16" — should be calculated from tributary area and soil bearing capacity

## Related Concepts

- [Deck Structural Engineering](deck-structural-engineering.md) — Foundation is the bottom of the load path
- [BOM Generation](bom-generation.md) — Foundation items are the first BOM category
- [Prescriptive Span Tables](prescriptive-span-tables.md) — Beam/joist sizing determines post spacing

## Related Entities

- [Deckmetry BOM Engine](../entities/deckmetry-bom-engine.md) — Implements foundation calculation

## Source References

- [Deckmetry BOM Engine Source](../sources/deckmetry-bom-engine-source.md)
