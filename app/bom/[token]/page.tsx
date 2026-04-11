import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
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
import { Hexagon, AlertTriangle, Info } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ token: string }>;
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

const CATEGORY_ORDER = [
  "foundation",
  "framing",
  "decking",
  "fasteners",
  "fascia",
  "railing",
  "add-ons",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: estimate } = await supabase
    .from("estimates")
    .select("project_name, deck_width_ft, deck_projection_ft")
    .eq("share_token", token)
    .is("deleted_at", null)
    .single();

  return {
    title: estimate
      ? `BOM — ${estimate.deck_width_ft}' x ${estimate.deck_projection_ft}' Deck`
      : "Deck Material List",
  };
}

export default async function BomViewPage({ params }: Props) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: estimate, error } = await supabase
    .from("estimates")
    .select(
      `
      *,
      estimate_line_items (*),
      estimate_stair_sections (*)
    `
    )
    .eq("share_token", token)
    .is("deleted_at", null)
    .single();

  if (error || !estimate) notFound();

  // Load supplier branding if this came from an embed
  let supplier: { name: string; logo_url: string | null; primary_color: string | null } | null = null;
  if (estimate.source?.startsWith("embed_") || estimate.source?.startsWith("supplier_")) {
    const orgId = estimate.source.replace(/^(embed_|supplier_)/, "");
    const { data: org } = await supabase
      .from("organizations")
      .select("name, logo_url, primary_color")
      .eq("id", orgId)
      .single();
    supplier = org;
  }

  const primaryColor = supplier?.primary_color || "#2d7a6b";

  // Group line items by category
  const lineItems = (estimate.estimate_line_items ?? []).sort(
    (a: any, b: any) => a.sort_order - b.sort_order
  );

  const groupedItems: Record<string, any[]> = {};
  for (const item of lineItems) {
    const cat = item.category;
    if (!groupedItems[cat]) groupedItems[cat] = [];
    groupedItems[cat].push(item);
  }

  const sortedCategories = CATEGORY_ORDER.filter((c) => groupedItems[c]);

  const warnings = (estimate.warnings as string[]) ?? [];
  const assumptions = (estimate.assumptions as string[]) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            {supplier?.logo_url ? (
              <img
                src={supplier.logo_url}
                alt={supplier.name}
                className="h-8 w-auto max-w-[120px] object-contain"
              />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <Hexagon className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="text-sm font-bold tracking-tight">
              {supplier?.name || "Deckmetry"}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Material List
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Project Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">
                  {estimate.project_name || "Deck Estimate"}
                </CardTitle>
                <CardDescription className="mt-1">
                  Generated{" "}
                  {new Date(estimate.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge className="shrink-0">{estimate.total_bom_items} items</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Deck Type
                </p>
                <p className="mt-1 text-sm font-medium capitalize">
                  {estimate.deck_type}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Dimensions
                </p>
                <p className="mt-1 text-sm font-medium">
                  {estimate.deck_width_ft}&apos; x {estimate.deck_projection_ft}
                  &apos; ({estimate.total_area_sf} sq ft)
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Material
                </p>
                <p className="mt-1 text-sm font-medium">
                  {estimate.decking_brand || "—"}{" "}
                  {estimate.decking_color ? `— ${estimate.decking_color}` : ""}
                </p>
              </div>
            </div>
            {estimate.project_address && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Project Address
                </p>
                <p className="mt-1 text-sm">{estimate.project_address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Manual Review Required
              </p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {warnings.map((w, i) => (
                  <li
                    key={i}
                    className="text-xs text-amber-700 dark:text-amber-300"
                  >
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* BOM by category */}
        {sortedCategories.map((category) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {CATEGORY_LABELS[category] || category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedItems[category].map((item: any) => (
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
                        <TableCell className="text-sm text-muted-foreground">
                          {item.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Stair sections */}
        {(estimate.estimate_stair_sections ?? []).length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Stair Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Width</TableHead>
                      <TableHead className="text-right">Steps</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estimate.estimate_stair_sections
                      .sort((a: any, b: any) => a.sort_order - b.sort_order)
                      .map((stair: any) => (
                        <TableRow key={stair.id}>
                          <TableCell className="text-sm font-medium capitalize">
                            {stair.location}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {stair.width_ft}&apos;
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {stair.step_count}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assumptions */}
        {assumptions.length > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                Assumptions
              </p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {assumptions.map((a, i) => (
                  <li
                    key={i}
                    className="text-xs text-blue-700 dark:text-blue-300"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-6 border-t">
          <p className="text-xs text-muted-foreground">
            This is a preliminary material list for budgeting and sales support.
            Final quantities should be verified before ordering.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by{" "}
            <a
              href="https://deckmetry.com"
              className="font-semibold hover:underline"
              style={{ color: primaryColor }}
            >
              Deckmetry
            </a>
            {supplier && (
              <>
                {" "}
                &middot; Provided by {supplier.name}
              </>
            )}
          </p>
          <p className="mt-4">
            <a
              href="https://deckmetry.com/estimate"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Create Your Own Estimate
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
