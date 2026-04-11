import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  proposalSent,
  proposalApproved,
  orderSubmitted,
  deliveryConfirmed,
} from "@/lib/inngest/functions";
import {
  paymentFailed,
  paymentReceived,
  trialEnding,
  subscriptionCanceled,
} from "@/lib/inngest/billing-functions";
import {
  embedBomCreated,
  embedLeadNotification,
} from "@/lib/inngest/embed-functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    proposalSent,
    proposalApproved,
    orderSubmitted,
    deliveryConfirmed,
    paymentFailed,
    paymentReceived,
    trialEnding,
    subscriptionCanceled,
    embedBomCreated,
    embedLeadNotification,
  ],
});
