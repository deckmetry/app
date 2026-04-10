import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, FileText, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomeownerDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id, full_name")
    .eq("id", user.id)
    .single();

  const orgId = profile?.default_organization_id;
  if (!orgId) redirect("/dashboard");

  // Fetch counts
  const [estimateCount, proposalCount] = await Promise.all([
    supabase
      .from("estimates")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .is("deleted_at", null),
    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .in("status", ["sent", "viewed", "approved"])
      .is("deleted_at", null),
  ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {firstName}!</h1>
        <p className="text-muted-foreground">
          Plan your deck project and review proposals from contractors
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New Estimate
              </CardTitle>
              <PlusCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Start the deck estimator wizard to generate a bill of materials
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/homeowner/estimates">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                My Estimates
              </CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {estimateCount.count ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Saved estimates
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/homeowner/proposals">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Proposals
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {proposalCount.count ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From contractors
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Get Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/">
            <Button className="w-full justify-start gap-2">
              <PlusCircle className="h-4 w-4" />
              Create a New Deck Estimate
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Use our wizard to calculate materials, generate a BOM, and get
            professional deck drawings — all for free.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
