import { createClient } from "@/lib/supabase/server";

export type PlanTier = "free" | "solo" | "team" | "supplier_platform";

interface SubscriptionInfo {
  active: boolean;
  tier: PlanTier;
  priceId: string | null;
  status: string | null;
  gracePeriod: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

// ---- Price ID mappings ----

const soloPriceId = process.env.STRIPE_CONTRACTOR_SOLO_PRICE_ID;
const teamBasePriceId = process.env.STRIPE_CONTRACTOR_TEAM_BASE_PRICE_ID;
const supplierPlatformPriceId = process.env.STRIPE_SUPPLIER_PLATFORM_PRICE_ID;

function resolveTier(priceId: string | null): PlanTier {
  if (!priceId) return "free";
  if (priceId === soloPriceId) return "solo";
  if (priceId === teamBasePriceId) return "team";
  if (priceId === supplierPlatformPriceId) return "supplier_platform";
  // Seat price IDs are secondary items; the base price determines the tier
  return "solo"; // fallback for unknown paid price
}

// ---- Estimate limits per tier ----

const ESTIMATE_LIMITS: Record<PlanTier, number> = {
  free: 3,
  solo: 50,
  team: Infinity,
  supplier_platform: Infinity,
};

// ---- Core subscription lookup ----

async function getOrgIdForUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, orgId: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  return {
    supabase,
    user,
    orgId: profile?.default_organization_id ?? null,
  };
}

/**
 * Get the subscription info for the current user's default organization.
 * Handles active, trialing, past_due (with grace period), and canceled (with period-end access).
 */
export async function getSubscription(): Promise<SubscriptionInfo> {
  const { supabase, user, orgId } = await getOrgIdForUser();

  const inactive: SubscriptionInfo = {
    active: false,
    tier: "free",
    priceId: null,
    status: null,
    gracePeriod: false,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: null,
  };

  if (!user || !orgId) return inactive;

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, price_id, grace_period_end, cancel_at_period_end, current_period_end")
    .eq("organization_id", orgId)
    .in("status", ["active", "trialing", "past_due", "canceled"])
    .order("current_period_end", { ascending: false })
    .limit(1)
    .single();

  if (!sub) return inactive;

  const now = new Date();
  const tier = resolveTier(sub.price_id);

  // Active or trialing — straightforward
  if (sub.status === "active" || sub.status === "trialing") {
    return {
      active: true,
      tier,
      priceId: sub.price_id,
      status: sub.status,
      gracePeriod: false,
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
      currentPeriodEnd: sub.current_period_end ?? null,
    };
  }

  // Past due — active only if within grace period
  if (sub.status === "past_due") {
    const graceEnd = sub.grace_period_end ? new Date(sub.grace_period_end) : null;
    const inGrace = graceEnd ? graceEnd > now : false;

    return {
      active: inGrace,
      tier: inGrace ? tier : "free",
      priceId: sub.price_id,
      status: sub.status,
      gracePeriod: inGrace,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: sub.current_period_end ?? null,
    };
  }

  // Canceled — active if current_period_end hasn't passed yet
  if (sub.status === "canceled") {
    const periodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null;
    const stillActive = periodEnd ? periodEnd > now : false;

    return {
      active: stillActive,
      tier: stillActive ? tier : "free",
      priceId: sub.price_id,
      status: sub.status,
      gracePeriod: false,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: sub.current_period_end ?? null,
    };
  }

  return inactive;
}

/**
 * Check if the org has a paid plan. Throws if not.
 */
export async function requirePaidPlan(
  message?: string
): Promise<SubscriptionInfo> {
  const sub = await getSubscription();
  if (!sub.active) {
    throw new Error(
      message ?? "This feature requires a paid plan. Please upgrade at /pricing."
    );
  }
  return sub;
}

// ---- Estimate limits ----

/**
 * Check if the org has hit their monthly estimate limit.
 * Free: 3/mo, Solo: 50/mo, Team+Supplier: unlimited.
 */
export async function checkEstimateLimit(): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const sub = await getSubscription();
  const limit = ESTIMATE_LIMITS[sub.tier];

  if (limit === Infinity) {
    return { allowed: true, used: 0, limit: Infinity };
  }

  const { supabase, orgId } = await getOrgIdForUser();
  if (!orgId) return { allowed: false, used: 0, limit };

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("estimates")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .gte("created_at", startOfMonth.toISOString())
    .is("deleted_at", null);

  const used = count ?? 0;

  return { allowed: used < limit, used, limit };
}

// ---- Homeowner purchase checks ----

export type HomeownerProductType = "bom" | "permit_design" | "3d_design" | "pro_review";

/**
 * Check if a homeowner has purchased a specific product for an entity (estimate).
 * Also returns true if the estimate is supplier-sourced (free BOM).
 */
export async function checkHomeownerPurchase(
  estimateId: string,
  productType: HomeownerProductType
): Promise<boolean> {
  const { supabase, orgId } = await getOrgIdForUser();
  if (!orgId) return false;

  // Check if estimate is supplier-sourced (free BOM)
  if (productType === "bom") {
    const { data: estimate } = await supabase
      .from("estimates")
      .select("source")
      .eq("id", estimateId)
      .single();

    if (estimate?.source?.startsWith("supplier_")) {
      return true;
    }
  }

  const { count } = await supabase
    .from("purchases")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("product_type", productType)
    .eq("entity_id", estimateId)
    .eq("status", "completed");

  return (count ?? 0) > 0;
}

// ---- Org billing info ----

interface OrgBillingInfo {
  orgId: string;
  orgType: string;
  tier: PlanTier;
  seatCount: number;
  active: boolean;
  stripeCustomerId: string | null;
}

/**
 * Full billing info for the current user's org.
 */
export async function getOrgBillingInfo(): Promise<OrgBillingInfo | null> {
  const { supabase, user, orgId } = await getOrgIdForUser();
  if (!user || !orgId) return null;

  const { data: org } = await supabase
    .from("organizations")
    .select("id, type, seat_count, stripe_customer_id")
    .eq("id", orgId)
    .single();

  if (!org) return null;

  const sub = await getSubscription();

  return {
    orgId: org.id,
    orgType: org.type,
    tier: sub.tier,
    seatCount: org.seat_count ?? 1,
    active: sub.active,
    stripeCustomerId: org.stripe_customer_id,
  };
}
