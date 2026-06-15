// Pure roof Bill-of-Materials builder.
// Extracted from components/roof/roof-estimator.tsx so the roof tool, the deck+roof
// wizard, and the combined BOM all build the same material list from a RoofConfig.

import {
  beamTotalLf,
  roofGeometry,
  rafters,
  roofPerimeterLf,
  sheathing,
  chamClad,
  asphaltShingles,
  fireplace,
  type RoofInput,
} from "./roof-calculations";
import type { RoofConfig } from "./types";

export interface RoofBomLine {
  id: string;
  description: string;
  size: string;
  brand: string;
  color: string;
  qty: number;
  unit: string;
}
export interface RoofBomGroup {
  title: string;
  lines: RoofBomLine[];
}

// Standard lumber stock lengths (ft) used for the editable Size column.
export const STOCK_LENGTHS = [8, 10, 12, 14, 16, 18, 20];
export const stockLen = (ft: number) => STOCK_LENGTHS.find((s) => s >= ft) ?? 20;
const piecesFor = (totalLf: number, stock = 16) => Math.max(1, Math.ceil(totalLf / stock));

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `l-${Math.random().toString(36).slice(2)}`;

/** Map the flat UI RoofConfig to the engine's RoofInput. */
export function roofConfigToInput(roof: RoofConfig): RoofInput {
  return {
    roof_type: roof.roofType,
    roof_width_ft: roof.widthFt,
    roof_length_ft: roof.lengthFt,
    roof_pitch_rise: roof.pitch,
    attachment: roof.attachment,
    overhangs: {
      side_overhang_left_ft: roof.overhangLeftFt,
      side_overhang_right_ft: roof.overhangRightFt,
      front_overhang_ft: roof.overhangFrontFt,
      rear_overhang_ft: roof.overhangRearFt,
    },
  };
}

