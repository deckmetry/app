import { listCustomers } from "@/lib/actions/customers";
import { CustomerList } from "@/components/customers/customer-list";
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers | Deckmetry",
};

export default async function ContractorCustomersPage() {
  const customers = await listCustomers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your homeowner customers"
      >
        <AddCustomerDialog role="contractor" />
      </PageHeader>
      <CustomerList customers={customers} role="contractor" />
    </div>
  );
}
