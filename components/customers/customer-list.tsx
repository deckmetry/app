"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Mail, Phone, Calendar, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────

export interface Customer {
  id: string;
  customerOrgId: string;
  customerRole: string;
  notes: string | null;
  status: string;
  createdAt: string;
  organization: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    type: string;
  } | null;
  projectCount: number;
}

interface CustomerListProps {
  customers: Customer[];
  role: "contractor" | "supplier";
}

// ─── Status colors ──────────────────────────────────────────

const statusColors: Record<string, string> = {
  active:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  archived: "bg-muted text-muted-foreground",
};

// ─── Component ──────────────────────────────────────────────

export function CustomerList({ customers, role }: CustomerListProps) {
  const basePath = `/${role}/customers`;

  if (customers.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed p-12 text-center">
        <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No customers yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first customer to start managing your homeowner relationships.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Desktop table */}
        <div className="hidden md:block rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-center">Projects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="group">
                  <TableCell>
                    <Link
                      href={`${basePath}/${customer.id}`}
                      className="font-medium text-sm hover:underline"
                    >
                      {customer.organization?.name ?? "Unknown"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {customer.organization?.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {customer.organization?.phone ?? "—"}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {customer.projectCount}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] capitalize",
                        statusColors[customer.status] ?? statusColors.active
                      )}
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="grid gap-3 md:hidden">
          {customers.map((customer) => (
            <Link key={customer.id} href={`${basePath}/${customer.id}`}>
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold truncate">
                          {customer.organization?.name ?? "Unknown"}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] capitalize shrink-0",
                            statusColors[customer.status] ??
                              statusColors.active
                          )}
                        >
                          {customer.status}
                        </Badge>
                      </div>
                      <div className="mt-1.5 space-y-0.5">
                        {customer.organization?.email && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {customer.organization?.email}
                            </span>
                          </p>
                        )}
                        {customer.organization?.phone && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 shrink-0" />
                            {customer.organization?.phone}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FolderKanban className="h-3 w-3" />
                          {customer.projectCount}{" "}
                          {customer.projectCount === 1
                            ? "project"
                            : "projects"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(
                            customer.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
