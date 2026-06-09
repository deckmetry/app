// ─────────────────────────────────────────────────────────────────────────────
// Public Showroom Estimator — data, options, pricing, and BOM generation.
//
// Self-contained: no Supabase/auth needed to run the estimator. Powers both the
// public paid mode and the Wehrung's showroom demo mode.
// ─────────────────────────────────────────────────────────────────────────────

export const BOM_PRICE = 79;

export const projectTypes = [
  "New deck",
  "Deck replacement",
  "Deck + stairs",
  "Deck + railing",
  "Full outdoor living project",
];

export interface DeckSize {
  label: string;
  w: number;
  d: number;
  area: number;
  custom?: boolean;
}
export const deckSizes: DeckSize[] = [
  { label: "12' x 12'", w: 12, d: 12, area: 144 },
  { label: "12' x 16'", w: 12, d: 16, area: 192 },
  { label: "14' x 20'", w: 14, d: 20, area: 280 },
  { label: "16' x 20'", w: 16, d: 20, area: 320 },
  { label: "16' x 24'", w: 16, d: 24, area: 384 },
  { label: "Custom size", w: 16, d: 20, area: 320, custom: true },
];

export interface DeckHeight {
  label: string;
  skirtFt: number;
}
export const deckHeights: DeckHeight[] = [
  { label: "Ground level", skirtFt: 1 },
  { label: "3' to 5'", skirtFt: 4 },
  { label: "6' to 8'", skirtFt: 7 },
  { label: "9'+ second-story deck", skirtFt: 9 },
];

export interface DeckingLine {
  label: string;
  brand: string;
  line: string;
  basePerSqft: number; // decking + framing base
}
export const deckingLines: DeckingLine[] = [
  { label: "Trex Select", brand: "Trex", line: "Select", basePerSqft: 46 },
  { label: "Trex Transcend", brand: "Trex", line: "Transcend", basePerSqft: 60 },
  { label: "Deckorators Vista", brand: "Deckorators", line: "Vista", basePerSqft: 50 },
  { label: "Deckorators Voyage", brand: "Deckorators", line: "Voyage", basePerSqft: 54 },
  { label: "Deckorators Venture", brand: "Deckorators", line: "Venture", basePerSqft: 48 },
];

export interface DeckColor {
  label: string;
  brand: string;
  line: string;
  color: string;
  swatch: string;
}
export const deckColors: DeckColor[] = [
  { label: "Deckorators Voyage — Costa", brand: "Deckorators", line: "Voyage", color: "Costa", swatch: "#7d7468" },
  { label: "Deckorators Voyage — Sierra", brand: "Deckorators", line: "Voyage", color: "Sierra", swatch: "#8a6f56" },
  { label: "Trex Transcend — Island Mist", brand: "Trex", line: "Transcend", color: "Island Mist", swatch: "#9aa0a0" },
  { label: "Trex Select — Saddle", brand: "Trex", line: "Select", color: "Saddle", swatch: "#6e5236" },
  { label: "Trex Transcend — Spiced Rum", brand: "Trex", line: "Transcend", color: "Spiced Rum", swatch: "#6b4a32" },
  { label: "Deckorators Vista — Driftwood", brand: "Deckorators", line: "Vista", color: "Driftwood", swatch: "#8f8a82" },
];

export interface Priced { label: string; add: number; }
export const railingOptions: Priced[] = [
  { label: "No railing", add: 0 },
  { label: "Black aluminum railing", add: 2400 },
  { label: "White vinyl railing", add: 1800 },
  { label: "Composite railing", add: 2100 },
  { label: "Cable railing", add: 3600 },
];

export const stairOptions: Priced[] = [
  { label: "No stairs", add: 0 },
  { label: "Standard stairs", add: 1200 },
  { label: "Open concept stairs", add: 1800 },
  { label: "Stairs with landing", add: 2600 },
];

export interface AddOn extends Priced { key: string; service?: boolean; }
export const addOnOptions: AddOn[] = [
  { key: "fascia", label: "Matching fascia", add: 650 },
  { key: "skirt", label: "Horizontal deck board skirt", add: 1900 },
  { key: "picture_frame", label: "Picture frame border", add: 900 },
  { key: "hidden_fasteners", label: "Hidden fasteners", add: 700 },
  { key: "stair_lights", label: "Low voltage stair lights", add: 600 },
  { key: "post_lights", label: "Low voltage post lights", add: 750 },
  { key: "delivery", label: "Delivery request", add: 85, service: true },
  { key: "install", label: "Contractor installation request", add: 0, service: true },
];

