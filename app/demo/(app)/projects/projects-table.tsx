"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projects, contractors, formatCurrency, statusBadgeClass } from "../../demo-data";

const ALL = "all";

export function ProjectsTable() {
  const [status, setStatus] = useState(ALL);
  const [contractor, setContractor] = useState(ALL);
  const [rep, setRep] = useState(ALL);

  const reps = useMemo(() => Array.from(new Set(projects.map((p) => p.rep))), []);
  const statuses = useMemo(() => Array.from(new Set(projects.map((p) => p.status))), []);

  const visible = projects.filter(
    (p) =>
      (status === ALL || p.status === status) &&
      (contractor === ALL || p.contractorId === contractor) &&
      (rep === ALL || p.rep === rep)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <FilterSelect label="Status" value={status} onChange={setStatus} options={statuses.map((s) => ({ value: s, label: s }))} />
        <FilterSelect label="Contractor" value={contractor} onChange={setContractor} options={contractors.map((c) => ({ value: c.id, label: c.company }))} />
        <FilterSelect label="Sales Rep" value={rep} onChange={setRep} options={reps.map((r) => ({ value: r, label: r }))} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Homeowner</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Material Value</TableHead>
                  <TableHead>Requested Delivery</TableHead>
                  <TableHead>Assigned Rep</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link href={`/demo/projects/${p.id}`} className="hover:text-primary hover:underline">{p.name}</Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.contractor}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.homeowner}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.city}</TableCell>
                    <TableCell><Badge variant="outline" className={statusBadgeClass(p.status)}>{p.status}</Badge></TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(p.materialValue)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{p.requestedDelivery ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.rep}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{p.lastUpdated}</TableCell>
                  </TableRow>
                ))}
                {visible.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                      No projects match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{visible.length} of {projects.length} projects</p>
        </CardContent>
      </Card>
    </div>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label}s</SelectItem>
          {options.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
        </SelectContent>
      </Select>
    </div>
  );
}
