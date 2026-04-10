import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, FileText, ExternalLink } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "outline"> = {
    draft: "outline",
    completed: "default",
    shared: "secondary",
    archived: "outline",
  };
  return (
    <Badge variant={variants[status] ?? "outline"} className="capitalize">
      {status}
    </Badge>
  );
}

export default async function ContractorEstimatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  const orgId = profile?.default_organization_id;
  if (!orgId) redirect("/login");

  const { data: estimates } = await supabase
    .from("estimates")
    .select(
      "id, project_name, status, deck_type, deck_width_ft, deck_projection_ft, total_area_sf, total_bom_items, created_at"
    )
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const rows = estimates ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estimates</h1>
          <p className="text-sm text-muted-foreground">
            All your deck estimates. Create quotes from completed estimates.
          </p>
        </div>
        <Link href="/">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Estimate
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/50 mb-4" />
          <h3 className="text-sm font-semibold text-muted-foreground">
            No estimates yet
          </h3>
          <p className="mt-1 text-xs text-muted-foreground/70 max-w-[300px]">
            Create your first deck estimate using the wizard, then come back
            here to build quotes and proposals.
          </p>
          <Link href="/" className="mt-4">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Estimate
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead className="text-right">Area</TableHead>
                <TableHead className="text-right">BOM Items</TableHead>
                <TableHead className="text-right">Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((est) => (
                <TableRow key={est.id}>
                  <TableCell className="font-medium">
                    {est.project_name || "Untitled"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={est.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {est.deck_width_ft}&apos; x {est.deck_projection_ft}&apos;{" "}
                    <span className="capitalize">{est.deck_type}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {est.total_area_sf ?? "—"} sf
                  </TableCell>
                  <TableCell className="text-right">
                    {est.total_bom_items ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(est.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/contractor/estimates/${est.id}/quote`}
                    >
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <ExternalLink className="h-3 w-3" />
                        Quote
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
