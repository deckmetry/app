"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Hexagon,
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  CreditCard,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  {
    label: "Pipeline",
    href: "/contractor",
    icon: LayoutDashboard,
  },
  {
    label: "Estimates",
    href: "/contractor/estimates",
    icon: FileSpreadsheet,
  },
  {
    label: "Quotes",
    href: "/contractor/quotes",
    icon: FileText,
  },
  {
    label: "Billing",
    href: "/contractor/billing",
    icon: CreditCard,
  },
];

export default function ContractorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav bar */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Link href="/contractor" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Hexagon className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold tracking-tight">
                Deckmetry
              </span>
            </Link>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Contractor
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/contractor" &&
                  pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2 text-xs",
                      isActive && "bg-secondary font-semibold"
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-2 text-xs text-muted-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">{children}</main>
    </div>
  );
}
