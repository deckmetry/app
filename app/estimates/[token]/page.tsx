import { getSupplierEstimateByToken } from "@/lib/actions/supplier-estimates";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Hexagon, Clock, CheckCircle2, Package } from "lucide-react";

function fmt(n: number) {
  return (
    "$" +
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default async function PublicSupplierEstimatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const estimate = await getSupplierEstimateByToken(token);

  if (!estimate) notFound();

  const lineItems = (estimate.supplier_estimate_line_items ?? []).sort(
    (a: any, b: any) => a.sort_order - b.sort_order
  );

  const isAccepted = estimate.status === "accepted";
  const supplier = estimate.organizations;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Hexagon className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight">Deckmetry</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Status banner */}
        {isAccepted && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                Estimate Accepted
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Accepted on {new Date(estimate.accepted_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Estimate header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{estimate.title || "Material Estimate"}</CardTitle>
                <CardDescription className="mt-1">
                  {estimate.estimate_number} &mdash; From{" "}
                  {supplier?.name ?? "Supplier"} &mdash; Created{" "}
                  {new Date(estimate.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge
                variant={isAccepted ? "default" : "secondary"}
                className="capitalize shrink-0"
              >
                {isAccepted ? "Accepted" : estimate.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {estimate.cover_note && (
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {estimate.cover_note}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Availability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.size || "—"}
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
                      <TableCell className="text-center">
                        {item.in_stock ? (
                          <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            In Stock
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            {item.lead_time_days ? `${item.lead_time_days}d lead` : "Out of Stock"}
                          </Badge>
                        )}
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
                <span className="text-sm font-mono">{fmt(estimate.subtotal)}</span>
              </div>
              {Number(estimate.tax_amount) > 0 && (
                <div className="flex justify-between w-64">
                  <span className="text-sm text-muted-foreground">Tax</span>
                  <span className="text-sm font-mono">{fmt(estimate.tax_amount)}</span>
                </div>
              )}
              {Number(estimate.discount_amount) > 0 && (
                <div className="flex justify-between w-64">
                  <span className="text-sm text-muted-foreground">Discount</span>
                  <span className="text-sm font-mono">-{fmt(estimate.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between w-64 border-t pt-2 mt-2">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold font-mono text-primary">
                  {fmt(estimate.total)}
                </span>
              </div>
            </div>
            {estimate.valid_until && (
              <p className="mt-4 text-xs text-muted-foreground text-right flex items-center justify-end gap-1">
                <Clock className="h-3 w-3" />
                Valid until {new Date(estimate.valid_until).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
