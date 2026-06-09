import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Globe } from "lucide-react";
import { leads, formatCurrency, statusBadgeClass } from "../../demo-data";

export default function DemoLeadsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Homeowner Leads"
        description="Leads captured from Wehrung's website deck estimator — ready to route to your contractor network."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Website Leads ({leads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Homeowner</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Project Type</TableHead>
                  <TableHead>Preferred Material</TableHead>
                  <TableHead className="text-right">Est. Value</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Contractor</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">
                      <Link href={`/demo/leads/${l.id}`} className="hover:text-primary hover:underline">{l.name}</Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.city}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.projectType}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.preferredMaterial}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(l.estimatedValue)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.timeline}</TableCell>
                    <TableCell><Badge variant="outline" className={statusBadgeClass(l.status)}>{l.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.assignedContractor ?? "Not assigned"}</TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                        <Link href={`/demo/leads/${l.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
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
