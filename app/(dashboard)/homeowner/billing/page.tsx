import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/components/ui/badge";
import { CreditCard, Receipt } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing — Deckmetry",
};

const PRODUCT_LABELS: Record<string, string> = {
  bom: "BOM Generation",
  permit_design: "Permit-Ready Design",
  "3d_design": "3D Design",
  pro_review: "Pro Review",
};

const PRODUCT_PRICES: Record<string, string> = {
  bom: "$27",
  permit_design: "$197",
  "3d_design": "$1,597",
  pro_review: "$97",
};

export default async function HomeownerBillingPage() {
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

  if (!profile?.default_organization_id) redirect("/onboarding");

  const { data: purchases } = await supabase
    .from("purchases")
    .select("*")
    .eq("organization_id", profile.default_organization_id)
    .order("created_at", { ascending: false });

  const totalSpent = (purchases ?? []).reduce(
    (sum, p) => sum + (p.amount ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Your purchase history and payment details.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${(totalSpent / 100).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Purchases</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{purchases?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pay-per-use info */}
      <Card>
        <CardHeader>
          <CardTitle>Pay-Per-Use Pricing</CardTitle>
          <CardDescription>
            You only pay for the services you use. No subscriptions required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(PRODUCT_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="rounded-lg border p-3 text-center"
              >
                <p className="text-sm font-medium">{label}</p>
                <p className="text-lg font-bold mt-1">{PRODUCT_PRICES[key]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Purchase history */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          {!purchases || purchases.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No purchases yet. Your payment history will appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="text-sm">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {PRODUCT_LABELS[purchase.product_type] ??
                        purchase.product_type}
                    </TableCell>
                    <TableCell>
                      ${(purchase.amount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          purchase.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {purchase.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
