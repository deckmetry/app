"use server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

/**
 * Create a Stripe Connect onboarding link for a supplier org.
 * Redirects to Stripe's hosted onboarding flow.
 */
export async function createConnectOnboardingLink() {
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
    .select("stripe_connect_id, name, email")
    .eq("id", orgId)
    .single();

  const stripe = getStripe();
  let connectId = org?.stripe_connect_id;

  // Create connected account if needed
  if (!connectId) {
    const account = await stripe.accounts.create({
      type: "standard",
      email: org?.email ?? user.email ?? undefined,
      business_profile: {
        name: org?.name ?? undefined,
      },
      metadata: { organization_id: orgId },
    });
    connectId = account.id;

    await supabase
      .from("organizations")
      .update({ stripe_connect_id: connectId })
      .eq("id", orgId);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const link = await stripe.accountLinks.create({
    account: connectId,
    refresh_url: `${appUrl}/supplier/billing?connect=refresh`,
    return_url: `${appUrl}/supplier/billing?connect=success`,
    type: "account_onboarding",
  });

  redirect(link.url);
}

/**
 * Create a Stripe Connect login link for an existing connected account.
 */
export async function createConnectDashboardLink() {
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
    .select("stripe_connect_id")
    .eq("id", profile.default_organization_id)
    .single();

  if (!org?.stripe_connect_id) {
    throw new Error("Stripe Connect not set up. Please complete onboarding first.");
  }

  const stripe = getStripe();
  const link = await stripe.accounts.createLoginLink(org.stripe_connect_id);

  redirect(link.url);
}
