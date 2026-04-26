import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package } from "lucide-react";
import { AddGroupDialog, AddItemDialog, EditItemDialog, DeleteItemButton, StockBadge } from "./catalog-client";

export default async function SupplierCatalogPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  const orgId = profile?.default_organization_id;
  if (!orgId) redirect("/dashboard");

  const [{ data: groups }, { data: items }] = await Promise.all([
    supabase
      .from("supplier_catalog_groups")
      .select("id, name")
      .eq("supplier_org_id", orgId)
      .eq("active", true)
      .order("sort_order")
      .order("name"),
    supabase
      .from("supplier_catalog_items")
      .select("*, supplier_catalog_groups(name)")
      .eq("supplier_org_id", orgId)
      .eq("active", true)
      .order("sku"),
  ]);

  const allGroups = groups ?? [];
  const allItems = items ?? [];

  const groupMap = new Map(allGroups.map((g: any) => [g.id, g.name]));

  // Group items by group name (ungrouped last)
  const byGroup: Record<string, any[]> = {};
  for (const item of allItems) {
    const groupName = (item as any).supplier_catalog_groups?.name ?? "Uncategorized";
    if (!byGroup[groupName]) byGroup[groupName] = [];
    byGroup[groupName].push(item);
  }

  const sortedGroups = Object.keys(byGroup).sort((a, b) =>
    a === "Uncategorized" ? 1 : b === "Uncategorized" ? -1 : a.localeCompare(b)
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Catalog"
        description="Manage your product catalog, pricing, and stock status"
      >
        <div className="flex gap-2">
          <AddGroupDialog />
          <AddItemDialog groups={allGroups} />
        </div>
      </PageHeader>

      {allItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg mb-2">No Catalog Items Yet</CardTitle>
            <p className="text-sm text-muted-foreground max-w-sm">
              Add product groups and items to build your catalog. Contractors
              will see these prices with their assigned discount applied.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedGroups.map((groupName) => (
            <Card key={groupName}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {groupName}{" "}
                  <span className="text-muted-foreground font-normal text-sm">
                    ({byGroup[groupName].length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {byGroup[groupName].map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs font-medium">
                            {item.sku}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.description}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.brand ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.unit}
                          </TableCell>
                          <TableCell className="text-sm text-right font-medium">
                            ${Number(item.base_price).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <StockBadge status={item.stock_status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <EditItemDialog item={item} groups={allGroups} />
                              <DeleteItemButton id={item.id} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
