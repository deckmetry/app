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
import { CreditCard, ExternalLink, Loader2, Plug } from "lucide-react";
import {
  createConnectOnboardingLink,
  createConnectDashboardLink,
} from "@/lib/actions/connect";
import { createPortalSession } from "@/lib/actions/stripe";
import Link from "next/link";

export default function SupplierBillingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading("connect");
    try {
      await createConnectOnboardingLink();
    } catch {
      setLoading(null);
    }
  };

  const handleConnectDashboard = async () => {
    setLoading("dashboard");
    try {
      await createConnectDashboardLink();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
      setLoading(null);
    }
  };

  const handleSubscription = async () => {
    setLoading("subscription");
    try {
      await createPortalSession();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and payment settings
        </p>
      </div>

      {/* Stripe Connect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Stripe Connect — Receive Payments
          </CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payments from contractors.
            Funds are transferred directly to your bank account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Button
              onClick={handleConnect}
              disabled={!!loading}
              className="gap-2"
            >
              {loading === "connect" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plug className="h-4 w-4" />
              )}
              Set Up / Update Connect
            </Button>
            <Button
              onClick={handleConnectDashboard}
              disabled={!!loading}
              variant="outline"
              className="gap-2"
            >
              {loading === "dashboard" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              Stripe Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            Manage your Deckmetry supplier plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleSubscription}
            disabled={!!loading}
            className="gap-2"
          >
            {loading === "subscription" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            Manage Subscription
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
