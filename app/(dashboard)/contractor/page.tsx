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
} from "lucide-react";

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

  // Fetch counts
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your estimates and proposals
          </p>
        </div>
        <Link href="/">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Estimate
          </Button>
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estimates</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estimates.length}</div>
            <p className="text-xs text-muted-foreground">total estimates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Draft Quotes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftQuotes}</div>
            <p className="text-xs text-muted-foreground">awaiting send</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentQuotes}</div>
            <p className="text-xs text-muted-foreground">awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {approvedQuotes}
            </div>
            <p className="text-xs text-muted-foreground">ready to order</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/contractor/estimates">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base">Estimates</CardTitle>
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
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base">Quotes &amp; Proposals</CardTitle>
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
