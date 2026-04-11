"use server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { getOrgBillingInfo as _getOrgBillingInfo } from "@/lib/subscription";

// ---- Price ID mappings ----

const HOMEOWNER_PRICE_IDS: Record<string, string | undefined> = {
  bom: process.env.STRIPE_HOMEOWNER_BOM_PRICE_ID,
  permit_design: process.env.STRIPE_HOMEOWNER_PERMIT_DESIGN_PRICE_ID,
  "3d_design": process.env.STRIPE_HOMEOWNER_3D_DESIGN_PRICE_ID,
  pro_review: process.env.STRIPE_HOMEOWNER_PRO_REVIEW_PRICE_ID,
};

export type HomeownerProduct = "bom" | "permit_design" | "3d_design" | "pro_review";

// ---- Helpers ----

async function getOrgAndCustomer() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_organization_id) {
    throw new Error("No organization found");
  }

  const orgId = profile.default_organization_id;

  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_customer_id")
    .eq("id", orgId)
    .single();

  let customerId = org?.stripe_customer_id;

  // Create Stripe customer if needed
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      metadata: { organization_id: orgId, user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", orgId);
  }

  return { supabase, user, orgId, customerId };
}

// ---- Subscription checkout (contractors + suppliers) ----

export async function createCheckoutSession(priceId: string, quantity?: number) {
  const { orgId, customerId } = await getOrgAndCustomer();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const lineItems: { price: string; quantity: number }[] = [
    { price: priceId, quantity: quantity ?? 1 },
  ];

  // For team plans, add per-seat line item
  const teamBasePriceId = process.env.STRIPE_CONTRACTOR_TEAM_BASE_PRICE_ID;
  const teamSeatPriceId = process.env.STRIPE_CONTRACTOR_TEAM_SEAT_PRICE_ID;
  const supplierPlatformPriceId = process.env.STRIPE_SUPPLIER_PLATFORM_PRICE_ID;
  const supplierSeatPriceId = process.env.STRIPE_SUPPLIER_SEAT_PRICE_ID;

  if (priceId === teamBasePriceId && teamSeatPriceId && quantity && quantity > 1) {
    lineItems.push({ price: teamSeatPriceId, quantity: quantity - 1 });
  }
  if (priceId === supplierPlatformPriceId && supplierSeatPriceId && quantity && quantity > 1) {
    lineItems.push({ price: supplierSeatPriceId, quantity: quantity - 1 });
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: lineItems,
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=canceled`,
    subscription_data: {
      metadata: { organization_id: orgId },
    },
    metadata: { organization_id: orgId },
  });

  if (!session.url) throw new Error("Failed to create checkout session");
  redirect(session.url);
}

// ---- Homeowner one-time payment checkout ----

export async function createHomeownerCheckoutSession(
  productType: HomeownerProduct,
  estimateId: string
) {
  const priceId = HOMEOWNER_PRICE_IDS[productType];
  if (!priceId) throw new Error(`No price configured for ${productType}`);

  const { user, orgId, customerId } = await getOrgAndCustomer();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/homeowner/estimates/${estimateId}?purchase=success`,
    cancel_url: `${appUrl}/homeowner/estimates/${estimateId}?purchase=canceled`,
    metadata: {
      organization_id: orgId,
      user_id: user.id,
      product_type: productType,
      entity_id: estimateId,
    },
  });

  if (!session.url) throw new Error("Failed to create checkout session");
  redirect(session.url);
}

// ---- Update subscription seat count ----

export async function updateSubscriptionSeats(newQuantity: number) {
  const { supabase, orgId } = await getOrgAndCustomer();

  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_subscription_id")
    .eq("id", orgId)
    .single();

  if (!org?.stripe_subscription_id) {
    throw new Error("No active subscription found");
  }

  const subscription = await getStripe().subscriptions.retrieve(
    org.stripe_subscription_id
  );

  // Find the seat line item (the per-seat price)
  const teamSeatPriceId = process.env.STRIPE_CONTRACTOR_TEAM_SEAT_PRICE_ID;
  const supplierSeatPriceId = process.env.STRIPE_SUPPLIER_SEAT_PRICE_ID;

  const seatItem = subscription.items.data.find(
    (item) =>
      item.price.id === teamSeatPriceId ||
      item.price.id === supplierSeatPriceId
  );

  if (!seatItem) {
    throw new Error("No seat-based line item found on subscription");
  }

  // Update the seat quantity (seats = total members - 1 base seat)
  const seatQuantity = Math.max(0, newQuantity - 1);

  await getStripe().subscriptionItems.update(seatItem.id, {
    quantity: seatQuantity,
  });

  // Update seat_count in our DB
  await supabase
    .from("organizations")
    .update({ seat_count: newQuantity })
    .eq("id", orgId);

  return { success: true, seatCount: newQuantity };
}

// ---- Billing portal ----

export async function createPortalSession() {
  const { customerId } = await getOrgAndCustomer();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard`,
  });

  redirect(session.url);
}

// ---- Billing info (server action wrapper for client components) ----

export async function getBillingInfo() {
  return _getOrgBillingInfo();
}
