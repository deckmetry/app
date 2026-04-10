import { listOrders } from "@/lib/actions/orders";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
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
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Package } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

const statusColors: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  confirmed: "bg-amber-100 text-amber-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={`capitalize ${statusColors[status] ?? ""}`}
    >
      {status}
    </Badge>
  );
}

function fmt(n: number) {
  return (
    "$" +
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default async function SupplierOrdersPage() {
  const orders = await listOrders("supplier");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Inbox"
        description="Incoming purchase orders from contractors"
      />

      <Card>
        <CardContent className="pt-6">
          {orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No orders yet"
              description="Orders from contractors will appear here"
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.order_number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.title}
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {fmt(order.total)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.submitted_at
                          ? new Date(order.submitted_at).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Link href={`/supplier/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
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
