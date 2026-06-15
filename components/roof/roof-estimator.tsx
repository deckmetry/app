"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Hexagon, Printer, Home, Footprints, Flame, PanelTop, CheckCircle2, Plus, Trash2, RotateCcw } from "lucide-react";
import {
  beamTotalLf, roofGeometry, rafters, roofPerimeterLf, sheathing, chamClad,
  asphaltShingles, fireplace,
  type RoofInput, type RoofType, type RoofAttachment, type FireplaceStoneSelection,
} from "@/lib/roof-calculations";

type RoofingMaterial = "asphalt" | "metal";

const CHAMCLAD_BRAND = "ChamClad";
const CHAMCLAD_COLORS: { name: string; img: string }[] = [
  { name: "Atlantic White", img: "/chamclad/Atlantic-White.jpeg" },
  { name: "Sunbleached Oak", img: "/chamclad/Sunbleached-Oak.jpg" },
  { name: "Sugar Maple", img: "/chamclad/Sugar-Maple.jpg" },
  { name: "Manhattan Natural Oak", img: "/chamclad/Manhattan-Natural-Oak.jpg" },
  { name: "Barrel Oak", img: "/chamclad/Barrel-Oak.jpeg" },
  { name: "Chai Cedar", img: "/chamclad/Chai-Cedar.jpg" },
  { name: "Toffee", img: "/chamclad/Toffee.jpg" },
  { name: "Cinnamon Walnut", img: "/chamclad/Cinnamon-Walnut-Film-Sample.jpg" },
];

// distinct color per BOM section header
const GROUP_COLORS: Record<string, string> = {
  BEAM: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  RAFTERS: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
  FASCIA: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  SHEATHING: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  HARDWARE: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  "ROOF CEILING": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200",
  ROOFING: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  "OPTIONAL ITEMS": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
  "FIREPLACE (OPTIONAL)": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};
const groupColor = (t: string) => GROUP_COLORS[t] ?? "bg-muted text-foreground";

// Standard lumber stock lengths (ft) used for the editable Size column.
const STOCK_LENGTHS = [8, 10, 12, 14, 16, 18, 20];
const stockLen = (ft: number) => STOCK_LENGTHS.find((s) => s >= ft) ?? 20;
const piecesFor = (totalLf: number, stock = 16) => Math.max(1, Math.ceil(totalLf / stock));

interface Line { id: string; description: string; size: string; brand: string; color: string; qty: number; unit: string; }
interface Group { title: string; lines: Line[]; }

const n = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `l-${Math.random().toString(36).slice(2)}`);

