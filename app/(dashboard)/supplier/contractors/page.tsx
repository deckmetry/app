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
import { Button } from "@/components/ui/button";
import { Eye, HardHat } from "lucide-react";
import Link from "next/link";
import { AddContractorDialog } from "./add-contractor-dialog";
import { ContractorRowActions } from "./contractor-row-actions";

export default async function SupplierContractorsPage() {
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

  const { data: contractors } = await supabase
    .from("org_customers")
    .select("*")
    .eq("owner_org_id", orgId)
    .eq("customer_role", "contractor")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const contractorOrgIds = (contractors ?? []).map((c: any) => c.customer_org_id);
  const projectCounts: Record<string, number> = {};

  if (contractorOrgIds.length > 0) {
    const { data: projectRows } = await supabase
      .from("projects")
      .select("contractor_org_id")
      .eq("supplier_org_id", orgId)
      .in("contractor_org_id", contractorOrgIds)
      .is("deleted_at", null);

    for (const row of projectRows ?? []) {
      const k = row.contractor_org_id;
      projectCounts[k] = (projectCounts[k] ?? 0) + 1;
    }
  }

  const allContractors = contractors ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contractors"
        description="Manage your contractor network and pricing discounts"
      >
        <AddContractorDialog />
      </PageHeader>

      {allContractors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <HardHat className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg mb-2">No Contractors Yet</CardTitle>
            <p className="text-sm text-muted-foreground max-w-sm">
              Add your first contractor to assign discounts and track their projects.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Active Contractors ({allContractors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allContractors.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.company_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.contact_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.email ? (
                          <a
                            href={`mailto:${c.email}`}
                            className="hover:underline text-primary"
                          >
                            {c.email}
                          </a>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.phone ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            c.discount_pct > 0
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }
                        >
                          {c.discount_pct > 0 ? `-${c.discount_pct}%` : "No discount"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {projectCounts[c.customer_org_id] ?? 0}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/supplier/contractors/${c.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <ContractorRowActions contractor={c} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
