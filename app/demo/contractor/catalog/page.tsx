import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { contractorCatalog, statusBadgeClass, CONTRACTOR_DISCOUNT } from "../../contractor-data";

export default function ContractorCatalogPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Catalog / Pricing"
        description={`Wehrung's materials with your contractor pricing (your discount tier: ${CONTRACTOR_DISCOUNT}% off retail).`}
      />

      <Card>
        <CardHeader><CardTitle className="text-base">Your Pricing ({contractorCatalog.length} products)</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Retail Price</TableHead>
                  <TableHead className="text-right">Your Price</TableHead>
                  <TableHead>Availability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractorCatalog.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.brand}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.category}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.color}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.unit}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground line-through">{p.retail}</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-emerald-700">{p.contractor}</TableCell>
                    <TableCell><Badge variant="outline" className={statusBadgeClass(p.availability)}>{p.availability}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Your price reflects Concept Design + Build&apos;s assigned {CONTRACTOR_DISCOUNT}% discount tier, applied automatically at quote time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