export function RoofEstimator() {
  // Project
  const [projectName, setProjectName] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  // Roof
  const [roofType, setRoofType] = useState<RoofType>("gable");
  const [width, setWidth] = useState(24);
  const [length, setLength] = useState(16);
  const [pitch, setPitch] = useState(6);
  const [attachment, setAttachment] = useState<RoofAttachment>("freestanding");
  const [oL, setOL] = useState(1), [oR, setOR] = useState(1), [oF, setOF] = useState(1), [oRear, setORear] = useState(0);
  const [sheathingWaste, setSheathingWaste] = useState(4);
  // Roofing
  const [roofing, setRoofing] = useState<RoofingMaterial>("asphalt");
  const [underlaymentCov, setUnderlaymentCov] = useState(1000);
  const [dripStock, setDripStock] = useState(10);
  const [valleyLf, setValleyLf] = useState(0);
  const [wallLf, setWallLf] = useState(0);
  const [metalNotes, setMetalNotes] = useState("");
  // Roof ceiling (always included)
  const [chamColor, setChamColor] = useState(CHAMCLAD_COLORS[0].name);
  const [panelCov, setPanelCov] = useState(1);
  const [hStock, setHStock] = useState(12);
  // Optional
  const [includeGutters, setIncludeGutters] = useState(false);
  const [includeRidgeVent, setIncludeRidgeVent] = useState(false);
  const [optionalNotes, setOptionalNotes] = useState("");
  // Fireplace
  const [includeFp, setIncludeFp] = useState(false);
  const [fpW, setFpW] = useState(6), [fpH, setFpH] = useState(8), [fpD, setFpD] = useState(2);
  const [fpOW, setFpOW] = useState(3), [fpOH, setFpOH] = useState(2);
  const [fpSides, setFpSides] = useState<0 | 1 | 2>(2);
  const [fpStonePiece, setFpStonePiece] = useState<FireplaceStoneSelection>("none");
  const [stoneBoxCov, setStoneBoxCov] = useState<number | "">("");
  const [adhesiveCov, setAdhesiveCov] = useState(75);

  const input: RoofInput = useMemo(() => ({
    roof_type: roofType, roof_width_ft: width, roof_length_ft: length, roof_pitch_rise: pitch,
    attachment, overhangs: { side_overhang_left_ft: oL, side_overhang_right_ft: oR, front_overhang_ft: oF, rear_overhang_ft: oRear },
  }), [roofType, width, length, pitch, attachment, oL, oR, oF, oRear]);

  const geo = useMemo(() => roofGeometry(input), [input]);
  const sh = useMemo(() => sheathing(input, sheathingWaste), [input, sheathingWaste]);

  // Build the seed BOM from the current calculations
  const seed: Group[] = useMemo(() => {
    const raf = rafters(input);
    const beams = beamTotalLf(input);
    const perim = Math.ceil(roofPerimeterLf(input));
    const cc = chamClad(input, { panel_coverage_width_ft: panelCov, h_channel_stock_length_ft: hStock });
    const r = cc.recommended;
    const panels = r.rows * r.segments_per_row;
    const asp = roofing === "asphalt" ? asphaltShingles(input, {
      underlayment_roll_coverage_sqft: underlaymentCov, drip_edge_stock_length_ft: dripStock,
      ice_water_valley_length_ft: valleyLf, ice_water_wall_intersection_length_ft: wallLf,
    }) : null;
    const fp = includeFp ? fireplace(
      { fireplace_total_width_ft: fpW, fireplace_total_height_ft: fpH, fireplace_total_depth_ft: fpD, fireplace_opening_width_ft: fpOW, fireplace_opening_height_ft: fpOH, stone_sides: fpSides, stone_piece_selection: fpStonePiece },
      { stone_coverage_per_box_sqft: typeof stoneBoxCov === "number" ? stoneBoxCov : undefined, veneer_adhesive_coverage_sqft: adhesiveCov }
    ) : null;

    const L = (description: string, size: string, qty: number, unit: string, brand = "", color = ""): Line =>
      ({ id: uid(), description, size, brand, color, qty, unit });
    const ft = (x: number) => `${x}'`;
    const ledgerPcs = attachment === "attached" ? Math.max(1, Math.ceil(geo.effective_roof_width_ft / 8)) : 0;
    const groups: Group[] = [];

    groups.push({ title: "FOOTING", lines: [
      L("Concrete 3000 psi", "80lb", 0, "bags"),
      L("Sonotube 16\"", "12'", 0, "Each"),
      L("Sonotube 24\"", "12'", 0, "Each"),
    ]});
    groups.push({ title: "BEAM", lines: [
      L("2x10", "16'", piecesFor(beams, 16), "Each"),
      L("5.25x12 LVL beam", "", 0, "Each"),
      L("3.5x16 LVL beam", "", 0, "Each"),
      L("5.5x16 LVL beam", "", 0, "Each"),
      L("5.25x16 PSL beam", "", 0, "Each"),
    ]});
    groups.push({ title: "RAFTERS", lines: [
      L(raf.recommended_rafter_size, ft(stockLen(raf.rafter_length_ft)), raf.rafter_quantity, "Each"),
    ]});
    groups.push({ title: "FASCIA", lines: [
      L("1x8 PVC", "16'", piecesFor(perim, 16), "Each", "", "White"),
      L("2x6", "16'", piecesFor(perim, 16), "Each"),
      L("1x6 Azek Captive PVC", "16'", 0, "Each", "Azek", "Black"),
      L("1x12 Azek Captive PVC", "16'", 0, "Each", "Azek", "Black"),
      L("1x8 Composite", "12'", 0, "Each", "Trex Select", ""),
      L("Fascia screws", "", 0, "box", "Trex Enhance", ""),
    ]});
    groups.push({ title: "SHEATHING", lines: [
      L("1/2\" CDX plywood", "4x8", sh.sheathing_quantity, "Each"),
    ]});
    groups.push({ title: "HARDWARE", lines: [
      L("Hurricane ties H2.5A", "", raf.rafter_quantity, "Each"),
      L("Rafter hangers", "2x8", 0, "Each"),
      L("Beam hangers HUC210-3", "", 0, "Each"),
      L("ABU66Z post base", "", 0, "Each"),
      L("AC6Z post cap", "", 0, "Each"),
      L("4\" flat head structural screws", "250 ct", ledgerPcs > 0 ? 1 : 1, "Bucket"),
      L("Ledger flashing drip edge", "8'", ledgerPcs, "Each"),
      L("12\" ledger flashing tape", "50'", attachment === "attached" ? 1 : 0, "Each"),
      L("Galvanized ridge strap", "50'", 0, "Each"),
      L("3\" galv. collated framing nails", "2000 ct", 0, "box"),
    ]});
    const ceiling: Line[] = [
      L("ChamClad 1x6 solid soffit", ft(r.recommended_panel_length_ft), panels, "Each", "ChamClad", chamColor),
      L("ChamClad J-Channel", ft(r.recommended_panel_length_ft), 0, "Each", "ChamClad", chamColor),
      L("ChamClad screws", "", 0, "box", "ChamClad"),
      L("ChamClad column wrap", "10'", 0, "Each", "ChamClad"),
    ];
    if (r.seam_required && r.h_channel_quantity > 0) ceiling.push(L("H-channel", ft(hStock), r.h_channel_quantity, "Each", "ChamClad", chamColor));
    groups.push({ title: "ROOF CEILING", lines: ceiling });

    if (asp) {
      const roof: Line[] = [
        L("Shingle bundles (15% waste)", "", asp.shingle_bundle_quantity, "bundles"),
        L("Synthetic underlayment", "", asp.underlayment_quantity ?? 0, "rolls"),
        L("Grace ice & water shield", "", Math.ceil(asp.ice_water_total_lf), "lin ft"),
        L("Aluminum drip edge (10% waste)", ft(dripStock), asp.drip_edge_quantity ?? 0, "Each"),
        L("Starter shingle strip (10% waste)", "", Math.ceil(asp.starter_order_lf), "lin ft"),
        L("Galvanized coil roofing nails", "", asp.roofing_nail_boxes, "box"),
        L("Exterior roofing sealant", "", 1, "box"),
      ];
      if (asp.ridge_cap_lf > 0) roof.splice(5, 0, L("Ridge cap shingles", "", Math.ceil(asp.ridge_cap_lf), "lin ft"));
      if (asp.include_headwall_flashing) roof.push(L("Headwall flashing", "", Math.ceil(asp.headwall_flashing_lf), "lin ft"));
      groups.push({ title: "ROOFING", lines: roof });
    } else {
      groups.push({ title: "ROOFING", lines: [L(metalNotes || "Metal roofing — manual (coming later)", "", 0, "—")] });
    }

    groups.push({ title: "ELECTRICAL", lines: [
      L("Tru-Scapes Dot Light TS-15DOT-SS", "", 0, "Each"),
      L("Post Cap Light TS-C125", "", 0, "Each", "", "TBD"),
    ]});

    const opt: Line[] = [];
    if (includeGutters) opt.push(L("Gutters & downspouts", "", perim, "lin ft"));
    if (includeRidgeVent && roofType === "gable") opt.push(L("Ridge vent", "", Math.ceil(geo.effective_roof_length_ft), "lin ft"));
    if (optionalNotes) opt.push(L(optionalNotes, "", 1, "Each"));
    if (opt.length === 0) opt.push(L("No optional items", "", 0, "—"));
    groups.push({ title: "OPTIONAL ITEMS", lines: opt });

    if (fp) {
      const f: Line[] = [
        L("20-ga metal stud 3.5\"", "10'", fp.metal_stud_quantity, "Each"),
        L("20-ga metal track 3.5\" (10% waste)", "10'", fp.metal_track_quantity, "Each"),
        L("3x5 cement board ½\" (10% waste)", "", fp.cement_board_quantity, "Each"),
        L("Cement board screws", "", fp.cement_board_screw_box_quantity, "box"),
        L(`MSI stone veneer${fp.stone_box_quantity === null ? " (enter box coverage)" : ""}`, "", fp.stone_box_quantity ?? 0, "box", "MSI", "TBC"),
        L("Stone veneer adhesive", "", fp.veneer_adhesive_quantity ?? 0, "Each"),
      ];
      if (fp.fireplace_stone_piece_quantity > 0) f.push(L(`Fireplace stone 2x12 (${fpStonePiece.replace("_", " & ")})`, "6'", fp.fireplace_stone_piece_quantity, "Each", "", "TBC"));
      f.push(L("Ventless gas fireplace appliance", "", 1, "Each"));
      groups.push({ title: "FIREPLACE (OPTIONAL)", lines: f });
    }
    return groups;
  }, [input, panelCov, hStock, roofing, underlaymentCov, dripStock, valleyLf, wallLf, includeFp, fpW, fpH, fpD, fpOW, fpOH, fpSides, fpStonePiece, stoneBoxCov, adhesiveCov, roofType, attachment, chamColor, metalNotes, includeGutters, includeRidgeVent, optionalNotes, sheathingWaste, sh, geo]);

  // Editable working BOM (seeded once; regenerate to refresh from inputs)
  const [bom, setBom] = useState<Group[]>(seed);
  const updateLine = (gi: number, li: number, field: keyof Line, val: string | number) =>
    setBom((b) => b.map((g, i) => (i !== gi ? g : { ...g, lines: g.lines.map((l, j) => (j !== li ? l : { ...l, [field]: val })) })));
  const addLine = (gi: number) =>
    setBom((b) => b.map((g, i) => (i !== gi ? g : { ...g, lines: [...g.lines, { id: uid(), description: "", size: "", brand: "", color: "", qty: 0, unit: "" }] })));
  const removeLine = (gi: number, li: number) =>
    setBom((b) => b.map((g, i) => (i !== gi ? g : { ...g, lines: g.lines.filter((_, j) => j !== li) })));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur px-4 py-3 print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"><Hexagon className="h-4.5 w-4.5 text-primary-foreground" /></div>
            <div><div className="text-sm font-bold tracking-tight">Deckmetry</div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Roof Estimator</div></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Internal</span>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print / Export</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 lg:px-8">
        {/* Project info — first */}
        <Card className="print:hidden">
          <CardHeader><CardTitle className="text-base">Project Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1"><Label className="text-xs">Project name</Label><Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g., Smith Pavilion" className="h-10" /></div>
            <div className="space-y-1"><Label className="text-xs">Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, State ZIP" className="h-10" /></div>
            <div className="space-y-1"><Label className="text-xs">Delivery date request</Label><Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="h-10" /></div>
          </CardContent>
        </Card>

        {/* Roof */}
        <Card className="print:hidden">
          <CardHeader><CardTitle className="text-base">Roof</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="text-xs">Roof type</Label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <OptionCard active={roofType === "gable"} onClick={() => setRoofType("gable")} icon={Home} title="Gable" desc="Two sloped sides, ridge" />
                <OptionCard active={roofType === "shed"} onClick={() => setRoofType("shed")} icon={Footprints} title="Shed" desc="Single slope" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Num label="Width (ft)" value={width} onChange={setWidth} />
              <Num label="Length (ft)" value={length} onChange={setLength} />
              <Num label="Pitch (rise/12)" value={pitch} onChange={setPitch} />
            </div>
            <div>
              <Label className="text-xs">Attachment</Label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <OptionCard active={attachment === "freestanding"} onClick={() => setAttachment("freestanding")} title="Freestanding" desc="Independent structure" />
                <OptionCard active={attachment === "attached"} onClick={() => setAttachment("attached")} title="Attached to house" desc="Adds headwall flashing" />
              </div>
            </div>
          </CardContent>
        </Card>

        <details className="rounded-xl border bg-card print:hidden">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Roof Overhangs <span className="font-normal text-muted-foreground">(defaults: 1 / 1 / 1 / 0)</span></summary>
          <div className="grid grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-4">
            <Num label="Left (ft)" value={oL} onChange={setOL} />
            <Num label="Right (ft)" value={oR} onChange={setOR} />
            <Num label="Front (ft)" value={oF} onChange={setOF} />
            <Num label="Rear (ft)" value={oRear} onChange={setORear} />
            <Num label="Sheathing waste (sheets)" value={sheathingWaste} onChange={setSheathingWaste} />
          </div>
        </details>

        {/* Roof Ceiling — ChamClad (always included) */}
        <Card className="print:hidden">
          <CardHeader><CardTitle className="text-base">Roof Ceiling — ChamClad</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="text-xs">Brand</Label>
              <div className="mt-2 flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/5 px-4 py-3">
                <PanelTop className="h-5 w-5 text-primary" />
                <div><div className="font-semibold">{CHAMCLAD_BRAND}</div><div className="text-xs text-muted-foreground">{CHAMCLAD_COLORS.length} colors · 16′ & 20′ panels</div></div>
              </div>
            </div>
            <div>
              <Label className="text-xs">Panel color</Label>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {CHAMCLAD_COLORS.map((c) => {
                  const active = chamColor === c.name;
                  return (
                    <button key={c.name} onClick={() => setChamColor(c.name)} className={cn("overflow-hidden rounded-xl border-2 text-left transition-all", active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40")}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.img} alt={c.name} className="h-16 w-full object-cover" />
                      <div className="flex items-center justify-between px-2.5 py-2">
                        <span className="text-xs font-semibold leading-tight">{c.name}</span>
                        {active && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Num label="Panel coverage (ft)" value={panelCov} onChange={setPanelCov} step={0.5} />
              <Num label="H-channel stock (ft)" value={hStock} onChange={setHStock} />
            </div>
          </CardContent>
        </Card>

        {/* Roofing */}
        <Card className="print:hidden">
          <CardHeader><CardTitle className="text-base">Roofing</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <OptionCard active={roofing === "asphalt"} onClick={() => setRoofing("asphalt")} icon={PanelTop} title="Asphalt Shingles" desc="Full material assembly" />
              <OptionCard active={roofing === "metal"} onClick={() => setRoofing("metal")} icon={PanelTop} title="Metal Roof" desc="Manual list — coming later" />
            </div>
            {roofing === "asphalt" ? (
              <div className="grid grid-cols-2 gap-3">
                <Num label="Underlayment roll (sqft)" value={underlaymentCov} onChange={setUnderlaymentCov} />
                <Num label="Drip edge stock (ft)" value={dripStock} onChange={setDripStock} />
                <Num label="Valley length (ft)" value={valleyLf} onChange={setValleyLf} />
                <Num label="Wall intersection (ft)" value={wallLf} onChange={setWallLf} />
              </div>
            ) : (
              <div><Label className="text-xs">Manual metal materials & notes</Label><textarea value={metalNotes} onChange={(e) => setMetalNotes(e.target.value)} rows={3} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="Metal roofing — coming later." /></div>
            )}
          </CardContent>
        </Card>

        {/* Optional */}
        <Card className="print:hidden">
          <CardHeader><CardTitle className="text-base">Optional Items</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow label="Gutters & downspouts" on={includeGutters} onClick={() => setIncludeGutters((v) => !v)} />
            <ToggleRow label={`Ridge vent ${roofType !== "gable" ? "(gable only)" : ""}`} on={includeRidgeVent} onClick={() => setIncludeRidgeVent((v) => !v)} />
            <div><Label className="text-xs">Other optional notes</Label><Input value={optionalNotes} onChange={(e) => setOptionalNotes(e.target.value)} placeholder="e.g., skylight, cupola…" className="mt-1 h-9" /></div>
          </CardContent>
        </Card>

        {/* Fireplace */}
        <Card className="print:hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Flame className="h-4 w-4 text-primary" /> Fireplace (Ventless)</CardTitle>
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
              <Num label="MSI stone box coverage (sqft) — blank if TBC" value={stoneBoxCov === "" ? 0 : stoneBoxCov} onChange={(v) => setStoneBoxCov(v === 0 ? "" : v)} />
            </CardContent>
          )}
        </Card>

        {/* ── BILL OF MATERIALS (editable) ── */}
        <div className="pt-2">
          <div className="mb-1 flex flex-wrap items-end justify-between gap-2 border-b-2 border-primary pb-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight">Bill of Materials</h2>
              <Button size="sm" variant="outline" className="gap-1.5 print:hidden" onClick={() => setBom(seed)} title="Rebuild from current inputs (overwrites manual edits)">
                <RotateCcw className="h-3.5 w-3.5" /> Regenerate from inputs
              </Button>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div className="font-semibold text-foreground">{projectName || "Roof project"}</div>
              {address && <div>{address}</div>}
              {deliveryDate && <div>Delivery requested: {deliveryDate}</div>}
            </div>
          </div>
          <p className="mb-3 text-xs text-muted-foreground print:hidden">Edit any field, add or remove lines. &ldquo;Regenerate&rdquo; rebuilds from the inputs above and replaces manual edits.</p>

          <datalist id="bom-lengths">
            {STOCK_LENGTHS.map((s) => <option key={s} value={`${s}'`} />)}
          </datalist>

          <div className="space-y-4">
            {bom.map((grp, gi) => (
              <div key={grp.title} className="overflow-hidden rounded-lg border print:break-inside-avoid">
                <div className={cn("flex items-center justify-between px-4 py-2 text-sm font-bold uppercase tracking-wide", groupColor(grp.title))}>
                  <span>{grp.title}</span>
                  <button onClick={() => addLine(gi)} className="flex items-center gap-1 rounded-md bg-white/60 px-2 py-1 text-xs font-semibold hover:bg-white print:hidden"><Plus className="h-3 w-3" /> Add item</button>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-1.5 font-semibold">Description</th>
                      <th className="px-3 py-1.5 font-semibold w-24">Length (ft)</th>
                      <th className="px-3 py-1.5 font-semibold w-32">Brand</th>
                      <th className="px-3 py-1.5 font-semibold w-28">Color</th>
                      <th className="px-3 py-1.5 font-semibold w-16 text-right">Qty</th>
                      <th className="px-3 py-1.5 font-semibold w-20">Unit</th>
                      <th className="px-2 py-1.5 w-8 print:hidden"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {grp.lines.map((l, li) => {
                      const cell = "w-full rounded border-transparent bg-transparent px-2 py-1 hover:border-input focus:border-input focus:bg-background print:border-0";
                      return (
                      <tr key={l.id} className="border-b last:border-0">
                        <td className="px-2 py-1"><input value={l.description} onChange={(e) => updateLine(gi, li, "description", e.target.value)} className={cell} /></td>
                        <td className="px-2 py-1"><input list="bom-lengths" value={l.size} onChange={(e) => updateLine(gi, li, "size", e.target.value)} placeholder="—" className={cell} /></td>
                        <td className="px-2 py-1"><input value={l.brand} onChange={(e) => updateLine(gi, li, "brand", e.target.value)} placeholder="—" className={cell} /></td>
                        <td className="px-2 py-1"><input value={l.color} onChange={(e) => updateLine(gi, li, "color", e.target.value)} placeholder="—" className={cell} /></td>
                        <td className="px-2 py-1"><input type="number" value={l.qty} onChange={(e) => updateLine(gi, li, "qty", e.target.value === "" ? 0 : Number(e.target.value))} className={cn(cell, "text-right tabular-nums")} /></td>
                        <td className="px-2 py-1"><input value={l.unit} onChange={(e) => updateLine(gi, li, "unit", e.target.value)} className={cell} /></td>
                        <td className="px-2 py-1 text-center print:hidden"><button onClick={() => removeLine(gi, li)} className="text-muted-foreground hover:text-destructive" title="Remove"><Trash2 className="h-4 w-4" /></button></td>
                      </tr>
                      );
                    })}
                    {grp.lines.length === 0 && (
                      <tr><td colSpan={7} className="px-3 py-3 text-center text-xs text-muted-foreground">No items — use &ldquo;Add item&rdquo;.</td></tr>
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Preliminary material list for budgeting. Verify spans, code compliance, and engineering before ordering.</p>
        </div>
      </div>
    </div>
  );
}

// ── small components ──
function OptionCard({ active, onClick, icon: Icon, title, desc }: { active: boolean; onClick: () => void; icon?: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3 text-left transition-all", active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/50")}>
      <div className="flex w-full items-center justify-between">{Icon ? <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} /> : <span />}{active && <CheckCircle2 className="h-4 w-4 text-primary" />}</div>
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </button>
  );
}
function Num({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label><Input type="number" step={step} value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} className="h-9" /></div>;
}
function Seg({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label><div className="flex flex-wrap gap-2">{options.map(([v, lbl]) => (<button key={v} onClick={() => onChange(v)} className={cn("rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors", value === v ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted")}>{lbl}</button>))}</div></div>;
}
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={cn("h-6 w-11 rounded-full transition-colors", on ? "bg-primary" : "bg-muted")}><span className={cn("block h-5 w-5 rounded-full bg-white shadow transition-transform", on ? "translate-x-5" : "translate-x-0.5")} /></button>;
}
function ToggleRow({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return <div className="flex items-center justify-between rounded-lg border px-3 py-2.5"><span className="text-sm font-medium">{label}</span><Toggle on={on} onClick={onClick} /></div>;
}
