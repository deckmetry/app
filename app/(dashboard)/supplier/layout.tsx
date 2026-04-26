"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import {
  LayoutDashboard,
  HardHat,
  Users,
  Package,
  BarChart3,
  FolderKanban,
  FileText,
  Truck,
  CreditCard,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/supplier", icon: LayoutDashboard },
  { label: "Contractors", href: "/supplier/contractors", icon: HardHat },
  { label: "Homeowners / Leads", href: "/supplier/leads", icon: Users },
  { label: "Catalog", href: "/supplier/catalog", icon: Package },
  { label: "Reports", href: "/supplier/reports", icon: BarChart3 },
  { label: "Projects", href: "/supplier/projects", icon: FolderKanban },
  { label: "Orders", href: "/supplier/orders", icon: FileText },
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
