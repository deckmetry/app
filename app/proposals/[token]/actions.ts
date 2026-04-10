"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { inngest } from "@/lib/inngest/client";
import { createNotification } from "@/lib/actions/notifications";

interface ApproveInput {
  quoteId: string;
  organizationId: string;
  signerName: string;
  signerEmail: string;
  total: number;
  quoteNumber: string;
}

interface ApproveResult {
  success: boolean;
  error?: string;
}

export async function approveProposal(
  input: ApproveInput
): Promise<ApproveResult> {
  const supabase = await createClient();
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    null;

  // Insert approval record
  const { error: approvalError } = await supabase.from("approvals").insert({
    quote_id: input.quoteId,
    organization_id: input.organizationId,
    signer_name: input.signerName,
    signer_email: input.signerEmail,
    signer_ip: ip,
    signature_data: `e-signature:${input.signerName}:${new Date().toISOString()}`,
    approved_total: input.total,
    approved_quote_number: input.quoteNumber,
  });

  if (approvalError) {
    return { success: false, error: approvalError.message };
  }

  // Update quote status
  const { error: updateError } = await supabase
    .from("quotes")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", input.quoteId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Notify contractor via Inngest
  const { data: quote } = await supabase
    .from("quotes")
    .select(`
      quote_number, title, total,
      estimates (project_name, contractor_name),
      profiles:created_by (full_name),
      users:created_by (email)
    `)
    .eq("id", input.quoteId)
    .single();

  if (quote) {
    const contractorEmail =
      (quote.users as any)?.email ?? null;
    if (contractorEmail) {
      await inngest.send({
        name: "proposal/approved",
        data: {
          contractorName:
            (quote.profiles as any)?.full_name ??
            quote.estimates?.contractor_name ??
            "Contractor",
          contractorEmail,
          signerName: input.signerName,
          projectName: quote.estimates?.project_name ?? quote.title,
          quoteNumber: input.quoteNumber,
          total: input.total,
        },
      });
    }
  }

  // In-app notification for contractor org
  await createNotification({
    organizationId: input.organizationId,
    type: "quote_approved",
    title: `Proposal ${input.quoteNumber} approved by ${input.signerName}`,
    body: `Total: $${input.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    href: `/contractor/quotes`,
    entityType: "quote",
    entityId: input.quoteId,
  });

  revalidatePath(`/proposals`);
  return { success: true };
}
