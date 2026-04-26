---
type: concept
sources: [deckmetry-bom-engine-source.md]
last_updated: 2026-04-10
---

# Picture Frame Decking

## Definition

Picture framing is a design technique where solid-edge (square-edge) deck boards are installed around the perimeter of the deck surface, creating a "frame" around the grooved field boards. The perimeter boards run perpendicular to the field boards, producing a finished visual border. Picture frame boards can be the same color as the field or a contrasting color for design accent.

## Strategic Importance

Picture framing is one of the most popular upgrades in residential decking — it differentiates a basic deck from a custom-looking installation. For contractors, it's a high-margin upsell because the material cost is relatively low (perimeter boards only) but the perceived value is high. Supporting picture frame in the BOM engine means Deckmetry can accurately quote this upgrade.

## How It Appears in the Data

### Perimeter Calculation

Picture frame covers 3 sides on an attached deck (front + left + right), not the house side:

```
perimeterLf = deckWidthFt + (2 x deckProjectionFt)
```

### Materials Required

- **Solid boards:** `ceil(perimeterLf / solidBoardLength) + 4` spare boards, with 7% waste
- **Screws:** 1 box per 50 LF of perimeter (face-screwed, not hidden fastened)
- **Plugs:** Same count as screw boxes (color-matched plugs cover screw heads)

### Color Options

- `pictureFrameColor` can differ from `deckingColor` — enabling two-tone designs
- Color-match screws and plugs must match the picture frame color, not the field color

### Interaction with Breaker Boards

When a deck has both picture frame and breaker boards, the breaker boards default to the picture frame color for visual consistency. This is an intentional design decision in the engine.

## Deckmetry Implications

- Picture frame is enabled by default in the wizard (`pictureFrameEnabled: true`)
- The SVG deck drawing should show picture frame boards as a different layer/color
- Fastener type changes: picture frame uses face screws + plugs, while field uses hidden fasteners
- Future: picture frame on all 4 sides for freestanding decks
- Future: diagonal picture frame for premium designs

## Related Concepts

- [BOM Generation](bom-generation.md) — Picture frame adds to decking and fasteners categories
- [Breaker Board Layout](breaker-board-layout.md) — Breaker boards use picture frame color
- [Waste Factors in Construction](waste-factors.md) — 7% waste applied to picture frame boards

## Related Entities

- [Deckmetry BOM Engine](../entities/deckmetry-bom-engine.md)
- [Trex](../entities/trex.md) — Offers both grooved and solid boards in all collections

## Source References

- [Deckmetry BOM Engine Source](../sources/deckmetry-bom-engine-source.md)
