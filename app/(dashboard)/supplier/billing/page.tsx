"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  ExternalLink,
  Loader2,
  Plug,
  Users,
  Minus,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  createConnectOnboardingLink,
  createConnectDashboardLink,
} from "@/lib/actions/connect";
import {
  createPortalSession,
  updateSubscriptionSeats,
  getBillingInfo,
} from "@/lib/actions/stripe";
import Link from "next/link";
import { toast } from "sonner";

export default function SupplierBillingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInfo, setBillingInfo] = useState<{
    tier: string;
    seatCount: number;
    active: boolean;
  } | null>(null);
  const [seatInput, setSeatInput] = useState(1);
  const [isUpdatingSeats, startSeatTransition] = useTransition();

  useEffect(() => {
    getBillingInfo().then((info) => {
      if (info) {
        setBillingInfo({
          tier: info.tier,
          seatCount: info.seatCount,
          active: info.active,
        });
        setSeatInput(info.seatCount);
      }
    });
  }, []);

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

  const handleUpdateSeats = () => {
    if (seatInput < 1) return;
    startSeatTransition(async () => {
      try {
        await updateSubscriptionSeats(seatInput);
        setBillingInfo((prev) =>
          prev ? { ...prev, seatCount: seatInput } : prev
        );
        toast.success(`Seat count updated to ${seatInput}`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update seats"
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your subscription and payment settings"
      />

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Platform Subscription
          </CardTitle>
          <CardDescription>
            Your Deckmetry supplier platform plan — $697/month + $20/seat.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {billingInfo ? (
            <div className="flex items-center gap-3">
              <Badge
                variant={billingInfo.active ? "default" : "secondary"}
                className="text-sm"
              >
                {billingInfo.active ? "Active" : "Inactive"}
              </Badge>
              {billingInfo.active && (
                <span className="text-sm text-muted-foreground">
                  {billingInfo.seatCount} seat(s)
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}

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
          {!billingInfo?.active && (
            <p className="text-sm text-muted-foreground">
              Don&apos;t have a plan yet?{" "}
              <Link href="/pricing" className="text-primary underline">
                View pricing
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Seat management */}
      {billingInfo?.active && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Seats
            </CardTitle>
            <CardDescription>
              Manage team member seats. Base plan includes 1 seat, additional
              seats are $20/month each.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Current seats:</span>
              <span className="text-lg font-bold">
                {billingInfo.seatCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSeatInput(Math.max(1, seatInput - 1))}
                disabled={seatInput <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={1}
                value={seatInput}
                onChange={(e) =>
                  setSeatInput(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSeatInput(seatInput + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleUpdateSeats}
                disabled={
                  isUpdatingSeats || seatInput === billingInfo.seatCount
                }
                className="ml-2"
              >
                {isUpdatingSeats ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Update Seats
              </Button>
            </div>
            {seatInput !== billingInfo.seatCount && (
              <p className="text-sm text-muted-foreground">
                {seatInput > billingInfo.seatCount
                  ? `Adding ${seatInput - billingInfo.seatCount} seat(s) — +$${(seatInput - billingInfo.seatCount) * 20}/mo`
                  : `Removing ${billingInfo.seatCount - seatInput} seat(s) — -$${(billingInfo.seatCount - seatInput) * 20}/mo`}
              </p>
            )}
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}
