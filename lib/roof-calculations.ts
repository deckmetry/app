// ─────────────────────────────────────────────────────────────────────────────
// Roof Estimator — pure calculation engine (INTERNAL)
//
// Implements the finalized company rules in docs/ROOF-ESTIMATOR-SPEC.md.
// Pure functions only — no UI/React/Next coupling. Every calculated quantity is
// returned as a raw number/struct; the override -> final layer (and BOM grouping)
// is a thin wrapper for the PM form. See makeQuantity() / BomQuantity.
//
// NOTE: The gable beam rule (§1) is intentional and must not be modified.
// ─────────────────────────────────────────────────────────────────────────────

export type RoofType = "shed" | "gable";
export type RoofAttachment = "attached" | "freestanding";

// ── Override-able BOM quantity shape (spec §12) ──────────────────────────────
export interface BomQuantity {
  calculated: number;
  override: number | null;
  final: number;
  unit: string;
  explanation: string;
}
export function makeQuantity(calculated: number, unit: string, explanation: string, override: number | null = null): BomQuantity {
  return { calculated, override, final: override ?? calculated, unit, explanation };
}

// ── Overhangs (spec §2) ───────────────────────────────────────────────────────
export interface RoofOverhangs {
  side_overhang_left_ft: number;
  side_overhang_right_ft: number;
  front_overhang_ft: number;
  rear_overhang_ft: number;
}
export const DEFAULT_OVERHANGS: RoofOverhangs = {
  side_overhang_left_ft: 1,
  side_overhang_right_ft: 1,
  front_overhang_ft: 1,
  rear_overhang_ft: 0,
};

export interface RoofInput {
  roof_type: RoofType;
  roof_width_ft: number;
  roof_length_ft: number;
  roof_pitch_rise: number; // rise per 12 of run
  overhangs?: Partial<RoofOverhangs>;
  attachment?: RoofAttachment;
}

export function resolveOverhangs(input: RoofInput): RoofOverhangs {
  return { ...DEFAULT_OVERHANGS, ...(input.overhangs ?? {}) };
}

export function effectiveDimensions(input: RoofInput) {
  const o = resolveOverhangs(input);
  return {
    effective_roof_width_ft: input.roof_width_ft + o.side_overhang_left_ft + o.side_overhang_right_ft,
    effective_roof_length_ft: input.roof_length_ft + o.front_overhang_ft + o.rear_overhang_ft,
  };
}

export function pitchFactor(roof_pitch_rise: number): number {
  return Math.sqrt(1 + Math.pow(roof_pitch_rise / 12, 2));
}

// ── §1 Beams — uses ORIGINAL dimensions, never effective; no overhang ─────────
export function beamTotalLf(input: RoofInput): number {
  if (input.roof_type === "gable") {
    return input.roof_width_ft + input.roof_length_ft * 3; // FINAL — do not modify
  }
  return input.roof_width_ft; // shed
}

// ── §3 Geometry ───────────────────────────────────────────────────────────────
export interface RoofGeometry {
  effective_roof_width_ft: number;
  effective_roof_length_ft: number;
  pitch_factor: number;
  rafter_run_ft: number;
  roof_diagonal_ft: number; // one sloped rafter length (ridge -> outside edge)
}
export function roofGeometry(input: RoofInput): RoofGeometry {
  const { effective_roof_width_ft, effective_roof_length_ft } = effectiveDimensions(input);
  const pf = pitchFactor(input.roof_pitch_rise);
  const rafter_run_ft =
    input.roof_type === "shed" ? effective_roof_length_ft : effective_roof_width_ft / 2;
  return {
    effective_roof_width_ft,
    effective_roof_length_ft,
    pitch_factor: pf,
    rafter_run_ft,
    roof_diagonal_ft: rafter_run_ft * pf,
  };
}

