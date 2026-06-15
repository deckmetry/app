"use client";

import { useWizardStore } from "@/lib/stores/wizard-store";
import { DEFAULT_ROOF_CONFIG } from "@/lib/store";
import type { RoofConfig } from "@/lib/types";
import { CHAMCLAD_BRAND, CHAMCLAD_COLORS } from "@/lib/chamclad";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Home, Footprints, PanelTop, Flame, CheckCircle2 } from "lucide-react";

export function RoofStep() {
  const roof = useWizardStore((s) => s.formData.roof) ?? DEFAULT_ROOF_CONFIG;
  const updateFormData = useWizardStore((s) => s.updateFormData);
  const set = (patch: Partial<RoofConfig>) => updateFormData({ roof: { ...roof, ...patch } });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Roof</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Roof structure, ceiling, and roofing. These materials are added to the same Bill of Materials.
        </p>
      </div>

      {/* Roof type */}
      <div>
        <Label className="text-xs">Roof type</Label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <OptionCard active={roof.roofType === "gable"} onClick={() => set({ roofType: "gable" })} icon={Home} title="Gable" desc="Two sloped sides, ridge" />
          <OptionCard active={roof.roofType === "shed"} onClick={() => set({ roofType: "shed" })} icon={Footprints} title="Shed" desc="Single slope" />
        </div>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-3 gap-3">
        <Num label="Width (ft)" value={roof.widthFt} onChange={(v) => set({ widthFt: v })} />
        <Num label="Length (ft)" value={roof.lengthFt} onChange={(v) => set({ lengthFt: v })} />
        <Num label="Pitch (rise/12)" value={roof.pitch} onChange={(v) => set({ pitch: v })} />
      </div>

      {/* Attachment */}
      <div>
        <Label className="text-xs">Attachment</Label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <OptionCard active={roof.attachment === "freestanding"} onClick={() => set({ attachment: "freestanding" })} title="Freestanding" desc="Independent structure" />
          <OptionCard active={roof.attachment === "attached"} onClick={() => set({ attachment: "attached" })} title="Attached to house" desc="Adds headwall flashing" />
        </div>
      </div>

      {/* Overhangs */}
      <details className="rounded-xl border bg-card">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
          Overhangs <span className="font-normal text-muted-foreground">(defaults: 1 / 1 / 1 / 0)</span>
        </summary>
        <div className="grid grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-5">
          <Num label="Left (ft)" value={roof.overhangLeftFt} onChange={(v) => set({ overhangLeftFt: v })} />
          <Num label="Right (ft)" value={roof.overhangRightFt} onChange={(v) => set({ overhangRightFt: v })} />
          <Num label="Front (ft)" value={roof.overhangFrontFt} onChange={(v) => set({ overhangFrontFt: v })} />
          <Num label="Rear (ft)" value={roof.overhangRearFt} onChange={(v) => set({ overhangRearFt: v })} />
          <Num label="Sheathing waste (sheets)" value={roof.sheathingWasteSheets} onChange={(v) => set({ sheathingWasteSheets: v })} />
        </div>
      </details>

      {/* Roof ceiling — ChamClad (always included) */}
      <div className="rounded-xl border bg-card p-4">
        <Label className="text-xs">Roof Ceiling — {CHAMCLAD_BRAND}</Label>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CHAMCLAD_COLORS.map((c) => {
            const active = roof.chamColor === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => set({ chamColor: c.name })}
                className={cn(
                  "overflow-hidden rounded-xl border-2 text-left transition-all",
                  active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                )}
              >
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
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Num label="Panel coverage (ft)" value={roof.panelCoverageFt} onChange={(v) => set({ panelCoverageFt: v })} step={0.5} />
          <Num label="H-channel stock (ft)" value={roof.hChannelStockFt} onChange={(v) => set({ hChannelStockFt: v })} />
        </div>
      </div>

      {/* Roofing */}
      <div>
        <Label className="text-xs">Roofing</Label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <OptionCard active={roof.roofing === "asphalt"} onClick={() => set({ roofing: "asphalt" })} icon={PanelTop} title="Asphalt Shingles" desc="Full material assembly" />
          <OptionCard active={roof.roofing === "metal"} onClick={() => set({ roofing: "metal" })} icon={PanelTop} title="Metal Roof" desc="Manual list — coming later" />
        </div>
        {roof.roofing === "asphalt" ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Num label="Underlayment roll (sqft)" value={roof.underlaymentCoverageSqft} onChange={(v) => set({ underlaymentCoverageSqft: v })} />
            <Num label="Drip edge stock (ft)" value={roof.dripEdgeStockFt} onChange={(v) => set({ dripEdgeStockFt: v })} />
            <Num label="Valley length (ft)" value={roof.valleyLengthFt} onChange={(v) => set({ valleyLengthFt: v })} />
            <Num label="Wall intersection (ft)" value={roof.wallIntersectionFt} onChange={(v) => set({ wallIntersectionFt: v })} />
          </div>
        ) : (
          <div className="mt-3">
            <Label className="text-xs">Manual metal materials &amp; notes</Label>
            <textarea
              value={roof.metalNotes}
              onChange={(e) => set({ metalNotes: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Metal roofing — coming later."
            />
          </div>
        )}
      </div>

      {/* Optional */}
      <div className="space-y-3">
        <Label className="text-xs">Optional Items</Label>
        <ToggleRow label="Gutters & downspouts" on={roof.includeGutters} onClick={() => set({ includeGutters: !roof.includeGutters })} />
        <ToggleRow label={`Ridge vent ${roof.roofType !== "gable" ? "(gable only)" : ""}`} on={roof.includeRidgeVent} onClick={() => set({ includeRidgeVent: !roof.includeRidgeVent })} />
        <div>
          <Label className="text-xs">Other optional notes</Label>
          <Input value={roof.optionalNotes} onChange={(e) => set({ optionalNotes: e.target.value })} placeholder="e.g., skylight, cupola…" className="mt-1 h-9" />
        </div>
      </div>

      {/* Fireplace */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Flame className="h-4 w-4 text-primary" /> Fireplace (Ventless)
          </Label>
          <Toggle on={roof.includeFireplace} onClick={() => set({ includeFireplace: !roof.includeFireplace })} />
        </div>
        {roof.includeFireplace && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Num label="Width (ft)" value={roof.fpWidthFt} onChange={(v) => set({ fpWidthFt: v })} />
              <Num label="Height (ft)" value={roof.fpHeightFt} onChange={(v) => set({ fpHeightFt: v })} />
              <Num label="Depth (ft)" value={roof.fpDepthFt} onChange={(v) => set({ fpDepthFt: v })} />
              <Num label="Opening W (ft)" value={roof.fpOpeningWidthFt} onChange={(v) => set({ fpOpeningWidthFt: v })} />
              <Num label="Opening H (ft)" value={roof.fpOpeningHeightFt} onChange={(v) => set({ fpOpeningHeightFt: v })} />
              <Num label="Adhesive cov (sqft)" value={roof.fpAdhesiveCoverageSqft} onChange={(v) => set({ fpAdhesiveCoverageSqft: v })} />
            </div>
            <Seg
              label="Stone sides"
              value={String(roof.fpStoneSides)}
              onChange={(v) => set({ fpStoneSides: Number(v) as 0 | 1 | 2 })}
              options={[["2", "Both"], ["1", "One"], ["0", "None"]]}
            />
            <Seg
              label="Hearth / Mantel stone"
              value={roof.fpStonePiece}
              onChange={(v) => set({ fpStonePiece: v as RoofConfig["fpStonePiece"] })}
              options={[["none", "None"], ["hearth", "Hearth"], ["mantel", "Mantel"], ["hearth_and_mantel", "Both"]]}
            />
            <Num
              label="MSI stone box coverage (sqft) — blank if TBC"
              value={roof.fpStoneBoxCoverageSqft === "" ? 0 : roof.fpStoneBoxCoverageSqft}
              onChange={(v) => set({ fpStoneBoxCoverageSqft: v === 0 ? "" : v })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── small components (mirrors the standalone roof tool) ──
function OptionCard({ active, onClick, icon: Icon, title, desc }: { active: boolean; onClick: () => void; icon?: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3 text-left transition-all", active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/50")}>
      <div className="flex w-full items-center justify-between">{Icon ? <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} /> : <span />}{active && <CheckCircle2 className="h-4 w-4 text-primary" />}</div>
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </button>
  );
}
function Num({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type="number" step={step} value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} className="h-9" />
    </div>
  );
}
function Seg({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, lbl]) => (
          <button key={v} type="button" onClick={() => onChange(v)} className={cn("rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors", value === v ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted")}>{lbl}</button>
        ))}
      </div>
    </div>
  );
}
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={cn("h-6 w-11 rounded-full transition-colors", on ? "bg-primary" : "bg-muted")}><span className={cn("block h-5 w-5 rounded-full bg-white shadow transition-transform", on ? "translate-x-5" : "translate-x-0.5")} /></button>;
}
function ToggleRow({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return <div className="flex items-center justify-between rounded-lg border px-3 py-2.5"><span className="text-sm font-medium">{label}</span><Toggle on={on} onClick={onClick} /></div>;
}
