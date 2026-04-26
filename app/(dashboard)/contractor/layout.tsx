"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Package,
  CreditCard,
  Users,
  UserCircle,
} from "lucide-react";

const navItems = [
  { label: "Pipeline", href: "/contractor", icon: LayoutDashboard },
  { label: "Projects", href: "/contractor/projects", icon: FolderKanban },
  { label: "Customers", href: "/contractor/customers", icon: UserCircle },
  { label: "Quotes", href: "/contractor/quotes", icon: FileText },
  { label: "Orders", href: "/contractor/orders", icon: Package },
  { label: "Billing", href: "/contractor/billing", icon: CreditCard },
  { label: "Team", href: "/contractor/team", icon: Users },
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
