import { PageHeader } from "@/components/page-header";
import { CatalogTable } from "./catalog-table";
import { catalogSections, catalogTotalProducts } from "../../demo-data";

export default function DemoCatalogPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Catalog"
        description={`${catalogTotalProducts} products across ${catalogSections.length} sections — Wehrung's shared deck-building price book.`}
      />
      <CatalogTable />
    </div>
  );
}
