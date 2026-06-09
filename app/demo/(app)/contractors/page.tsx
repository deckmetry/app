import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { contractors, formatCurrency, statusBadgeClass } from "../../demo-data";

export default function DemoContractorsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Contractors"
        description="Your contractor network — pricing discounts, project pipeline, and material spend."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Contractors ({contractors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Assigned Rep</TableHead>
                  <TableHead className="text-center">Discount</TableHead>
                  <TableHead className="text-center">Active Projects</TableHead>
                  <TableHead className="text-right">Quoted Value</TableHead>
                  <TableHead className="text-right">Ordered Value</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractors.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link href={`/demo/contractors/${c.id}`} className="hover:text-primary hover:underline">
                        {c.company}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.contact}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.rep}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">-{c.discount}%</Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">{c.activeProjects}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(c.quotedValue)}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(c.orderedValue)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{c.lastActivity}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(c.status)}>{c.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                        <Link href={`/demo/contractors/${c.id}`}><Eye className="h-4 w-4" /></Link>
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
