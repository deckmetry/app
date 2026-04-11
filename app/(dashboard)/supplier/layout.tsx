"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import {
  LayoutDashboard,
  Package,
  FileText,
  Truck,
  CreditCard,
  Users,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/supplier", icon: LayoutDashboard },
  { label: "Leads", href: "/supplier/leads", icon: Users },
  { label: "Orders", href: "/supplier/orders", icon: Package },
  { label: "Invoices", href: "/supplier/invoices", icon: FileText },
  { label: "Deliveries", href: "/supplier/deliveries", icon: Truck },
  { label: "Billing", href: "/supplier/billing", icon: CreditCard },
  { label: "Settings", href: "/supplier/settings", icon: Settings },
];

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      role="supplier"
      roleLabel="Supplier"
      basePath="/supplier"
      navItems={navItems}
    >
      {children}
    </DashboardShell>
  );
}
