"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, CheckCircle2, Circle, Send, CalendarClock, Download, FileText,
  CreditCard, MessageSquare,
} from "lucide-react";
import {
  getContractorProject, projectDetail, smithResidence, formatCurrency, statusBadgeClass,
} from "../../../contractor-data";
import { CloneDialog } from "../../clone-dialog";

export default function ContractorProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = getContractorProject(id);
  if (!project) notFound();

  const [flash, setFlash] = useState<string | null>(null);
  const isSmith = project.id === "smith-residence";
  const retail = isSmith ? smithResidence.pricing.retailTotal : Math.round(project.total / (1 - 0.18));

  const summary: Record<string, string> = {
    "Project Name": project.name,
    Homeowner: project.homeowner,
    Location: project.city,
    Contractor: "Concept Design + Build",
    "Assigned Wehrung's Rep": "John Miller",
    Status: project.status,
    "Requested Delivery Date": project.requestedDelivery,
    "Material Total": formatCurrency(project.total),
  };

  const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    "Request Wehrung's Review": Send,
    "Request Delivery Date": CalendarClock,
    "Download BOM": Download,
    "Download Quote": FileText,
    "Pay Deposit / Pay Balance": CreditCard,
    "Message Wehrung's Rep": MessageSquare,
  };

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 gap-1 text-muted-foreground -ml-2">
          <Link href="/demo/contractor/projects"><ArrowLeft className="h-4 w-4" /> Back to Projects</Link>
        </Button>
        <PageHeader title={project.name} description={`${project.homeowner} · ${project.city}`}>
          <Badge variant="outline" className={statusBadgeClass(project.status)}>{project.status}</Badge>
        </PageHeader>
      </div>

      {flash && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {flash}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Summary */}
          <Card>
            <CardHeader><CardTitle className="text-base">Project Summary</CardTitle></CardHeader>
            <CardContent className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {Object.entries(summary).map(([k, v]) => (
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

          {/* Deck configuration */}
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

          {/* BOM */}
          <Card>
            <CardHeader><CardTitle className="text-base">Material List / BOM</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {smithResidence.bom.map((line, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm font-medium whitespace-nowrap">{line.category}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{line.item}</TableCell>
                        <TableCell className="text-right text-sm whitespace-nowrap">{line.qty}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status timeline */}
          <Card>
            <CardHeader><CardTitle className="text-base">Status Timeline</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {projectDetail.timeline.map((t, i) => (
                  <li key={i} className="flex gap-3">
                    {t.done ? (
                      <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${t.current ? "text-primary" : "text-emerald-600"}`} />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}
                    <span className={`text-sm ${t.current ? "font-semibold text-primary" : t.done ? "font-medium" : "text-muted-foreground"}`}>
                      {t.label}{t.current ? " — current" : ""}
                    </span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Row label="Retail Material Total" value={formatCurrency(retail)} />
              <Row label="Contractor Discount" value="18%" />
              <div className="border-t pt-3">
                <Row label="Contractor Price" value={formatCurrency(project.total)} bold />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment Status</span>
                <Badge variant="outline" className={statusBadgeClass(projectDetail.paymentStatus)}>{projectDetail.paymentStatus}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
              {projectDetail.actions.map((a) => {
                if (a === "Clone Project") {
                  return (
                    <CloneDialog
                      key={a}
                      projectName={project.name}
                      triggerLabel="Clone Project"
                      triggerSize="default"
                      onCloned={() => setFlash(`New draft created from ${project.name}.`)}
                    />
                  );
                }
                if (a === "Pay Deposit / Pay Balance") {
                  const Icon = ICONS[a];
                  return (
                    <Button key={a} asChild variant="outline" className="justify-start gap-2">
                      <Link href="/demo/contractor/payments"><Icon className="h-4 w-4" /> {a}</Link>
                    </Button>
                  );
                }
                const Icon = ICONS[a] ?? Send;
                const primary = a === "Request Wehrung's Review";
                return (
                  <Button
                    key={a}
                    variant={primary ? "default" : "outline"}
                    className="justify-start gap-2"
                    onClick={() => setFlash(`${a} — done (demo).`)}
                  >
                    <Icon className="h-4 w-4" /> {a}
                  </Button>
                );
              })}
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
