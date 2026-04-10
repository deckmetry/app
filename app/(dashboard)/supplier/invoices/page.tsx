import { listInvoices } from "@/lib/actions/invoices";
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
import { Eye, FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  void: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
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

export default async function SupplierInvoicesPage() {
  const invoices = await listInvoices("supplier");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage invoices for orders"
      />

      <Card>
        <CardContent className="pt-6">
          {invoices.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No invoices yet"
              description="Create an invoice from a confirmed order"
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-sm">
                        {inv.invoice_number}
                      </TableCell>
                      <TableCell className="font-medium">{inv.title}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize ${statusColors[inv.status] ?? ""}`}
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {fmt(inv.total)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inv.due_date
                          ? new Date(inv.due_date).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Link href={`/supplier/invoices/${inv.id}`}>
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
