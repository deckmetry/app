"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Package,
  CreditCard,
} from "lucide-react";

const navItems = [
  { label: "Pipeline", href: "/contractor", icon: LayoutDashboard },
  { label: "Estimates", href: "/contractor/estimates", icon: FileSpreadsheet },
  { label: "Quotes", href: "/contractor/quotes", icon: FileText },
  { label: "Orders", href: "/contractor/orders", icon: Package },
  { label: "Billing", href: "/contractor/billing", icon: CreditCard },
];

export default function ContractorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      role="contractor"
      roleLabel="Contractor"
      basePath="/contractor"
      navItems={navItems}
    >
      {children}
    </DashboardShell>
  );
}
