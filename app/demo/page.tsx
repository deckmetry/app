import Link from "next/link";
import { Hexagon, ArrowRight, Building2, HardHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DemoLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <Hexagon className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Deckmetry</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a portal to enter the demo
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Supplier portal */}
          <Link href="/demo/dashboard" className="group">
            <Card className="h-full border-slate-200 shadow-sm transition-all group-hover:border-primary/40 group-hover:shadow-md">
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold">Wehrung&apos;s Supplier Portal</h2>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">
                  Manage contractors, homeowner leads, projects, catalog, and material order review.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Enter as Wehrung&apos;s
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>

          {/* Contractor portal */}
          <Link href="/demo/contractor" className="group">
            <Card className="h-full border-slate-200 shadow-sm transition-all group-hover:border-primary/40 group-hover:shadow-md">
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <HardHat className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold">Contractor Portal</h2>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">
                  Concept Design + Build — create estimates, request orders, track status, manage payments, and receive leads.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Enter as Contractor
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Front-end sales &amp; contractor experience layer for Wehrung&apos;s. Epicor remains the system of record.
        </p>
      </div>
    </div>
  );
}
