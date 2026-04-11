"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { LayoutDashboard, FolderKanban, CreditCard } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/homeowner", icon: LayoutDashboard },
  { label: "My Projects", href: "/homeowner/projects", icon: FolderKanban },
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
