"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createQuote } from "@/lib/actions/quotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

interface LineItem {
  category: string;
  description: string;
  size: string | null;
  quantity: number;
  unit: string;
  unit_cost: number;
  markup_pct: number;
  notes: string | null;
  sort_order: number;
  visible_to_customer: boolean;
}

interface EstimateData {
  id: string;
  project_name: string;
  deck_type: string;
  deck_width_ft: number;
  deck_projection_ft: number;
  total_area_sf: number | null;
  contractor_name: string | null;
  project_address: string | null;
  decking_brand: string | null;
  decking_collection: string | null;
  decking_color: string | null;
  estimate_line_items: {
    category: string;
    description: string;
    size: string | null;
    quantity: number;
    unit: string;
    notes: string | null;
    sort_order: number;
  }[];
}

export default function QuoteBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const estimateId = params.id as string;

  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Quote fields
  const [title, setTitle] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("50% deposit, balance on delivery");
  const [taxRate, setTaxRate] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  useEffect(() => {
    async function loadEstimate() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("estimates")
        .select(`
          id, project_name, deck_type, deck_width_ft, deck_projection_ft,
          total_area_sf, contractor_name, project_address,
          decking_brand, decking_collection, decking_color,
          estimate_line_items (
            category, description, size, quantity, unit, notes, sort_order
          )
        `)
        .eq("id", estimateId)
        .single();

      if (error || !data) {
        setError("Estimate not found");
        setLoading(false);
        return;
      }

      setEstimate(data as EstimateData);
      setTitle(`Proposal for ${data.project_name || "Deck Project"}`);

      // Default valid for 30 days
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + 30);
      setValidUntil(validDate.toISOString().split("T")[0]);

      // Convert BOM items to quote line items with default pricing
      const items: LineItem[] = (data.estimate_line_items ?? []).map(
        (item: any) => ({
          category: item.category,
          description: item.description,
          size: item.size,
          quantity: item.quantity,
          unit: item.unit,
          unit_cost: 0,
          markup_pct: 25,
          notes: item.notes,
          sort_order: item.sort_order,
          visible_to_customer: true,
        })
      );

      setLineItems(items);
      setLoading(false);
    }

    loadEstimate();
  }, [estimateId]);

  const updateLineItem = useCallback(
    (index: number, field: keyof LineItem, value: any) => {
      setLineItems((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    },
    []
  );

  const subtotal = lineItems.reduce(
    (sum, item) =>
      sum + item.quantity * item.unit_cost * (1 + item.markup_pct / 100),
    0
  );
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount - discountAmount;

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const result = await createQuote({
      estimate_id: estimateId,
      title,
      cover_note: coverNote || undefined,
      valid_until: validUntil || undefined,
      payment_terms: paymentTerms || undefined,
      tax_rate: taxRate / 100,
      discount_amount: discountAmount,
      line_items: lineItems,
    });

    if (!result.success) {
      setError(result.error ?? "Failed to create quote");
      setSaving(false);
      return;
    }

    router.push("/contractor/quotes");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{error || "Estimate not found"}</p>
        <Link href="/contractor/estimates" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            Back to Estimates
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/contractor/estimates">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Quote Builder
            </h1>
            <p className="text-sm text-muted-foreground">
              {estimate.project_name} &mdash; {estimate.deck_width_ft}&apos; x{" "}
              {estimate.deck_projection_ft}&apos;{" "}
              {estimate.deck_type}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Quote
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quote details */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Proposal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverNote">Cover Note</Label>
              <Textarea
                id="coverNote"
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Thank you for the opportunity to provide this proposal..."
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">
                ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="taxRate" className="text-sm">
                  Tax Rate (%)
                </Label>
                <Input
                  id="taxRate"
                  type="number"
                  min={0}
                  step={0.25}
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-24 text-right"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-mono">
                  ${taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="discount" className="text-sm">
                  Discount ($)
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min={0}
                  step={1}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-24 text-right"
                />
              </div>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="font-mono">
                ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line items table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line Items</CardTitle>
          <CardDescription>
            Set unit costs and markup for each BOM item. Items marked hidden
            won&apos;t appear on the customer-facing proposal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">Visible</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Markup %</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item, i) => {
                  const unitPrice =
                    item.unit_cost * (1 + item.markup_pct / 100);
                  const lineTotal = item.quantity * unitPrice;
                  return (
                    <TableRow key={i}>
                      <TableCell>
                        <Switch
                          checked={item.visible_to_customer}
                          onCheckedChange={(v) =>
                            updateLineItem(i, "visible_to_customer", v)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">
                          {item.category}
                        </Badge>
                      </TableCell>
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
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.unit_cost || ""}
                          onChange={(e) =>
                            updateLineItem(
                              i,
                              "unit_cost",
                              Number(e.target.value)
                            )
                          }
                          className="w-24 text-right font-mono"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          value={item.markup_pct}
                          onChange={(e) =>
                            updateLineItem(
                              i,
                              "markup_pct",
                              Number(e.target.value)
                            )
                          }
                          className="w-20 text-right font-mono"
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        ${unitPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium">
                        ${lineTotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
