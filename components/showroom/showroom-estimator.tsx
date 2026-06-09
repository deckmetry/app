"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Lock, Hexagon, Phone, PencilRuler, Box,
  ChevronRight, RotateCcw,
} from "lucide-react";
import {
  projectTypes, deckSizes, deckHeights, deckingLines, deckColors, railingOptions,
  stairOptions, addOnOptions, timelineOptions, emptySelections, estimateRange,
  formatRange, generateBom, makeReference, buildLead, BOM_PRICE,
  type EstimatorSelections,
} from "@/app/estimate/estimator-data";

type Mode = "demo" | "paid";
type Phase = "steps" | "result" | "thankyou";

const SERVICES = [
  { key: "pro", title: "Request Pro Contact", icon: Phone, description: "Speak with a professional about materials, budget, next steps, and contractor options." },
  { key: "drawings", title: "Request Permit-Ready Drawings", icon: PencilRuler, description: "Request professionally prepared permit-ready drawings for your deck project." },
  { key: "3d", title: "Request 3D Renderings", icon: Box, description: "Request a 3D rendering to visualize your future deck and outdoor space before moving forward." },
];

export function ShowroomEstimator({ mode }: { mode: Mode }) {
  const [phase, setPhase] = useState<Phase>("steps");
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<EstimatorSelections>(emptySelections);

  // result-phase state
  const [services, setServices] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [reference, setReference] = useState("");
  const [unlockMsg, setUnlockMsg] = useState<string | null>(null);

  const set = (patch: Partial<EstimatorSelections>) => setSel((s) => ({ ...s, ...patch }));
  const range = useMemo(() => estimateRange(sel), [sel]);
  const bom = useMemo(() => generateBom(sel), [sel]);

  const TOTAL_STEPS = 9;
  const stepValid = (i: number): boolean => {
    switch (i) {
      case 0: return !!sel.projectType;
      case 1: return !!sel.sizeLabel;
      case 2: return !!sel.heightLabel;
      case 3: return !!sel.lineLabel;
      case 4: return !!sel.colorLabel;
      case 5: return !!sel.railingLabel;
      case 6: return !!sel.stairsLabel;
      case 7: return true; // add-ons optional
      case 8: return !!sel.fullName && !!sel.email && !!sel.phone && !!sel.city;
      default: return false;
    }
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else setPhase("result");
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const toggleAddOn = (label: string) =>
    set({ addOns: sel.addOns.includes(label) ? sel.addOns.filter((a) => a !== label) : [...sel.addOns, label] });

  // Payments disabled for now — the detailed BOM is shown in both modes.
  // (To re-enable the $79 gate later: set `unlocked = mode === "demo"`.)
  const unlocked = true;

  const handleUnlock = () => {
    const link = process.env.NEXT_PUBLIC_BOM_PAYMENT_LINK;
    if (!link) {
      setUnlockMsg("Payment link not configured.");
      return;
    }
    try {
      localStorage.setItem("dm_estimate", JSON.stringify({ sel, bom, range }));
    } catch {}
    window.location.href = link;
  };

  const submitRequest = () => {
    const ref = makeReference();
    const lead = buildLead(sel, {
      source: mode === "demo" ? "Wehrung's Showroom Demo" : "Website Estimator",
      bomStatus: mode === "demo" ? "demo" : "unlocked",
      wantsPro: !!services.pro,
      wantsDrawings: !!services.drawings,
      wants3d: !!services["3d"],
      notes,
      reference: ref,
    });
    fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) }).catch(() => {});
    setReference(ref);
    setPhase("thankyou");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <Header mode={mode} />

      {phase === "steps" && (
        <>
          <Progress step={step} total={TOTAL_STEPS} />
          <div className="mt-6 min-h-[320px]">
            {step === 0 && <OptionGrid title="What type of project is this?" options={projectTypes} value={sel.projectType} onSelect={(v) => set({ projectType: v })} />}
            {step === 1 && <OptionGrid title="What size deck?" options={deckSizes.map((s) => s.label)} value={sel.sizeLabel} onSelect={(v) => set({ sizeLabel: v })} cols={2} />}
            {step === 2 && <OptionGrid title="How high off the ground?" options={deckHeights.map((h) => h.label)} value={sel.heightLabel} onSelect={(v) => set({ heightLabel: v })} cols={2} />}
            {step === 3 && <OptionGrid title="Choose your decking material" options={deckingLines.map((l) => l.label)} value={sel.lineLabel} onSelect={(v) => set({ lineLabel: v })} cols={2} />}
            {step === 4 && <ColorGrid value={sel.colorLabel} onSelect={(v) => set({ colorLabel: v })} />}
            {step === 5 && <OptionGrid title="Railing" options={railingOptions.map((r) => r.label)} value={sel.railingLabel} onSelect={(v) => set({ railingLabel: v })} cols={2} />}
            {step === 6 && <OptionGrid title="Stairs" options={stairOptions.map((s) => s.label)} value={sel.stairsLabel} onSelect={(v) => set({ stairsLabel: v })} cols={2} />}
            {step === 7 && <MultiGrid title="Add-ons" subtitle="Select any that apply" options={addOnOptions.map((a) => a.label)} selected={sel.addOns} onToggle={toggleAddOn} />}
            {step === 8 && <ContactForm sel={sel} set={set} />}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={back} disabled={step === 0} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button size="lg" onClick={next} disabled={!stepValid(step)} className="gap-2 px-8 text-base">
              {step === TOTAL_STEPS - 1 ? "See My Estimate" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {phase === "result" && (
        <ResultView
          mode={mode} sel={sel} range={range} bom={bom} unlocked={unlocked}
          services={services} setServices={setServices} notes={notes} setNotes={setNotes}
          onUnlock={handleUnlock} unlockMsg={unlockMsg}
          onEdit={() => { setPhase("steps"); setStep(0); }}
          onSubmit={submitRequest}
        />
      )}

      {phase === "thankyou" && (
        <ThankYou sel={sel} range={range} reference={reference} services={services} />
      )}
    </div>
  );
}

// ── Header / badge ──────────────────────────────────────────────────────────
function Header({ mode }: { mode: Mode }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Hexagon className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight">Deckmetry</span>
      </Link>
      {mode === "demo" && (
        <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          Wehrung&apos;s Showroom Demo
        </span>
      )}
    </div>
  );
}

