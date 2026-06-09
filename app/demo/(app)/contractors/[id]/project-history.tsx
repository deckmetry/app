"use client";

import { useState } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Project, PROJECT_STATUSES, formatCurrency, statusBadgeClass } from "../../../demo-data";

export function ProjectHistory({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<string>("All");

  const filters = ["All", ...PROJECT_STATUSES];
  const visible =
    filter === "All"
      ? projects
      : projects.filter((p) => p.status === filter || (filter === "Wehrung's Review" && p.status === "Pending Wehrung's Review"));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const count =
            f === "All"
              ? projects.length
              : projects.filter((p) => p.status === f || (f === "Wehrung's Review" && p.status === "Pending Wehrung's Review")).length;
          if (f !== "All" && count === 0) return null;
          return (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setFilter(f)}
            >
              {f} {f !== "All" && <span className="ml-1 opacity-70">({count})</span>}
            </Button>
          );
        })}
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Homeowner</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Material Value</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <Link href={`/demo/projects/${p.id}`} className="hover:text-primary hover:underline">{p.name}</Link>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.homeowner}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.city}</TableCell>
                <TableCell><Badge variant="outline" className={statusBadgeClass(p.status)}>{p.status}</Badge></TableCell>
                <TableCell className="text-right text-sm font-medium">{formatCurrency(p.materialValue)}</TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{p.lastUpdated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
