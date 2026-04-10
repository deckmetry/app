import { inngest } from "./client";
import { getResend } from "@/lib/resend";
import { ProposalSentEmail } from "@/lib/email/proposal-sent";
import { ProposalApprovedEmail } from "@/lib/email/proposal-approved";
import { OrderSubmittedEmail } from "@/lib/email/order-submitted";
import { DeliveryConfirmedEmail } from "@/lib/email/delivery-confirmed";

function fmt(n: number) {
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

// ---------- proposal/sent ----------
export const proposalSent = inngest.createFunction(
  { id: "proposal-sent-email", name: "Send Proposal Email", triggers: [{ event: "proposal/sent" }] },
  async ({ event }) => {
    const {
      recipientName,
      recipientEmail,
      contractorName,
      projectName,
      quoteNumber,
      total,
      shareToken,
    } = event.data;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const proposalUrl = `${appUrl}/proposals/${shareToken}`;

    const { error } = await getResend().emails.send({
      from: "Deckmetry <notifications@deckmetry.com>",
      to: recipientEmail,
      subject: `Deck Proposal from ${contractorName} — ${quoteNumber}`,
      react: ProposalSentEmail({
        recipientName,
        contractorName,
        projectName,
        quoteNumber,
        total: fmt(total),
        proposalUrl,
      }),
    });

    if (error) {
      throw new Error(`Failed to send proposal email: ${error.message}`);
    }

    return { sent: true, to: recipientEmail };
  }
);

// ---------- proposal/approved ----------
export const proposalApproved = inngest.createFunction(
  { id: "proposal-approved-email", name: "Send Approval Notification", triggers: [{ event: "proposal/approved" }] },
  async ({ event }) => {
    const {
      contractorName,
      contractorEmail,
      signerName,
      projectName,
      quoteNumber,
      total,
    } = event.data;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const dashboardUrl = `${appUrl}/contractor/quotes`;

    const { error } = await getResend().emails.send({
      from: "Deckmetry <notifications@deckmetry.com>",
      to: contractorEmail,
      subject: `Proposal ${quoteNumber} Approved!`,
      react: ProposalApprovedEmail({
        contractorName,
        signerName,
        projectName,
        quoteNumber,
        total: fmt(total),
        dashboardUrl,
      }),
    });

    if (error) {
      throw new Error(`Failed to send approval email: ${error.message}`);
    }

    return { sent: true, to: contractorEmail };
  }
);

// ---------- order/submitted ----------
export const orderSubmitted = inngest.createFunction(
  { id: "order-submitted-email", name: "Send Order Submitted Notification", triggers: [{ event: "order/submitted" }] },
  async ({ event }) => {
    const {
      supplierEmail,
      supplierName,
      contractorName,
      orderNumber,
      title,
      total,
    } = event.data;

    if (!supplierEmail) return { sent: false, reason: "No supplier email" };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const dashboardUrl = `${appUrl}/supplier/orders`;

    const { error } = await getResend().emails.send({
      from: "Deckmetry <notifications@deckmetry.com>",
      to: supplierEmail,
      subject: `New Purchase Order ${orderNumber}`,
      react: OrderSubmittedEmail({
        supplierName: supplierName ?? "Supplier",
        contractorName: contractorName ?? "A contractor",
        orderNumber,
        title,
        total: fmt(total),
        dashboardUrl,
      }),
    });

    if (error) {
      throw new Error(`Failed to send order email: ${error.message}`);
    }

    return { sent: true, to: supplierEmail };
  }
);

// ---------- delivery/confirmed ----------
export const deliveryConfirmed = inngest.createFunction(
  { id: "delivery-confirmed-email", name: "Send Delivery Confirmation", triggers: [{ event: "delivery/confirmed" }] },
  async ({ event }) => {
    const {
      contractorEmail,
      contractorName,
      orderNumber,
      carrier,
      trackingNumber,
      deliveredDate,
    } = event.data;

    if (!contractorEmail) return { sent: false, reason: "No contractor email" };

    const { error } = await getResend().emails.send({
      from: "Deckmetry <notifications@deckmetry.com>",
      to: contractorEmail,
      subject: `Order ${orderNumber} Delivered!`,
      react: DeliveryConfirmedEmail({
        contractorName: contractorName ?? "Contractor",
        orderNumber,
        carrier: carrier ?? "Unknown",
        trackingNumber: trackingNumber ?? "N/A",
        estimatedDate: deliveredDate ?? new Date().toLocaleDateString(),
      }),
    });

    if (error) {
      throw new Error(`Failed to send delivery email: ${error.message}`);
    }

    return { sent: true, to: contractorEmail };
  }
);
