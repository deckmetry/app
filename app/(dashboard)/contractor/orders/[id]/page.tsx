import { getOrder } from "@/lib/actions/orders";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContractorOrderActions } from "./contractor-order-actions";

function fmt(n: number) {
  return (
    "$" +
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  confirmed: "bg-amber-100 text-amber-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

// Order timeline steps
const timelineSteps = [
  { key: "draft", label: "Created" },
  { key: "submitted", label: "Submitted" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function OrderTimeline({ status }: { status: string }) {
  const currentIdx = timelineSteps.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-1">
      {timelineSteps.map((step, idx) => {
        const isDone = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <div key={step.key} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full ${
                  isDone
                    ? "bg-primary"
                    : "bg-muted border border-muted-foreground/30"
                } ${isCurrent ? "ring-2 ring-primary/30" : ""}`}
              />
              <span
                className={`text-[10px] mt-1 ${
                  isDone ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < timelineSteps.length - 1 && (
              <div
                className={`h-0.5 w-8 mt-[-12px] ${
                  idx < currentIdx ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default async function ContractorOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  const lineItems = (order.order_line_items ?? []).sort(
    (a: any, b: any) => a.sort_order - b.sort_order
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-muted-foreground">{order.title}</p>
        </div>
        <Badge
          variant="outline"
          className={`capitalize text-sm ${statusColors[order.status] ?? ""}`}
        >
          {order.status}
        </Badge>
      </div>

      {/* Timeline */}
      {order.status !== "cancelled" && (
        <Card>
          <CardContent className="pt-6 flex justify-center">
            <OrderTimeline status={order.status} />
          </CardContent>
        </Card>
      )}

      {/* Delivery tracking */}
      {order.deliveries && order.deliveries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            {order.deliveries.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">
                    {d.carrier ?? "Carrier TBD"}{" "}
                    {d.tracking_number && (
                      <span className="text-muted-foreground">
                        #{d.tracking_number}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {d.status.replace(/_/g, " ")}
                  </p>
                </div>
                {d.tracking_url && (
                  <a
                    href={d.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline"
                  >
                    Track
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Line items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">
                      {item.description}
                      {item.size && (
                        <span className="ml-1 text-muted-foreground">
                          ({item.size})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.unit}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {fmt(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium">
                      {fmt(item.line_total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-end space-y-2">
            <div className="flex justify-between w-64">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm font-mono">{fmt(order.subtotal)}</span>
            </div>
            {Number(order.tax_amount) > 0 && (
              <div className="flex justify-between w-64">
                <span className="text-sm text-muted-foreground">Tax</span>
                <span className="text-sm font-mono">{fmt(order.tax_amount)}</span>
              </div>
            )}
            {Number(order.shipping_amount) > 0 && (
              <div className="flex justify-between w-64">
                <span className="text-sm text-muted-foreground">Shipping</span>
                <span className="text-sm font-mono">{fmt(order.shipping_amount)}</span>
              </div>
            )}
            <div className="flex justify-between w-64 border-t pt-2 mt-2">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold font-mono text-primary">
                {fmt(order.total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions (draft only) */}
      <ContractorOrderActions orderId={order.id} status={order.status} />
    </div>
  );
}
