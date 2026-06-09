"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function OrderActions({ actions }: { actions: string[] }) {
  const [done, setDone] = useState<string | null>(null);

  // Primary actions get filled buttons; the rest are outline.
  const primary = new Set(["Review Order", "Confirm Availability", "Send Confirmation to Contractor"]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <Button
            key={a}
            variant={primary.has(a) ? "default" : "outline"}
            size="sm"
            onClick={() => setDone(a)}
          >
            {a}
          </Button>
        ))}
      </div>
      {done && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span><span className="font-medium">{done}</span> — action recorded. (Demo: this is where Wehrung&apos;s confirms before pushing to Epicor.)</span>
        </div>
      )}
    </div>
  );
}
