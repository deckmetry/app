"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FileSpreadsheet,
  FileText,
  ClipboardList,
  Package,
  Receipt,
  Truck,
  FolderOpen,
} from "lucide-react";
import type { Project } from "./project-detail-shell";

// ─── Tree node type ─────────────────────────────────────────

type DocType = "bom" | "supplier_estimate" | "proposal" | "order" | "invoice" | "delivery";

interface FlowNode {
  id: string;
  type: DocType;
  number: string;
  title: string;
  status: string;
  amount: number | null;
  date: string;
  children: FlowNode[];
}

// ─── Config ─────────────────────────────────────────────────

const TYPE_ICONS: Record<DocType, React.ComponentType<{ className?: string }>> = {
  bom: FileSpreadsheet,
  supplier_estimate: ClipboardList,
  proposal: FileText,
  order: Package,
  invoice: Receipt,
  delivery: Truck,
};

const TYPE_COLORS: Record<DocType, string> = {
  bom: "bg-blue-500",
  supplier_estimate: "bg-amber-500",
  proposal: "bg-indigo-500",
  order: "bg-violet-500",
  invoice: "bg-rose-500",
  delivery: "bg-sky-500",
};

const STATUS_DOT: Record<string, string> = {
  draft: "bg-muted-foreground",
  completed: "bg-emerald-500",
  shared: "bg-indigo-500",
  sent: "bg-indigo-500",
  viewed: "bg-amber-500",
  accepted: "bg-emerald-500",
  approved: "bg-emerald-500",
  rejected: "bg-red-500",
  submitted: "bg-violet-500",
  confirmed: "bg-blue-500",
  processing: "bg-blue-500",
  shipped: "bg-sky-500",
  delivered: "bg-emerald-500",
  paid: "bg-emerald-500",
  overdue: "bg-red-500",
  pending: "bg-muted-foreground",
  in_transit: "bg-sky-500",
  cancelled: "bg-muted-foreground",
  expired: "bg-muted-foreground",
};

// ─── Build tree from project data ───────────────────────────

function buildFlowTree(project: Project): FlowNode[] {
  const roots: FlowNode[] = [];

  // Index orders by their parent FK
  const ordersByQuoteId = new Map<string, typeof project.orders>();
  const ordersBySupEstId = new Map<string, typeof project.orders>();
  for (const o of project.orders ?? []) {
    if (o.quote_id) {
      const list = ordersByQuoteId.get(o.quote_id) ?? [];
      list.push(o);
      ordersByQuoteId.set(o.quote_id, list);
    }
    if (o.supplier_estimate_id) {
      const list = ordersBySupEstId.get(o.supplier_estimate_id) ?? [];
      list.push(o);
      ordersBySupEstId.set(o.supplier_estimate_id, list);
    }
  }

  // Index invoices and deliveries by order_id
  const invoicesByOrderId = new Map<string, typeof project.invoices>();
  for (const inv of project.invoices ?? []) {
    if (inv.order_id) {
      const list = invoicesByOrderId.get(inv.order_id) ?? [];
      list.push(inv);
      invoicesByOrderId.set(inv.order_id, list);
    }
  }

  const deliveriesByOrderId = new Map<string, typeof project.deliveries>();
  for (const d of project.deliveries ?? []) {
    if (d.order_id) {
      const list = deliveriesByOrderId.get(d.order_id) ?? [];
      list.push(d);
      deliveriesByOrderId.set(d.order_id, list);
    }
  }

  // Track which orders are claimed by a parent
  const claimedOrderIds = new Set<string>();

  function buildOrderChildren(orderId: string): FlowNode[] {
    const children: FlowNode[] = [];
    for (const d of deliveriesByOrderId.get(orderId) ?? []) {
      children.push({
        id: d.id,
        type: "delivery",
        number: d.delivery_number,
        title: d.carrier ? `${d.carrier} shipment` : "Shipment",
        status: d.status,
        amount: null,
        date: d.created_at,
        children: [],
      });
    }
    for (const inv of invoicesByOrderId.get(orderId) ?? []) {
      children.push({
        id: inv.id,
        type: "invoice",
        number: inv.invoice_number,
        title: inv.title || "Invoice",
        status: inv.status,
        amount: inv.total,
        date: inv.created_at,
        children: [],
      });
    }
    return children;
  }

  function buildOrderNodes(orders: typeof project.orders): FlowNode[] {
    return (orders ?? []).map((o) => {
      claimedOrderIds.add(o.id);
      return {
        id: o.id,
        type: "order" as const,
        number: o.order_number,
        title: o.title || "Purchase Order",
        status: o.status,
        amount: o.total,
        date: o.created_at,
        children: buildOrderChildren(o.id),
      };
    });
  }

  // Index quotes by estimate_id
  const quotesByEstimateId = new Map<string, typeof project.quotes>();
  for (const q of project.quotes ?? []) {
    if (q.estimate_id) {
      const list = quotesByEstimateId.get(q.estimate_id) ?? [];
      list.push(q);
      quotesByEstimateId.set(q.estimate_id, list);
    }
  }

  // Track which quotes/supplier estimates are claimed
  const claimedQuoteIds = new Set<string>();
  const claimedSupEstIds = new Set<string>();

  // Build BOM roots
  for (const est of project.estimates ?? []) {
    const bomChildren: FlowNode[] = [];

    // Proposals linked to this BOM
    for (const q of quotesByEstimateId.get(est.id) ?? []) {
      claimedQuoteIds.add(q.id);
      const orderNodes = buildOrderNodes(ordersByQuoteId.get(q.id) ?? []);
      bomChildren.push({
        id: q.id,
        type: "proposal",
        number: q.quote_number,
        title: q.title || "Proposal",
        status: q.status,
        amount: q.total,
        date: q.created_at,
        children: orderNodes,
      });
    }

    // Supplier estimates (not directly linked to BOM via FK, but within same project)
    // They'll be shown as siblings to proposals under the BOM
    for (const se of project.supplier_estimates ?? []) {
      claimedSupEstIds.add(se.id);
      const orderNodes = buildOrderNodes(ordersBySupEstId.get(se.id) ?? []);
      bomChildren.push({
        id: se.id,
        type: "supplier_estimate",
        number: se.estimate_number,
        title: se.title || "Material Estimate",
        status: se.status,
        amount: se.total,
        date: se.created_at,
        children: orderNodes,
      });
    }

    roots.push({
      id: est.id,
      type: "bom",
      number: est.bom_number,
      title: est.project_name || "Untitled BOM",
      status: est.status,
      amount: null,
      date: est.created_at,
      children: bomChildren,
    });
  }

  // Orphan quotes (no estimate_id)
  for (const q of project.quotes ?? []) {
    if (claimedQuoteIds.has(q.id)) continue;
    const orderNodes = buildOrderNodes(ordersByQuoteId.get(q.id) ?? []);
    roots.push({
      id: q.id,
      type: "proposal",
      number: q.quote_number,
      title: q.title || "Proposal",
      status: q.status,
      amount: q.total,
      date: q.created_at,
      children: orderNodes,
    });
  }

  // Orphan supplier estimates
  for (const se of project.supplier_estimates ?? []) {
    if (claimedSupEstIds.has(se.id)) continue;
    const orderNodes = buildOrderNodes(ordersBySupEstId.get(se.id) ?? []);
    roots.push({
      id: se.id,
      type: "supplier_estimate",
      number: se.estimate_number,
      title: se.title || "Material Estimate",
      status: se.status,
      amount: se.total,
      date: se.created_at,
      children: orderNodes,
    });
  }

  // Orphan orders (no quote_id or supplier_estimate_id)
  for (const o of project.orders ?? []) {
    if (claimedOrderIds.has(o.id)) continue;
    roots.push({
      id: o.id,
      type: "order",
      number: o.order_number,
      title: o.title || "Purchase Order",
      status: o.status,
      amount: o.total,
      date: o.created_at,
      children: buildOrderChildren(o.id),
    });
  }

  return roots;
}

