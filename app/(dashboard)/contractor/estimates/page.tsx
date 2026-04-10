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
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

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
      <PageHeader
        title="Estimates"
        description="All your deck estimates. Create quotes from completed estimates."
      >
        <Link href="/estimate">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Estimate
          </Button>
        </Link>
      </PageHeader>

      {rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No estimates yet"
          description="Create your first deck estimate using the wizard, then come back here to build quotes and proposals."
          actionLabel="Create Estimate"
          actionHref="/estimate"
        />
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
                    <Link
                      href={`/contractor/estimates/${est.id}/quote`}
                      className="hover:underline"
                    >
                      {est.project_name || "Untitled"}
                    </Link>
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
