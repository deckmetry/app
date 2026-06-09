import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FolderKanban, FileEdit, ClipboardCheck, Truck, DollarSign, Users, ArrowRight,
  Calculator, AlertCircle,
} from "lucide-react";
import {
  dashboardMetrics, recentProjects, upcomingDeliveries, dashboardLeads,
  ordersNeedingAction, formatCurrency, statusBadgeClass,
} from "../contractor-data";

export default function ContractorDashboardPage() {
  const m = dashboardMetrics;
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your projects, orders, deliveries, leads, and balances with Wehrung's — all in one place."
      >
        <Button asChild className="gap-2">
          <Link href="/estimate?demo=contractor"><Calculator className="h-4 w-4" /> New Estimate</Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Active Projects" value={m.activeProjects} icon={FolderKanban} accentColor="#3B82F6" href="/demo/contractor/projects" />
        <MetricCard label="Draft Estimates" value={m.draftEstimates} icon={FileEdit} accentColor="#0EA5E9" href="/demo/contractor/projects" />
        <MetricCard label="Orders Waiting for Wehrung's Review" value={m.ordersWaitingReview} icon={ClipboardCheck} accentColor="#8B5CF6" href="/demo/contractor/orders" />
        <MetricCard label="Scheduled Deliveries" value={m.scheduledDeliveries} icon={Truck} accentColor="#10B981" href="/demo/contractor/orders" />
        <MetricCard label="Open Balance" value={formatCurrency(m.openBalance)} icon={DollarSign} accentColor="#F59E0B" href="/demo/contractor/payments" />
        <MetricCard label="Leads Received from Wehrung's" value={m.leadsReceived} icon={Users} accentColor="#6366F1" href="/demo/contractor/leads" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Projects</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/demo/contractor/projects">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProjects.map((p) => (
              <Link key={p.id} href={`/demo/contractor/projects/${p.id}`} className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0 hover:opacity-70 transition-opacity">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.updated}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium">{formatCurrency(p.total)}</span>
                  <Badge variant="outline" className={statusBadgeClass(p.status)}>{p.status}</Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming deliveries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming Deliveries</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/demo/contractor/orders">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeliveries.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.date}</p>
                </div>
                <Badge variant="outline" className={statusBadgeClass(d.status)}>{d.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Leads from Wehrung's */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Leads from Wehrung&apos;s</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/demo/contractor/leads">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardLeads.map((l) => (
              <Link key={l.id} href="/demo/contractor/leads" className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0 hover:opacity-70 transition-opacity">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{l.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{l.city} · {l.type}</p>
                </div>
                <Badge variant="outline" className={statusBadgeClass(l.status)}>{l.status}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Orders needing action */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" /> Orders Needing Action
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/demo/contractor/orders">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {ordersNeedingAction.map((o) => (
              <Link key={o.id} href={`/demo/contractor/projects/${o.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2.5 hover:bg-amber-50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{o.name}</p>
                  <p className="text-xs text-muted-foreground">{o.note}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
