import { getCustomer } from "@/lib/actions/customers";
import { notFound } from "next/navigation";
import { CustomerDetailClient } from "@/components/customers/customer-detail-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer | Deckmetry",
};

export default async function ContractorCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  return (
    <CustomerDetailClient customer={customer} role="contractor" />
  );
}