/** Build the sectioned roof BOM (calculable quantities filled; catalog extras seed at 0). */
export function buildRoofBom(roof: RoofConfig): RoofBomGroup[] {
  const input = roofConfigToInput(roof);
  const geo = roofGeometry(input);
  const sh = sheathing(input, roof.sheathingWasteSheets);

  const raf = rafters(input);
  const beams = beamTotalLf(input);
  const perim = Math.ceil(roofPerimeterLf(input));
  const cc = chamClad(input, {
    panel_coverage_width_ft: roof.panelCoverageFt,
    h_channel_stock_length_ft: roof.hChannelStockFt,
  });
  const r = cc.recommended;
  const panels = r.rows * r.segments_per_row;
  const asp =
    roof.roofing === "asphalt"
      ? asphaltShingles(input, {
          underlayment_roll_coverage_sqft: roof.underlaymentCoverageSqft,
          drip_edge_stock_length_ft: roof.dripEdgeStockFt,
          ice_water_valley_length_ft: roof.valleyLengthFt,
          ice_water_wall_intersection_length_ft: roof.wallIntersectionFt,
        })
      : null;
  const fp = roof.includeFireplace
    ? fireplace(
        {
          fireplace_total_width_ft: roof.fpWidthFt,
          fireplace_total_height_ft: roof.fpHeightFt,
          fireplace_total_depth_ft: roof.fpDepthFt,
          fireplace_opening_width_ft: roof.fpOpeningWidthFt,
          fireplace_opening_height_ft: roof.fpOpeningHeightFt,
          stone_sides: roof.fpStoneSides,
          stone_piece_selection: roof.fpStonePiece,
        },
        {
          stone_coverage_per_box_sqft:
            typeof roof.fpStoneBoxCoverageSqft === "number" ? roof.fpStoneBoxCoverageSqft : undefined,
          veneer_adhesive_coverage_sqft: roof.fpAdhesiveCoverageSqft,
        }
      )
    : null;

  const L = (
    description: string,
    size: string,
    qty: number,
    unit: string,
    brand = "",
    color = ""
  ): RoofBomLine => ({ id: uid(), description, size, brand, color, qty, unit });
  const ft = (x: number) => `${x}'`;
  const ledgerPcs =
    roof.attachment === "attached" ? Math.max(1, Math.ceil(geo.effective_roof_width_ft / 8)) : 0;

  const groups: RoofBomGroup[] = [];

  groups.push({
    title: "FOOTING",
    lines: [
      L("Concrete 3000 psi", "80lb", 0, "bags"),
      L('Sonotube 16"', "12'", 0, "Each"),
      L('Sonotube 24"', "12'", 0, "Each"),
    ],
  });
  groups.push({
    title: "BEAM",
    lines: [
      L("2x10", "16'", piecesFor(beams, 16), "Each"),
      L("5.25x12 LVL beam", "", 0, "Each"),
      L("3.5x16 LVL beam", "", 0, "Each"),
      L("5.5x16 LVL beam", "", 0, "Each"),
      L("5.25x16 PSL beam", "", 0, "Each"),
    ],
  });
  groups.push({
    title: "RAFTERS",
    lines: [L(raf.recommended_rafter_size, ft(stockLen(raf.rafter_length_ft)), raf.rafter_quantity, "Each")],
  });
  groups.push({
    title: "FASCIA",
    lines: [
      L("1x8 PVC", "16'", piecesFor(perim, 16), "Each", "", "White"),
      L("2x6", "16'", piecesFor(perim, 16), "Each"),
      L("1x6 Azek Captive PVC", "16'", 0, "Each", "Azek", "Black"),
      L("1x12 Azek Captive PVC", "16'", 0, "Each", "Azek", "Black"),
      L("1x8 Composite", "12'", 0, "Each", "Trex Select", ""),
      L("Fascia screws", "", 0, "box", "Trex Enhance", ""),
    ],
  });
  groups.push({
    title: "SHEATHING",
    lines: [L('1/2" CDX plywood', "4x8", sh.sheathing_quantity, "Each")],
  });
  groups.push({
    title: "HARDWARE",
    lines: [
      L("Hurricane ties H2.5A", "", raf.rafter_quantity, "Each"),
      L("Rafter hangers", "2x8", 0, "Each"),
      L("Beam hangers HUC210-3", "", 0, "Each"),
      L("ABU66Z post base", "", 0, "Each"),
      L("AC6Z post cap", "", 0, "Each"),
      L('4" flat head structural screws', "250 ct", 1, "Bucket"),
      L("Ledger flashing drip edge", "8'", ledgerPcs, "Each"),
      L('12" ledger flashing tape', "50'", roof.attachment === "attached" ? 1 : 0, "Each"),
      L("Galvanized ridge strap", "50'", 0, "Each"),
      L("3\" galv. collated framing nails", "2000 ct", 0, "box"),
    ],
  });
  const ceiling: RoofBomLine[] = [
    L("ChamClad 1x6 solid soffit", ft(r.recommended_panel_length_ft), panels, "Each", "ChamClad", roof.chamColor),
    L("ChamClad J-Channel", ft(r.recommended_panel_length_ft), 0, "Each", "ChamClad", roof.chamColor),
    L("ChamClad screws", "", 0, "box", "ChamClad"),
    L("ChamClad column wrap", "10'", 0, "Each", "ChamClad"),
  ];
  if (r.seam_required && r.h_channel_quantity > 0)
    ceiling.push(L("H-channel", ft(roof.hChannelStockFt), r.h_channel_quantity, "Each", "ChamClad", roof.chamColor));
  groups.push({ title: "ROOF CEILING", lines: ceiling });

  if (asp) {
    const roofLines: RoofBomLine[] = [
      L("Shingle bundles (15% waste)", "", asp.shingle_bundle_quantity, "bundles"),
      L("Synthetic underlayment", "", asp.underlayment_quantity ?? 0, "rolls"),
      L("Grace ice & water shield", "", Math.ceil(asp.ice_water_total_lf), "lin ft"),
      L("Aluminum drip edge (10% waste)", ft(roof.dripEdgeStockFt), asp.drip_edge_quantity ?? 0, "Each"),
      L("Starter shingle strip (10% waste)", "", Math.ceil(asp.starter_order_lf), "lin ft"),
      L("Galvanized coil roofing nails", "", asp.roofing_nail_boxes, "box"),
      L("Exterior roofing sealant", "", 1, "box"),
    ];
    if (asp.ridge_cap_lf > 0)
      roofLines.splice(5, 0, L("Ridge cap shingles", "", Math.ceil(asp.ridge_cap_lf), "lin ft"));
    if (asp.include_headwall_flashing)
      roofLines.push(L("Headwall flashing", "", Math.ceil(asp.headwall_flashing_lf), "lin ft"));
    groups.push({ title: "ROOFING", lines: roofLines });
  } else {
    groups.push({
      title: "ROOFING",
      lines: [L(roof.metalNotes || "Metal roofing — manual (coming later)", "", 0, "—")],
    });
  }

  groups.push({
    title: "ELECTRICAL",
    lines: [
      L("Tru-Scapes Dot Light TS-15DOT-SS", "", 0, "Each"),
      L("Post Cap Light TS-C125", "", 0, "Each", "", "TBD"),
    ],
  });

  const opt: RoofBomLine[] = [];
  if (roof.includeGutters) opt.push(L("Gutters & downspouts", "", perim, "lin ft"));
  if (roof.includeRidgeVent && roof.roofType === "gable")
    opt.push(L("Ridge vent", "", Math.ceil(geo.effective_roof_length_ft), "lin ft"));
  if (roof.optionalNotes) opt.push(L(roof.optionalNotes, "", 1, "Each"));
  if (opt.length === 0) opt.push(L("No optional items", "", 0, "—"));
  groups.push({ title: "OPTIONAL ITEMS", lines: opt });

  if (fp) {
    const f: RoofBomLine[] = [
      L('20-ga metal stud 3.5"', "10'", fp.metal_stud_quantity, "Each"),
      L('20-ga metal track 3.5" (10% waste)', "10'", fp.metal_track_quantity, "Each"),
      L('3x5 cement board ½" (10% waste)', "", fp.cement_board_quantity, "Each"),
      L("Cement board screws", "", fp.cement_board_screw_box_quantity, "box"),
      L(
        `MSI stone veneer${fp.stone_box_quantity === null ? " (enter box coverage)" : ""}`,
        "",
        fp.stone_box_quantity ?? 0,
        "box",
        "MSI",
        "TBC"
      ),
      L("Stone veneer adhesive", "", fp.veneer_adhesive_quantity ?? 0, "Each"),
    ];
    if (fp.fireplace_stone_piece_quantity > 0)
      f.push(
        L(
          `Fireplace stone 2x12 (${roof.fpStonePiece.replace("_", " & ")})`,
          "6'",
          fp.fireplace_stone_piece_quantity,
          "Each",
          "",
          "TBC"
        )
      );
    f.push(L("Ventless gas fireplace appliance", "", 1, "Each"));
    groups.push({ title: "FIREPLACE (OPTIONAL)", lines: f });
  }

  return groups;
}