// ── §4 Rafters ────────────────────────────────────────────────────────────────
export function recommendedRafterSize(roof_diagonal_ft: number): "2x8" | "2x10" | "2x12" {
  if (roof_diagonal_ft <= 10) return "2x8";
  if (roof_diagonal_ft < 16) return "2x10";
  return "2x12";
}
export function rafters(input: RoofInput) {
  const g = roofGeometry(input);
  if (input.roof_type === "shed") {
    const rafter_quantity = Math.ceil((g.effective_roof_width_ft * 12) / 16) + 2;
    return {
      rafter_quantity,
      rafter_length_ft: g.roof_diagonal_ft,
      recommended_rafter_size: recommendedRafterSize(g.roof_diagonal_ft),
    };
  }
  const rafters_per_side = Math.ceil((g.effective_roof_length_ft * 12) / 16) + 2;
  return {
    rafters_per_side,
    rafter_quantity: rafters_per_side * 2,
    rafter_length_ft: g.roof_diagonal_ft,
    recommended_rafter_size: recommendedRafterSize(g.roof_diagonal_ft),
  };
}

// ── §5 Perimeter (overhang-adjusted; not for beams) ──────────────────────────
export function roofPerimeterLf(input: RoofInput): number {
  const g = roofGeometry(input);
  if (input.roof_type === "shed") return g.roof_diagonal_ft * 2 + g.effective_roof_width_ft;
  return g.roof_diagonal_ft * 2 + g.effective_roof_length_ft * 2;
}

// ── §6 Sheathing (+4 sheets default waste, override-able) ────────────────────
export function roofSurfaceAreaSqft(input: RoofInput): number {
  const g = roofGeometry(input);
  if (input.roof_type === "shed") return g.roof_diagonal_ft * g.effective_roof_width_ft;
  return g.roof_diagonal_ft * g.effective_roof_length_ft * 2;
}
export function sheathing(input: RoofInput, wasteSheets = 4) {
  const roof_surface_area_sqft = roofSurfaceAreaSqft(input);
  const sheathing_base_sheets = Math.ceil(roof_surface_area_sqft / 32);
  return {
    roof_surface_area_sqft,
    sheathing_base_sheets,
    sheathing_quantity: sheathing_base_sheets + wasteSheets,
  };
}

// ── §7 ChamClad panel orientation ─────────────────────────────────────────────
export interface ChamCladConfig {
  panel_coverage_width_ft?: number; // panel coverage across the run (default 1.0 ft)
  h_channel_stock_length_ft?: number; // default 12
}
export interface OrientationResult {
  label: "A" | "B";
  description: string;
  panel_run_length_ft: number;
  covered_dimension_ft: number;
  recommended_panel_length_ft: 16 | 20;
  seam_required: boolean;
  segments_per_row: number;
  seams_per_row: number;
  rows: number;
  waste_lf: number;
  h_channel_lines: number;
  h_channel_total_lf: number;
  h_channel_quantity: number;
}

function evalOrientation(
  label: "A" | "B",
  description: string,
  panel_run_length_ft: number,
  covered_dimension_ft: number,
  cfg: Required<ChamCladConfig>
): OrientationResult {
  let recommended_panel_length_ft: 16 | 20;
  let seam_required: boolean;
  if (panel_run_length_ft <= 16) {
    recommended_panel_length_ft = 16;
    seam_required = false;
  } else if (panel_run_length_ft <= 20) {
    recommended_panel_length_ft = 20;
    seam_required = false;
  } else {
    recommended_panel_length_ft = 20;
    seam_required = true;
  }

  const rows = Math.max(1, Math.ceil(covered_dimension_ft / cfg.panel_coverage_width_ft));
  const segments_per_row = Math.ceil(panel_run_length_ft / recommended_panel_length_ft);
  const seams_per_row = Math.max(0, segments_per_row - 1);
  const waste_per_row_lf = segments_per_row * recommended_panel_length_ft - panel_run_length_ft;
  const waste_lf = waste_per_row_lf * rows;

  // H-channel only when run > 20 (a seam is unavoidable)
  const include_h_channel = panel_run_length_ft > 20;
  const h_channel_lines = include_h_channel ? seams_per_row : 0;
  const h_channel_total_lf = h_channel_lines * covered_dimension_ft;
  const h_channel_quantity = include_h_channel
    ? Math.ceil(h_channel_total_lf / cfg.h_channel_stock_length_ft)
    : 0;

  return {
    label,
    description,
    panel_run_length_ft,
    covered_dimension_ft,
    recommended_panel_length_ft,
    seam_required,
    segments_per_row,
    seams_per_row,
    rows,
    waste_lf,
    h_channel_lines,
    h_channel_total_lf,
    h_channel_quantity,
  };
}

