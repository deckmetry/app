import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

// Use service role client — webhooks run without user auth
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = getAdminClient();

  try {
    switch (event.type) {
      // ---- Product events ----
      case "product.created":
      case "product.updated": {
        const product = event.data.object as Stripe.Product;
        await supabase.from("products").upsert({
          id: product.id,
          active: product.active,
          name: product.name,
          description: product.description ?? null,
          image: product.images?.[0] ?? null,
          metadata: product.metadata,
        });
        break;
      }
      case "product.deleted": {
        const product = event.data.object as Stripe.Product;
        await supabase
          .from("products")
          .update({ active: false })
          .eq("id", product.id);
        break;
      }

      // ---- Price events ----
      case "price.created":
      case "price.updated": {
        const price = event.data.object as Stripe.Price;
        await supabase.from("prices").upsert({
          id: price.id,
          product_id: typeof price.product === "string" ? price.product : price.product.id,
          active: price.active,
          description: price.nickname ?? null,
          unit_amount: price.unit_amount ?? 0,
          currency: price.currency,
          type: price.type,
          interval: price.recurring?.interval ?? null,
          interval_count: price.recurring?.interval_count ?? null,
          trial_period_days: price.recurring?.trial_period_days ?? null,
          metadata: price.metadata,
        });
        break;
      }
      case "price.deleted": {
        const price = event.data.object as Stripe.Price;
        await supabase
          .from("prices")
          .update({ active: false })
          .eq("id", price.id);
        break;
      }

      // ---- Checkout completed — link customer to org ----
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.metadata?.organization_id) {
          await supabase
            .from("organizations")
            .update({ stripe_customer_id: session.customer as string })
            .eq("id", session.metadata.organization_id);
        }
        break;
      }

      // ---- Subscription events ----
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = await resolveOrgId(supabase, subscription.customer as string);
        if (!orgId) break;

        await supabase.from("subscriptions").upsert({
          id: subscription.id,
          organization_id: orgId,
          status: subscription.status,
          price_id: subscription.items.data[0]?.price.id ?? null,
          quantity: subscription.items.data[0]?.quantity ?? 1,
          cancel_at_period_end: subscription.cancel_at_period_end,
          cancel_at: subscription.cancel_at
            ? new Date(subscription.cancel_at * 1000).toISOString()
            : null,
          canceled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toISOString()
            : null,
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          trial_start: subscription.trial_start
            ? new Date(subscription.trial_start * 1000).toISOString()
            : null,
          trial_end: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          ended_at: subscription.ended_at
            ? new Date(subscription.ended_at * 1000).toISOString()
            : null,
          metadata: subscription.metadata,
        });

        // Also store subscription ID on the org for quick lookups
        await supabase
          .from("organizations")
          .update({ stripe_subscription_id: subscription.id })
          .eq("id", orgId);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            ended_at: new Date().toISOString(),
          })
          .eq("id", subscription.id);

        // Clear subscription ID from org
        const orgId = await resolveOrgId(supabase, subscription.customer as string);
        if (orgId) {
          await supabase
            .from("organizations")
            .update({ stripe_subscription_id: null })
            .eq("id", orgId);
        }
        break;
      }
    }
  } catch (err) {
    console.error("Stripe webhook processing error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

/** Resolve organization_id from a Stripe customer ID */
async function resolveOrgId(
  supabase: ReturnType<typeof createClient>,
  customerId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("organizations")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();
  return data?.id ?? null;
}
