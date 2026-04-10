"use server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

/**
 * Create a Stripe Checkout session for a subscription plan.
 * Redirects the user to Stripe's hosted checkout page.
 */
export async function createCheckoutSession(priceId: string) {
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

  // Check if org already has a Stripe customer
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
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

/**
 * Create a Stripe billing portal session for managing subscription.
 * Redirects the user to the Stripe Customer Portal.
 */
export async function createPortalSession() {
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

  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_customer_id")
    .eq("id", profile.default_organization_id)
    .single();

  if (!org?.stripe_customer_id) {
    throw new Error("No billing account found. Please subscribe to a plan first.");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await getStripe().billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `${appUrl}/dashboard`,
  });

  redirect(session.url);
}
