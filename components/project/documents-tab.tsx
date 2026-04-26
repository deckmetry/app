"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  FileSpreadsheet,
  FileText,
  Handshake,
  Package,
  Receipt,
  Truck,
  ClipboardList,
  FolderOpen,
  ArrowUpRight,
  ArrowDownLeft,
  List,
  GitBranch,
} from "lucide-react";
import { DocumentFlowTree } from "./document-flow-tree";
import type { Project } from "./project-detail-shell";

// ─── Document kinds ──────────────────────────────────────────

type DocumentKind =
  | "bom"
  | "supplier_estimate"
  | "proposal"
  | "agreement"
  | "order"
  | "invoice"
  | "delivery";

type DocDirection = "sell" | "buy" | null;

interface NormalizedDocument {
  id: string;
  kind: DocumentKind;
  number: string;
  title: string;
  status: string;
  amount: number | null;
  date: string;
  linkHref: string | null;
  direction: DocDirection;
}

// ─── Kind config ─────────────────────────────────────────────

const KIND_ICONS: Record<DocumentKind, React.ComponentType<{ className?: string }>> = {
  bom: FileSpreadsheet,
  supplier_estimate: ClipboardList,
  proposal: FileText,
  agreement: Handshake,
  order: Package,
  invoice: Receipt,
  delivery: Truck,
};

const KIND_COLORS: Record<DocumentKind, string> = {
  bom: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  supplier_estimate: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  proposal: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  agreement: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  order: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  invoice: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  delivery: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
};

type Role = "homeowner" | "contractor" | "supplier";

const KIND_LABELS: Record<DocumentKind, Record<Role, string>> = {
  bom:                { homeowner: "BOM",               contractor: "BOM",               supplier: "BOM" },
  supplier_estimate:  { homeowner: "Estimate",          contractor: "Supplier Estimate",  supplier: "My Estimate" },
  proposal:           { homeowner: "Proposal",          contractor: "My Proposal",        supplier: "Proposal" },
  agreement:          { homeowner: "Agreement",         contractor: "Agreement",          supplier: "Agreement" },
  order:              { homeowner: "Order",             contractor: "Purchase Order",     supplier: "Order Received" },
  invoice:            { homeowner: "Invoice",           contractor: "Invoice",            supplier: "My Invoice" },
  delivery:           { homeowner: "Delivery",          contractor: "Delivery",           supplier: "My Delivery" },
};

// ─── Status colors ───────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  // Common
  draft: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
  // Estimates / BOM
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  shared: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  // Supplier estimates
  sent: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  viewed: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  accepted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  expired: "bg-muted text-muted-foreground",
  revised: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  // Quotes
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  // Orders
  submitted: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  shipped: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  // Invoices
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  void: "bg-muted text-muted-foreground",
  // Deliveries
  pending: "bg-muted text-muted-foreground",
  in_transit: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  out_for_delivery: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

// ─── Normalizer ──────────────────────────────────────────────

function normalizeProjectDocuments(project: Project, role: Role): NormalizedDocument[] {
  const docs: NormalizedDocument[] = [];

  for (const est of project.estimates ?? []) {
    docs.push({
      id: est.id,
      kind: "bom",
      number: est.bom_number,
      title: est.project_name || "Untitled BOM",
      status: est.status,
      amount: null,
      date: est.created_at,
      linkHref: `/${role}/estimates/${est.id}`,
      direction: null,
    });
  }

  for (const se of project.supplier_estimates ?? []) {
    docs.push({
      id: se.id,
      kind: "supplier_estimate",
      number: se.estimate_number,
      title: se.title || "Material Estimate",
      status: se.status,
      amount: se.total,
      date: se.created_at,
      linkHref: null,
      direction: role === "supplier" ? "sell" : "buy",
    });
  }

  for (const q of project.quotes ?? []) {
    docs.push({
      id: q.id,
      kind: "proposal",
      number: q.quote_number,
      title: q.title || "Untitled Proposal",
      status: q.status,
      amount: q.total,
      date: q.created_at,
      linkHref: role === "contractor" ? `/${role}/quotes/${q.id}` : null,
      direction: role === "contractor" ? "sell" : "buy",
    });
  }

  for (const a of project.approvals ?? []) {
    docs.push({
      id: a.id,
      kind: "agreement",
      number: "Agreement",
      title: a.signer_name ? `Signed by ${a.signer_name}` : "Signed Agreement",
      status: "approved",
      amount: a.approved_total,
      date: a.approved_at ?? a.created_at,
      linkHref: null,
      direction: null,
    });
  }

  for (const o of project.orders ?? []) {
    docs.push({
      id: o.id,
      kind: "order",
      number: o.order_number,
      title: o.title || "Untitled Order",
      status: o.status,
      amount: o.total,
      date: o.created_at,
      linkHref: `/${role}/orders/${o.id}`,
      direction: role === "contractor" ? "buy" : "sell",
    });
  }

  for (const inv of project.invoices ?? []) {
    docs.push({
      id: inv.id,
      kind: "invoice",
      number: inv.invoice_number,
      title: inv.title || "Invoice",
      status: inv.status,
      amount: inv.total,
      date: inv.created_at,
      linkHref: role === "supplier" ? `/${role}/invoices/${inv.id}` : null,
      direction: role === "supplier" ? "sell" : "buy",
    });
  }

  for (const d of project.deliveries ?? []) {
    docs.push({
      id: d.id,
      kind: "delivery",
      number: d.delivery_number,
      title: d.carrier ? `${d.carrier} shipment` : "Shipment",
      status: d.status,
      amount: null,
      date: d.created_at,
      linkHref: role === "supplier" ? `/${role}/deliveries/${d.id}` : null,
      direction: null,
    });
  }

  // Sort by date descending
  docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return docs;
}

