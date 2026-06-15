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
import { projectStatusLabel, scopeLabel } from "@/lib/project-status";

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
      "id, project_name, status, scope, deck_type, deck_width_ft, deck_projection_ft, total_area_sf, total_bom_items, created_at, project:projects(status)"
    )
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const rows = (estimates ?? []) as Array<{
    id: string;
    project_name: string | null;
    status: string;
    scope: string | null;
    deck_type: string | null;
    deck_width_ft: number | null;
    deck_projection_ft: number | null;
    total_area_sf: number | null;
    total_bom_items: number | null;
    created_at: string;
    project: { status: string | null } | { status: string | null }[] | null;
  }>;

  const projStatus = (p: (typeof rows)[number]["project"]) =>
    Array.isArray(p) ? p[0]?.status ?? null : p?.status ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Your material lists. Save drafts, finish lists, email suppliers, and request reviews."
      >
        <Link href="/estimate/pro?role=contractor">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </PageHeader>

      {rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No projects yet"
          description="Start a new project to build a material list — deck, roof, or both — then save, print, or send it to your supplier."
          actionLabel="New Project"
          actionHref="/estimate/pro?role=contractor"
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">BOM Items</TableHead>
                <TableHead className="text-right">Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((est) => {
                const status = projectStatusLabel(est.status, projStatus(est.project));
                return (
                  <TableRow key={est.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/contractor/estimates/${est.id}`}
                        className="hover:underline"
                      >
                        {est.project_name || "Untitled"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{scopeLabel(est.scope)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {est.deck_width_ft
                        ? `${est.deck_width_ft}' x ${est.deck_projection_ft}' ${est.deck_type ?? ""}`
                        : "Roof project"}
                    </TableCell>
                    <TableCell className="text-right">
                      {est.total_bom_items ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(est.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/estimate/pro?edit=${est.id}&role=contractor`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <ExternalLink className="h-3 w-3" />
                          Open
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