export const timelineOptions = [
  "ASAP",
  "30-60 days",
  "60-90 days",
  "Spring 2026",
  "Just exploring",
];

// ── Selections ────────────────────────────────────────────────────────────────
export interface EstimatorSelections {
  projectType: string;
  sizeLabel: string;
  heightLabel: string;
  lineLabel: string;
  colorLabel: string;
  railingLabel: string;
  stairsLabel: string;
  addOns: string[]; // add-on labels
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  timeline: string;
  who: string; // "Homeowner" | "Contractor"
  needInstall: string; // "Yes" | "No" | "Not sure"
}

export const emptySelections: EstimatorSelections = {
  projectType: "",
  sizeLabel: "",
  heightLabel: "",
  lineLabel: "",
  colorLabel: "",
  railingLabel: "",
  stairsLabel: "",
  addOns: [],
  fullName: "",
  email: "",
  phone: "",
  city: "",
  address: "",
  timeline: "",
  who: "Homeowner",
  needInstall: "Not sure",
};

const findSize = (l: string) => deckSizes.find((s) => s.label === l);
const findLine = (l: string) => deckingLines.find((s) => s.label === l);

// ── Estimated material range ───────────────────────────────────────────────────
export function estimateRange(sel: EstimatorSelections): { low: number; high: number } | null {
  const size = findSize(sel.sizeLabel);
  const line = findLine(sel.lineLabel);
  if (!size || !line) return null;

  let total = size.area * line.basePerSqft;
  total += railingOptions.find((r) => r.label === sel.railingLabel)?.add ?? 0;
  total += stairOptions.find((s) => s.label === sel.stairsLabel)?.add ?? 0;
  for (const a of sel.addOns) {
    total += addOnOptions.find((o) => o.label === a)?.add ?? 0;
  }

  const round = (n: number) => Math.round(n / 100) * 100;
  return { low: round(total * 0.92), high: round(total * 1.08) };
}

