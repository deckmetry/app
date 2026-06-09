"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Hexagon, Printer } from "lucide-react";
import { formatRange, type BomRow, type EstimatorSelections } from "@/app/estimate/estimator-data";

interface Saved {
  sel: EstimatorSelections;
  bom: BomRow[];
  range: { low: number; high: number } | null;
}

export default function EstimateSuccessPage() {
  const [data, setData] = useState<Saved | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("dm_estimate");
      if (raw) setData(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Hexagon className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight">Deckmetry</span>
      </div>

      <div className="mb-8 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-600" />
        <div>
          <h1 className="text-xl font-bold text-emerald-800">Your Detailed BOM Is Unlocked</h1>
          <p className="text-sm text-emerald-700">Thank you for your purchase. Your full material list is below.</p>
        </div>
      </div>

      {!loaded ? null : data ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="grid gap-x-6 gap-y-4 pt-6 sm:grid-cols-2">
              {[
                ["Project type", data.sel.projectType],
                ["Deck size", data.sel.sizeLabel],
                ["Deck height", data.sel.heightLabel],
                ["Decking", data.sel.colorLabel || data.sel.lineLabel],
                ["Railing", data.sel.railingLabel],
                ["Stairs", data.sel.stairsLabel],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
                  <p className="text-base font-medium">{v || "—"}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6 text-center">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Estimated Material Range</p>
              <p className="mt-2 text-3xl font-extrabold text-primary">{formatRange(data.range)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold">Detailed Bill of Materials</h3>
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 print:hidden">
                  <Printer className="h-4 w-4" /> Print
                </Button>
              </div>
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
                    {data.bom.map((r, i) => (
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
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <p>Your payment is confirmed. We couldn&apos;t find your estimate on this device — please return to the estimator to regenerate your material list.</p>
            <Button asChild className="mt-4"><Link href="/estimate">Open the Estimator</Link></Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
