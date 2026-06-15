# Roof Estimator — Finalized Company Rules (Internal Spec)

**Status:** Internal · specification only (no implementation in this repo yet — see note at end)
**Owner:** Renan Maia
**Scope:** Roof framing/surface geometry, ChamClad ceiling panels, asphalt shingle assembly, and ventless fireplace assembly for outdoor-living structures.
**Conventions:** All lengths in feet unless noted. All calculated quantities support **manual override** with a stored `calculated` value, `override` value, and `final` value. Every line item carries: calculated qty · override · final · unit · calculation explanation · product · SKU · color/finish · notes.

---

## 1. Gable Beam Rule (FINAL — do not modify)

Gable roof total beam linear feet:

```ts
beam_total_lf = roof_width_ft + roof_length_ft * 3;
```

Shed roof:

```ts
beam_total_lf = roof_width_ft;
```

Rules:
- **No overhang allowance on beams.**
- Use the **originally entered** roof dimensions for beams — **never** the effective (overhang-expanded) dimensions.
- Allow manual override.
- **Do not** show a warning suggesting the gable beam formula needs clarification. It is intentional and final.

---

## 2. Rafter Overhangs

Company-standard defaults (configurable, override-able by the PM):

```ts
side_overhang_left_ft = 1;
side_overhang_right_ft = 1;
front_overhang_ft = 1;
rear_overhang_ft = 0;
```

Display under an expandable section titled **“Roof Overhangs.”**

### Effective roof dimensions (used for rafters, sheathing, fascia, roofing, finished ceilings — NOT beams)

```ts
effective_roof_width_ft =
  roof_width_ft + side_overhang_left_ft + side_overhang_right_ft;

effective_roof_length_ft =
  roof_length_ft + front_overhang_ft + rear_overhang_ft;
```

---

## 3. Roof Geometry

Shared pitch factor:

```ts
pitch_factor = Math.sqrt(1 + Math.pow(roof_pitch_rise / 12, 2));
```

### Shed roof
```ts
shed_rafter_run_ft = effective_roof_length_ft;
roof_diagonal_ft  = shed_rafter_run_ft * pitch_factor;
```
Rafter length includes the front overhang (and any configured rear overhang); effective width includes both side overhangs.

### Gable roof
```ts
gable_rafter_run_ft = effective_roof_width_ft / 2;
roof_diagonal_ft    = gable_rafter_run_ft * pitch_factor;
```
`roof_diagonal_ft` = one sloped rafter length, ridge → outside roof edge. Effective length includes front + rear overhang.

---

## 4. Rafter Quantities

### Shed
```ts
rafter_quantity = Math.ceil((effective_roof_width_ft * 12) / 16) + 2;
rafter_length_ft = roof_diagonal_ft;
```

### Gable
```ts
rafters_per_side = Math.ceil((effective_roof_length_ft * 12) / 16) + 2;
rafter_quantity  = rafters_per_side * 2;
rafter_length_ft = roof_diagonal_ft;
```

### Size recommendation (existing rule)
```ts
if (roof_diagonal_ft <= 10)      recommended_rafter_size = "2x8";
else if (roof_diagonal_ft < 16)  recommended_rafter_size = "2x10";
else                             recommended_rafter_size = "2x12";
```

Allow manual size / length / spacing / quantity overrides.

---

## 5. Roof Perimeter (overhang-adjusted)

### Shed
```ts
roof_perimeter_lf = roof_diagonal_ft * 2 + effective_roof_width_ft;
```

### Gable
```ts
roof_perimeter_lf = roof_diagonal_ft * 2 + effective_roof_length_ft * 2;
```

Used for: 2×6 perimeter framing · 1×8 fascia · roof-edge trim. **Not** for beams.

---

## 6. Sheathing (default company waste = +4 sheets, override-able)

