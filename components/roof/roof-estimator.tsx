"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Hexagon, Printer, Home, Flame, PanelTop, Layers } from "lucide-react";
import {
  beamTotalLf, roofGeometry, rafters, roofPerimeterLf, sheathing, chamClad,
  asphaltShingles, fireplace, fireplaceStoneAreas,
  type RoofInput, type RoofType, type RoofAttachment, type FireplaceStoneSelection,
} from "@/lib/roof-calculations";

type RoofingMaterial = "asphalt" | "metal";

interface BomLine { id: string; item: string; calc: number; unit: string; note?: string; }
interface BomGroup { title: string; icon: React.ComponentType<{ className?: string }>; lines: BomLine[]; }

const n = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

export function RoofEstimator() {
  // ── Roof ──
  const [roofType, setRoofType] = useState<RoofType>("gable");
  const [width, setWidth] = useState(24);
  const [length, setLength] = useState(16);
  const [pitch, setPitch] = useState(6);
  const [attachment, setAttachment] = useState<RoofAttachment>("freestanding");
  // overhangs
  const [oL, setOL] = useState(1), [oR, setOR] = useState(1), [oF, setOF] = useState(1), [oRear, setORear] = useState(0);
  const [sheathingWaste, setSheathingWaste] = useState(4);

  // ── Roofing ──
  const [roofing, setRoofing] = useState<RoofingMaterial>("asphalt");
  const [underlaymentCov, setUnderlaymentCov] = useState(1000);
  const [dripStock, setDripStock] = useState(10);
  const [valleyLf, setValleyLf] = useState(0);
  const [wallLf, setWallLf] = useState(0);
  const [metalNotes, setMetalNotes] = useState("");

  // ── Ceiling / ChamClad ──
  const [includeChamclad, setIncludeChamclad] = useState(false);
  const [panelCov, setPanelCov] = useState(1);
  const [hStock, setHStock] = useState(12);

  // ── Fireplace ──
  const [includeFp, setIncludeFp] = useState(false);
  const [fpW, setFpW] = useState(6), [fpH, setFpH] = useState(8), [fpD, setFpD] = useState(2);
  const [fpOW, setFpOW] = useState(3), [fpOH, setFpOH] = useState(2);
  const [fpSides, setFpSides] = useState<0 | 1 | 2>(2);
  const [fpStonePiece, setFpStonePiece] = useState<FireplaceStoneSelection>("none");
  const [stoneBoxCov, setStoneBoxCov] = useState<number | "">("");
  const [adhesiveCov, setAdhesiveCov] = useState(75);

  // override store (lineId -> string)
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const setOverride = (id: string, v: string) => setOverrides((o) => ({ ...o, [id]: v }));
  const finalOf = (l: BomLine) => {
    const ov = overrides[l.id];
    return ov !== undefined && ov !== "" ? Number(ov) : l.calc;
  };

  const input: RoofInput = useMemo(() => ({
    roof_type: roofType, roof_width_ft: width, roof_length_ft: length, roof_pitch_rise: pitch,
    attachment, overhangs: { side_overhang_left_ft: oL, side_overhang_right_ft: oR, front_overhang_ft: oF, rear_overhang_ft: oRear },
  }), [roofType, width, length, pitch, attachment, oL, oR, oF, oRear]);

  const geo = useMemo(() => roofGeometry(input), [input]);
  const raf = useMemo(() => rafters(input), [input]);
  const sh = useMemo(() => sheathing(input, sheathingWaste), [input, sheathingWaste]);
  const beams = useMemo(() => beamTotalLf(input), [input]);
  const perim = useMemo(() => roofPerimeterLf(input), [input]);
  const cc = useMemo(() => (includeChamclad ? chamClad(input, { panel_coverage_width_ft: panelCov, h_channel_stock_length_ft: hStock }) : null), [input, includeChamclad, panelCov, hStock]);
  const asp = useMemo(() => (roofing === "asphalt" ? asphaltShingles(input, {
    underlayment_roll_coverage_sqft: underlaymentCov, drip_edge_stock_length_ft: dripStock,
    ice_water_valley_length_ft: valleyLf, ice_water_wall_intersection_length_ft: wallLf,
  }) : null), [input, roofing, underlaymentCov, dripStock, valleyLf, wallLf]);
  const fp = useMemo(() => (includeFp ? fireplace(
    { fireplace_total_width_ft: fpW, fireplace_total_height_ft: fpH, fireplace_total_depth_ft: fpD, fireplace_opening_width_ft: fpOW, fireplace_opening_height_ft: fpOH, stone_sides: fpSides, stone_piece_selection: fpStonePiece },
    { stone_coverage_per_box_sqft: typeof stoneBoxCov === "number" ? stoneBoxCov : undefined, veneer_adhesive_coverage_sqft: adhesiveCov }
  ) : null), [includeFp, fpW, fpH, fpD, fpOW, fpOH, fpSides, fpStonePiece, stoneBoxCov, adhesiveCov]);

  // ── Build BOM groups ──
  const groups: BomGroup[] = useMemo(() => {
    const g: BomGroup[] = [];

    g.push({ title: "Roof Framing & Structure", icon: Home, lines: [
      { id: "beam", item: `Beam stock${roofType === "gable" ? " (width + length × 3)" : ""}`, calc: beams, unit: "lin ft", note: "Original dims, no overhang" },
      { id: "rafter", item: `Rafters — ${raf.recommended_rafter_size} @ ${n(raf.rafter_length_ft, 1)}'`, calc: raf.rafter_quantity, unit: "pcs" },
      { id: "perim2x6", item: "2×6 perimeter framing", calc: Math.ceil(perim), unit: "lin ft" },
      { id: "fascia", item: "1×8 fascia", calc: Math.ceil(perim), unit: "lin ft" },
      { id: "sheath", item: `Roof sheathing (incl. +${sheathingWaste} waste)`, calc: sh.sheathing_quantity, unit: "sheets" },
    ]});

    if (cc) {
      const r = cc.recommended;
      const panels = r.rows * r.segments_per_row;
      const lines: BomLine[] = [
        { id: "cc_panel", item: `ChamClad panels — ${r.recommended_panel_length_ft}' (Option ${r.label}: ${r.description.toLowerCase()})`, calc: panels, unit: "panels" },
      ];
      if (r.seam_required && r.h_channel_quantity > 0) {
        lines.push({ id: "cc_h", item: `H-channel — ${n(r.h_channel_total_lf, 0)} lf total`, calc: r.h_channel_quantity, unit: "pcs", note: `${r.h_channel_lines} seam line(s)` });
      }
      g.push({ title: `ChamClad Ceiling — ${r.seam_required ? "seam required" : "seam-free"}`, icon: PanelTop, lines });
    }

    if (asp) {
      const lines: BomLine[] = [
        { id: "shingles", item: `Shingle bundles (~${n(asp.roofing_squares, 1)} sq, 15% waste)`, calc: asp.shingle_bundle_quantity, unit: "bundles" },
        { id: "underlay", item: "Synthetic underlayment", calc: asp.underlayment_quantity ?? 0, unit: "rolls" },
        { id: "icewater", item: "Ice & water shield", calc: Math.ceil(asp.ice_water_total_lf), unit: "lin ft" },
        { id: "drip", item: "Aluminum drip edge (10% waste)", calc: asp.drip_edge_quantity ?? 0, unit: "pcs" },
        { id: "starter", item: "Starter shingle strip (10% waste)", calc: Math.ceil(asp.starter_order_lf), unit: "lin ft" },
        { id: "nails", item: "Galvanized coil roofing nails", calc: asp.roofing_nail_boxes, unit: "boxes" },
        { id: "sealant", item: "Exterior roofing sealant", calc: 1, unit: "box" },
      ];
      if (asp.ridge_cap_lf > 0) lines.splice(5, 0, { id: "ridge", item: "Ridge cap shingles", calc: Math.ceil(asp.ridge_cap_lf), unit: "lin ft" });
      if (asp.include_headwall_flashing) lines.push({ id: "headwall", item: "Headwall flashing (attached)", calc: Math.ceil(asp.headwall_flashing_lf), unit: "lin ft" });
      g.push({ title: "Asphalt Roofing", icon: Layers, lines });
    }

    if (fp) {
      const lines: BomLine[] = [
        { id: "fp_stud", item: "20-ga metal stud 3.5\"×10'", calc: fp.metal_stud_quantity, unit: "pcs" },
        { id: "fp_track", item: "20-ga metal track 3.5\"×10' (10% waste)", calc: fp.metal_track_quantity, unit: "pcs" },
        { id: "fp_cb", item: "Cement board 3'×5'×½\" (10% waste)", calc: fp.cement_board_quantity, unit: "boards" },
        { id: "fp_screw", item: "Cement board screws", calc: fp.cement_board_screw_box_quantity, unit: "boxes" },
        { id: "fp_stone", item: `MSI stone veneer${fp.stone_box_quantity === null ? ` — enter box coverage (need ${n(fp.fireplace_stone_order_sqft, 1)} sqft)` : ""}`, calc: fp.stone_box_quantity ?? 0, unit: "boxes", note: `Order area ${n(fp.fireplace_stone_order_sqft, 1)} sqft (15% waste)` },
        { id: "fp_adh", item: "Stone veneer adhesive", calc: fp.veneer_adhesive_quantity ?? 0, unit: "units" },
      ];
      if (fp.fireplace_stone_piece_quantity > 0) lines.push({ id: "fp_piece", item: `Fireplace stone 2"×12"×72" (${fpStonePiece.replace("_", " & ")})`, calc: fp.fireplace_stone_piece_quantity, unit: "pcs" });
      lines.push({ id: "fp_appl", item: "Ventless gas fireplace appliance", calc: 1, unit: "ea", note: "Model TBC — manual select" });
      g.push({ title: "Fireplace (Ventless)", icon: Flame, lines });
    }

    return g;
  }, [roofType, beams, raf, perim, sh, sheathingWaste, cc, asp, fp, fpStonePiece]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur px-4 py-3 print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"><Hexagon className="h-4.5 w-4.5 text-primary-foreground" /></div>
            <div>
              <div className="text-sm font-bold tracking-tight">Deckmetry</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Roof Estimator</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Internal</span>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print / Export</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          {/* ── FORM ── */}
          <div className="space-y-5 print:hidden">
            <Card>
              <CardHeader><CardTitle className="text-base">Roof</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Seg label="Roof type" value={roofType} onChange={(v) => setRoofType(v as RoofType)} options={[["gable", "Gable"], ["shed", "Shed"]]} />
                <div className="grid grid-cols-3 gap-3">
                  <Num label="Width (ft)" value={width} onChange={setWidth} />
                  <Num label="Length (ft)" value={length} onChange={setLength} />
                  <Num label="Pitch (rise/12)" value={pitch} onChange={setPitch} />
                </div>
                <Seg label="Attachment" value={attachment} onChange={(v) => setAttachment(v as RoofAttachment)} options={[["freestanding", "Freestanding"], ["attached", "Attached to house"]]} />
              </CardContent>
            </Card>

            <details className="rounded-xl border bg-card">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Roof Overhangs</summary>
              <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                <Num label="Left (ft)" value={oL} onChange={setOL} />
                <Num label="Right (ft)" value={oR} onChange={setOR} />
                <Num label="Front (ft)" value={oF} onChange={setOF} />
                <Num label="Rear (ft)" value={oRear} onChange={setORear} />
                <Num label="Sheathing waste (sheets)" value={sheathingWaste} onChange={setSheathingWaste} />
              </div>
            </details>

            <Card>
              <CardHeader><CardTitle className="text-base">Roofing Material</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Seg label="Type" value={roofing} onChange={(v) => setRoofing(v as RoofingMaterial)} options={[["asphalt", "Asphalt Shingles"], ["metal", "Metal (coming later)"]]} />
                {roofing === "asphalt" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Num label="Underlayment roll (sqft)" value={underlaymentCov} onChange={setUnderlaymentCov} />
                    <Num label="Drip edge stock (ft)" value={dripStock} onChange={setDripStock} />
                    <Num label="Valley length (ft)" value={valleyLf} onChange={setValleyLf} />
                    <Num label="Wall intersection (ft)" value={wallLf} onChange={setWallLf} />
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs">Manual metal materials & notes</Label>
                    <textarea value={metalNotes} onChange={(e) => setMetalNotes(e.target.value)} rows={3} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="Metal roofing — coming later. Add manual materials/notes here." />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">ChamClad Ceiling</CardTitle>
                <Toggle on={includeChamclad} onClick={() => setIncludeChamclad((v) => !v)} />
              </CardHeader>
              {includeChamclad && (
                <CardContent className="grid grid-cols-2 gap-3">
                  <Num label="Panel coverage (ft)" value={panelCov} onChange={setPanelCov} step={0.5} />
                  <Num label="H-channel stock (ft)" value={hStock} onChange={setHStock} />
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Fireplace (Ventless)</CardTitle>
                <Toggle on={includeFp} onClick={() => setIncludeFp((v) => !v)} />
              </CardHeader>
              {includeFp && (
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <Num label="Width (ft)" value={fpW} onChange={setFpW} />
                    <Num label="Height (ft)" value={fpH} onChange={setFpH} />
                    <Num label="Depth (ft)" value={fpD} onChange={setFpD} />
                    <Num label="Opening W (ft)" value={fpOW} onChange={setFpOW} />
                    <Num label="Opening H (ft)" value={fpOH} onChange={setFpOH} />
                    <Num label="Adhesive cov (sqft)" value={adhesiveCov} onChange={setAdhesiveCov} />
                  </div>
                  <Seg label="Stone sides" value={String(fpSides)} onChange={(v) => setFpSides(Number(v) as 0 | 1 | 2)} options={[["2", "Both"], ["1", "One"], ["0", "None"]]} />
                  <Seg label="Hearth / Mantel stone" value={fpStonePiece} onChange={(v) => setFpStonePiece(v as FireplaceStoneSelection)} options={[["none", "None"], ["hearth", "Hearth"], ["mantel", "Mantel"], ["hearth_and_mantel", "Both"]]} />
                  <Num label="MSI stone box coverage (sqft) — leave blank if TBC" value={stoneBoxCov === "" ? 0 : stoneBoxCov} onChange={(v) => setStoneBoxCov(v === 0 ? "" : v)} allowZeroBlank />
                </CardContent>
              )}
            </Card>
          </div>

          {/* ── MATERIAL LIST ── */}
          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-base">Roof Summary</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                <Stat label="Effective W × L" value={`${n(geo.effective_roof_width_ft, 0)}′ × ${n(geo.effective_roof_length_ft, 0)}′`} />
                <Stat label="Rafter length" value={`${n(geo.roof_diagonal_ft, 1)}′`} />
                <Stat label="Roof area" value={`${n(sh.roof_surface_area_sqft, 0)} sqft`} />
                <Stat label="Beam total" value={`${n(beams, 0)} lf`} />
              </CardContent>
            </Card>

            {groups.map((grp) => (
              <Card key={grp.title} className="print:break-inside-avoid">
                <CardHeader className="flex flex-row items-center gap-2">
                  <grp.icon className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">{grp.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="px-3 py-2 font-semibold">Item</th>
                          <th className="px-3 py-2 text-right font-semibold">Calc</th>
                          <th className="px-3 py-2 text-right font-semibold print:hidden">Override</th>
                          <th className="px-3 py-2 text-right font-semibold">Final</th>
                          <th className="px-3 py-2 font-semibold">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grp.lines.map((l) => (
                          <tr key={l.id} className="border-b last:border-0 align-top">
                            <td className="px-3 py-2">
                              <div className="font-medium">{l.item}</div>
                              {l.note && <div className="text-xs text-muted-foreground">{l.note}</div>}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{n(l.calc, l.calc % 1 ? 1 : 0)}</td>
                            <td className="px-3 py-2 text-right print:hidden">
                              <input type="number" value={overrides[l.id] ?? ""} placeholder="—" onChange={(e) => setOverride(l.id, e.target.value)}
                                className="w-20 rounded border px-2 py-1 text-right text-sm" />
                            </td>
                            <td className="px-3 py-2 text-right font-semibold tabular-nums">{n(finalOf(l), finalOf(l) % 1 ? 1 : 0)}</td>
                            <td className="px-3 py-2 text-muted-foreground">{l.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}

            {roofing === "metal" && (
              <Card><CardContent className="py-5 text-sm text-muted-foreground">Metal roofing BOM is <strong>coming later</strong>. Use the manual notes field — no metal-roof materials are auto-generated.{metalNotes && <div className="mt-2 whitespace-pre-wrap rounded bg-muted/40 p-3 text-foreground">{metalNotes}</div>}</CardContent></Card>
            )}

            <p className="text-xs text-muted-foreground print:mt-4">
              Preliminary material list for budgeting. Verify spans, code compliance, and engineering before ordering. Quantities are editable via Override.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── small inputs ──
function Num({ label, value, onChange, step = 1, allowZeroBlank }: { label: string; value: number; onChange: (v: number) => void; step?: number; allowZeroBlank?: boolean }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type="number" step={step} value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(e.target.value === "" ? (allowZeroBlank ? 0 : 0) : Number(e.target.value))} className="h-9" />
    </div>
  );
}
function Seg({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, lbl]) => (
          <button key={v} onClick={() => onChange(v)} className={cn("rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors", value === v ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted")}>{lbl}</button>
        ))}
      </div>
    </div>
  );
}
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={cn("h-6 w-11 rounded-full transition-colors", on ? "bg-primary" : "bg-muted")}><span className={cn("block h-5 w-5 rounded-full bg-white shadow transition-transform", on ? "translate-x-5" : "translate-x-0.5")} /></button>;
}
function Stat({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className="text-base font-bold">{value}</div></div>;
}