export function formatUSD(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function formatRange(r: { low: number; high: number } | null) {
  if (!r) return "—";
  return `${formatUSD(r.low)} – ${formatUSD(r.high)}`;
}

// ── Detailed BOM (planning list) ────────────────────────────────────────────────
export interface BomRow { category: string; item: string; qty: string; }

export function generateBom(sel: EstimatorSelections): BomRow[] {
  const size = findSize(sel.sizeLabel);
  const line = findLine(sel.lineLabel);
  if (!size || !line) return [];

  const { w: W, d: D, area: A } = size;
  const perimeter = 2 * (W + D);
  const height = deckHeights.find((h) => h.label === sel.heightLabel);
  const hasAddon = (label: string) => sel.addOns.includes(label);

  const joists = Math.ceil(W * 0.75) + 1;
  const beams = Math.max(2, Math.ceil(D / 10));
  const posts = beams * (Math.ceil(W / 6) + 1);
  const deckingBoards = Math.ceil((A / 9.17) * 1.1);
  const colorName = sel.colorLabel || `${line.brand} ${line.line}`;

  const rows: BomRow[] = [];
  rows.push({ category: "Decking boards", item: `${line.brand} ${line.line} decking — ${sel.colorLabel ? sel.colorLabel.split("— ")[1] ?? colorName : "selected color"}, 20'`, qty: `${deckingBoards} boards` });

  if (hasAddon("Matching fascia")) {
    rows.push({ category: "Fascia boards", item: `${line.brand} ${line.line} fascia, 12'`, qty: `${Math.ceil((perimeter / 11) * 1.1)} boards` });
  }
  if (hasAddon("Horizontal deck board skirt")) {
    const skirtFt = height?.skirtFt ?? 1;
    const skirtBoards = Math.ceil(((perimeter * skirtFt) / 9.17) * 1.1);
    rows.push({ category: "Skirting boards", item: `${line.brand} ${line.line} deck-board skirt, 20'`, qty: `${skirtBoards} boards` });
  }

  rows.push({ category: "Joists / framing", item: `2x8 PT SYP joists, ~${D}' (16\" OC)`, qty: `${joists} pcs` });
  rows.push({ category: "Beams", item: `2x10 PT SYP beam stock`, qty: `${beams * 2} pcs` });
  rows.push({ category: "Posts", item: `6x6 PT posts`, qty: `${posts} pcs` });
  rows.push({ category: "Concrete footings", item: `12" footing tube + concrete`, qty: `${posts} sets` });

  if (sel.railingLabel && sel.railingLabel !== "No railing") {
    const railLf = Math.max(0, perimeter - W);
    const sections = Math.ceil(railLf / 6);
    rows.push({ category: "Railing sections / kits", item: `${sel.railingLabel} — 6' sections`, qty: `${sections} sections` });
    rows.push({ category: "Railing posts", item: `Rail posts (incl. corners)`, qty: `${sections + 1} posts` });
  }

  if (sel.stairsLabel && sel.stairsLabel !== "No stairs") {
    const steps = Math.max(3, Math.round((height?.skirtFt ?? 4) * 1.5));
    rows.push({ category: "Stair components", item: `Stringers + ${sel.stairsLabel.toLowerCase()}`, qty: `3 stringers` });
    rows.push({ category: "Stair treads", item: `${line.brand} ${line.line} composite treads`, qty: `${steps} treads` });
  }

  if (hasAddon("Hidden fasteners") || line.brand === "Trex" || line.brand === "Deckorators") {
    rows.push({ category: "Hidden fasteners", item: `Hidden fastener system`, qty: `${Math.ceil(A / 80)} boxes` });
  }
  rows.push({ category: "Structural hardware / connectors", item: `Joist hangers, post bases, post caps, structural screws`, qty: `1 lot` });

  if (hasAddon("Low voltage stair lights")) {
    const steps = Math.max(3, Math.round((height?.skirtFt ?? 4) * 1.5));
    rows.push({ category: "Low voltage lighting", item: `Low-voltage stair lights`, qty: `${steps} lights` });
  }
  if (hasAddon("Low voltage post lights")) {
    const railLf = Math.max(0, perimeter - W);
    rows.push({ category: "Low voltage lighting", item: `Low-voltage post cap lights`, qty: `${Math.ceil(railLf / 6) + 1} lights` });
  }
  if ((hasAddon("Low voltage stair lights") || hasAddon("Low voltage post lights"))) {
    rows.push({ category: "Low voltage lighting", item: `Low-voltage transformer + wiring`, qty: `1 kit` });
  }

  rows.push({ category: "Miscellaneous accessories", item: `Post sleeves, trim, sealant, blocking`, qty: `1 lot` });
  rows.push({ category: "Waste factor", item: `10% — included in board & framing quantities`, qty: `+10%` });

  return rows;
}

// ── Lead record ─────────────────────────────────────────────────────────────────
export type LeadSource = "Website Estimator" | "Wehrung's Showroom Demo";

export function buildLead(sel: EstimatorSelections, opts: {
  source: LeadSource;
  bomStatus: "locked" | "unlocked" | "demo";
  wantsPro: boolean;
  wantsDrawings: boolean;
  wants3d: boolean;
  notes: string;
  reference: string;
}) {
  const range = estimateRange(sel);
  return {
    lead_id: opts.reference,
    created_date: new Date().toISOString(),
    source: opts.source,
    full_name: sel.fullName,
    email: sel.email,
    phone: sel.phone,
    city: sel.city,
    address_optional: sel.address,
    timeline: sel.timeline,
    user_type: sel.who,
    needs_installation: sel.needInstall,
    project_type: sel.projectType,
    deck_size: sel.sizeLabel,
    deck_height: sel.heightLabel,
    decking_brand: findLine(sel.lineLabel)?.brand ?? "",
    decking_line: findLine(sel.lineLabel)?.line ?? "",
    decking_color: sel.colorLabel,
    railing_type: sel.railingLabel,
    stairs: sel.stairsLabel,
    add_ons: sel.addOns,
    estimated_material_range: range ? `${formatUSD(range.low)} - ${formatUSD(range.high)}` : "",
    bom_status: opts.bomStatus,
    wants_pro_contact: opts.wantsPro,
    wants_permit_ready_drawings: opts.wantsDrawings,
    wants_3d_renderings: opts.wants3d,
    notes: opts.notes,
    status: "New Lead",
  };
}

export function makeReference() {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `DM-${new Date().getFullYear()}-${rand}`;
}