### Shed
```ts
roof_surface_area_sqft = roof_diagonal_ft * effective_roof_width_ft;
sheathing_base_sheets  = Math.ceil(roof_surface_area_sqft / 32);
sheathing_quantity     = sheathing_base_sheets + 4;
```

### Gable
```ts
roof_surface_area_sqft = roof_diagonal_ft * effective_roof_length_ft * 2;
sheathing_base_sheets  = Math.ceil(roof_surface_area_sqft / 32);
sheathing_quantity     = sheathing_base_sheets + 4;
```

---

## 7. ChamClad Panel Orientation (seam-avoidance optimizer)

**Goal:** avoid seams. Auto-compare both orientations and recommend the one that (1) completes seam-free with a 16′ or 20′ panel, (2) uses the shortest stock that does so, (3) lowest reasonable waste, (4) fewest H-channels if seam-free is impossible. Stock lengths: **16′, 20′**.

```ts
// Option A — panels parallel to effective length
panel_run_length_ft = effective_roof_length_ft;  covered_dimension_ft = effective_roof_width_ft;
// Option B — panels parallel to effective width
panel_run_length_ft = effective_roof_width_ft;    covered_dimension_ft = effective_roof_length_ft;
```
For slope-following ceilings, use the appropriate **sloped** dimension instead of the horizontal one.

### Stock-length selection (per orientation)
```ts
if (panel_run_length_ft <= 16)      { recommended_panel_length_ft = 16; seam_required = false; }
else if (panel_run_length_ft <= 20) { recommended_panel_length_ft = 20; seam_required = false; }
else                                { recommended_panel_length_ft = 20; seam_required = true;  }
```
If both orientations are seam-free, recommend the **lowest-waste** one.

### H-channel rule (run > 20′)
```ts
include_h_channel  = true;
segments_per_row   = Math.ceil(panel_run_length_ft / selected_panel_length_ft);
seams_per_row      = segments_per_row - 1;
h_channel_lines    = seams_per_row;
h_channel_total_lf = h_channel_lines * covered_dimension_ft;
h_channel_quantity = Math.ceil(h_channel_total_lf / h_channel_stock_length_ft);
```

PM overrides: panel direction · stock length · panel qty · H-channel inclusion · H-channel qty.

**Display:** recommended orientation · recommended stock length · seam required (Y/N) · # seam lines · total H-channel LF · H-channel purchase qty.

---

## 8. Asphalt Shingle Assembly

Use overhang-adjusted sloped surface area; default shingle waste **15%**.
```ts
net_roof_area_sqft       = roof_surface_area_sqft;
shingle_order_area_sqft  = net_roof_area_sqft * 1.15;
```

**A. Shingle bundles**
```ts
shingle_bundle_coverage_sqft = 33.33; // configurable
shingle_bundle_quantity = Math.ceil(shingle_order_area_sqft / shingle_bundle_coverage_sqft);
roofing_squares = shingle_order_area_sqft / 100; // display
```

**B. Synthetic underlayment** (no auto 15% unless product-configured)
```ts
underlayment_quantity = Math.ceil(net_roof_area_sqft / underlayment_roll_coverage_sqft);
```

**C. Ice & water shield** (inputs: roll coverage, eave courses, optional valley LF, optional wall-intersection LF; default 1 eave course)
```ts
ice_water_eave_lf =
  roof_type === "shed" ? effective_roof_width_ft : effective_roof_length_ft * 2;
ice_water_total_lf = ice_water_eave_lf + valley_length_ft + wall_intersection_length_ft;
// convert to area via selected membrane width; rolls via configurable coverage; full manual override
```

**D. Drip edge** (10% waste, configurable stock length)
```ts
drip_edge_net_lf   = roof_perimeter_lf;
drip_edge_order_lf = drip_edge_net_lf * 1.10;
drip_edge_quantity = Math.ceil(drip_edge_order_lf / drip_edge_stock_length_ft);
```

