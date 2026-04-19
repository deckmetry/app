import { getEstimate } from "@/lib/actions/estimates";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { ArrowLeft, FileText, Pencil } from "lucide-react";
import { PageHeader } from "@/components/page-header";

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

export default async function ContractorEstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const estimate = await getEstimate(id);

  if (!estimate) notFound();

  const lineItems = (estimate.estimate_line_items ?? []).sort(
    (a: any, b: any) => a.sort_order - b.sort_order
  );

  const grouped = lineItems.reduce((acc: Record<string, any[]>, item: any) => {
    const cat = item.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const stairs = (estimate.estimate_stair_sections ?? []).sort(
    (a: any, b: any) => a.sort_order - b.sort_order
  );

  return (
    <div className="space-y-6">
      <Link
        href="/contractor/estimates"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Estimates
      </Link>

      <PageHeader
        title={estimate.project_name || "Untitled Estimate"}
        description={`${estimate.deck_width_ft}' × ${estimate.deck_projection_ft}' ${estimate.deck_type} deck — ${estimate.total_area_sf ?? "—"} sf • ${lineItems.length} BOM items`}
      >
        <Link href={`/estimate?edit=${id}`}>
          <Button size="sm" variant="outline" className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Estimate
          </Button>
        </Link>
        <Link href={`/contractor/estimates/${id}/quote`}>
          <Button size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Create Quote
          </Button>
        </Link>
      </PageHeader>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {estimate.project_address && (
              <div>
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{estimate.project_address}</p>
              </div>
            )}
            {estimate.contractor_name && (
              <div>
                <p className="text-muted-foreground">Contractor</p>
                <p className="font-medium">{estimate.contractor_name}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Deck Type</p>
              <p className="font-medium capitalize">{estimate.deck_type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Dimensions</p>
              <p className="font-medium">
                {estimate.deck_width_ft}&apos; × {estimate.deck_projection_ft}&apos;
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Height</p>
              <p className="font-medium">{estimate.deck_height_in}&quot;</p>
            </div>
            <div>
              <p className="text-muted-foreground">Joist Spacing</p>
              <p className="font-medium">{estimate.joist_spacing_in}&quot; o.c.</p>
            </div>
            {estimate.decking_brand && (
              <div>
                <p className="text-muted-foreground">Surface</p>
                <p className="font-medium">
                  {estimate.decking_brand} {estimate.decking_collection}{" "}
                  {estimate.decking_color && `— ${estimate.decking_color}`}
                </p>
              </div>
            )}
            {estimate.railing_material && (
              <div>
                <p className="text-muted-foreground">Railing</p>
                <p className="font-medium capitalize">
                  {estimate.railing_material}
                  {estimate.railing_color && ` — ${estimate.railing_color}`}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant="secondary" className="capitalize">
                {estimate.status}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">
                {new Date(estimate.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stairs */}
      {stairs.length > 0 && (
        <Card>
          <CardHeader>
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
                  {stairs.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="capitalize">{s.location}</TableCell>
                      <TableCell className="text-right">{s.width_ft}&apos;</TableCell>
                      <TableCell className="text-right">{s.step_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* BOM by Category */}
      {CATEGORY_ORDER.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;

        return (
          <Card key={cat}>
            <CardHeader>
              <CardTitle className="text-base">
                {CATEGORY_LABELS[cat] ?? cat}
                <Badge variant="secondary" className="ml-2">
                  {items.length}
                </Badge>
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
                    {items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">
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
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {item.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/contractor/estimates">
          <Button variant="outline">Back to Estimates</Button>
        </Link>
        <Link href={`/estimate?edit=${id}`}>
          <Button variant="outline" className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Estimate
          </Button>
        </Link>
        <Link href={`/contractor/estimates/${id}/quote`}>
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            Create Quote
          </Button>
        </Link>
      </div>
    </div>
  );
}
