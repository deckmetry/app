import { describe, it, expect } from "vitest";
import {
  beamTotalLf,
  roofGeometry,
  rafters,
  roofSurfaceAreaSqft,
  sheathing,
  chamClad,
  asphaltShingles,
  fireplace,
  fireplaceStoneAreas,
  fireplaceStonePieceQuantity,
  pitchFactor,
  type RoofInput,
} from "./roof-calculations";

const gable = (over: Partial<RoofInput> = {}): RoofInput => ({
  roof_type: "gable",
  roof_width_ft: 24,
  roof_length_ft: 16,
  roof_pitch_rise: 6,
  ...over,
});
const shed = (over: Partial<RoofInput> = {}): RoofInput => ({
  roof_type: "shed",
  roof_width_ft: 16,
  roof_length_ft: 12,
  roof_pitch_rise: 4,
  ...over,
});

describe("Roof Estimator — finalized rules", () => {
  // 1. Beams unchanged when overhang values change
  it("1 · beams ignore overhang changes", () => {
    const base = beamTotalLf(gable());
    const withOverhangs = beamTotalLf(
      gable({ overhangs: { side_overhang_left_ft: 3, side_overhang_right_ft: 3, front_overhang_ft: 2, rear_overhang_ft: 2 } })
    );
    expect(withOverhangs).toBe(base);
  });

  // 2. Gable beam = width + length * 3 (exact)
  it("2 · gable beam = width + length*3", () => {
    expect(beamTotalLf(gable({ roof_width_ft: 24, roof_length_ft: 16 }))).toBe(24 + 16 * 3);
    expect(beamTotalLf(shed({ roof_width_ft: 16 }))).toBe(16); // shed = width
  });

  // 3. Shed rafter length includes front overhang
  it("3 · shed rafter length includes front overhang", () => {
    const noFront = roofGeometry(shed({ overhangs: { front_overhang_ft: 0, rear_overhang_ft: 0 } })).roof_diagonal_ft;
    const withFront = roofGeometry(shed({ overhangs: { front_overhang_ft: 1, rear_overhang_ft: 0 } })).roof_diagonal_ft;
    expect(withFront).toBeGreaterThan(noFront);
    // run = effective length (12 + 1) * pitch factor
    const pf = pitchFactor(4);
    expect(withFront).toBeCloseTo((12 + 1) * pf, 6);
  });

  // 4. Gable rafter length includes both side overhangs
  it("4 · gable rafter length includes both side overhangs", () => {
    const pf = pitchFactor(6);
    const g = roofGeometry(gable({ roof_width_ft: 24, overhangs: { side_overhang_left_ft: 1, side_overhang_right_ft: 1 } }));
    // effective width = 26, half-run = 13
    expect(g.rafter_run_ft).toBeCloseTo(13, 6);
    expect(g.roof_diagonal_ft).toBeCloseTo(13 * pf, 6);
  });

  // 5. Roof area includes all applicable overhangs
  it("5 · roof area uses effective (overhang-adjusted) dimensions", () => {
    const pf = pitchFactor(6);
    const area = roofSurfaceAreaSqft(gable());
    // gable: diagonal * effective_length * 2 ; effective_length = 16 + 1 = 17 ; diagonal = 13*pf
    expect(area).toBeCloseTo(13 * pf * 17 * 2, 5);
  });

  // 6. ChamClad picks 16' when run <= 16
  it("6 · ChamClad 16' panel when run <= 16", () => {
    // shed effective length = 12 + 1 = 13 (Option A run); width = 16+2 = 18
    const r = chamClad(shed());
    expect(r.optionA.panel_run_length_ft).toBeCloseTo(13, 6);
    expect(r.optionA.recommended_panel_length_ft).toBe(16);
    expect(r.optionA.seam_required).toBe(false);
  });

  // 7. ChamClad picks 20' when 16 < run <= 20
  it("7 · ChamClad 20' panel when 16 < run <= 20", () => {
    const r = chamClad(shed({ roof_length_ft: 18 })); // eff length = 19
    expect(r.optionA.panel_run_length_ft).toBeCloseTo(19, 6);
    expect(r.optionA.recommended_panel_length_ft).toBe(20);
    expect(r.optionA.seam_required).toBe(false);
  });

  // 8. ChamClad recommends lower-waste seam-free orientation
  it("8 · ChamClad recommends the lower-waste seam-free orientation", () => {
    // Both runs <= 16 -> both seam-free with 16' stock. Lower waste should win.
    // width 10 (-> A covered 12, B run 12), length 8 (-> A run 10, B covered 10) w/ default 1ft overhangs:
    // eff_width = 12, eff_length = 10. A: run=10, covered=12 ; B: run=12, covered=10.
    const r = chamClad({ roof_type: "gable", roof_width_ft: 10, roof_length_ft: 8, roof_pitch_rise: 4 });
    expect(r.optionA.seam_required).toBe(false);
    expect(r.optionB.seam_required).toBe(false);
    expect(r.recommended.waste_lf).toBeLessThanOrEqual(Math.max(r.optionA.waste_lf, r.optionB.waste_lf));
    // recommended is whichever of A/B has the smaller waste_lf
    const lower = r.optionA.waste_lf <= r.optionB.waste_lf ? r.optionA : r.optionB;
    expect(r.recommended.label).toBe(lower.label);
  });

  // 9. ChamClad adds H-channel when both directions exceed 20'
  it("9 · ChamClad H-channel when both runs > 20", () => {
    const r = chamClad({ roof_type: "gable", roof_width_ft: 40, roof_length_ft: 40, roof_pitch_rise: 4 });
    expect(r.optionA.panel_run_length_ft).toBeGreaterThan(20);
    expect(r.optionB.panel_run_length_ft).toBeGreaterThan(20);
    expect(r.recommended.seam_required).toBe(true);
    expect(r.recommended.h_channel_lines).toBeGreaterThanOrEqual(1);
    expect(r.recommended.h_channel_quantity).toBeGreaterThanOrEqual(1);
  });

  // 10. Correct H-channel seam-line calculations
  it("10 · H-channel seam-line math", () => {
    // run = 44 with 20' stock -> ceil(44/20)=3 segments -> 2 seams per row
    const r = chamClad(
      { roof_type: "shed", roof_width_ft: 30, roof_length_ft: 42, roof_pitch_rise: 4 },
      { h_channel_stock_length_ft: 12 }
    );
    // Option A run = eff length = 42 + 1 = 43 -> ceil(43/20)=3 segments -> 2 seams
    expect(r.optionA.segments_per_row).toBe(3);
    expect(r.optionA.seams_per_row).toBe(2);
    expect(r.optionA.h_channel_lines).toBe(2);
    // covered = eff width = 30+2 = 32 ; total = 2 * 32 = 64 ; qty = ceil(64/12) = 6
    expect(r.optionA.h_channel_total_lf).toBeCloseTo(64, 6);
    expect(r.optionA.h_channel_quantity).toBe(6);
  });

  // 11. Asphalt shingle bundle calculations
  it("11 · shingle bundles", () => {
    const a = asphaltShingles(shed());
    const expectedBundles = Math.ceil(a.shingle_order_area_sqft / 33.33);
    expect(a.shingle_bundle_quantity).toBe(expectedBundles);
    expect(a.shingle_order_area_sqft).toBeCloseTo(a.net_roof_area_sqft * 1.15, 6);
  });

  // 12. Underlayment roll calculations
  it("12 · underlayment rolls", () => {
    const a = asphaltShingles(shed(), { underlayment_roll_coverage_sqft: 1000 });
    expect(a.underlayment_quantity).toBe(Math.ceil(a.net_roof_area_sqft / 1000));
    // no auto 15% waste on underlayment
    expect(a.underlayment_quantity).toBe(Math.ceil(a.net_roof_area_sqft / 1000));
  });

  // 13. Ice & water shield calculations
  it("13 · ice & water shield LF", () => {
    const a = asphaltShingles(gable(), { ice_water_valley_length_ft: 10, ice_water_wall_intersection_length_ft: 5 });
    // gable eave = effective_length * 2 = 17*2 = 34 ; +10 +5 = 49
    expect(a.ice_water_eave_lf).toBeCloseTo(34, 6);
    expect(a.ice_water_total_lf).toBeCloseTo(49, 6);
  });

  // 14. Drip-edge stock-piece calculations
  it("14 · drip edge pieces", () => {
    const a = asphaltShingles(shed(), { drip_edge_stock_length_ft: 10 });
    const expected = Math.ceil((a.drip_edge_net_lf * 1.1) / 10);
    expect(a.drip_edge_quantity).toBe(expected);
  });

  // 15. Starter-strip calculations
  it("15 · starter strip LF", () => {
    const aShed = asphaltShingles(shed());
    expect(aShed.starter_strip_lf).toBeCloseTo(16 + 2, 6); // eff width
    const aGable = asphaltShingles(gable());
    expect(aGable.starter_strip_lf).toBeCloseTo((16 + 1) * 2, 6); // eff length * 2
  });

  // 16. Gable ridge-cap calculations
  it("16 · gable ridge cap = effective length", () => {
    const a = asphaltShingles(gable());
    expect(a.ridge_cap_lf).toBeCloseTo(16 + 1, 6);
  });

  // 17. Shed roofs exclude ridge cap by default
  it("17 · shed ridge cap = 0", () => {
    expect(asphaltShingles(shed()).ridge_cap_lf).toBe(0);
  });

  // 18. Attached shed roofs add headwall flashing
  it("18 · attached shed adds headwall flashing", () => {
    const a = asphaltShingles(shed({ attachment: "attached" }));
    expect(a.include_headwall_flashing).toBe(true);
    expect(a.headwall_flashing_lf).toBeCloseTo(16 + 2, 6); // eff width
  });

  // 19. Freestanding roofs exclude headwall flashing by default
  it("19 · freestanding excludes headwall flashing", () => {
    expect(asphaltShingles(shed({ attachment: "freestanding" })).include_headwall_flashing).toBe(false);
    expect(asphaltShingles(gable({ attachment: "attached" })).include_headwall_flashing).toBe(false); // gable not auto
  });

  // ── Fireplace ──────────────────────────────────────────────────────────────
  const fp = {
    fireplace_total_width_ft: 6,
    fireplace_total_height_ft: 8,
    fireplace_total_depth_ft: 2,
    fireplace_opening_width_ft: 3,
    fireplace_opening_height_ft: 2,
  };

  // 20. Fireplace metal-stud calculation
  it("20 · fireplace metal studs", () => {
    const f = fireplace(fp);
    // front = ceil(6*12/16)+2 = ceil(4.5)+2 = 5+2 = 7 ; side = ceil(2*12/16)+1 = ceil(1.5)+1 = 2+1 = 3
    // total = 7 + 3*2 + 4 = 17
    expect(f.front_stud_count).toBe(7);
    expect(f.studs_per_side).toBe(3);
    expect(f.metal_stud_quantity).toBe(17);
  });

  // 21. Fireplace track calculation
  it("21 · fireplace track", () => {
    const f = fireplace(fp);
    const track_total = (6 + 2 * 2) * 2; // 20
    const opening_track = 3 + 2 * 2; // 7
    const order = (track_total + opening_track) * 1.1; // 29.7
    expect(f.track_total_lf).toBeCloseTo(track_total, 6);
    expect(f.opening_track_lf).toBeCloseTo(opening_track, 6);
    expect(f.metal_track_quantity).toBe(Math.ceil(order / 10)); // ceil(2.97) = 3
  });

  // 22. Opening subtracted from stone area
  it("22 · fireplace opening subtracted from stone area", () => {
    const a = fireplaceStoneAreas(fp);
    expect(a.fireplace_front_gross_sqft).toBe(48);
    expect(a.fireplace_opening_sqft).toBe(6);
    expect(a.fireplace_front_net_sqft).toBe(42);
    expect(a.fireplace_side_stone_sqft).toBe(2 * 8 * 2); // 32
    expect(a.fireplace_stone_net_sqft).toBe(42 + 32); // 74
  });

  // 23. Cement-board sheet calculation
  it("23 · cement board sheets", () => {
    const f = fireplace(fp);
    const order = 74 * 1.1; // 81.4
    expect(f.cement_board_order_sqft).toBeCloseTo(order, 6);
    expect(f.cement_board_quantity).toBe(Math.ceil(order / 15)); // ceil(5.43) = 6
  });

  // 24. MSI stone order-area calculation
  it("24 · MSI stone order area + box qty only when coverage entered", () => {
    const noCoverage = fireplace(fp);
    expect(noCoverage.stone_box_quantity).toBeNull();
    expect(noCoverage.fireplace_stone_order_sqft).toBeCloseTo(74 * 1.15, 6); // 85.1
    const withCoverage = fireplace(fp, { stone_coverage_per_box_sqft: 8 });
    expect(withCoverage.stone_box_quantity).toBe(Math.ceil((74 * 1.15) / 8)); // ceil(10.6375) = 11
  });

  // 25. Hearth and mantel stone selections
  it("25 · hearth/mantel stone piece quantities", () => {
    expect(fireplaceStonePieceQuantity("none")).toBe(0);
    expect(fireplaceStonePieceQuantity("hearth")).toBe(1);
    expect(fireplaceStonePieceQuantity("mantel")).toBe(1);
    expect(fireplaceStonePieceQuantity("hearth_and_mantel")).toBe(2);
  });

  // 26. Ventless fireplace excludes all chimney materials
  it("26 · ventless fireplace excludes chimney materials", () => {
    const f = fireplace({ ...fp, fireplace_type: "ventless" });
    expect(f.fireplace_type).toBe("ventless");
    expect(f.chimney_materials_included).toBe(false);
    // none of the chimney keys should appear on the result
    const keys = Object.keys(f);
    for (const ck of ["chimney_framing", "chimney_cap", "flue_pipe", "roof_penetration", "chimney_flashing", "combustion_venting"]) {
      expect(keys).not.toContain(ck);
    }
  });
});
