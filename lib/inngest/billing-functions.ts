import { inngest } from "./client";
import { getResend } from "@/lib/resend";
import { PaymentFailedEmail } from "@/lib/email/payment-failed";
import { PaymentReceivedEmail } from "@/lib/email/payment-received";
import { TrialEndingEmail } from "@/lib/email/trial-ending";
import { SubscriptionCanceledEmail } from "@/lib/email/subscription-canceled";

function fmtCents(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

// ---------- billing/payment-failed ----------
export const paymentFailed = inngest.createFunction(
  {
    id: "billing-payment-failed",
    name: "Send Payment Failed Email",
    triggers: [{ event: "billing/payment-failed" }],
  },
  async ({ event }) => {
    const { recipientEmail, recipientName, gracePeriodEnd, amountDue, currency } =
      event.data;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const portalUrl = `${appUrl}/dashboard`;

    const { error } = await getResend().emails.send({
      from: "Deckmetry <billing@deckmetry.com>",
      to: recipientEmail,
      subject: "Action Required: Payment Failed",
      react: PaymentFailedEmail({
        recipientName,
        gracePeriodEnd: new Date(gracePeriodEnd).toLocaleDateString(),
        amountDue: fmtCents(amountDue, currency),
        portalUrl,
      }),
    });

    if (error) {
      throw new Error(`Failed to send payment-failed email: ${error.message}`);
    }

    return { sent: true, to: recipientEmail };
  }
);

// ---------- billing/payment-received ----------
export const paymentReceived = inngest.createFunction(
  {
    id: "billing-payment-received",
    name: "Send Payment Received Email",
    triggers: [{ event: "billing/payment-received" }],
  },
  async ({ event }) => {
    const { recipientEmail, recipientName, amountPaid, currency } = event.data;

    const { error } = await getResend().emails.send({
      from: "Deckmetry <billing@deckmetry.com>",
      to: recipientEmail,
      subject: "Payment Received — Thank You!",
      react: PaymentReceivedEmail({
        recipientName,
        amountPaid: fmtCents(amountPaid, currency),
      }),
    });

    if (error) {
      throw new Error(`Failed to send payment-received email: ${error.message}`);
    }

    return { sent: true, to: recipientEmail };
  }
);

// ---------- billing/trial-ending ----------
export const trialEnding = inngest.createFunction(
  {
    id: "billing-trial-ending",
    name: "Send Trial Ending Email",
    triggers: [{ event: "billing/trial-ending" }],
  },
  async ({ event }) => {
    const { recipientEmail, recipientName, trialEnd } = event.data;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const pricingUrl = `${appUrl}/pricing`;

    const { error } = await getResend().emails.send({
      from: "Deckmetry <billing@deckmetry.com>",
      to: recipientEmail,
      subject: "Your Deckmetry Trial Ends Soon",
      react: TrialEndingEmail({
        recipientName,
        trialEndDate: trialEnd
          ? new Date(trialEnd).toLocaleDateString()
          : "soon",
        pricingUrl,
      }),
    });

    if (error) {
      throw new Error(`Failed to send trial-ending email: ${error.message}`);
    }

    return { sent: true, to: recipientEmail };
  }
);

// ---------- billing/subscription-canceled ----------
export const subscriptionCanceled = inngest.createFunction(
  {
    id: "billing-subscription-canceled",
    name: "Send Subscription Canceled Email",
    triggers: [{ event: "billing/subscription-canceled" }],
  },
  async ({ event }) => {
    const { recipientEmail, recipientName, accessUntil } = event.data;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const pricingUrl = `${appUrl}/pricing`;

    const { error } = await getResend().emails.send({
      from: "Deckmetry <billing@deckmetry.com>",
      to: recipientEmail,
      subject: "Your Deckmetry Subscription Has Been Canceled",
      react: SubscriptionCanceledEmail({
        recipientName,
        accessUntil: accessUntil ?? null,
        pricingUrl,
      }),
    });

    if (error) {
      throw new Error(`Failed to send subscription-canceled email: ${error.message}`);
    }

    return { sent: true, to: recipientEmail };
  }
);
