import { listDeliveries } from "@/lib/actions/deliveries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Truck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  in_transit: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  out_for_delivery: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

export default async function SupplierDeliveriesPage() {
  const deliveries = await listDeliveries();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deliveries"
        description="Track shipments and proof of delivery"
      />

      <Card>
        <CardContent className="pt-6">
          {deliveries.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No deliveries yet"
              description="Create a delivery from a confirmed order"
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Delivered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((d: any) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-sm">
                        {d.order_id ? (
                          <Link
                            href={`/supplier/orders/${d.order_id}`}
                            className="hover:underline text-primary"
                          >
                            {d.orders?.order_number ?? "—"}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {d.carrier ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {d.tracking_url ? (
                          <a
                            href={d.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            {d.tracking_number ?? "Track"}
                          </a>
                        ) : (
                          d.tracking_number ?? "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize ${statusColors[d.status] ?? ""}`}
                        >
                          {d.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {d.estimated_date
                          ? new Date(d.estimated_date).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {d.actual_date
                          ? new Date(d.actual_date).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