**E. Starter shingles** (lower eaves; +10% waste ÷ package coverage)
```ts
starter_strip_lf = roof_type === "shed" ? effective_roof_width_ft : effective_roof_length_ft * 2;
```

**F. Ridge cap** (gable only; shed = 0, never auto-added to shed)
```ts
ridge_cap_lf = roof_type === "gable" ? effective_roof_length_ft : 0;
// packages via configurable ridge-cap coverage
```

**G. Roofing nails** (editable)
```ts
roofing_nail_boxes = Math.max(1, Math.ceil(roofing_squares / 15));
```

**H. Flashing** — configurable: sidewall · headwall · step · kickout · pipe-boot · valley. Add input **Roof attachment type: Attached to house | Freestanding**.
```ts
// Attached shed:
include_headwall_flashing = true;
headwall_flashing_lf = effective_roof_width_ft;
// Freestanding: no auto headwall flashing. All quantities editable.
```

**I. Roofing sealant** — always add 1 box / configured package (override-able).

**J. Asphalt roofing BOM group:** bundles · underlayment · ice&water · drip edge · starter · ridge cap · coil nails · headwall/sidewall/step/kickout flashing · pipe boots · valley flashing · sealant · manual materials.

**Metal roof:** **“Coming Later.”** When selected, allow manual material list + notes; **do not** auto-generate a metal-roof BOM.

---

## 9. Fireplace Configuration

Standard = **ventless**. Exclude: chimney framing, chimney cap, flue pipe, roof penetration, chimney flashing, combustion venting.
```ts
fireplace_type = "ventless";
```
Allow: *Ventless gas fireplace* · *Fireplace structure without appliance*. Appliance model is manually selected/entered.

---

## 10. Fireplace Dimensions

```ts
fireplace_total_width_ft  fireplace_total_height_ft  fireplace_total_depth_ft
fireplace_opening_width_ft  fireplace_opening_height_ft
// optional:
fireplace_return_left_ft  fireplace_return_right_ft
include_stone_on_sides  include_hearth  include_mantel_stone
```

```ts
fireplace_front_gross_sqft = fireplace_total_width_ft * fireplace_total_height_ft;
fireplace_opening_sqft     = fireplace_opening_width_ft * fireplace_opening_height_ft;
fireplace_front_net_sqft   = fireplace_front_gross_sqft - fireplace_opening_sqft;

// both full-depth sides clad (else compute one side):
fireplace_side_stone_sqft  = fireplace_total_depth_ft * fireplace_total_height_ft * 2;

fireplace_stone_net_sqft   = fireplace_front_net_sqft + fireplace_side_stone_sqft;
fireplace_stone_order_sqft = fireplace_stone_net_sqft * 1.15; // 15% waste
```
Calculated cladding area shown, manual override allowed.

---

## 11. Standard Fireplace Materials

**A. Metal studs** — 20-ga, 3.5″ × 10′, 16″ OC
```ts
front_stud_count   = Math.ceil((fireplace_total_width_ft * 12) / 16) + 2;
studs_per_side     = Math.ceil((fireplace_total_depth_ft * 12) / 16) + 1;
metal_stud_quantity = front_stud_count + studs_per_side * 2 + 4; // +4 jambs/header/corners
// round up to whole 10' studs; manual override
```

**B. Metal track** — 20-ga, 3.5″ × 10′ (10% waste)
```ts
track_total_lf     = (fireplace_total_width_ft + fireplace_total_depth_ft * 2) * 2;
opening_track_lf   = fireplace_opening_width_ft + fireplace_opening_height_ft * 2;
track_order_lf     = (track_total_lf + opening_track_lf) * 1.10;
metal_track_quantity = Math.ceil(track_order_lf / 10);
```

