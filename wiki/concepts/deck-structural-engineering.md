---
type: concept
sources: [deckmetry-bom-engine-source.md]
last_updated: 2026-04-10
---

# Deck Structural Engineering

## Definition

Deck structural engineering encompasses the design of the load-bearing framework: footings, posts, beams, joists, and ledger connections. For residential decks, this is typically governed by IRC Section R507 (Exterior Decks) using prescriptive or engineered methods.

## Strategic Importance

Correct structural sizing is a legal and safety requirement. Deckmetry uses the prescriptive method (span tables) which is code-compliant for standard rectangular decks. This covers the majority of residential projects without requiring a PE stamp, which is a key enabler for the self-service wizard.

## How It Appears in the Data

### Load Path (Top Down)

```
Deck Surface (40 psf live + 10 psf dead)
    ↓
Joists (sized by span & spacing from prescriptive tables)
    ↓
Beams (3-ply built-up, sized by joist span & beam span)
    ↓
Posts (4x4 or 6x6, sized by height and load conditions)
    ↓
Footings (16" x 36" sonotubes with concrete)
    ↓
Soil (bearing capacity: 2000 psf default)
```

### Key Design Decisions in Deckmetry

| Decision | Deckmetry Approach | Code Reference |
|----------|-------------------|----------------|
| Load assumptions | 40 psf live + 10 psf dead | IRC R301.5 |
| Lumber grade | No. 2, wet service | Conservative default |
| Joist sizing | Prescriptive span table | IRC R507.5 |
| Beam type | 3-ply built-up | IRC R507.6 |
| Post size trigger | 6x6 if height>30" or guards required | IRC R407.3 |
| Max post spacing | 9' on center | Conservative practice |
| Beam inset | 1'-6" from deck edge | Standard practice |
| Footing inset | 1'-6" from width edges | Standard practice |
| Blocking | Every 6' along joist span | Standard practice |

### Attached vs. Freestanding

- **Attached:** Ledger board on house, 1 beam line, posts only under beam
- **Freestanding:** No ledger, 2 beam lines, posts under both beams, 2x sonotubes

## Deckmetry Implications

- The engine only supports single-span joists (no multi-span continuous joists)
- Beam sizing assumes joists framing from one side only — two-sided loading would require different tables
- Post height calculation accounts for decking thickness and joist depth: `supportHeight = deckHeight - deckingThickness - joistDepth`
- Warnings trigger at 24' width, 18' projection, 96" height — beyond these, manual engineering review is recommended

## Related Concepts

- [Prescriptive Span Tables](prescriptive-span-tables.md) — The specific tables used for sizing
- [Deck Foundation Design](deck-foundation-design.md) — The bottom of the load path
- [Guard Railing Requirements](guard-railing-requirements.md) — Triggers structural post upsizing
- [BOM Generation](bom-generation.md) — How structural sizes become material quantities

## Related Entities

- [Deckmetry BOM Engine](../entities/deckmetry-bom-engine.md)

## Source References

- [Deckmetry BOM Engine Source](../sources/deckmetry-bom-engine-source.md)