// ─── Formatters ──────────────────────────────────────────────

function formatCurrency(amount: number | null) {
  if (amount == null) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

// ─── Component ───────────────────────────────────────────────

interface DocumentsTabProps {
  project: Project;
  role: Role;
}

export function DocumentsTab({ project, role }: DocumentsTabProps) {
  const allDocs = normalizeProjectDocuments(project, role);
  const [filter, setFilter] = useState<DocumentKind | "all">("all");
  const [view, setView] = useState<"list" | "flow">("list");

  const filteredDocs = filter === "all" ? allDocs : allDocs.filter((d) => d.kind === filter);

  // Compute counts per kind (only show kinds that have docs)
  const kindCounts = allDocs.reduce<Partial<Record<DocumentKind, number>>>((acc, d) => {
    acc[d.kind] = (acc[d.kind] ?? 0) + 1;
    return acc;
  }, {});

  const activeKinds = Object.keys(kindCounts) as DocumentKind[];

  if (allDocs.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed p-12 text-center">
        <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Documents like BOMs, estimates, proposals, and orders will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: view toggle + filter bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Filter bar (list view only) */}
        {view === "list" && activeKinds.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                filter === "all"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              All
              <span className="font-mono">{allDocs.length}</span>
            </button>
            {activeKinds.map((kind) => (
              <button
                key={kind}
                onClick={() => setFilter(kind)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  filter === kind
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {KIND_LABELS[kind][role]}
                <span className="font-mono">{kindCounts[kind]}</span>
              </button>
            ))}
          </div>
        ) : (
          <div />
        )}

        {/* View toggle */}
        <div className="flex shrink-0 rounded-md border">
          <button
            onClick={() => setView("list")}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-colors rounded-l-md",
              view === "list"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
          <button
            onClick={() => setView("flow")}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-colors rounded-r-md border-l",
              view === "flow"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <GitBranch className="h-3.5 w-3.5" />
            Flow
          </button>
        </div>
      </div>

      {/* Flow tree view */}
      {view === "flow" && <DocumentFlowTree project={project} />}

      {/* Document list view */}
      {view === "list" && (
      <div className="grid gap-2">
        {filteredDocs.map((doc) => {
          const Icon = KIND_ICONS[doc.kind];
          const kindLabel = KIND_LABELS[doc.kind][role];
          const statusColor = STATUS_COLORS[doc.status] ?? "bg-muted text-muted-foreground";
          const amount = formatCurrency(doc.amount);

          const content = (
            <Card className={cn("transition-colors", doc.linkHref && "hover:bg-muted/50 cursor-pointer")}>
              <CardContent className="flex items-center justify-between py-3 px-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", KIND_COLORS[doc.kind])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {kindLabel}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">{doc.number}</span>
                      <Badge variant="secondary" className={cn("text-[10px]", statusColor)}>
                        {doc.status.replace(/_/g, " ")}
                      </Badge>
                      {doc.direction === "sell" && (
                        <Badge variant="outline" className="text-[10px] shrink-0 border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400">
                          <ArrowUpRight className="mr-0.5 h-3 w-3" />
                          Sell
                        </Badge>
                      )}
                      {doc.direction === "buy" && (
                        <Badge variant="outline" className="text-[10px] shrink-0 border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400">
                          <ArrowDownLeft className="mr-0.5 h-3 w-3" />
                          Buy
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm font-medium truncate">{doc.title}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  {amount && (
                    <p className="text-sm font-mono font-medium">{amount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{formatDate(doc.date)}</p>
                </div>
              </CardContent>
            </Card>
          );

          if (doc.linkHref) {
            return (
              <Link key={`${doc.kind}-${doc.id}`} href={doc.linkHref}>
                {content}
              </Link>
            );
          }

          return <div key={`${doc.kind}-${doc.id}`}>{content}</div>;
        })}
      </div>
      )}
    </div>
  );
}