// ─── Formatters ─────────────────────────────────────────────

function formatCurrency(amount: number | null) {
  if (amount == null) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

// ─── Tree node renderer ─────────────────────────────────────

function FlowNodeRow({ node, depth, isLast }: { node: FlowNode; depth: number; isLast: boolean }) {
  const Icon = TYPE_ICONS[node.type];
  const dotColor = STATUS_DOT[node.status] ?? "bg-muted-foreground";
  const amount = formatCurrency(node.amount);

  return (
    <>
      <div className="flex items-center gap-2 py-1.5">
        {/* Indentation + connector lines */}
        <div className="flex items-center" style={{ width: depth * 24 }}>
          {depth > 0 && (
            <div className="relative flex items-center justify-center" style={{ width: 24, height: 24 }}>
              <div className={cn(
                "absolute left-[11px] w-px bg-border",
                isLast ? "top-0 h-[12px]" : "top-0 h-full"
              )} />
              <div className="absolute left-[11px] top-[12px] h-px w-[8px] bg-border" />
            </div>
          )}
        </div>

        {/* Status dot */}
        <div className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dotColor)} />

        {/* Icon */}
        <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded", TYPE_COLORS[node.type])}>
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>

        {/* Doc number + title */}
        <span className="text-xs font-mono text-muted-foreground shrink-0">{node.number}</span>
        <span className="text-sm truncate">{node.title}</span>

        {/* Status badge */}
        <Badge variant="outline" className="text-[10px] shrink-0 ml-auto">
          {node.status.replace(/_/g, " ")}
        </Badge>

        {/* Amount */}
        {amount && (
          <span className="text-xs font-mono text-muted-foreground shrink-0">{amount}</span>
        )}
      </div>

      {/* Children */}
      {node.children.map((child, i) => (
        <FlowNodeRow
          key={`${child.type}-${child.id}`}
          node={child}
          depth={depth + 1}
          isLast={i === node.children.length - 1}
        />
      ))}
    </>
  );
}

// ─── Component ──────────────────────────────────────────────

interface DocumentFlowTreeProps {
  project: Project;
}

export function DocumentFlowTree({ project }: DocumentFlowTreeProps) {
  const roots = buildFlowTree(project);

  if (roots.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed p-12 text-center">
        <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The document flow chain will appear here as documents are created.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      {roots.map((root, i) => (
        <FlowNodeRow
          key={`${root.type}-${root.id}`}
          node={root}
          depth={0}
          isLast={i === roots.length - 1}
        />
      ))}
    </div>
  );
}
