import { listOrders } from "@/lib/actions/orders";
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
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Package } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  confirmed: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  processing: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
  shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

function fmt(n: number) {
  return (
    "$" +
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default async function ContractorOrdersPage() {
  const orders = await listOrders("contractor");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Purchase orders sent to suppliers"
      />

      <Card>
        <CardContent className="pt-6">
          {orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No orders yet"
              description="Create an order from an approved quote"
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
                    <TableHead>Date</TableHead>
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
                        <Badge
                          variant="outline"
                          className={`capitalize ${statusColors[order.status] ?? ""}`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {fmt(order.total)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link href={`/contractor/orders/${order.id}`}>
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