export function chamClad(input: RoofInput, config: ChamCladConfig = {}) {
  const cfg: Required<ChamCladConfig> = {
    panel_coverage_width_ft: config.panel_coverage_width_ft ?? 1,
    h_channel_stock_length_ft: config.h_channel_stock_length_ft ?? 12,
  };
  const g = roofGeometry(input);

  // Option A — panels parallel to effective length
  const optionA = evalOrientation(
    "A",
    "Panels run parallel to the effective roof length",
    g.effective_roof_length_ft,
    g.effective_roof_width_ft,
    cfg
  );
  // Option B — panels parallel to effective width
  const optionB = evalOrientation(
    "B",
    "Panels run parallel to the effective roof width",
    g.effective_roof_width_ft,
    g.effective_roof_length_ft,
    cfg
  );

  const recommended = chooseOrientation(optionA, optionB);
  return { optionA, optionB, recommended };
}

function chooseOrientation(a: OrientationResult, b: OrientationResult): OrientationResult {
  const seamFree = [a, b].filter((o) => !o.seam_required);
  if (seamFree.length > 0) {
    // 1) seam-free, 2) shortest stock that's seam-free, 3) lowest waste
    seamFree.sort(
      (x, y) =>
        x.recommended_panel_length_ft - y.recommended_panel_length_ft || x.waste_lf - y.waste_lf
    );
    return seamFree[0];
  }
  // none seam-free: fewest H-channels, then lowest waste
  return [a, b].sort((x, y) => x.h_channel_lines - y.h_channel_lines || x.waste_lf - y.waste_lf)[0];
}

// ── §8 Asphalt shingle assembly ───────────────────────────────────────────────
export interface AsphaltConfig {
  shingle_waste_factor?: number; // default 0.15
  shingle_bundle_coverage_sqft?: number; // default 33.33
  underlayment_roll_coverage_sqft?: number;
  drip_edge_stock_length_ft?: number;
  drip_edge_waste_factor?: number; // default 0.10
  starter_waste_factor?: number; // default 0.10
  starter_package_coverage_lf?: number;
  ridge_cap_coverage_lf_per_package?: number;
  ice_water_valley_length_ft?: number;
  ice_water_wall_intersection_length_ft?: number;
}

