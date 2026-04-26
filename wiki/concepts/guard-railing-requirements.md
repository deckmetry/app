---
type: concept
sources: [deckmetry-bom-engine-source.md]
last_updated: 2026-04-10
---

# Guard Railing Requirements

## Definition

Guards (also called guardrails) are required safety barriers on elevated decks and stairs. The IRC mandates guards on any walking surface more than 30 inches above grade. This is the single most impactful code requirement in deck design because it adds significant material cost (posts, sections, hardware) and affects structural post sizing.

## Strategic Importance

The 30-inch rule is the most common trigger for material cost increases in residential decks. A 28" deck needs zero railing; a 32" deck may need $2,000-$5,000+ in railing materials. Deckmetry must calculate this accurately because it directly impacts the contractor's quote and homeowner's budget expectations.

## How It Appears in the Data

### IRC Requirements Implemented

| Requirement | Value | Code Section |
|-------------|-------|-------------|
| Guard trigger height | 30" above grade | IRC R312.1 |
| Minimum guard height | 36" (residential) | IRC R312.1.1 |
| Baluster spacing max | 4" (sphere test) | IRC R312.1.3 |
| Stair guard trigger | 30" above grade at any point | IRC R312.1 |
| Stair guard height | 34" min (measured from stair nosing) | IRC R312.1.2 |
| Level post height | 39" (catalog standard) | Manufacturer spec |
| Stair post height | 45" (catalog standard) | Manufacturer spec |

### Railing Section Optimization

Deckmetry optimizes railing section layout to minimize total sections (and therefore posts):

1. Measure each open side's linear footage
2. Subtract stair openings from the side where stairs are located
3. For each run, try combinations of 8' and 6' sections
4. Prefer fewer total sections (8' over 6')
5. Corner posts are shared between adjacent sides

**Example:** A 16' front run = 2 x 8' sections (3 posts). Not 3 x 6' sections (4 posts).

### Post Count Algorithm

```
Corner posts = count of adjacent open-side pairs (max 4)
Interior posts per side = (sections on that side + 1) - corners on that side
Total level posts = corner posts + all interior posts
Stair posts = 4 per stair section (2 at deck, 2 at bottom)
```

### Railing Materials in Catalog

| Material | Colors | Section Lengths |
|----------|--------|----------------|
| Vinyl | White, Clay, Khaki | 6', 8' |
| Composite | White, Black, Brown | 6', 8' |
| Aluminum | Black, Bronze, White | 6', 8' |
| Cable | Black, Silver | 6', 8' |

## Deckmetry Implications

- User can override the guard requirement via `railingRequiredOverride` (e.g., for deck-to-grade situations)
- Stair railing only calculated when deck height ≥ 30"
- Railing waste factor is only 3% (lowest category) because sections are pre-cut
- Hardware packs calculated at 1 per 2 sections

## Related Concepts

- [Deck Structural Engineering](deck-structural-engineering.md) — Guards trigger 6x6 post upgrade
- [BOM Generation](bom-generation.md) — Railing is a major BOM category
- [Waste Factors in Construction](waste-factors.md) — Railing has the lowest waste factor

## Related Entities

- [Deckmetry BOM Engine](../entities/deckmetry-bom-engine.md) — Implements guard logic in `chooseRailSectionsForRun()`

## Source References

- [Deckmetry BOM Engine Source](../sources/deckmetry-bom-engine-source.md)
