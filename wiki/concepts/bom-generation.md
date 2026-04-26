---
type: concept
sources: [deckmetry-bom-engine-source.md, deckmetry-context-pack.md, deckmetry-wehrungs-mvp-build-spec.md]
last_updated: 2026-04-26
---

# BOM Generation (Bill of Materials)

## Definition

A Bill of Materials (BOM) is a comprehensive, itemized list of all materials required to build a deck. In Deckmetry, the BOM is the primary output of the estimation wizard — it translates deck dimensions, material selections, and feature choices into a purchasable list of components with quantities, sizes, and units.

## Strategic Importance

The BOM is the atomic unit of value in Deckmetry's pipeline. It flows through every persona's workflow:
- **Homeowner** sees it as the estimate summary
- **Contractor** uses it to build quotes and proposals with markups
- **Supplier** receives it as a purchase order line item list

Accuracy of the BOM directly determines trust. An inaccurate BOM that under-counts materials costs the contractor money; one that over-counts loses the bid. Industry-standard waste factors mitigate this risk.

## How It Appears in the Data

In Deckmetry, the BOM is structured as an array of `BomItem` objects, each with:
- `category` — one of: foundation, framing, decking, fascia, fasteners, railing, add-ons
- `description` — human-readable item name (e.g., "Honey Grove Grooved Deck Board")
- `size` — dimensional specification (e.g., "2x10 x 14'", "1x12x12")
- `quantity` — integer count
- `unit` — ea, bags, bucket, box, pack
- `editable` — all items are user-editable for contractor overrides

### BOM Categories and What They Cover

| Category | Items | Sizing Logic |
|----------|-------|-------------|
| Foundation | Sonotubes, concrete bags, post bases, stair landing footings | Volume calculation, post spacing |
| Framing | Ledger, joists, beams, rim boards, posts, blocking, joist hangers, stringers | [Prescriptive span tables](prescriptive-span-tables.md), stock length optimization |
| Decking | Grooved boards, solid boards (picture frame, breaker, stair treads) | Board row count, [breaker board logic](breaker-board-layout.md), waste factor |
| Fascia | 1x12 (perimeter + stair sides), 1x8 (stair risers) | Linear footage with 10% waste |
| Fasteners | Camo hidden fastener buckets, screw/plug kits | Area-based (500sf/bucket) and linear/step-based |
| Railing | Level/stair sections (6'/8'), level/stair posts, hardware packs | [Guard requirements](guard-railing-requirements.md), section optimization |
| Add-ons | Lattice/horizontal skirt, post cap/stair/accent lights, transformer | Perimeter-based for skirts, count-based for lights |

### Railing Section Logic

The context pack specifies a preferred railing kit layout algorithm:
- Use **6 ft and 8 ft level rail kits** in combination to cover each open railing run
- Prefer **equal/balanced visual layout** — avoid tiny leftover sections at the end of a run
- Subtract stair openings from railing run length before calculating kits
- Allow contractor/admin manual adjustment after auto-calculation

Example (20 ft wide deck, railing on front + two sides, no stairs, wall at back):
- Front: three 6 ft sections (18 ft covered, or mix adjusted to span)
- Each side: two 8 ft sections

This logic applies to brands like [RDI Finyl Line](../entities/rdi-finyl-line.md) where kits are sold in 6 ft and 8 ft lengths.

## Deckmetry Implications

- BOM items are stored as `estimate_line_items` in the database (normalized, not JSON blob)
- The `editable` flag allows contractors to override any quantity before quoting
- Future: BOM should include SKU-level pricing from supplier catalogs for automated quoting

## Related Concepts

- [Prescriptive Span Tables](prescriptive-span-tables.md) — How structural sizes are determined
- [Waste Factors in Construction](waste-factors.md) — Markup percentages applied to raw counts
- [Deck Structural Engineering](deck-structural-engineering.md) — The engineering basis for sizing
- [Breaker Board Layout](breaker-board-layout.md) — How wide decks are zoned

## Related Entities

- [Deckmetry BOM Engine](../entities/deckmetry-bom-engine.md) — The engine that generates BOMs
- [Trex](../entities/trex.md), [TimberTech](../entities/timbertech.md), [Deckorators](../entities/deckorators.md) — Brands whose products appear in BOMs

## Source References

- [Deckmetry BOM Engine Source](../sources/deckmetry-bom-engine-source.md)
- [Deckmetry Context Pack](../sources/deckmetry-context-pack.md)
- [Deckmetry Wehrung's MVP Build Spec](../sources/deckmetry-wehrungs-mvp-build-spec.md)
