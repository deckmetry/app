import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { RealtimeRefresh } from "@/components/realtime-refresh";

export default async function ContractorPipelinePage() {
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

  const [estimatesRes, quotesRes] = await Promise.all([
    supabase
      .from("estimates")
      .select("id, status", { count: "exact" })
      .eq("organization_id", orgId)
      .is("deleted_at", null),
    supabase
      .from("quotes")
      .select("id, status", { count: "exact" })
      .eq("organization_id", orgId)
      .is("deleted_at", null),
  ]);

  const estimates = estimatesRes.data ?? [];
  const quotes = quotesRes.data ?? [];

  const draftQuotes = quotes.filter((q) => q.status === "draft").length;
  const sentQuotes = quotes.filter((q) => q.status === "sent").length;
  const approvedQuotes = quotes.filter((q) => q.status === "approved").length;

  return (
    <div className="space-y-8">
      <RealtimeRefresh table="quotes" />
      <RealtimeRefresh table="estimates" />
      <PageHeader
        title="Pipeline"
        description="Overview of your estimates and proposals"
      >
        <Link href="/estimate">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Estimate
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Estimates"
          value={estimates.length}
          sub="total estimates"
          icon={FileSpreadsheet}
          accentColor="#64748B"
        />
        <MetricCard
          label="Draft Quotes"
          value={draftQuotes}
          sub="awaiting send"
          icon={Clock}
          accentColor="#F59E0B"
        />
        <MetricCard
          label="Sent"
          value={sentQuotes}
          sub="awaiting response"
          icon={FileText}
          accentColor="#3B82F6"
        />
        <MetricCard
          label="Approved"
          value={approvedQuotes}
          sub="ready to order"
          icon={CheckCircle2}
          accentColor="#10B981"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/contractor/estimates">
          <Card className="group transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                Estimates
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </CardTitle>
              <CardDescription>
                View and manage all your deck estimates. Create quotes from
                completed estimates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{estimates.length} estimates</Badge>
            </CardContent>
          </Card>
        </Link>

        <Link href="/contractor/quotes">
          <Card className="group transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                Quotes &amp; Proposals
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </CardTitle>
              <CardDescription>
                Manage quotes, generate PDF proposals, and track approvals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{quotes.length} quotes</Badge>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
