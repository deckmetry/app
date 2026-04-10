import { listDeliveries } from "@/lib/actions/deliveries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  in_transit: "bg-blue-100 text-blue-800",
  out_for_delivery: "bg-amber-100 text-amber-800",
  delivered: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

export default async function SupplierDeliveriesPage() {
  const deliveries = await listDeliveries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deliveries</h1>
        <p className="text-muted-foreground">
          Track shipments and proof of delivery
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {deliveries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No deliveries yet</p>
              <p className="text-sm mt-1">
                Create a delivery from a confirmed order
              </p>
            </div>
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
                        {d.orders?.order_number ?? "—"}
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
