import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, FileText, PlusCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/metric-card";

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {firstName}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Plan your deck project and review proposals from contractors
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/">
          <Card className="group transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New Estimate
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <PlusCircle className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Start the deck estimator wizard
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Get started
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <MetricCard
          label="My Estimates"
          value={estimateCount.count ?? 0}
          sub="Saved estimates"
          icon={FileSpreadsheet}
          href="/homeowner/estimates"
          accentColor="#64748B"
        />

        <MetricCard
          label="Proposals"
          value={proposalCount.count ?? 0}
          sub="From contractors"
          icon={FileText}
          href="/homeowner/proposals"
          accentColor="#3B82F6"
        />
      </div>

      <Card className="border-dashed">
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
