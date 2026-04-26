import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { RealtimeRefresh } from "@/components/realtime-refresh";

export default async function HomeownerEstimatesPage() {
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

  if (!profile?.default_organization_id) redirect("/dashboard");

  const { data: estimates } = await supabase
    .from("estimates")
    .select(
      "id, project_name, deck_type, deck_width_ft, deck_projection_ft, total_area_sf, status, created_at"
    )
    .eq("organization_id", profile.default_organization_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <RealtimeRefresh table="estimates" />
      <PageHeader title="My Estimates" description="Your saved deck estimates and BOMs">
        <Link href="/estimate">
          <Button size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Estimate
          </Button>
        </Link>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          {!estimates || estimates.length === 0 ? (
            <EmptyState
              icon={FileSpreadsheet}
              title="No estimates yet"
              description="Create your first deck estimate using the wizard"
              actionLabel="Start Estimating"
              actionHref="/estimate"
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Deck</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estimates.map((est: any) => (
                    <TableRow key={est.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Link
                          href={`/homeowner/estimates/${est.id}`}
                          className="hover:underline"
                        >
                          {est.project_name || "Untitled"}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">
                        {est.deck_width_ft}&apos; x {est.deck_projection_ft}
                        &apos; {est.deck_type}
                      </TableCell>
                      <TableCell className="text-sm">
                        {est.total_area_sf ? `${est.total_area_sf} sf` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {est.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(est.created_at).toLocaleDateString()}
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
