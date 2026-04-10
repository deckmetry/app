import { createClient } from "@/lib/supabase/server";

export type PlanTier = "free" | "pro" | "team" | "connected" | "enterprise";

interface SubscriptionInfo {
  active: boolean;
  tier: PlanTier;
  priceId: string | null;
  status: string | null;
}

const proPriceId = process.env.STRIPE_CONTRACTOR_PRO_PRICE_ID;
const teamPriceId = process.env.STRIPE_CONTRACTOR_TEAM_PRICE_ID;
const connectedPriceId = process.env.STRIPE_SUPPLIER_CONNECTED_PRICE_ID;

function resolveTier(priceId: string | null): PlanTier {
  if (!priceId) return "free";
  if (priceId === proPriceId) return "pro";
  if (priceId === teamPriceId) return "team";
  if (priceId === connectedPriceId) return "connected";
  return "pro"; // fallback for unknown paid price
}

/**
 * Get the subscription info for the current user's default organization.
 * Call this from server actions / server components.
 */
export async function getSubscription(): Promise<SubscriptionInfo> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { active: false, tier: "free", priceId: null, status: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_organization_id) {
    return { active: false, tier: "free", priceId: null, status: null };
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, price_id")
    .eq("organization_id", profile.default_organization_id)
    .in("status", ["active", "trialing"])
    .limit(1)
    .single();

  if (!sub) {
    return { active: false, tier: "free", priceId: null, status: null };
  }

  return {
    active: true,
    tier: resolveTier(sub.price_id),
    priceId: sub.price_id,
    status: sub.status,
  };
}

/**
 * Check if the org has a paid plan. Throws if not.
 * Use in server actions to gate paid features.
 */
export async function requirePaidPlan(message?: string): Promise<SubscriptionInfo> {
  const sub = await getSubscription();
  if (!sub.active) {
    throw new Error(message ?? "This feature requires a paid plan. Please upgrade at /pricing.");
  }
  return sub;
}

// ---------- Plan limits ----------

const FREE_ESTIMATES_PER_MONTH = 3;

/**
 * Check if the free tier org has hit their monthly estimate limit.
 */
export async function checkEstimateLimit(): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const sub = await getSubscription();

  // Paid plans have unlimited estimates
  if (sub.active) {
    return { allowed: true, used: 0, limit: Infinity };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { allowed: false, used: 0, limit: FREE_ESTIMATES_PER_MONTH };

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_organization_id) {
    return { allowed: false, used: 0, limit: FREE_ESTIMATES_PER_MONTH };
  }

  // Count estimates created this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("estimates")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", profile.default_organization_id)
    .gte("created_at", startOfMonth.toISOString())
    .is("deleted_at", null);

  const used = count ?? 0;

  return {
    allowed: used < FREE_ESTIMATES_PER_MONTH,
    used,
    limit: FREE_ESTIMATES_PER_MONTH,
  };
}
