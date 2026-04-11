import Link from "next/link";
import { FileSpreadsheet, FileText, Package, Plus, ArrowRight } from "lucide-react";

export function ContractorDashboardMockup() {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-center text-sm font-medium text-muted-foreground mb-4">
        Your contractor dashboard at a glance
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
              app.deckmetry.com/contractor
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Fake sidebar */}
          <div className="hidden sm:flex w-44 flex-col border-r bg-muted/30 p-3 gap-1">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Pipeline
            </div>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Estimates
            </div>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Quotes
            </div>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              Orders
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-5 space-y-5">
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Active Estimates", value: "12", color: "text-blue-600" },
                { label: "Pending Quotes", value: "5", color: "text-amber-600" },
                { label: "In-Progress Orders", value: "3", color: "text-emerald-600" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border bg-card p-3 text-center"
                >
                  <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent estimates */}
            <div className="rounded-lg border">
              <div className="flex items-center justify-between border-b px-4 py-2.5">
                <span className="text-xs font-semibold">Recent Estimates</span>
                <Link
                  href="/estimate"
                  className="flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  New Estimate
                </Link>
              </div>
              <div className="divide-y text-xs">
                {[
                  { name: "Johnson Residence", dims: "16' x 24'", status: "Completed", statusColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
                  { name: "Smith Pool Deck", dims: "20' x 32'", status: "Draft", statusColor: "bg-muted text-muted-foreground" },
                  { name: "Park Community Deck", dims: "12' x 16'", status: "Quoted", statusColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
                ].map((e) => (
                  <div key={e.name} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <span className="font-medium text-foreground">{e.name}</span>
                      <span className="ml-2 text-muted-foreground">{e.dims}</span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${e.statusColor}`}>
                      {e.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/estimate"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Create Your First Estimate
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-3">
        Click &quot;Create Your First Estimate&quot; to try the live wizard
      </p>
    </div>
  );
}
