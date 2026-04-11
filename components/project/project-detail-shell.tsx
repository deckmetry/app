"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectPipeline } from "./project-pipeline";
import { cn } from "@/lib/utils";

// ─── Status config ───────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string }> = {
  bom_created: { label: "BOM Created", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  estimate_requested: { label: "Estimate Requested", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  estimate_received: { label: "Estimate Received", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  proposal_sent: { label: "Proposal Sent", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300" },
  proposal_viewed: { label: "Proposal Viewed", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300" },
  agreement_signed: { label: "Agreement Signed", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  po_submitted: { label: "PO Submitted", color: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300" },
  po_confirmed: { label: "PO Confirmed", color: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300" },
  materials_shipped: { label: "Shipped", color: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" },
  materials_delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  complete: { label: "Complete", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground" },
};

// ─── Types ───────────────────────────────────────────────────
interface Stakeholder {
  id: string;
  organization_id: string;
  role: string;
  added_at: string;
  organizations: { id: string; name: string; type: string; logo_url: string | null } | null;
}

interface Estimate {
  id: string;
  project_name: string;
  status: string;
  deck_type: string;
  deck_width_ft: number;
  deck_projection_ft: number;
  total_area_sf: number | null;
  total_bom_items: number | null;
  decking_brand: string | null;
  decking_collection: string | null;
  decking_color: string | null;
  share_token: string | null;
  created_at: string;
}

interface Quote {
  id: string;
  quote_number: string;
  title: string;
  status: string;
  total: number | null;
  share_token: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  approved_at: string | null;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  title: string;
  status: string;
  total: number | null;
  submitted_at: string | null;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

interface SupplierEstimate {
  id: string;
  estimate_number: string;
  title: string;
  status: string;
  total: number | null;
  share_token: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  created_at: string;
  organizations: { id: string; name: string } | null;
}

interface Approval {
  id: string;
  signer_name: string | null;
  signer_email: string | null;
  approved_at: string | null;
  approved_total: number | null;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  title: string;
  status: string;
  total: number | null;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
}

interface Delivery {
  id: string;
  tracking_number: string | null;
  carrier: string | null;
  status: string;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  address: string | null;
  description: string | null;
  status: string;
  project_number: string;
  homeowner_org_id: string | null;
  contractor_org_id: string | null;
  supplier_org_id: string | null;
  created_at: string;
  updated_at: string;
  project_stakeholders: Stakeholder[];
  estimates: Estimate[];
  quotes: Quote[];
  orders: Order[];
  supplier_estimates: SupplierEstimate[];
  approvals: Approval[];
  invoices: Invoice[];
  deliveries: Delivery[];
}

interface TabConfig {
  value: string;
  label: string;
  count?: number;
}

interface ProjectDetailShellProps {
  project: Project;
  backHref: string;
  backLabel: string;
  tabs: TabConfig[];
  defaultTab?: string;
  children?: React.ReactNode;
}

// ─── Formatters ──────────────────────────────────────────────
function formatCurrency(amount: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

const quoteStatusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  viewed: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  expired: "bg-muted text-muted-foreground",
};

const orderStatusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  shipped: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelled: "bg-muted text-muted-foreground",
};

const supplierEstStatusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  viewed: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  accepted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  expired: "bg-muted text-muted-foreground",
  revised: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
};

// ─── Sub-components for tab content ─────────────────────────

export function OverviewTab({ project }: { project: Project }) {
  const status = statusConfig[project.status] ?? { label: project.status, color: "bg-muted text-muted-foreground" };

  return (
    <div className="space-y-6">
      <ProjectPipeline status={project.status} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant="secondary" className={cn("mt-1", status.color)}>
                {status.label}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Project Number</p>
              <p className="font-mono font-medium">{project.project_number}</p>
            </div>
            {project.address && (
              <div>
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{project.address}</p>
              </div>
            )}
            {project.description && (
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Description</p>
                <p className="font-medium">{project.description}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(project.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stakeholders */}
      {project.project_stakeholders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stakeholders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.project_stakeholders.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{s.organizations?.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{s.organizations?.type ?? ""}</p>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">
                    {s.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary counts */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="BOMs" count={project.estimates.length} />
        <SummaryCard label="Estimates" count={project.supplier_estimates.length} />
        <SummaryCard label="Proposals" count={project.quotes.length} />
        <SummaryCard label="Orders" count={project.orders.length} />
      </div>
    </div>
  );
}

function SummaryCard({ label, count }: { label: string; count: number }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{count}</p>
      </CardContent>
    </Card>
  );
}

export function BomTab({ estimates, role }: { estimates: Estimate[]; role: string }) {
  if (estimates.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed p-12 text-center">
        <p className="text-lg font-semibold">No BOMs yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No bill of materials has been created for this project.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {estimates.map((est) => (
        <Link key={est.id} href={`/${role}/estimates/${est.id}`}>
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardContent className="flex items-center justify-between py-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold truncate">
                  {est.project_name || "Untitled BOM"}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {est.deck_width_ft}&apos; x {est.deck_projection_ft}&apos; {est.deck_type}
                  {est.total_area_sf ? ` — ${est.total_area_sf} sf` : ""}
                  {est.total_bom_items ? ` — ${est.total_bom_items} items` : ""}
                </p>
                {est.decking_brand && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {est.decking_brand} {est.decking_collection} {est.decking_color && `— ${est.decking_color}`}
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-muted-foreground shrink-0 ml-4">
                {formatDate(est.created_at)}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export function QuotesTab({ quotes, role }: { quotes: Quote[]; role: string }) {
  if (quotes.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed p-12 text-center">
        <p className="text-lg font-semibold">No proposals yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {role === "contractor"
            ? "Create a quote from a BOM to send a proposal."
            : "No contractor proposals have been sent for this project."}
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-sm">{q.quote_number}</TableCell>
                  <TableCell className="font-medium text-sm">{q.title || "Untitled"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-[10px]", quoteStatusColors[q.status])}>
                      {q.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatCurrency(q.total)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(q.sent_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed p-12 text-center">
        <p className="text-lg font-semibold">No orders yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Purchase orders will appear here once created.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Delivered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm">{o.order_number}</TableCell>
                  <TableCell className="font-medium text-sm">{o.title || "Untitled"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-[10px]", orderStatusColors[o.status])}>
                      {o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatCurrency(o.total)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(o.submitted_at)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(o.delivered_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function SupplierEstimatesTab({ supplierEstimates }: { supplierEstimates: SupplierEstimate[] }) {
  if (supplierEstimates.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed p-12 text-center">
        <p className="text-lg font-semibold">No estimates yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Supplier pricing estimates will appear here.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierEstimates.map((se) => (
                <TableRow key={se.id}>
                  <TableCell className="font-mono text-sm">{se.estimate_number}</TableCell>
                  <TableCell className="font-medium text-sm">{se.title || "Untitled"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {se.organizations?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-[10px]", supplierEstStatusColors[se.status])}>
                      {se.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatCurrency(se.total)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(se.sent_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function AgreementsTab({ approvals }: { approvals: Approval[] }) {
  if (approvals.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed p-12 text-center">
        <p className="text-lg font-semibold">No agreements yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed agreements will appear here once a proposal is accepted.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Signer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Signed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-sm">{a.signer_name || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.signer_email || "—"}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatCurrency(a.approved_total)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(a.approved_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Shell ──────────────────────────────────────────────

export function ProjectDetailShell({
  project,
  backHref,
  backLabel,
  tabs,
  defaultTab = "overview",
  children,
}: ProjectDetailShellProps) {
  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <span className="text-sm font-mono text-muted-foreground">{project.project_number}</span>
        </div>
        {project.address && (
          <p className="mt-1 text-sm text-muted-foreground">{project.address}</p>
        )}
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <Badge variant="secondary" className="h-5 min-w-5 px-1 text-[10px]">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {children}
      </Tabs>
    </div>
  );
}
