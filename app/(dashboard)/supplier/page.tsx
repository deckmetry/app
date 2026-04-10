import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FileText, Truck, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

  // Fetch metrics
  const [ordersRes, invoicesRes, deliveriesRes] = await Promise.all([
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

  const metrics = [
    {
      label: "Total Orders",
      value: ordersRes.count ?? 0,
      sub: `${pendingOrders.count ?? 0} pending`,
      icon: Package,
      href: "/supplier/orders",
    },
    {
      label: "Invoices",
      value: invoicesRes.count ?? 0,
      sub: `${unpaidInvoices.count ?? 0} unpaid`,
      icon: FileText,
      href: "/supplier/invoices",
    },
    {
      label: "Deliveries",
      value: deliveriesRes.count ?? 0,
      sub: `${activeDeliveries.count ?? 0} in transit`,
      icon: Truck,
      href: "/supplier/deliveries",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
        <p className="text-muted-foreground">
          Manage incoming orders, invoices, and deliveries
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((m) => (
          <Link key={m.label} href={m.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {m.label}
                </CardTitle>
                <m.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{m.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/supplier/orders">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Package className="h-4 w-4" />
                View Order Inbox
              </Button>
            </Link>
            <Link href="/supplier/invoices">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                Manage Invoices
              </Button>
            </Link>
            <Link href="/supplier/deliveries">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Truck className="h-4 w-4" />
                Track Deliveries
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
