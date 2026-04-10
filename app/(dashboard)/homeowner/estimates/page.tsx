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
import { PlusCircle } from "lucide-react";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Estimates</h1>
          <p className="text-muted-foreground">
            Your saved deck estimates and BOMs
          </p>
        </div>
        <Link href="/">
          <Button size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Estimate
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          {!estimates || estimates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No estimates yet</p>
              <p className="text-sm mt-1">
                Create your first deck estimate using the wizard
              </p>
              <Link href="/" className="mt-4 inline-block">
                <Button>Start Estimating</Button>
              </Link>
            </div>
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
                    <TableRow key={est.id}>
                      <TableCell className="font-medium">
                        {est.project_name}
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
