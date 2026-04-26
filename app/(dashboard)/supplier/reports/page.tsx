import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
import { TrendingUp, Package, HardHat, FileText } from "lucide-react";

function MetricTile({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function SupplierReportsPage() {
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

  // Run all queries in parallel
  const [
    projectsRes,
    leadsRes,
    contractorsRes,
    projectsByStatusRes,
    recentProjectsRes,
  ] = await Promise.all([
    // total projects + submitted+
    supabase
      .from("projects")
      .select("id, status, created_at")
      .eq("supplier_org_id", orgId)
      .is("deleted_at", null),
    // leads
    supabase
      .from("supplier_leads")
      .select("id, status, created_at")
      .eq("supplier_org_id", orgId),
    // active contractors
    supabase
      .from("org_customers")
      .select("id, company_name, contact_name, discount_pct, customer_org_id, created_at")
      .eq("owner_org_id", orgId)
      .eq("customer_role", "contractor")
      .eq("status", "active"),
    // projects by status
    supabase
      .from("projects")
      .select("status")
      .eq("supplier_org_id", orgId)
      .is("deleted_at", null),
    // recent projects
    supabase
      .from("projects")
      .select("id, name, project_number, status, created_at, contractor_org_id")
      .eq("supplier_org_id", orgId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const projects = projectsRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const contractors = contractorsRes.data ?? [];
  const recentProjects = recentProjectsRes.data ?? [];

  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (p: any) => !["bom_created", "cancelled", "complete"].includes(p.status)
  ).length;
  const completedProjects = projects.filter(
    (p: any) => p.status === "complete" || p.status === "delivered" || p.status === "paid"
  ).length;
  const totalLeads = leads.length;
  const newLeads = leads.filter((l: any) => l.status === "new").length;
  const convertedLeads = leads.filter((l: any) => l.status === "converted").length;
  const conversionRate =
    totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Project count per contractor
  const projectsByContractor: Record<string, number> = {};
  for (const p of projects) {
    const k = (p as any).contractor_org_id;
    if (k) projectsByContractor[k] = (projectsByContractor[k] ?? 0) + 1;
  }

  // Status distribution
  const statusCounts: Record<string, number> = {};
  for (const p of projectsByStatusRes.data ?? []) {
    statusCounts[(p as any).status] = (statusCounts[(p as any).status] ?? 0) + 1;
  }

  const contractorOrgId2Name = new Map(
    contractors.map((c: any) => [c.customer_org_id, c.company_name ?? "Unknown"])
  );

  const STATUS_COLORS: Record<string, string> = {
    bom_created: "bg-gray-100 text-gray-700",
    submitted: "bg-blue-100 text-blue-800",
    revision_requested: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    scheduled: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-teal-100 text-teal-800",
    complete: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Sales activity and project pipeline overview"
      />

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Total Projects"
          value={totalProjects}
          sub={`${activeProjects} active`}
          icon={FileText}
        />
        <MetricTile
          label="Completed"
          value={completedProjects}
          sub={totalProjects > 0 ? `${Math.round((completedProjects / totalProjects) * 100)}% completion rate` : "—"}
          icon={TrendingUp}
        />
        <MetricTile
          label="Homeowner Leads"
          value={totalLeads}
          sub={`${newLeads} new · ${conversionRate}% converted`}
          icon={Package}
        />
        <MetricTile
          label="Active Contractors"
          value={contractors.length}
          icon={HardHat}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Project Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projects by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(statusCounts).length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No projects yet.
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(statusCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${STATUS_COLORS[status] ?? ""}`}
                      >
                        {status.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Contractors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Contractors by Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {contractors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No contractors yet.
              </p>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contractor</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead className="text-right">Projects</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractors
                      .sort(
                        (a: any, b: any) =>
                          (projectsByContractor[b.customer_org_id] ?? 0) -
                          (projectsByContractor[a.customer_org_id] ?? 0)
                      )
                      .slice(0, 8)
                      .map((c: any) => (
                        <TableRow key={c.id}>
                          <TableCell className="text-sm font-medium">
                            {c.company_name ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                c.discount_pct > 0
                                  ? "bg-emerald-100 text-emerald-800 text-xs"
                                  : "bg-gray-100 text-gray-600 text-xs"
                              }
                            >
                              {c.discount_pct > 0 ? `-${c.discount_pct}%` : "0%"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-right font-medium">
                            {projectsByContractor[c.customer_org_id] ?? 0}
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

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {recentProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No projects yet.
            </p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentProjects.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm font-medium">{p.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {p.project_number}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {contractorOrgId2Name.get(p.contractor_org_id) ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${STATUS_COLORS[p.status] ?? ""}`}
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
  );
}
