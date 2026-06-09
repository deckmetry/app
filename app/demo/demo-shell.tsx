"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Hexagon, LogOut, LayoutDashboard, HardHat, Users, Package, FolderKanban, BarChart3 } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/demo/dashboard", icon: LayoutDashboard },
  { label: "Contractors", href: "/demo/contractors", icon: HardHat },
  { label: "Homeowners / Leads", href: "/demo/leads", icon: Users },
  { label: "Catalog", href: "/demo/catalog", icon: Package },
  { label: "Projects / Orders", href: "/demo/projects", icon: FolderKanban },
  { label: "Reports", href: "/demo/reports", icon: BarChart3 },
];

export function DemoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r bg-card">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/demo/dashboard" className="flex items-center gap-2.5 group min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Hexagon className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-bold tracking-tight truncate">Deckmetry</span>
              <span className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground truncate">
                Wehrung&apos;s Supplier Portal
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <Link
            href="/demo"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign out</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Hexagon className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight">Deckmetry</span>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs text-muted-foreground">Signed in as</span>
            <span className="text-sm font-semibold">John Miller · Wehrung&apos;s Sales</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              JM
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
