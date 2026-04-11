"use server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { checkHomeownerPurchase as _checkPurchase, type HomeownerProductType } from "@/lib/subscription";

// ---- Price ID mappings ----

const HOMEOWNER_PRICE_IDS: Record<string, string | undefined> = {
  bom: process.env.STRIPE_HOMEOWNER_BOM_PRICE_ID,
  permit_design: process.env.STRIPE_HOMEOWNER_PERMIT_PRICE_ID,
  "3d_design": process.env.STRIPE_HOMEOWNER_3D_PRICE_ID,
  pro_review: process.env.STRIPE_HOMEOWNER_REVIEW_PRICE_ID,
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
      price_id: priceId,
    },
  });

  if (!session.url) throw new Error("Failed to create checkout session");
  redirect(session.url);
}

// ---- Purchase check (server action wrapper for client components) ----

export async function checkHomeownerPurchase(
  estimateId: string,
  productType: HomeownerProductType
): Promise<boolean> {
  return _checkPurchase(estimateId, productType);
}
