import Link from "next/link";
import {
  Hexagon,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Layers,
} from "lucide-react";

export function HomeownerWizardMockup() {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-center text-sm font-medium text-muted-foreground mb-4">
        See how easy it is to estimate your deck
      </p>
      <div className="rounded-xl border-2 border-border bg-card shadow-2xl overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 mx-8">
            <div className="rounded-md bg-background border px-3 py-1 text-xs text-muted-foreground text-center font-mono">
              app.deckmetry.com/estimate
            </div>
          </div>
        </div>

        {/* Wizard content */}
        <div className="bg-background">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Hexagon className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-xs font-bold">Deckmetry</span>
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded">
              Step 3 of 6
            </span>
          </div>

          <div className="flex">
            {/* Left: form area */}
            <div className="flex-1 p-5 space-y-4">
              {/* Step pills */}
              <div className="flex gap-1.5 overflow-x-auto">
                {["Job Info", "Geometry", "Surface", "Railing", "Add-ons", "Review"].map(
                  (step, i) => (
                    <div
                      key={step}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium whitespace-nowrap ${
                        i < 2
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : i === 2
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i < 2 ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/10 text-[9px]">
                          {i + 1}
                        </span>
                      )}
                      <span className="hidden sm:inline">{step}</span>
                    </div>
                  )
                )}
              </div>

              {/* Surface step mockup */}
              <div className="rounded-lg border bg-card p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Choose Your Decking</h3>
                  <p className="text-[10px] text-muted-foreground">
                    Select brand, collection, and color
                  </p>
                </div>

                {/* Brand selector mockup */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "Trex", active: true },
                    { name: "TimberTech", active: false },
                    { name: "Deckorators", active: false },
                  ].map((b) => (
                    <div
                      key={b.name}
                      className={`rounded-lg border-2 p-3 text-center text-xs font-medium ${
                        b.active
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {b.name}
                    </div>
                  ))}
                </div>

                {/* Color swatches mockup */}
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground mb-2">
                    Trex Transcend Colors
                  </p>
                  <div className="flex gap-2">
                    {[
                      { name: "Havana Gold", color: "#8B7355" },
                      { name: "Spiced Rum", color: "#6B4226" },
                      { name: "Lava Rock", color: "#4A3728", active: true },
                      { name: "Rope Swing", color: "#C4A882" },
                      { name: "Island Mist", color: "#9E9E8E" },
                    ].map((c) => (
                      <div key={c.name} className="text-center">
                        <div
                          className={`h-8 w-8 rounded-full border-2 mx-auto ${
                            c.active
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-border"
                          }`}
                          style={{ backgroundColor: c.color }}
                        />
                        <p className="text-[8px] text-muted-foreground mt-1 truncate w-12">
                          {c.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nav buttons */}
              <div className="flex justify-between">
                <div className="rounded-lg border px-3 py-1.5 text-xs text-muted-foreground">
                  Previous
                </div>
                <Link
                  href="/estimate"
                  className="flex items-center gap-1 rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Try It Live
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Right: summary panel */}
            <div className="hidden sm:block w-52 border-l">
              <div className="bg-primary px-4 py-3">
                <span className="text-xs font-semibold text-primary-foreground">
                  Project Summary
                </span>
              </div>
              <div className="p-3 space-y-3">
                {/* Drawing mockup */}
                <div className="rounded-lg border bg-muted/20 p-2">
                  <div className="flex items-center gap-1 mb-2">
                    <Layers className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Plan View
                    </span>
                  </div>
                  <div className="h-24 rounded bg-muted/40 flex items-center justify-center">
                    <svg width="80" height="60" viewBox="0 0 80 60">
                      <rect
                        x="5"
                        y="5"
                        width="70"
                        height="50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-muted-foreground/30"
                        rx="1"
                      />
                      <line
                        x1="5"
                        y1="15"
                        x2="75"
                        y2="15"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-muted-foreground/20"
                      />
                      <line
                        x1="5"
                        y1="25"
                        x2="75"
                        y2="25"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-muted-foreground/20"
                      />
                      <line
                        x1="5"
                        y1="35"
                        x2="75"
                        y2="35"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-muted-foreground/20"
                      />
                      <line
                        x1="5"
                        y1="45"
                        x2="75"
                        y2="45"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-muted-foreground/20"
                      />
                      <circle cx="15" cy="10" r="3" className="fill-muted-foreground/30" />
                      <circle cx="40" cy="10" r="3" className="fill-muted-foreground/30" />
                      <circle cx="65" cy="10" r="3" className="fill-muted-foreground/30" />
                    </svg>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/40 rounded p-2">
                    <p className="text-[8px] font-semibold text-muted-foreground uppercase">
                      Type
                    </p>
                    <p className="text-[10px] font-semibold">Attached</p>
                  </div>
                  <div className="bg-muted/40 rounded p-2">
                    <p className="text-[8px] font-semibold text-muted-foreground uppercase">
                      Height
                    </p>
                    <p className="text-[10px] font-semibold">36&quot;</p>
                  </div>
                </div>

                <div className="border rounded p-2 border-primary/20 bg-primary/5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[8px] font-semibold text-muted-foreground uppercase">
                      Total Area
                    </span>
                    <span className="text-sm font-bold text-primary">
                      384 <span className="text-[9px] font-normal text-muted-foreground">sf</span>
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground">16&apos; W x 24&apos; D</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-3">
        Click &quot;Try It Live&quot; to start your own estimate
      </p>
    </div>
  );
}
