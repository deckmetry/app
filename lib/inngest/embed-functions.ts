import { inngest } from "./client";
import { getResend } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/service";
import { BomResultsEmail } from "@/lib/email/bom-results";
import { NewLeadEmail } from "@/lib/email/new-lead";

// ---------- embed/bom-created — Send BOM email to homeowner ----------
export const embedBomCreated = inngest.createFunction(
  {
    id: "embed-bom-created",
    name: "Send BOM Results Email to Homeowner",
    triggers: [{ event: "embed/bom-created" }],
  },
  async ({ event }) => {
    const {
      shareToken,
      homeownerEmail,
      homeownerName,
      supplierName,
      supplierLogoUrl,
      supplierPrimaryColor,
      deckSpecs,
    } = event.data;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const bomUrl = `${appUrl}/bom/${shareToken}`;

    const { error } = await getResend().emails.send({
      from: `${supplierName} via Deckmetry <noreply@deckmetry.com>`,
      to: homeownerEmail,
      subject: "Your Deck Material List is Ready",
      react: BomResultsEmail({
        homeownerName,
        supplierName,
        supplierLogoUrl,
        supplierPrimaryColor,
        deckType: deckSpecs.type,
        widthFt: deckSpecs.widthFt,
        projectionFt: deckSpecs.projectionFt,
        areaSf: deckSpecs.areaSf,
        bomItems: deckSpecs.bomItems,
        brand: deckSpecs.brand,
        color: deckSpecs.color,
        bomUrl,
      }),
    });

    if (error) {
      throw new Error(`Failed to send BOM email: ${error.message}`);
    }

    return { sent: true, to: homeownerEmail };
  }
);

// ---------- embed/bom-created — Send lead notification to supplier ----------
export const embedLeadNotification = inngest.createFunction(
  {
    id: "embed-lead-notification",
    name: "Send New Lead Notification to Supplier",
    triggers: [{ event: "embed/bom-created" }],
  },
  async ({ event }) => {
    const {
      supplierOrgId,
      supplierName,
      homeownerName,
      homeownerEmail,
      homeownerPhone,
      projectAddress,
      deckSpecs,
    } = event.data;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const leadsUrl = `${appUrl}/supplier/leads`;

    // Find the supplier org owner's email
    const supabase = createServiceClient();
    const { data: ownerMember } = await supabase
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", supplierOrgId)
      .eq("role", "owner")
      .single();

    if (!ownerMember) {
      throw new Error(`No owner found for org ${supplierOrgId}`);
    }

    const { data: ownerUser } = await supabase.auth.admin.getUserById(
      ownerMember.user_id
    );

    if (!ownerUser?.user?.email) {
      throw new Error(`No email found for org owner ${ownerMember.user_id}`);
    }

    const { error } = await getResend().emails.send({
      from: "Deckmetry <leads@deckmetry.com>",
      to: ownerUser.user.email,
      subject: `New Lead: ${homeownerName || homeownerEmail}`,
      react: NewLeadEmail({
        supplierName,
        homeownerName,
        homeownerEmail,
        homeownerPhone,
        projectAddress,
        deckType: deckSpecs.type,
        widthFt: deckSpecs.widthFt,
        projectionFt: deckSpecs.projectionFt,
        areaSf: deckSpecs.areaSf,
        bomItems: deckSpecs.bomItems,
        leadsUrl,
      }),
    });

    if (error) {
      throw new Error(`Failed to send lead notification: ${error.message}`);
    }

    return { sent: true, to: ownerUser.user.email };
  }
);
