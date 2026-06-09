import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HardHat,
  FileText,
  Package,
  Users,
  DollarSign,
  ClipboardCheck,
  ArrowRight,
  Activity,
} from "lucide-react";
import {
  dashboardMetrics,
  formatCurrency,
  recentContractorActivity,
  leads,
  ordersPendingReview,
  topContractorsByActivity,
  statusBadgeClass,
} from "../../demo-data";

export default function DemoDashboardPage() {
  const m = dashboardMetrics;
  return (
    <div className="space-y-8">
      <PageHeader
        title="Supplier Dashboard"
        description="Sales activity, contractor pipeline, and material revenue visibility — before orders hit Epicor."
      />

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Active Contractors" value={m.activeContractors} icon={HardHat} accentColor="#3B82F6" href="/demo/contractors" />
        <MetricCard label="Quotes Created This Month" value={m.quotesThisMonth} icon={FileText} accentColor="#0EA5E9" href="/demo/reports" />
        <MetricCard label="Orders Requested" value={m.ordersRequested} icon={Package} accentColor="#6366F1" href="/demo/projects" />
        <MetricCard label="Homeowner Leads" value={m.homeownerLeads} icon={Users} accentColor="#8B5CF6" href="/demo/leads" />
        <MetricCard label="Estimated Material Revenue" value={formatCurrency(m.estimatedRevenue)} icon={DollarSign} accentColor="#10B981" href="/demo/reports" />
        <MetricCard label="Pending Wehrung's Review" value={m.pendingReview} icon={ClipboardCheck} accentColor="#F59E0B" href="/demo/projects" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent contractor activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Recent Contractor Activity
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/demo/contractors">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentContractorActivity.map((a, i) => (
              <div key={i} className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{a.contractor}</p>
                  <p className="text-xs text-muted-foreground">{a.action}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">{a.when}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent homeowner leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Recent Homeowner Leads
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/demo/leads">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {leads.map((l) => (
              <Link
                key={l.id}
                href={`/demo/leads/${l.id}`}
                className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0 hover:opacity-70 transition-opacity"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{l.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{l.city} · {l.projectType}</p>
                </div>
                <Badge variant="outline" className={statusBadgeClass(l.status)}>{l.status}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Orders pending review */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              Orders Pending Review
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/demo/projects">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {ordersPendingReview.map((p) => (
              <Link
                key={p.id}
                href={`/demo/projects/${p.id}`}
                className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0 hover:opacity-70 transition-opacity"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.contractor}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium">{formatCurrency(p.materialValue)}</span>
                  <Badge variant="outline" className={statusBadgeClass(p.status)}>{p.status}</Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Top contractors by activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <HardHat className="h-4 w-4 text-muted-foreground" />
              Top Contractors by Activity
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/demo/contractors">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {topContractorsByActivity.map((c, i) => (
              <Link
                key={c.id}
                href={`/demo/contractors/${c.id}`}
                className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0 hover:opacity-70 transition-opacity"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.company}</p>
                    <p className="text-xs text-muted-foreground">{c.activeProjects} active projects · Rep: {c.rep}</p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-medium">{formatCurrency(c.quotedValue)}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