export function asphaltShingles(input: RoofInput, config: AsphaltConfig = {}) {
  const cfg = {
    shingle_waste_factor: config.shingle_waste_factor ?? 0.15,
    shingle_bundle_coverage_sqft: config.shingle_bundle_coverage_sqft ?? 33.33,
    drip_edge_waste_factor: config.drip_edge_waste_factor ?? 0.1,
    starter_waste_factor: config.starter_waste_factor ?? 0.1,
    valley: config.ice_water_valley_length_ft ?? 0,
    wall: config.ice_water_wall_intersection_length_ft ?? 0,
  };
  const g = roofGeometry(input);
  const net_roof_area_sqft = roofSurfaceAreaSqft(input);
  const shingle_order_area_sqft = net_roof_area_sqft * (1 + cfg.shingle_waste_factor);
  const roofing_squares = shingle_order_area_sqft / 100;

  // A. Bundles
  const shingle_bundle_quantity = Math.ceil(shingle_order_area_sqft / cfg.shingle_bundle_coverage_sqft);

  // B. Underlayment (no auto waste)
  const underlayment_quantity = config.underlayment_roll_coverage_sqft
    ? Math.ceil(net_roof_area_sqft / config.underlayment_roll_coverage_sqft)
    : null;

  // C. Ice & water shield (eave LF + valley + wall)
  const ice_water_eave_lf =
    input.roof_type === "shed" ? g.effective_roof_width_ft : g.effective_roof_length_ft * 2;
  const ice_water_total_lf = ice_water_eave_lf + cfg.valley + cfg.wall;

  // D. Drip edge (10% waste)
  const drip_edge_net_lf = roofPerimeterLf(input);
  const drip_edge_order_lf = drip_edge_net_lf * (1 + cfg.drip_edge_waste_factor);
  const drip_edge_quantity = config.drip_edge_stock_length_ft
    ? Math.ceil(drip_edge_order_lf / config.drip_edge_stock_length_ft)
    : null;

  // E. Starter (lower eaves + 10% waste)
  const starter_strip_lf =
    input.roof_type === "shed" ? g.effective_roof_width_ft : g.effective_roof_length_ft * 2;
  const starter_order_lf = starter_strip_lf * (1 + cfg.starter_waste_factor);

  // F. Ridge cap — gable only (shed never auto-added)
  const ridge_cap_lf = input.roof_type === "gable" ? g.effective_roof_length_ft : 0;

  // G. Roofing nails (editable)
  const roofing_nail_boxes = Math.max(1, Math.ceil(roofing_squares / 15));

  // H. Headwall flashing — attached shed only
  const include_headwall_flashing = input.roof_type === "shed" && input.attachment === "attached";
  const headwall_flashing_lf = include_headwall_flashing ? g.effective_roof_width_ft : 0;

  return {
    net_roof_area_sqft,
    shingle_order_area_sqft,
    roofing_squares,
    shingle_bundle_quantity,
    underlayment_quantity,
    ice_water_eave_lf,
    ice_water_total_lf,
    drip_edge_net_lf,
    drip_edge_order_lf,
    drip_edge_quantity,
    starter_strip_lf,
    starter_order_lf,
    ridge_cap_lf,
    roofing_nail_boxes,
    include_headwall_flashing,
    headwall_flashing_lf,
  };
}

// ── §9–11 Fireplace (ventless standard) ───────────────────────────────────────
export type FireplaceType = "ventless" | "structure_only";
export type FireplaceStoneSelection = "none" | "hearth" | "mantel" | "hearth_and_mantel";

// Chimney materials are NEVER part of a ventless fireplace (spec §9).
export const CHIMNEY_MATERIAL_KEYS = [
  "chimney_framing",
  "chimney_cap",
  "flue_pipe",
  "roof_penetration",
  "chimney_flashing",
  "combustion_venting",
] as const;

export interface FireplaceInput {
  fireplace_type?: FireplaceType; // default "ventless"
  fireplace_total_width_ft: number;
  fireplace_total_height_ft: number;
  fireplace_total_depth_ft: number;
  fireplace_opening_width_ft: number;
  fireplace_opening_height_ft: number;
  stone_sides?: 0 | 1 | 2; // how many full-depth sides get stone (default 2)
  stone_piece_selection?: FireplaceStoneSelection; // default "none"
}

export interface FireplaceMaterialConfig {
  stone_waste_factor?: number; // default 0.15
  cement_board_coverage_sqft?: number; // default 15
  cement_board_waste_factor?: number; // default 0.10
  track_waste_factor?: number; // default 0.10
  stud_extra_allowance?: number; // default 4
  stone_coverage_per_box_sqft?: number; // no default — must be entered
  veneer_adhesive_coverage_sqft?: number;
}

