import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Mail, Phone, User, Percent, FolderKanban, FileText, Package,
  CheckCircle2, DollarSign, Ruler, Layers,
} from "lucide-react";
import { getContractor, projectsForContractor, formatCurrency, statusBadgeClass } from "../../../demo-data";
import { ProjectHistory } from "./project-history";

export default async function ContractorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getContractor(id);
  if (!c) notFound();

  const projects = projectsForContractor(c.id);
  const s = c.summary;

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 gap-1 text-muted-foreground -ml-2">
          <Link href="/demo/contractors"><ArrowLeft className="h-4 w-4" /> Back to Contractors</Link>
        </Button>
        <PageHeader title={c.company} description={`Assigned Wehrung's rep: ${c.rep}`}>
          <Badge variant="outline" className={statusBadgeClass(c.status)}>{c.status}</Badge>
        </PageHeader>
      </div>

      {/* Profile + notes */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Account Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail icon={User} label="Main Contact" value={c.contact} />
            <Detail icon={Mail} label="Email" value={c.email} />
            <Detail icon={Phone} label="Phone" value={c.phone} />
            <Detail icon={User} label="Assigned Wehrung's Rep" value={c.rep} />
            <Detail icon={Percent} label="Contractor Discount" value={`${c.discount}%`} />
            <Detail icon={CheckCircle2} label="Account Status" value={c.status} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Internal Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.notes}</p>
          </CardContent>
        </Card>
      </div>

      {/* Business summary cards */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Business Summary</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Projects" value={s.totalProjects} icon={FolderKanban} accentColor="#3B82F6" />
          <MetricCard label="Quotes Created" value={s.quotesCreated} icon={FileText} accentColor="#0EA5E9" />
          <MetricCard label="Orders Requested" value={s.ordersRequested} icon={Package} accentColor="#6366F1" />
          <MetricCard label="Approved Orders" value={s.approvedOrders} icon={CheckCircle2} accentColor="#10B981" />
          <MetricCard label="YTD Material Revenue" value={formatCurrency(s.ytdRevenue)} icon={DollarSign} accentColor="#059669" />
          <MetricCard label="Average Project Size" value={formatCurrency(s.avgProjectSize)} icon={Ruler} accentColor="#F59E0B" />
          <MetricCard label="Most Used Product Line" value={s.topProductLine} icon={Layers} accentColor="#8B5CF6" />
        </div>
      </div>

      {/* Project history */}
      <Card>
        <CardHeader><CardTitle className="text-base">Project &amp; Order History</CardTitle></CardHeader>
        <CardContent>
          <ProjectHistory projects={projects} />
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
