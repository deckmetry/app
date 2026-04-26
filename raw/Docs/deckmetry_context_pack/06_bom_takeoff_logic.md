# 06 — BOM and Takeoff Logic

## Purpose

The BOM logic should convert deck inputs into a practical material list that is accurate enough for sales review and contractor ordering, while still allowing Wehrung's to verify final quantities.

## Key deck inputs

### Dimensions
- Deck width
- Deck length/projection
- Deck height
- Attached/freestanding
- Number of sides requiring railing
- Stair count or stair height
- Joist spacing: 12” O.C. default, optional 16” O.C.

### Decking
- Brand
- Collection
- Color
- Board type:
  - Grooved field boards
  - Solid boards for border/picture frame/stairs
- Board length:
  - 12 ft
  - 16 ft
  - 20 ft

### Framing inventory assumptions
Potential lumber/product lengths:
- 2x4
- 2x6
- 2x8
- 2x10
- 2x12
- 4x4 posts
- 6x6 posts
- 8 ft, 10 ft, 12 ft, 16 ft, 20 ft lengths as available
- Treated PSL beam where needed
- Joist hangers
- Post bases/caps
- Ledger board
- Flashing

### Foundation
- Concrete bags
- Sonotubes
- Post bases
- Anchors
- Optional helical piers in future

### Railing
Categories:
- Vinyl
- Composite
- Aluminum
- Cable

Rail kit assumptions:
- 6 ft level kits
- 8 ft level kits
- Stair rail kits
- Posts
- Post caps
- Post sleeves/skirts where applicable
- Typical railing height such as 39” depending on product

Known user preference/reference:
- RDI Finyl Line white with black round balusters for some deck projects.
- ADA aluminum handrails can be referenced as a graspable rail option mounted to deck railing.

## Deck board calculation logic

If boards run across the width of the deck, board count is based on deck projection/length divided by board coverage.

Example from known project:
- Deck dimensions: 20 ft wide x 16 ft long.
- Deck boards run the 20 ft width.
- Decking board nominal width: 5.5 inches.
- Board count is based on 16 ft length divided by 5.5 inch board width.
- Add waste factor.

Formula concept:
- Convert deck projection to inches.
- Divide by board coverage.
- Round up.
- Add waste factor.
- Select board length based on deck width and available product lengths.

## Railing section logic

Known preference:
- Efficiently divide railing into equal lengths using only 6 ft and 8 ft sections when possible.

Example:
- 20 ft wide deck with no stairs and wall on the back.
- Railing installed on front and sides only.
- Front uses three 6 ft sections.
- Each side uses two 8 ft sections.

Logic requirements:
- Determine open sides requiring railing.
- Subtract stair openings if applicable.
- Divide each run into practical 6 ft and 8 ft kit combinations.
- Prefer balanced/equal visual layout.
- Avoid tiny leftover sections when possible.
- Allow admin/contractor manual adjustment.

## Framing logic

MVP framing logic can use standard estimating assumptions:
- Joists based on spacing and deck width/length.
- Beam length based on deck width or structural layout.
- Posts based on beam span assumptions.
- Ledger if attached to home.
- Rim joists and blocking.
- Hardware based on counts.

Important:
The system should not claim engineering approval. It should produce material estimating assumptions only.

Suggested disclaimer:
> Framing quantities are generated from standard estimating assumptions and must be reviewed for code, span, load, and site-specific conditions.

## Waste factors

Suggested defaults:
- Decking: 5–10%
- Fascia: 5–10%
- Framing lumber: 5%
- Fasteners: rounded to package quantities
- Railing: based on kit count, not percentage
- Concrete: rounded up by post count/depth assumption

## Package rounding

The system should round products to sellable units:
- Boards rounded to whole boards.
- Railing kits rounded to whole kits.
- Fasteners rounded to full boxes/buckets.
- Concrete bags rounded to whole bags.
- Hidden fasteners rounded to box coverage.
- Fascia rounded to full boards.

## BOM categories

Recommended BOM output sections:

1. Decking
2. Fascia/trim
3. Framing lumber
4. Beams/posts
5. Hardware/connectors
6. Foundation/concrete
7. Railing
8. Stairs
9. Fasteners
10. Lighting/options
11. Delivery/notes
12. Items requiring review

## Manual override

The admin and possibly contractor should be able to adjust:
- Quantity
- SKU
- Product substitution
- Waste factor
- Notes
- Price override
- Availability status

## Accuracy principle

MVP should optimize for:
- Repeatable assumptions.
- Sales-reviewable output.
- Speed.
- Clear disclaimers.
- Easy editing.

It should not attempt to handle every custom deck condition in the first pilot.