export function fireplaceStoneAreas(fp: FireplaceInput, stoneWasteFactor = 0.15) {
  const sides = fp.stone_sides ?? 2;
  const fireplace_front_gross_sqft = fp.fireplace_total_width_ft * fp.fireplace_total_height_ft;
  const fireplace_opening_sqft = fp.fireplace_opening_width_ft * fp.fireplace_opening_height_ft;
  const fireplace_front_net_sqft = fireplace_front_gross_sqft - fireplace_opening_sqft;
  const fireplace_side_stone_sqft = fp.fireplace_total_depth_ft * fp.fireplace_total_height_ft * sides;
  const fireplace_stone_net_sqft = fireplace_front_net_sqft + fireplace_side_stone_sqft;
  const fireplace_stone_order_sqft = fireplace_stone_net_sqft * (1 + stoneWasteFactor);
  return {
    fireplace_front_gross_sqft,
    fireplace_opening_sqft,
    fireplace_front_net_sqft,
    fireplace_side_stone_sqft,
    fireplace_stone_net_sqft,
    fireplace_stone_order_sqft,
  };
}

export function fireplaceStonePieceQuantity(selection: FireplaceStoneSelection = "none"): number {
  if (selection === "hearth" || selection === "mantel") return 1;
  if (selection === "hearth_and_mantel") return 2;
  return 0;
}

export function fireplace(fp: FireplaceInput, config: FireplaceMaterialConfig = {}) {
  const cfg = {
    stone_waste_factor: config.stone_waste_factor ?? 0.15,
    cement_board_coverage_sqft: config.cement_board_coverage_sqft ?? 15,
    cement_board_waste_factor: config.cement_board_waste_factor ?? 0.1,
    track_waste_factor: config.track_waste_factor ?? 0.1,
    stud_extra_allowance: config.stud_extra_allowance ?? 4,
  };
  const fireplace_type = fp.fireplace_type ?? "ventless";
  const areas = fireplaceStoneAreas(fp, cfg.stone_waste_factor);

  // A. Metal studs (16" OC)
  const front_stud_count = Math.ceil((fp.fireplace_total_width_ft * 12) / 16) + 2;
  const studs_per_side = Math.ceil((fp.fireplace_total_depth_ft * 12) / 16) + 1;
  const metal_stud_quantity = front_stud_count + studs_per_side * 2 + cfg.stud_extra_allowance;

  // B. Metal track (10% waste)
  const track_total_lf = (fp.fireplace_total_width_ft + fp.fireplace_total_depth_ft * 2) * 2;
  const opening_track_lf = fp.fireplace_opening_width_ft + fp.fireplace_opening_height_ft * 2;
  const track_order_lf = (track_total_lf + opening_track_lf) * (1 + cfg.track_waste_factor);
  const metal_track_quantity = Math.ceil(track_order_lf / 10);

  // C. Cement board (10% waste, 15 sqft/board)
  const cement_board_order_sqft = areas.fireplace_stone_net_sqft * (1 + cfg.cement_board_waste_factor);
  const cement_board_quantity = Math.ceil(cement_board_order_sqft / cfg.cement_board_coverage_sqft);

  // D. Cement board screws
  const cement_board_screw_box_quantity = Math.max(1, Math.ceil(cement_board_quantity / 10));

  // E. MSI stone — only divide once coverage entered
  const stone_box_quantity = config.stone_coverage_per_box_sqft
    ? Math.ceil(areas.fireplace_stone_order_sqft / config.stone_coverage_per_box_sqft)
    : null;

  // F. Veneer adhesive
  const veneer_adhesive_quantity = config.veneer_adhesive_coverage_sqft
    ? Math.ceil(areas.fireplace_stone_order_sqft / config.veneer_adhesive_coverage_sqft)
    : null;

  // G. Fireplace stone piece
  const fireplace_stone_piece_quantity = fireplaceStonePieceQuantity(fp.stone_piece_selection);

  // Ventless => no chimney materials, ever.
  const chimney_materials_included = false;

  return {
    fireplace_type,
    chimney_materials_included,
    ...areas,
    front_stud_count,
    studs_per_side,
    metal_stud_quantity,
    track_total_lf,
    opening_track_lf,
    track_order_lf,
    metal_track_quantity,
    cement_board_order_sqft,
    cement_board_quantity,
    cement_board_screw_box_quantity,
    stone_box_quantity,
    veneer_adhesive_quantity,
    fireplace_stone_piece_quantity,
  };
}
