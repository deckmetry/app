"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Hexagon, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminRoleSwitcher } from "@/components/admin-role-switcher";
import { useAdmin } from "@/lib/contexts/admin-context";
import { useOrganizationId } from "@/hooks/use-org";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardShellProps {
  role: "homeowner" | "contractor" | "supplier";
  roleLabel: string;
  basePath: string;
  navItems: NavItem[];
  children: React.ReactNode;
}

export function DashboardShell({
  role,
  roleLabel,
  basePath,
  navItems,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const orgId = useOrganizationId();
  const { isMasterAdmin } = useAdmin();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    pathname === href ||
    (href !== basePath && pathname.startsWith(href));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-card transition-[width] duration-200",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-3">
          <Link href={basePath} className="flex items-center gap-2.5 group min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary transition-shadow group-hover:shadow-md group-hover:shadow-primary/20">
              <Hexagon className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="block text-sm font-bold tracking-tight truncate">
                  Deckmetry
                </span>
                <span className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground truncate">
                  {roleLabel}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Master admin role switcher */}
        {isMasterAdmin && (
          <div className="px-2 pt-2">
            <AdminRoleSwitcher currentRole={role} collapsed={collapsed} />
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="border-t p-2 space-y-1">
          <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between px-1")}>
            {!collapsed && <ThemeToggle />}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            {collapsed && <ThemeToggle />}
          </div>
          <button
            onClick={handleSignOut}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <Link href={basePath} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Hexagon className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold tracking-tight">Deckmetry</span>
            </Link>
          </div>

          {/* Desktop: breadcrumb area / admin switcher */}
          <div className="hidden md:block" />

          {/* Mobile admin switcher */}
          {isMasterAdmin && (
            <div className="md:hidden">
              <AdminRoleSwitcher currentRole={role} />
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-1">
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            <NotificationBell organizationId={orgId} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 pb-24 md:pb-6">
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom App Bar ── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-0 flex-1",
                  active
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "text-primary")} />
                <span className={cn(
                  "text-[10px] font-medium truncate max-w-full",
                  active && "font-semibold"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
