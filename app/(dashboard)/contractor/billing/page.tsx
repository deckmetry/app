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
  Users,
  Minus,
  Plus,
} from "lucide-react";
import {
  createPortalSession,
  updateSubscriptionSeats,
  getBillingInfo,
} from "@/lib/actions/stripe";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  solo: "Solo",
  team: "Teams",
};

const TIER_DESCRIPTIONS: Record<string, string> = {
  free: "3 estimates per month",
  solo: "$99/month — up to 50 estimates per month",
  team: "$149/month + $20/seat — unlimited estimates",
};

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
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

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      await createPortalSession();
    } catch (err) {
      setLoading(false);
      alert(
        err instanceof Error ? err.message : "Failed to open billing portal"
      );
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
        description="Manage your subscription and payment methods"
      />

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your active subscription and usage limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {billingInfo ? (
            <div className="flex items-center gap-3">
              <Badge
                variant={billingInfo.active ? "default" : "secondary"}
                className="text-sm"
              >
                {TIER_LABELS[billingInfo.tier] ?? billingInfo.tier}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {TIER_DESCRIPTIONS[billingInfo.tier] ?? ""}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}

          <div className="flex gap-3">
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
          </div>
          {!billingInfo?.active && (
            <p className="text-sm text-muted-foreground">
              Upgrade your plan?{" "}
              <Link href="/pricing" className="text-primary underline">
                View pricing
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Seat management — only for teams tier */}
      {billingInfo?.tier === "team" && (
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
    </div>
  );
}
