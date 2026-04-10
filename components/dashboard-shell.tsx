"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Hexagon, LogOut, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/notification-bell";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          {/* Logo + Role */}
          <div className="flex items-center gap-3">
            <Link href={basePath} className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-shadow group-hover:shadow-md group-hover:shadow-primary/20">
                <Hexagon className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold tracking-tight">
                Deckmetry
              </span>
            </Link>
            <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:inline">
              {roleLabel}
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== basePath && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2 text-xs transition-colors",
                      isActive && "bg-secondary font-semibold"
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right side: notifications + sign out + mobile menu */}
          <div className="flex items-center gap-1">
            <NotificationBell organizationId={orgId} />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="hidden gap-2 text-xs text-muted-foreground sm:inline-flex"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div className="border-t bg-card px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== basePath && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start gap-2 text-xs",
                        isActive && "bg-secondary font-semibold"
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start gap-2 text-xs text-muted-foreground sm:hidden"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{children}</main>
    </div>
  );
}
