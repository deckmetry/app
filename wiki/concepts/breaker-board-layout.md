---
type: concept
sources: [deckmetry-bom-engine-source.md]
last_updated: 2026-04-10
---

# Breaker Board Layout

## Definition

A breaker board is a solid (square-edge) deck board installed perpendicular to the main field boards to visually and structurally divide a wide deck into zones. Breaker boards are necessary when the deck width exceeds the maximum available board length (typically 20'). They also serve as a design element, creating a visual break in the deck surface.

## Strategic Importance

Wide decks (>20') are common in residential construction, especially for entertaining spaces. The breaker board algorithm is critical for accurate BOM generation because it changes the entire decking calculation — instead of optimizing one long row, the engine must calculate multiple zones with different board counts plus the breaker boards themselves.

## How It Appears in the Data

### Algorithm (from Deckmetry BOM Engine)

1. **Check if needed:** `deckWidthFt > maxBoardLength` (typically 20')
2. **Try exact match first:** Can the width divide evenly into standard lengths?
   - 24' = 2 x 12' (exact)
   - 32' = 2 x 16' (exact)
   - 36' = 3 x 12' (exact)
   - 40' = 2 x 20' (exact)
3. **Fallback:** Find smallest number of zones where a standard board length covers each zone
4. **Breaker count:** `zones - 1` (e.g., 3 zones = 2 breaker boards)
5. **Breaker boards run full projection length** using solid (not grooved) boards

### Impact on BOM

- **Field boards:** quantity = `zones x boardRows x (1 + wasteFactors.decking)`
- **Breaker boards:** quantity = `ceil(projectionFt / solidBoardLength) x breakerCount x (1 + waste)`
- **Breaker boards use the picture frame color** (or main color if no picture frame)

### Example: 32' Wide Deck

```
Zone 1 (16')  |  Breaker  |  Zone 2 (16')
← 16' boards →  ← solid →  ← 16' boards →
```

- 2 zones of 16' grooved boards
- 1 breaker line of solid boards running the full projection
- Each zone has `boardRows` boards (projection / boardFaceWidth)

## Deckmetry Implications

- The algorithm assumes equal zone widths — unequal zoning (e.g., 24' = 16' + 8') is not implemented
- Breaker boards add significant cost on very wide decks (40'+) and should be flagged to contractors
- The visual impact of breaker boards should be shown in the SVG deck drawing (not yet implemented)
- Future: allow user to specify breaker board placement for aesthetic control

## Related Concepts

- [BOM Generation](bom-generation.md) — Breaker boards add items to decking category
- [Picture Frame Decking](picture-frame-decking.md) — Often paired with breaker boards for design consistency

## Related Entities

- [Deckmetry BOM Engine](../entities/deckmetry-bom-engine.md) — Implements this in the decking calculation section
- [Trex](../entities/trex.md), [TimberTech](../entities/timbertech.md), [Deckorators](../entities/deckorators.md) — All support 12'/16'/20' board lengths

## Source References

- [Deckmetry BOM Engine Source](../sources/deckmetry-bom-engine-source.md)
