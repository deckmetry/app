import { inngest } from "./client";
import { getResend } from "@/lib/resend";
import { ProposalSentEmail } from "@/lib/email/proposal-sent";
import { ProposalApprovedEmail } from "@/lib/email/proposal-approved";

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
