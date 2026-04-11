"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupplierEstimate, sendSupplierEstimate } from "@/lib/actions/supplier-estimates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Save, Package } from "lucide-react";

interface BomLineItem {
  id: string;
  category: string;
  description: string;
  size: string | null;
  quantity: number;
  unit: string;
  notes: string | null;
  sort_order: number;
}

interface EstimateInfo {
  id: string;
  project_name: string;
  project_id: string | null;
  deck_type: string;
  deck_width_ft: number;
  deck_projection_ft: number;
  total_area_sf: number | null;
  decking_brand: string | null;
  decking_collection: string | null;
  decking_color: string | null;
  organization_id: string;
}

interface LineItemState {
  unit_price: number;
  in_stock: boolean;
  lead_time_days: number | null;
}

interface SupplierEstimateBuilderProps {
  estimate: EstimateInfo;
  bomItems: BomLineItem[];
}

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const CATEGORY_LABELS: Record<string, string> = {
  foundation: "Foundation",
  framing: "Framing",
  decking: "Decking",
  fasteners: "Fasteners",
  fascia: "Fascia",
  railing: "Railing",
  "add-ons": "Add-ons",
};

export function SupplierEstimateBuilder({ estimate, bomItems }: SupplierEstimateBuilderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(`Material Estimate — ${estimate.project_name}`);
  const [coverNote, setCoverNote] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [taxRate, setTaxRate] = useState(0);

  // Per-line-item state
  const [itemStates, setItemStates] = useState<Record<string, LineItemState>>(() => {
    const initial: Record<string, LineItemState> = {};
    for (const item of bomItems) {
      initial[item.id] = { unit_price: 0, in_stock: true, lead_time_days: null };
    }
    return initial;
  });

  function updateItem(id: string, updates: Partial<LineItemState>) {
    setItemStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  }

  // Calculate totals
  const subtotal = bomItems.reduce((sum, item) => {
    const state = itemStates[item.id];
    return sum + item.quantity * (state?.unit_price ?? 0);
  }, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  // Group by category
  const grouped = bomItems.reduce((acc: Record<string, BomLineItem[]>, item) => {
    const cat = item.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryOrder = ["foundation", "framing", "decking", "fasteners", "fascia", "railing", "add-ons"];

  async function handleSave(andSend: boolean) {
    startTransition(async () => {
      const lineItems = bomItems.map((item) => {
        const state = itemStates[item.id];
        return {
          category: item.category,
          description: item.description,
          size: item.size,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: state?.unit_price ?? 0,
          in_stock: state?.in_stock ?? true,
          lead_time_days: state?.lead_time_days ?? undefined,
          notes: item.notes,
          sort_order: item.sort_order,
        };
      });

      const result = await createSupplierEstimate({
        estimate_id: estimate.id,
        project_id: estimate.project_id ?? undefined,
        recipient_org_id: estimate.organization_id,
        title,
        cover_note: coverNote || undefined,
        valid_until: validUntil || undefined,
        tax_rate: taxRate / 100,
        line_items: lineItems,
      });

      if (!result.success) return;

      if (andSend && result.supplierEstimateId) {
        await sendSupplierEstimate(result.supplierEstimateId);
      }

      router.push("/supplier/projects");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Estimate info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            BOM Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Project</p>
              <p className="font-medium">{estimate.project_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Deck</p>
              <p className="font-medium">
                {estimate.deck_width_ft}&apos; x {estimate.deck_projection_ft}&apos; {estimate.deck_type}
                {estimate.total_area_sf ? ` — ${estimate.total_area_sf} sf` : ""}
              </p>
            </div>
            {estimate.decking_brand && (
              <div>
                <p className="text-muted-foreground">Material</p>
                <p className="font-medium">
                  {estimate.decking_brand} {estimate.decking_collection} {estimate.decking_color && `— ${estimate.decking_color}`}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estimate settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estimate Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="coverNote">Cover Note</Label>
            <Textarea
              id="coverNote"
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Include a message for the recipient..."
              rows={3}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line items by category */}
      {categoryOrder.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;

        return (
          <Card key={cat}>
            <CardHeader>
              <CardTitle className="text-base">
                {CATEGORY_LABELS[cat] ?? cat}
                <Badge variant="secondary" className="ml-2">{items.length}</Badge>
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
                      <TableHead className="text-right w-[120px]">Unit Price</TableHead>
                      <TableHead className="text-right">Line Total</TableHead>
                      <TableHead className="text-center w-[70px]">In Stock</TableHead>
                      <TableHead className="w-[90px]">Lead Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const state = itemStates[item.id];
                      const lineTotal = item.quantity * (state?.unit_price ?? 0);

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm font-medium">{item.description}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.size || "—"}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.unit}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              className="h-8 w-[100px] text-right font-mono text-sm ml-auto"
                              value={state?.unit_price ?? 0}
                              onChange={(e) => updateItem(item.id, { unit_price: Number(e.target.value) })}
                            />
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-medium">
                            {fmt(lineTotal)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={state?.in_stock ?? true}
                              onCheckedChange={(checked) => updateItem(item.id, { in_stock: !!checked })}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              placeholder="days"
                              className="h-8 w-[70px] text-sm"
                              value={state?.lead_time_days ?? ""}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  lead_time_days: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Totals */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-end space-y-2">
            <div className="flex justify-between w-64">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm font-mono">{fmt(subtotal)}</span>
            </div>
            {taxAmount > 0 && (
              <div className="flex justify-between w-64">
                <span className="text-sm text-muted-foreground">Tax ({taxRate}%)</span>
                <span className="text-sm font-mono">{fmt(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between w-64 border-t pt-2 mt-2">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold font-mono text-primary">{fmt(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => handleSave(false)}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save as Draft
        </Button>
        <Button
          disabled={isPending || subtotal === 0}
          onClick={() => handleSave(true)}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          {isPending ? "Saving..." : "Save & Send"}
        </Button>
      </div>
    </div>
  );
}
