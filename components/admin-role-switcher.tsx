"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { switchAdminView } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";
import { Home, Hammer, Store, Shield, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roles = [
  { value: "homeowner" as const, label: "Homeowner", icon: Home, path: "/homeowner" },
  { value: "contractor" as const, label: "Contractor", icon: Hammer, path: "/contractor" },
  { value: "supplier" as const, label: "Supplier", icon: Store, path: "/supplier" },
];

interface AdminRoleSwitcherProps {
  currentRole: "homeowner" | "contractor" | "supplier";
  collapsed?: boolean;
}

export function AdminRoleSwitcher({ currentRole, collapsed }: AdminRoleSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentRoleInfo = roles.find((r) => r.value === currentRole) ?? roles[0];

  const handleSwitch = (role: "homeowner" | "contractor" | "supplier") => {
    if (role === currentRole) return;
    startTransition(async () => {
      const result = await switchAdminView(role);
      if (result.success) {
        const target = roles.find((r) => r.value === role);
        router.push(target?.path ?? "/homeowner");
        router.refresh();
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 transition-colors hover:bg-amber-500/20 cursor-pointer",
            collapsed && "justify-center px-1.5",
            isPending && "opacity-60"
          )}
          disabled={isPending}
          title={collapsed ? `Admin: ${currentRoleInfo.label}` : undefined}
        >
          <Shield className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && (
            <>
              <span className="truncate">
                {isPending ? "Switching..." : currentRoleInfo.label}
              </span>
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Switch Dashboard View
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map((role) => (
          <DropdownMenuItem
            key={role.value}
            onClick={() => handleSwitch(role.value)}
            className="gap-2 cursor-pointer"
          >
            <role.icon className="h-4 w-4" />
            <span>{role.label}</span>
            {role.value === currentRole && (
              <Check className="ml-auto h-3.5 w-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
