"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Wallet, CheckCircle2, CalendarClock, Receipt } from "lucide-react";
import { payments, paymentSummary, formatCurrency, statusBadgeClass } from "../../contractor-data";

export default function ContractorPaymentsPage() {
  const [flash, setFlash] = useState<string | null>(null);
  const s = paymentSummary;

  return (
    <div className="space-y-8">
      <PageHeader title="Payments" description="Balances, deposits, and payment history with Wehrung's." />

      {flash && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {flash}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Open Balance" value={formatCurrency(s.openBalance)} icon={DollarSign} accentColor="#F59E0B" />
        <MetricCard label="Deposits Due" value={formatCurrency(s.depositsDue)} icon={Wallet} accentColor="#6366F1" />
        <MetricCard label="Paid This Month" value={formatCurrency(s.paidThisMonth)} icon={CheckCircle2} accentColor="#10B981" />
        <MetricCard label="Upcoming Payment Due" value={s.upcomingDue} icon={CalendarClock} accentColor="#3B82F6" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.order}>
                    <TableCell className="font-medium">{p.project}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{p.order}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(p.amount)}</TableCell>
                    <TableCell><Badge variant="outline" className={statusBadgeClass(p.status)}>{p.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{p.dueDate}</TableCell>
                    <TableCell>
                      {p.action === "View Receipt" ? (
                        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setFlash(`${p.project}: receipt opened (demo).`)}>
                          <Receipt className="h-3.5 w-3.5" /> View Receipt
                        </Button>
                      ) : (
                        <Button size="sm" className="gap-1.5" onClick={() => setFlash(`${p.project}: ${p.action} — payment flow opened (demo).`)}>
                          <DollarSign className="h-3.5 w-3.5" /> {p.action}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
