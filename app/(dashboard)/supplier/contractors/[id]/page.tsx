import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EditContractorForm } from "./edit-contractor-form";

const PROJECT_STATUS_COLORS: Record<string, string> = {
  bom_created: "bg-gray-100 text-gray-700",
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-800",
  revision_requested: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  scheduled: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-teal-100 text-teal-800",
  completed: "bg-green-100 text-green-800",
  paid: "bg-green-200 text-green-900",
  canceled_lost: "bg-red-100 text-red-800",
};

export default async function ContractorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
  if (!orgId) redirect("/dashboard");

  const { data: contractor } = await supabase
    .from("org_customers")
    .select("*")
    .eq("id", id)
    .eq("owner_org_id", orgId)
    .eq("customer_role", "contractor")
    .single();

  if (!contractor) notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, project_number, status, created_at, updated_at")
    .eq("supplier_org_id", orgId)
    .eq("contractor_org_id", contractor.customer_org_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const allProjects = projects ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link href="/supplier/contractors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={contractor.company_name ?? "Contractor"}
          description={contractor.contact_name ?? undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <EditContractorForm contractor={contractor} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <Badge
                  variant="outline"
                  className={
                    contractor.discount_pct > 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-600"
                  }
                >
                  {contractor.discount_pct > 0
                    ? `-${contractor.discount_pct}%`
                    : "No discount"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Projects</span>
                <span className="font-medium">{allProjects.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Added</span>
                <span>{new Date(contractor.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Projects ({allProjects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No projects yet for this contractor.
                </p>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allProjects.map((p: any) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium text-sm">
                            <Link
                              href={`/supplier/projects/${p.id}`}
                              className="hover:underline text-primary"
                            >
                              {p.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {p.project_number}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${PROJECT_STATUS_COLORS[p.status] ?? ""}`}
                            >
                              {p.status?.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
