"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { createPortalSession } from "@/lib/actions/stripe";
import Link from "next/link";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      await createPortalSession();
    } catch (err) {
      // If no subscription yet, show message
      setLoading(false);
      alert(
        err instanceof Error ? err.message : "Failed to open billing portal"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and payment methods
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            Manage your plan, update payment methods, and view invoices through
            the Stripe billing portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleManageBilling}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            Manage Billing
          </Button>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have a plan yet?{" "}
            <Link href="/pricing" className="text-primary underline">
              View pricing
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