function Progress({ step, total }: { step: number; total: number }) {
  const pct = ((step + 1) / total) * 100;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
        <span className="font-medium">Step {step + 1} of {total}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Option grids ──────────────────────────────────────────────────────────────
function OptionGrid({ title, options, value, onSelect, cols = 1 }: {
  title: string; options: string[]; value: string; onSelect: (v: string) => void; cols?: 1 | 2;
}) {
  return (
    <div>
      <h2 className="mb-5 text-2xl font-bold tracking-tight">{title}</h2>
      <div className={cn("grid gap-3", cols === 2 ? "sm:grid-cols-2" : "")}>
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              onClick={() => onSelect(o)}
              className={cn(
                "flex items-center justify-between rounded-xl border-2 px-5 py-5 text-left text-lg font-medium transition-all",
                active ? "border-primary bg-primary/5 text-primary" : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
              )}
            >
              {o}
              {active ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColorGrid({ value, onSelect }: { value: string; onSelect: (v: string) => void }) {
  return (
    <div>
      <h2 className="mb-5 text-2xl font-bold tracking-tight">Choose your color</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {deckColors.map((c) => {
          const active = value === c.label;
          return (
            <button
              key={c.label}
              onClick={() => onSelect(c.label)}
              className={cn(
                "overflow-hidden rounded-xl border-2 text-left transition-all",
                active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
              )}
            >
              <div className="h-20 w-full" style={{ backgroundColor: c.swatch }} />
              <div className="flex items-center justify-between px-3 py-3">
                <div>
                  <p className="text-sm font-semibold leading-tight">{c.color}</p>
                  <p className="text-xs text-muted-foreground">{c.brand} {c.line}</p>
                </div>
                {active && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiGrid({ title, subtitle, options, selected, onToggle }: {
  title: string; subtitle: string; options: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mb-5 text-sm text-muted-foreground">{subtitle}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => {
          const active = selected.includes(o);
          return (
            <button
              key={o}
              onClick={() => onToggle(o)}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 px-4 py-4 text-left text-base font-medium transition-all",
                active ? "border-primary bg-primary/5 text-primary" : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
              )}
            >
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded border-2", active ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40")}>
                {active && <CheckCircle2 className="h-4 w-4" />}
              </span>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ContactForm({ sel, set }: { sel: EstimatorSelections; set: (p: Partial<EstimatorSelections>) => void }) {
  return (
    <div>
      <h2 className="mb-5 text-2xl font-bold tracking-tight">Your contact information</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name *"><Input value={sel.fullName} onChange={(e) => set({ fullName: e.target.value })} className="h-12 text-base" /></Field>
        <Field label="Email *"><Input type="email" value={sel.email} onChange={(e) => set({ email: e.target.value })} className="h-12 text-base" /></Field>
        <Field label="Phone *"><Input type="tel" value={sel.phone} onChange={(e) => set({ phone: e.target.value })} className="h-12 text-base" /></Field>
        <Field label="Project city *"><Input value={sel.city} onChange={(e) => set({ city: e.target.value })} className="h-12 text-base" /></Field>
        <Field label="Project address (optional)" full><Input value={sel.address} onChange={(e) => set({ address: e.target.value })} className="h-12 text-base" /></Field>
        <Field label="Timeline">
          <select value={sel.timeline} onChange={(e) => set({ timeline: e.target.value })} className="h-12 w-full rounded-md border border-input bg-background px-3 text-base">
            <option value="">Select…</option>
            {timelineOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Are you a…">
          <select value={sel.who} onChange={(e) => set({ who: e.target.value })} className="h-12 w-full rounded-md border border-input bg-background px-3 text-base">
            <option value="Homeowner">Homeowner</option>
            <option value="Contractor">Contractor</option>
          </select>
        </Field>
        <Field label="Need contractor installation?">
          <select value={sel.needInstall} onChange={(e) => set({ needInstall: e.target.value })} className="h-12 w-full rounded-md border border-input bg-background px-3 text-base">
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Not sure">Not sure</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={cn("space-y-1.5", full && "sm:col-span-2")}>
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

// ── Result view ───────────────────────────────────────────────────────────────
function ResultView({ mode, sel, range, bom, unlocked, services, setServices, notes, setNotes, onUnlock, unlockMsg, onEdit, onSubmit }: any) {
  const summary: [string, string][] = [
    ["Project type", sel.projectType],
    ["Deck size", sel.sizeLabel],
    ["Deck height", sel.heightLabel],
    ["Decking", sel.colorLabel || sel.lineLabel],
    ["Railing", sel.railingLabel],
    ["Stairs", sel.stairsLabel],
    ["Add-ons", sel.addOns.length ? sel.addOns.join(", ") : "None"],
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your Deck Project Summary</h1>
        <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1.5"><RotateCcw className="h-4 w-4" /> Edit</Button>
      </div>

      {/* Selections */}
      <Card>
        <CardContent className="grid gap-x-6 gap-y-4 pt-6 sm:grid-cols-2">
          {summary.map(([k, v]) => (
            <div key={k}>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
              <p className="text-base font-medium">{v}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Estimated range */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Estimated Material Range</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-primary">{formatRange(range)}</p>
          <p className="mt-2 text-xs text-muted-foreground">Preliminary planning estimate. Final pricing confirmed by Wehrung&apos;s.</p>
        </CardContent>
      </Card>

      {/* BOM — unlocked (demo / paid+unlocked) or locked */}
      {unlocked ? (
        <BomTable bom={bom} />
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"><Lock className="h-6 w-6 text-muted-foreground" /></div>
            <div>
              <h3 className="text-xl font-bold">Unlock Your Detailed BOM</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                Get the detailed material list for your deck project, including decking quantities, railing package,
                fascia, skirting, fasteners, hardware, lighting, and a printable project summary.
              </p>
            </div>
            <div className="text-3xl font-extrabold">${BOM_PRICE}</div>
            <Button size="lg" className="px-10 text-base" onClick={onUnlock}>Unlock BOM</Button>
            {unlockMsg && <p className="text-sm font-medium text-amber-700">{unlockMsg}</p>}
          </CardContent>
        </Card>
      )}

      {/* Next-step services */}
      <div>
        <h2 className="mb-1 text-xl font-bold">Next steps</h2>
        <p className="mb-4 text-sm text-muted-foreground">Select one or more — a representative can help with the rest.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {SERVICES.map((s) => {
            const active = !!services[s.key];
            return (
              <button
                key={s.key}
                onClick={() => setServices((p: any) => ({ ...p, [s.key]: !p[s.key] }))}
                className={cn(
                  "flex h-full flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all",
                  active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <s.icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                  {active && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          <Label className="text-sm">Tell us more about your project or what kind of help you need.</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1.5" placeholder="Optional notes…" />
        </div>
        <Button size="lg" className="mt-5 w-full text-base sm:w-auto px-10" onClick={onSubmit}>Submit My Project Request</Button>
      </div>
    </div>
  );
}

function BomTable({ bom }: { bom: { category: string; item: string; qty: string }[] }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="mb-3 text-lg font-bold">Detailed Bill of Materials</h3>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-3 py-2 font-semibold">Category</th>
                <th className="px-3 py-2 font-semibold">Item</th>
                <th className="px-3 py-2 text-right font-semibold">Qty</th>
              </tr>
            </thead>
            <tbody>
              {bom.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{r.category}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.item}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{r.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          This BOM is a planning material list and must be reviewed and confirmed by Wehrung&apos;s before ordering.
        </p>
      </CardContent>
    </Card>
  );
}

// ── Thank you ─────────────────────────────────────────────────────────────────
function ThankYou({ sel, range, reference, services }: any) {
  const chosen = SERVICES.filter((s) => services[s.key]).map((s) => s.title);
  return (
    <div className="mx-auto max-w-xl py-6 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Your Project Request Has Been Submitted</h1>
      <p className="mt-3 text-muted-foreground">
        Your deck project summary has been created. A representative can review your selections, confirm material
        availability, and help with next steps.
      </p>
      <Card className="mt-8 text-left">
        <CardContent className="space-y-3 pt-6">
          <Row label="Reference number" value={reference} mono />
          <Row label="Name" value={sel.fullName} />
          <Row label="Estimated material range" value={formatRange(range)} />
          <Row label="Next-step services" value={chosen.length ? chosen.join(", ") : "None selected"} />
        </CardContent>
      </Card>
      <Button asChild variant="outline" className="mt-6 gap-2"><Link href="/">Back to Home</Link></Button>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold text-right", mono && "font-mono")}>{value}</span>
    </div>
  );
}
