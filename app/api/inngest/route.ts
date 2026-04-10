import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  proposalSent,
  proposalApproved,
  orderSubmitted,
  deliveryConfirmed,
} from "@/lib/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [proposalSent, proposalApproved, orderSubmitted, deliveryConfirmed],
});