**C. Cement board** — 3′ × 5′ × ½″ (15 sqft/board), 10% waste
```ts
cement_board_coverage_sqft = 15;
cement_board_order_sqft    = fireplace_stone_net_sqft * 1.10;
cement_board_quantity      = Math.ceil(cement_board_order_sqft / cement_board_coverage_sqft);
```

**D. Cement board screws** (configurable coverage)
```ts
cement_board_screw_box_quantity = Math.max(1, Math.ceil(cement_board_quantity / 10));
```

**E. MSI natural stone veneer** (color TBC; searchable MSI field)
```ts
// config: stone_coverage_per_box_sqft, stone_product_name, stone_color, stone_sku
stone_box_quantity = Math.ceil(fireplace_stone_order_sqft / stone_coverage_per_box_sqft);
// Do NOT divide until coverage entered; before product selected, display required order area (sqft).
```

**F. Veneer adhesive** (configurable coverage)
```ts
veneer_adhesive_quantity = Math.ceil(fireplace_stone_order_sqft / veneer_adhesive_coverage_sqft);
```

**G. Fireplace stone** — piece 2″ × 12″ × 72″. Selection: None · Hearth · Mantel · Hearth & Mantel.
```ts
none -> 0 ; hearth|mantel -> 1 ; hearth_and_mantel -> 2  // override-able
```
Display **“Fireplace Stone — 2″ × 12″ × 72″”**; color/finish default **TBC**.

**H. Fireplace appliance** — when *Ventless Gas Fireplace* selected: add 1 ea. Fields: manufacturer, model, opening dims, fuel, BTU, finish, remote included, notes. No auto gas/electrical calc. Optional toggles: *Include gas connection allowance* / *Include electrical connection allowance* → create manual allowance items.

---

## 12. Fireplace BOM Group

1. Metal Framing · 2. Cement Board · 3. Cement Board Fasteners · 4. MSI Natural Stone Veneer · 5. Veneer Adhesive · 6. Fireplace Stone · 7. Ventless Fireplace Appliance · 8. Gas/Electrical Allowances · 9. Manual Fireplace Materials.

Each item: calculated qty · manual override · final qty · unit · calc explanation · product · SKU · color/finish · notes.

---

## 13. Required Automated Tests

1. Beams unchanged when overhang values change.
2. Gable beam exactly `width + length * 3`.
3. Shed rafter length includes front overhang.
4. Gable rafter length includes both side overhangs.
5. Roof area includes all applicable overhangs.
6. ChamClad selects 16′ panels when run ≤ 16′.
7. ChamClad selects 20′ panels when 16′ < run ≤ 20′.
8. ChamClad recommends lower-waste seam-free orientation.
9. ChamClad adds H-channel when both directions > 20′.
10. Correct H-channel seam-line calculations.
11. Asphalt shingle bundle calc.
12. Underlayment roll calc.
13. Ice & water shield calc.
14. Drip-edge stock-piece calc.
15. Starter-strip calc.
16. Gable ridge-cap calc.
17. Shed roofs exclude ridge cap by default.
18. Attached shed roofs add headwall flashing.
19. Freestanding roofs exclude headwall flashing by default.
20. Fireplace metal-stud calc.
21. Fireplace track calc.
22. Fireplace opening subtracted from stone area.
23. Cement-board sheet calc.
24. MSI stone order-area calc.
25. Hearth & mantel stone selections.
26. Ventless fireplace excludes all chimney materials.

---

## Implementation note (read before coding)

There is **no Roof Estimator code in this repository** — this repo is the Deckmetry *deck* estimator (`lib/calculations.ts`, the deck wizard). This document is the finalized, implementable spec for internal use. Before any implementation:
- Confirm **where it lives**: a new internal module in this repo (e.g., `lib/roof-calculations.ts` + a `/roof-estimate` route, kept internal/unreleased), or a separate project.
- Recommended structure (mirrors the deck engine): a pure, fully-unit-tested calc module (the 26 tests above) with **no UI coupling**, then the PM-facing form with override fields on top.
