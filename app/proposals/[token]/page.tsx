import { createClient } from "@/lib/supabase/server";
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
import { Hexagon, Download, CheckCircle2, Clock } from "lucide-react";
import { ApprovalForm } from "./approval-form";

function fmt(n: number) {
  return (
    "$" +
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default async function ProposalReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: quote, error } = await supabase
    .from("quotes")
    .select(`
      *,
      quote_line_items (
        id, category, description, size, quantity, unit,
        unit_price, line_total, visible_to_customer, sort_order
      ),
      estimates (
        project_name, deck_type, deck_width_ft, deck_projection_ft,
        total_area_sf, contractor_name, project_address,
        decking_brand, decking_collection, decking_color
      ),
      approvals (id, signer_name, approved_at)
    `)
    .eq("share_token", token)
    .is("deleted_at", null)
    .single();

  if (error || !quote) notFound();

  // Mark as viewed
  if (quote.status === "sent" && !quote.viewed_at) {
    await supabase
      .from("quotes")
      .update({ status: "viewed", viewed_at: new Date().toISOString() })
      .eq("id", quote.id);
  }

  const visibleItems = (quote.quote_line_items ?? [])
    .filter((i: any) => i.visible_to_customer)
    .sort((a: any, b: any) => a.sort_order - b.sort_order);

  const isApproved =
    quote.status === "approved" || (quote.approvals?.length ?? 0) > 0;
  const estimate = quote.estimates;

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
          <a
            href={`/api/quotes/${quote.id}/pdf`}
            target="_blank"
            rel="noopener"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Status banner */}
        {isApproved && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Proposal Approved
              </p>
              <p className="text-xs text-emerald-700">
                Approved by {quote.approvals?.[0]?.signer_name ?? "—"} on{" "}
                {new Date(
                  quote.approvals?.[0]?.approved_at ?? quote.approved_at
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Proposal header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{quote.title}</CardTitle>
                <CardDescription className="mt-1">
                  {quote.quote_number} &mdash; Created{" "}
                  {new Date(quote.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge
                variant={isApproved ? "default" : "secondary"}
                className="capitalize shrink-0"
              >
                {isApproved ? "Approved" : quote.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Project
                </p>
                <p className="mt-1 text-sm font-medium">
                  {estimate?.project_name}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Deck
                </p>
                <p className="mt-1 text-sm font-medium">
                  {estimate?.deck_width_ft}&apos; x{" "}
                  {estimate?.deck_projection_ft}&apos; {estimate?.deck_type} (
                  {estimate?.total_area_sf} sf)
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Material
                </p>
                <p className="mt-1 text-sm font-medium">
                  {estimate?.decking_brand} {estimate?.decking_color}
                </p>
              </div>
            </div>
            {estimate?.project_address && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Address
                </p>
                <p className="mt-1 text-sm">{estimate.project_address}</p>
              </div>
            )}
            {quote.cover_note && (
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {quote.cover_note}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Materials &amp; Services
            </CardTitle>
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
                  {visibleItems.map((item: any) => (
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
                <span className="text-sm font-mono">{fmt(quote.subtotal)}</span>
              </div>
              {Number(quote.tax_amount) > 0 && (
                <div className="flex justify-between w-64">
                  <span className="text-sm text-muted-foreground">Tax</span>
                  <span className="text-sm font-mono">
                    {fmt(quote.tax_amount)}
                  </span>
                </div>
              )}
              {Number(quote.discount_amount) > 0 && (
                <div className="flex justify-between w-64">
                  <span className="text-sm text-muted-foreground">
                    Discount
                  </span>
                  <span className="text-sm font-mono">
                    -{fmt(quote.discount_amount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between w-64 border-t pt-2 mt-2">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold font-mono text-primary">
                  {fmt(quote.total)}
                </span>
              </div>
            </div>
            {quote.payment_terms && (
              <p className="mt-4 text-xs text-muted-foreground text-right">
                Terms: {quote.payment_terms}
              </p>
            )}
            {quote.valid_until && (
              <p className="mt-1 text-xs text-muted-foreground text-right flex items-center justify-end gap-1">
                <Clock className="h-3 w-3" />
                Valid until{" "}
                {new Date(quote.valid_until).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Approval form */}
        {!isApproved && (
          <ApprovalForm
            quoteId={quote.id}
            organizationId={quote.organization_id}
            quoteNumber={quote.quote_number}
            total={Number(quote.total)}
            token={token}
          />
        )}
      </main>
    </div>
  );
}
