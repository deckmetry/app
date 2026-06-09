import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import {
  getProject, getContractor, smithResidence, formatCurrency, statusBadgeClass,
} from "../../../demo-data";
import { OrderActions } from "./order-actions";
import { OrderDocument } from "./order-document";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getProject(id);
  if (!p) notFound();

  const isSmith = p.id === "smith-residence";
  const contractor = getContractor(p.contractorId);
  const discount = contractor?.discount ?? 0;

  // Pricing: use the explicit Smith pricing block, else compute from material value.
  const retail = isSmith ? smithResidence.pricing.retailTotal : Math.round(p.materialValue / (1 - discount / 100));
  const contractorPrice = isSmith ? smithResidence.pricing.contractorPrice : p.materialValue;
  const discountPct = isSmith ? smithResidence.pricing.discountPct : discount;

  const facts: Record<string, string> = {
    "Project Name": p.name,
    Homeowner: p.homeowner,
    Location: p.city,
    Contractor: p.contractor,
    "Assigned Wehrung's Rep": p.rep,
    Status: p.status,
    "Requested Delivery Date": p.requestedDelivery ?? "Not set",
  };

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 gap-1 text-muted-foreground -ml-2">
          <Link href="/demo/projects"><ArrowLeft className="h-4 w-4" /> Back to Projects / Orders</Link>
        </Button>
        <PageHeader title={p.name} description={`${p.contractor} · ${p.city}`}>
          <Badge variant="outline" className={statusBadgeClass(p.status)}>{p.status}</Badge>
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: details + config + BOM */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Project Details</CardTitle></CardHeader>
            <CardContent className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {Object.entries(facts).map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-muted-foreground">{k}</p>
                  {k === "Status" ? (
                    <Badge variant="outline" className={statusBadgeClass(v)}>{v}</Badge>
                  ) : (
                    <p className="text-sm font-medium">{v}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {isSmith && (
            <Card>
              <CardHeader><CardTitle className="text-base">Deck Configuration</CardTitle></CardHeader>
              <CardContent className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {Object.entries(smithResidence.config).map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="text-sm font-medium">{v}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {isSmith && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Material list submitted by {p.contractor} via Deckmetry — prices auto-populated from the Wehrung&apos;s catalog with the contractor&apos;s discount tier applied.
              </p>
              <OrderDocument />
            </div>
          )}
        </div>

        {/* Right column: pricing + actions + timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Row label="Retail Material Total" value={formatCurrency(retail)} />
              <Row label="Contractor Discount" value={`${discountPct}%`} />
              <div className="border-t pt-3">
                <Row label="Contractor Price" value={formatCurrency(contractorPrice)} bold />
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                <span className="text-xs text-muted-foreground">Estimated Material Margin</span>
                <span className="text-xs font-medium text-muted-foreground">Internal only</span>
              </div>
              <Row label="Requested Delivery Date" value={p.requestedDelivery ?? "Not set"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Wehrung&apos;s Actions</CardTitle></CardHeader>
            <CardContent>
              <OrderActions actions={smithResidence.actions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Activity Timeline</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {smithResidence.timeline.map((t, i) => (
                  <li key={i} className="flex gap-3">
                    {t.done ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm ${t.done ? "font-medium" : "text-muted-foreground"}`}>{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.at}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={bold ? "text-base font-bold" : "text-sm font-medium"}>{value}</span>
    </div>
  );
}
