"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, CreditCard, Pencil, CheckCircle2, Calculator } from "lucide-react";
import { contractorProjects, formatCurrency, statusBadgeClass } from "../../contractor-data";
import { CloneDialog } from "../clone-dialog";

export default function ContractorProjectsPage() {
  const [flash, setFlash] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <PageHeader title="Projects" description="Your full project history with Wehrung's.">
        <Button asChild className="gap-2">
          <Link href="/estimate?demo=contractor"><Calculator className="h-4 w-4" /> New Estimate</Link>
        </Button>
      </PageHeader>

      {flash && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {flash}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Projects ({contractorProjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Homeowner</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Material Total</TableHead>
                  <TableHead>Requested Delivery</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractorProjects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link href={`/demo/contractor/projects/${p.id}`} className="hover:text-primary hover:underline">{p.name}</Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.homeowner}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.city}</TableCell>
                    <TableCell><Badge variant="outline" className={statusBadgeClass(p.status)}>{p.status}</Badge></TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(p.total)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{p.requestedDelivery}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{p.updated}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {p.actions.map((a) => {
                          if (a === "Clone") {
                            return (
                              <CloneDialog
                                key={a}
                                projectName={p.name}
                                onCloned={() => setFlash(`New draft created from ${p.name} — added to your projects.`)}
                              />
                            );
                          }
                          if (a === "View") {
                            return (
                              <Button key={a} asChild variant="ghost" size="sm" className="gap-1.5">
                                <Link href={`/demo/contractor/projects/${p.id}`}><Eye className="h-3.5 w-3.5" /> View</Link>
                              </Button>
                            );
                          }
                          if (a === "Pay Balance") {
                            return (
                              <Button key={a} asChild variant="outline" size="sm" className="gap-1.5">
                                <Link href="/demo/contractor/payments"><CreditCard className="h-3.5 w-3.5" /> Pay Balance</Link>
                              </Button>
                            );
                          }
                          if (a === "Edit") {
                            return (
                              <Button key={a} asChild variant="ghost" size="sm" className="gap-1.5">
                                <Link href="/estimate?demo=contractor"><Pencil className="h-3.5 w-3.5" /> Edit</Link>
                              </Button>
                            );
                          }
                          return null;
                        })}
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
