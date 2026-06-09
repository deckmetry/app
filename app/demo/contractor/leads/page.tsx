"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, MoreHorizontal, ArrowRight } from "lucide-react";
import { contractorLeads, formatCurrency, statusBadgeClass } from "../../contractor-data";

export default function ContractorLeadsPage() {
  // Local status overrides so the demo can change a lead's state live.
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(contractorLeads.map((l) => [l.id, l.status]))
  );
  const [flash, setFlash] = useState<string | null>(null);

  const update = (id: string, name: string, status: string, msg: string) => {
    setStatuses((s) => ({ ...s, [id]: status }));
    setFlash(`${name}: ${msg}`);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leads from Wehrung's"
        description="Homeowner leads Wehrung's has routed to you. Contact, estimate, and convert them into projects."
      />

      {flash && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {flash}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Assigned Leads ({contractorLeads.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Homeowner</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Project Type</TableHead>
                  <TableHead className="text-right">Est. Material Value</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractorLeads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.city}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.projectType}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(l.estimatedValue)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.timeline}</TableCell>
                    <TableCell><Badge variant="outline" className={statusBadgeClass(statuses[l.id])}>{statuses[l.id]}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Button asChild size="sm" className="gap-1.5">
                          <Link href="/estimate?demo=contractor"><ArrowRight className="h-3.5 w-3.5" /> Convert to Project</Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => update(l.id, l.name, "Contacted", "marked as contacted.")}>Mark Contacted</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => update(l.id, l.name, "Estimate Sent", "estimate sent.")}>Mark Estimate Sent</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => update(l.id, l.name, "Won", "marked Won. 🎉")}>Mark Won</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => update(l.id, l.name, "Lost", "marked Lost.")}>Mark Lost</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFlash(`Note added to ${l.name} (demo).`)}>Add Notes</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
