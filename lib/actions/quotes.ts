"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { inngest } from "@/lib/inngest/client";
import { createNotification } from "@/lib/actions/notifications";
import { logActivity } from "@/lib/actions/activity";
import { requirePaidPlan } from "@/lib/subscription";

interface QuoteLineItemInput {
  category: string;
  description: string;
  size: string | null;
  quantity: number;
  unit: string;
  unit_cost: number;
  markup_pct: number;
  notes: string | null;
  sort_order: number;
  visible_to_customer: boolean;
}

interface CreateQuoteInput {
  estimate_id: string;
  title: string;
  cover_note?: string;
  valid_until?: string;
  payment_terms?: string;
  tax_rate?: number;
  discount_amount?: number;
  line_items: QuoteLineItemInput[];
}

interface QuoteResult {
  success: boolean;
  quoteId?: string;
  error?: string;
}

export async function createQuote(input: CreateQuoteInput): Promise<QuoteResult> {
  try {
    await requirePaidPlan("Creating quotes requires a paid plan. Upgrade at /pricing.");
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Paid plan required" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_organization_id) {
    return { success: false, error: "No organization found" };
  }

  const orgId = profile.default_organization_id;

  // Create the quote
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      organization_id: orgId,
      estimate_id: input.estimate_id,
      created_by: user.id,
      status: "draft",
      title: input.title,
      cover_note: input.cover_note || null,
      valid_until: input.valid_until || null,
      payment_terms: input.payment_terms || null,
      tax_rate: input.tax_rate ?? 0,
      discount_amount: input.discount_amount ?? 0,
    })
    .select("id")
    .single();

  if (quoteError || !quote) {
    return { success: false, error: quoteError?.message ?? "Failed to create quote" };
  }

  // Insert line items
  if (input.line_items.length > 0) {
    const lineItems = input.line_items.map((item) => ({
      quote_id: quote.id,
      category: item.category,
      description: item.description,
      size: item.size,
      quantity: item.quantity,
      unit: item.unit,
      unit_cost: item.unit_cost,
      markup_pct: item.markup_pct,
      notes: item.notes,
      sort_order: item.sort_order,
      visible_to_customer: item.visible_to_customer,
    }));

    const { error: lineError } = await supabase
      .from("quote_line_items")
      .insert(lineItems);

    if (lineError) {
      console.error("Failed to save quote line items:", lineError);
    }
  }

  revalidatePath("/contractor/quotes");
  revalidatePath("/contractor");

  await logActivity({
    orgId,
    userId: user.id,
    entityType: "quote",
    entityId: quote.id,
    action: "created",
    details: { title: input.title, estimateId: input.estimate_id },
  });

  return { success: true, quoteId: quote.id };
}

export async function sendQuote(
  quoteId: string,
  recipientEmail?: string,
  recipientName?: string
): Promise<QuoteResult> {
  try {
    await requirePaidPlan("Sending quotes requires a paid plan.");
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Paid plan required" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("quotes")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", quoteId);

  if (error) return { success: false, error: error.message };

  // Fire proposal/sent event via Inngest (if recipient provided)
  if (recipientEmail) {
    const { data: quote } = await supabase
      .from("quotes")
      .select(`
        quote_number, title, total, share_token,
        estimates (project_name, contractor_name)
      `)
      .eq("id", quoteId)
      .single();

    if (quote) {
      await inngest.send({
        name: "proposal/sent",
        data: {
          recipientName: recipientName ?? recipientEmail,
          recipientEmail,
          contractorName: quote.estimates?.contractor_name ?? "Your contractor",
          projectName: quote.estimates?.project_name ?? quote.title,
          quoteNumber: quote.quote_number,
          total: Number(quote.total),
          shareToken: quote.share_token,
        },
      });
    }
  }

  // In-app notification
  const { data: sentQuote } = await supabase
    .from("quotes")
    .select("quote_number, title, organization_id")
    .eq("id", quoteId)
    .single();

  if (sentQuote) {
    await createNotification({
      organizationId: sentQuote.organization_id,
      type: "quote_sent",
      title: `Proposal ${sentQuote.quote_number} sent`,
      body: sentQuote.title,
      href: `/contractor/quotes`,
      entityType: "quote",
      entityId: quoteId,
    });
  }

  revalidatePath("/contractor/quotes");
  revalidatePath("/contractor");

  if (sentQuote) {
    await logActivity({
      orgId: sentQuote.organization_id,
      userId: user.id,
      entityType: "quote",
      entityId: quoteId,
      action: "sent",
      details: {
        quoteNumber: sentQuote.quote_number,
        recipientEmail: recipientEmail ?? null,
      },
    });
  }

  return { success: true, quoteId };
}

export async function getQuote(quoteId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quotes")
    .select(`
      *,
      quote_line_items (*),
      estimates (
        id, project_name, deck_type, deck_width_ft, deck_projection_ft,
        total_area_sf, decking_brand, decking_collection, decking_color,
        contractor_name, project_address
      )
    `)
    .eq("id", quoteId)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

export async function getQuoteByToken(token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quotes")
    .select(`
      *,
      quote_line_items (
        id, category, description, size, quantity, unit,
        unit_price, line_total, notes, sort_order, visible_to_customer
      ),
      estimates (
        id, project_name, deck_type, deck_width_ft, deck_projection_ft,
        total_area_sf, decking_brand, decking_collection, decking_color,
        contractor_name, project_address
      )
    `)
    .eq("share_token", token)
    .is("deleted_at", null)
    .single();

  if (error) return null;

  // Mark as viewed if first time
  if (data.status === "sent" && !data.viewed_at) {
    await supabase
      .from("quotes")
      .update({ status: "viewed", viewed_at: new Date().toISOString() })
      .eq("id", data.id);
  }

  return data;
}

export async function listQuotes() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_organization_id) return [];

  const { data, error } = await supabase
    .from("quotes")
    .select(`
      id, quote_number, title, status, subtotal, total,
      share_token, sent_at, approved_at, created_at,
      estimates (id, project_name, deck_width_ft, deck_projection_ft)
    `)
    .eq("organization_id", profile.default_organization_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}
