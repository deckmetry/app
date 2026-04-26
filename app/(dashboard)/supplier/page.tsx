import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FileText, Truck, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { RealtimeRefresh } from "@/components/realtime-refresh";

export default async function SupplierDashboardPage() {
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
  if (!orgId) redirect("/dashboard");

  const [ordersRes, invoicesRes, deliveriesRes, leadsRes, newLeadsRes] = await Promise.all([
    supabase
      .from("orders")
      .select("status", { count: "exact", head: true })
      .eq("supplier_org_id", orgId)
      .neq("status", "draft")
      .is("deleted_at", null),
    supabase
      .from("invoices")
      .select("status", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .is("deleted_at", null),
    supabase
      .from("deliveries")
      .select("status", { count: "exact", head: true })
      .eq("organization_id", orgId),
    supabase
      .from("supplier_leads")
      .select("id", { count: "exact", head: true })
      .eq("supplier_org_id", orgId),
    supabase
      .from("supplier_leads")
      .select("id", { count: "exact", head: true })
      .eq("supplier_org_id", orgId)
      .eq("status", "new"),
  ]);

  const [pendingOrders, unpaidInvoices, activeDeliveries] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("supplier_org_id", orgId)
      .eq("status", "submitted")
      .is("deleted_at", null),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "sent")
      .is("deleted_at", null),
    supabase
      .from("deliveries")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .in("status", ["in_transit", "out_for_delivery"]),
  ]);

  return (
    <div className="space-y-8">
      <RealtimeRefresh table="orders" />
      <RealtimeRefresh table="invoices" />
      <RealtimeRefresh table="deliveries" />
      <PageHeader
        title="Supplier Dashboard"
        description="Manage incoming orders, invoices, and deliveries"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          label="Leads"
          value={leadsRes.count ?? 0}
          sub={`${newLeadsRes.count ?? 0} new`}
          icon={Users}
          href="/supplier/leads"
          accentColor="#8B5CF6"
        />
        <MetricCard
          label="Total Orders"
          value={ordersRes.count ?? 0}
          sub={`${pendingOrders.count ?? 0} pending`}
          icon={Package}
          href="/supplier/orders"
          accentColor="#3B82F6"
        />
        <MetricCard
          label="Invoices"
          value={invoicesRes.count ?? 0}
          sub={`${unpaidInvoices.count ?? 0} unpaid`}
          icon={FileText}
          href="/supplier/invoices"
          accentColor="#F59E0B"
        />
        <MetricCard
          label="Deliveries"
          value={deliveriesRes.count ?? 0}
          sub={`${activeDeliveries.count ?? 0} in transit`}
          icon={Truck}
          href="/supplier/deliveries"
          accentColor="#10B981"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/supplier/orders">
            <Button
              variant="outline"
              className="group w-full justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                View Order Inbox
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link href="/supplier/invoices">
            <Button
              variant="outline"
              className="group w-full justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Manage Invoices
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link href="/supplier/deliveries">
            <Button
              variant="outline"
              className="group w-full justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Track Deliveries
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
