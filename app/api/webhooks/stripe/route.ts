import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { inngest } from "@/lib/inngest/client";
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

  // ---- Idempotency: deduplicate via stripe_events table ----
  const { data: inserted } = await supabase
    .from("stripe_events")
    .upsert({ id: event.id, type: event.type }, { onConflict: "id", ignoreDuplicates: true })
    .select("id")
    .single();

  if (!inserted) {
    return NextResponse.json({ received: true, duplicate: true });
  }

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

      // ---- Checkout completed — link customer to org + handle one-time payments ----
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.organization_id;

        if (orgId) {
          await supabase
            .from("organizations")
            .update({ stripe_customer_id: session.customer as string })
            .eq("id", orgId);
        }

        // Handle one-time homeowner payments
        if (session.mode === "payment" && orgId && session.metadata?.product_type) {
          const userId = session.metadata.user_id ?? null;
          await supabase.from("purchases").insert({
            organization_id: orgId,
            user_id: userId,
            stripe_session_id: session.id,
            product_type: session.metadata.product_type,
            entity_id: session.metadata.entity_id ?? null,
            amount: session.amount_total ?? 0,
            currency: session.currency ?? "usd",
            status: "completed",
            stripe_payment_intent_id: typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
            price_id: session.metadata.price_id ?? null,
          });
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

          // Fire Inngest event for cancellation email
          const ownerEmail = await resolveOrgOwnerEmail(supabase, orgId);
          if (ownerEmail) {
            await inngest.send({
              name: "billing/subscription-canceled",
              data: {
                organizationId: orgId,
                recipientEmail: ownerEmail.email,
                recipientName: ownerEmail.name,
                accessUntil: subscription.current_period_end
                  ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
                  : null,
              },
            });
          }
        }
        break;
      }

      // ---- Invoice payment failed — set grace period ----
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;
        if (!subscriptionId) break;

        // Set 7-day grace period
        const gracePeriodEnd = new Date();
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

        await supabase
          .from("subscriptions")
          .update({ grace_period_end: gracePeriodEnd.toISOString() })
          .eq("id", subscriptionId);

        // Fire billing email
        const orgId = await resolveOrgIdFromSubscription(supabase, subscriptionId);
        if (orgId) {
          const ownerEmail = await resolveOrgOwnerEmail(supabase, orgId);
          if (ownerEmail) {
            await inngest.send({
              name: "billing/payment-failed",
              data: {
                organizationId: orgId,
                recipientEmail: ownerEmail.email,
                recipientName: ownerEmail.name,
                gracePeriodEnd: gracePeriodEnd.toISOString(),
                amountDue: invoice.amount_due,
                currency: invoice.currency,
              },
            });
          }
        }
        break;
      }

      // ---- Invoice payment succeeded — clear grace period ----
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;
        if (!subscriptionId) break;

        // Clear grace period
        await supabase
          .from("subscriptions")
          .update({ grace_period_end: null })
          .eq("id", subscriptionId);

        // Fire receipt email
        const orgId = await resolveOrgIdFromSubscription(supabase, subscriptionId);
        if (orgId) {
          const ownerEmail = await resolveOrgOwnerEmail(supabase, orgId);
          if (ownerEmail) {
            await inngest.send({
              name: "billing/payment-received",
              data: {
                organizationId: orgId,
                recipientEmail: ownerEmail.email,
                recipientName: ownerEmail.name,
                amountPaid: invoice.amount_paid,
                currency: invoice.currency,
              },
            });
          }
        }
        break;
      }

      // ---- Trial ending soon ----
      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = await resolveOrgId(supabase, subscription.customer as string);
        if (!orgId) break;

        const ownerEmail = await resolveOrgOwnerEmail(supabase, orgId);
        if (ownerEmail) {
          await inngest.send({
            name: "billing/trial-ending",
            data: {
              organizationId: orgId,
              recipientEmail: ownerEmail.email,
              recipientName: ownerEmail.name,
              trialEnd: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
            },
          });
        }
        break;
      }

      // ---- Charge refunded — mark purchase as refunded ----
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;

        if (paymentIntentId) {
          await supabase
            .from("purchases")
            .update({
              status: "refunded",
              refunded_at: new Date().toISOString(),
            })
            .eq("stripe_payment_intent_id", paymentIntentId);
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

/** Resolve organization_id from a subscription ID */
async function resolveOrgIdFromSubscription(
  supabase: ReturnType<typeof createClient>,
  subscriptionId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("organization_id")
    .eq("id", subscriptionId)
    .single();
  return data?.organization_id ?? null;
}

/** Resolve org owner's email and name for billing notifications */
async function resolveOrgOwnerEmail(
  supabase: ReturnType<typeof createClient>,
  orgId: string
): Promise<{ email: string; name: string } | null> {
  // Find the org owner
  const { data: member } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", orgId)
    .eq("role", "owner")
    .limit(1)
    .single();

  if (!member?.user_id) return null;

  // Get user email via admin API
  const { data: { user } } = await supabase.auth.admin.getUserById(member.user_id);
  if (!user?.email) return null;

  return {
    email: user.email,
    name: user.user_metadata?.full_name ?? user.email.split("@")[0],
  };
}
