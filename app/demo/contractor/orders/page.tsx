import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, CreditCard, Receipt, Copy } from "lucide-react";
import { contractorOrders, formatCurrency, statusBadgeClass } from "../../contractor-data";

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  View: Eye,
  "Pay Balance": CreditCard,
  "View Receipt": Receipt,
  "Clone Project": Copy,
};

export default function ContractorOrdersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Orders"
        description="Material requests you've submitted to Wehrung's, and their status."
      />

      <Card>
        <CardHeader><CardTitle className="text-base">Orders ({contractorOrders.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractorOrders.map((o) => (
                  <TableRow key={o.number}>
                    <TableCell className="font-mono text-sm font-medium">{o.number}</TableCell>
                    <TableCell className="text-sm">
                      <Link href={`/demo/contractor/projects/${o.projectId}`} className="hover:text-primary hover:underline">{o.project}</Link>
                    </TableCell>
                    <TableCell><Badge variant="outline" className={statusBadgeClass(o.status)}>{o.status}</Badge></TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(o.total)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{o.deliveryDate}</TableCell>
                    <TableCell><Badge variant="outline" className={statusBadgeClass(o.paymentStatus)}>{o.paymentStatus}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {o.actions.map((a) => {
                          const Icon = ACTION_ICONS[a] ?? Eye;
                          const href =
                            a === "Pay Balance" ? "/demo/contractor/payments"
                            : a === "Clone Project" ? `/demo/contractor/projects/${o.projectId}`
                            : `/demo/contractor/projects/${o.projectId}`;
                          return (
                            <Button key={a} asChild variant={a === "Pay Balance" ? "outline" : "ghost"} size="sm" className="gap-1.5">
                              <Link href={href}><Icon className="h-3.5 w-3.5" /> {a}</Link>
                            </Button>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
