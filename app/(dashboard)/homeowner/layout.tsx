"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { LayoutDashboard, FileSpreadsheet, FileText, CreditCard } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/homeowner", icon: LayoutDashboard },
  { label: "My Estimates", href: "/homeowner/estimates", icon: FileSpreadsheet },
  { label: "Proposals", href: "/homeowner/proposals", icon: FileText },
  { label: "Billing", href: "/homeowner/billing", icon: CreditCard },
];

export default function HomeownerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      role="homeowner"
      roleLabel="Homeowner"
      basePath="/homeowner"
      navItems={navItems}
    >
      {children}
    </DashboardShell>
  );
}
