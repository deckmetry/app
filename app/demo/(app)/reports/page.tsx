import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FileText, Package, CheckCircle2, Users, UserCheck, DollarSign, Layers, HardHat, TrendingUp,
} from "lucide-react";
import { reports, formatCurrency } from "../../demo-data";

export default function DemoReportsPage() {
  const k = reports.kpis;
  const maxQuotes = Math.max(...reports.quotesByMonth.map((m) => m.quotes));
  const maxValue = Math.max(...reports.quotesByMonth.map((m) => m.value));
  const maxLine = Math.max(...reports.topProductLines.map((l) => l.quotes));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Leadership visibility into sales pipeline, contractor activity, and material revenue."
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Quotes Created" value={k.quotesCreated} icon={FileText} accentColor="#0EA5E9" />
        <MetricCard label="Orders Requested" value={k.ordersRequested} icon={Package} accentColor="#6366F1" />
        <MetricCard label="Confirmed Orders" value={k.confirmedOrders} icon={CheckCircle2} accentColor="#10B981" />
        <MetricCard label="Homeowner Leads Generated" value={k.leadsGenerated} icon={Users} accentColor="#8B5CF6" />
        <MetricCard label="Leads Assigned to Contractors" value={k.leadsAssigned} icon={UserCheck} accentColor="#3B82F6" />
        <MetricCard label="Estimated Material Revenue" value={formatCurrency(k.estimatedRevenue)} icon={DollarSign} accentColor="#059669" />
        <MetricCard label="Lead-to-Order Conversion" value={`${k.conversionRate}%`} icon={TrendingUp} accentColor="#F59E0B" />
        <MetricCard label="Top Product Line" value={k.topProductLine} icon={Layers} accentColor="#8B5CF6" />
        <MetricCard label="Top Contractor" value={k.topContractor} icon={HardHat} accentColor="#3B82F6" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quotes created by month */}
        <Card>
          <CardHeader><CardTitle className="text-base">Quotes Created by Month</CardTitle></CardHeader>
          <CardContent>
            <div className="flex h-52 items-end justify-between gap-3">
              {reports.quotesByMonth.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium">{m.quotes}</span>
                  <div className="flex w-full items-end justify-center">
                    <div
                      className="w-8 rounded-t bg-primary transition-all"
                      style={{ height: `${(m.quotes / maxQuotes) * 150}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{m.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Material value quoted by month */}
        <Card>
          <CardHeader><CardTitle className="text-base">Material Value Quoted by Month</CardTitle></CardHeader>
          <CardContent>
            <div className="flex h-52 items-end justify-between gap-3">
              {reports.quotesByMonth.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] font-medium">{Math.round(m.value / 1000)}k</span>
                  <div className="flex w-full items-end justify-center">
                    <div
                      className="w-8 rounded-t bg-emerald-500 transition-all"
                      style={{ height: `${(m.value / maxValue) * 150}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{m.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top contractors */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Contractors</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contractor</TableHead>
                    <TableHead className="text-right">Quoted</TableHead>
                    <TableHead className="text-right">Ordered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.topContractors.map((c) => (
                    <TableRow key={c.name}>
                      <TableCell className="font-medium text-sm">{c.name}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(c.quoted)}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCurrency(c.ordered)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Most quoted product lines */}
        <Card>
          <CardHeader><CardTitle className="text-base">Most Quoted Product Lines</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {reports.topProductLines.map((l) => (
              <div key={l.line} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{l.line}</span>
                  <span className="text-muted-foreground">{l.quotes} quotes</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(l.quotes / maxLine) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
