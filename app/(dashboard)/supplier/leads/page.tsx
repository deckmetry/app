import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
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
import { Users } from "lucide-react";
import { LeadStatusSelect } from "./lead-status-select";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  contacted: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  converted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default async function SupplierLeadsPage() {
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

  const { data: leads } = await supabase
    .from("supplier_leads")
    .select(
      `
      *,
      estimates (
        id, share_token, deck_type, deck_width_ft, deck_projection_ft,
        total_area_sf, total_bom_items, decking_brand, decking_color
      )
    `
    )
    .eq("supplier_org_id", orgId)
    .order("created_at", { ascending: false });

  const allLeads = leads ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leads"
        description="Homeowners who used your embedded deck estimator"
      />

      {allLeads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg mb-2">No Leads Yet</CardTitle>
            <CardDescription className="max-w-sm">
              When homeowners use your embedded deck estimator and submit their
              email, they&apos;ll appear here as leads.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              All Leads ({allLeads.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Deck</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>BOM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allLeads.map((lead: any) => {
                    const est = lead.estimates;
                    return (
                      <TableRow key={lead.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {lead.homeowner_name || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          <a
                            href={`mailto:${lead.homeowner_email}`}
                            className="text-primary hover:underline"
                          >
                            {lead.homeowner_email}
                          </a>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lead.homeowner_phone || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lead.project_address || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {est ? (
                            <>
                              {est.deck_width_ft}&apos; x{" "}
                              {est.deck_projection_ft}&apos; (
                              {est.total_area_sf} sf)
                            </>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <LeadStatusSelect
                            leadId={lead.id}
                            currentStatus={lead.status}
                          />
                        </TableCell>
                        <TableCell>
                          {est?.share_token ? (
                            <Link
                              href={`/bom/${est.share_token}`}
                              target="_blank"
                              className="text-xs text-primary font-medium hover:underline"
                            >
                              View
                            </Link>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
