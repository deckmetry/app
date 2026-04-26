"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { inngest } from "@/lib/inngest/client";
import { advanceProjectStatus } from "@/lib/actions/projects";
import { createNotification } from "@/lib/actions/notifications";

interface SupplierEstimateLineItemInput {
  category: string;
  description: string;
  size: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  in_stock?: boolean;
  lead_time_days?: number;
  notes: string | null;
  sort_order: number;
}

interface CreateSupplierEstimateInput {
  estimate_id: string;
  project_id?: string;
  recipient_org_id?: string;
  title: string;
  cover_note?: string;
  valid_until?: string;
  tax_rate?: number;
  discount_amount?: number;
  line_items: SupplierEstimateLineItemInput[];
}

async function getUserOrgId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_organization_id)
    throw new Error("No organization found");

  return { supabase, user, orgId: profile.default_organization_id };
}

export async function createSupplierEstimate(input: CreateSupplierEstimateInput) {
  const { supabase, user, orgId } = await getUserOrgId();

  // Calculate totals from line items
  const subtotal = input.line_items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const taxRate = input.tax_rate ?? 0;
  const taxAmount = subtotal * taxRate;
  const discountAmount = input.discount_amount ?? 0;
  const total = subtotal + taxAmount - discountAmount;

  // Get project_id from estimate if not provided
  let projectId = input.project_id;
  if (!projectId) {
    const { data: estimate } = await supabase
      .from("estimates")
      .select("project_id")
      .eq("id", input.estimate_id)
      .single();
    projectId = estimate?.project_id ?? undefined;
  }

  const { data: supplierEstimate, error } = await supabase
    .from("supplier_estimates")
    .insert({
      estimate_id: input.estimate_id,
      project_id: projectId || null,
      organization_id: orgId,
      recipient_org_id: input.recipient_org_id || null,
      created_by: user.id,
      title: input.title,
      cover_note: input.cover_note || null,
      valid_until: input.valid_until || null,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total,
    })
    .select("id, estimate_number")
    .single();

  if (error || !supplierEstimate) {
    return { success: false, error: error?.message ?? "Failed to create estimate" };
  }

  // Insert line items
  if (input.line_items.length > 0) {
    const lineItems = input.line_items.map((item) => ({
      supplier_estimate_id: supplierEstimate.id,
      category: item.category,
      description: item.description,
      size: item.size,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      in_stock: item.in_stock ?? true,
      lead_time_days: item.lead_time_days ?? null,
      notes: item.notes,
      sort_order: item.sort_order,
    }));

    await supabase.from("supplier_estimate_line_items").insert(lineItems);
  }

  revalidatePath("/");
  return {
    success: true,
    supplierEstimateId: supplierEstimate.id,
    estimateNumber: supplierEstimate.estimate_number,
  };
}

export async function sendSupplierEstimate(supplierEstimateId: string) {
  const { supabase, orgId } = await getUserOrgId();

  const { data: estimate, error: fetchError } = await supabase
    .from("supplier_estimates")
    .select("id, project_id, recipient_org_id, estimate_number, title, total")
    .eq("id", supplierEstimateId)
    .eq("organization_id", orgId)
    .eq("status", "draft")
    .single();

  if (fetchError || !estimate) {
    return { error: "Estimate not found or already sent" };
  }

  const { error } = await supabase
    .from("supplier_estimates")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", supplierEstimateId);

  if (error) return { error: error.message };

  // Advance project pipeline
  if (estimate.project_id) {
    await advanceProjectStatus(estimate.project_id, "estimate_received");
  }

  // Notify recipient
  if (estimate.recipient_org_id) {
    await createNotification({
      organizationId: estimate.recipient_org_id,
      type: "system",
      title: "New Material Estimate",
      body: `Estimate ${estimate.estimate_number} received — $${Number(estimate.total).toLocaleString()}`,
      href: `/projects`,
      entityType: "supplier_estimate",
      entityId: estimate.id,
    });
  }

  // Fire Inngest event for email notification
  await inngest.send({
    name: "supplier-estimate/sent",
    data: {
      supplierEstimateId: estimate.id,
      estimateNumber: estimate.estimate_number,
      title: estimate.title,
      total: Number(estimate.total),
      recipientOrgId: estimate.recipient_org_id,
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function getSupplierEstimate(supplierEstimateId: string) {
  const { supabase } = await getUserOrgId();

  const { data, error } = await supabase
    .from("supplier_estimates")
    .select(
      `
      *,
      supplier_estimate_line_items (*),
      organizations:organization_id (id, name, logo_url),
      estimates:estimate_id (
        id, project_name, deck_type, deck_width_ft, deck_projection_ft,
        total_area_sf, decking_brand, decking_collection, decking_color
      )
    `
    )
    .eq("id", supplierEstimateId)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

export async function getSupplierEstimateByToken(token: string) {
  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    const service = createServiceClient();

    const { data, error } = await service
      .from("supplier_estimates")
      .select(
        `
        *,
        supplier_estimate_line_items (*),
        organizations:organization_id (id, name, logo_url)
      `
      )
      .eq("share_token", token)
      .is("deleted_at", null)
      .single();

    if (error || !data) return null;

    // Auto-mark as viewed on first access
    if (data.status === "sent") {
      await service
        .from("supplier_estimates")
        .update({ status: "viewed", viewed_at: new Date().toISOString() })
        .eq("id", data.id);
    }

    return data;
  } catch {
    return null;
  }
}

export async function listSupplierEstimates() {
  const { supabase, orgId } = await getUserOrgId();

  // Get org type to determine query
  const { data: org } = await supabase
    .from("organizations")
    .select("type")
    .eq("id", orgId)
    .single();

  let query = supabase
    .from("supplier_estimates")
    .select(
      `
      id, estimate_number, title, status, total, share_token,
      sent_at, accepted_at, created_at,
      organizations:organization_id (id, name),
      estimates:estimate_id (project_name, total_area_sf)
    `
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (org?.type === "supplier") {
    query = query.eq("organization_id", orgId);
  } else {
    // Contractor or homeowner — show estimates sent to them
    query = query.eq("recipient_org_id", orgId).neq("status", "draft");
  }

  const { data } = await query;
  return data ?? [];
}

export async function acceptSupplierEstimate(supplierEstimateId: string) {
  const { supabase, orgId } = await getUserOrgId();

  const { data: estimate } = await supabase
    .from("supplier_estimates")
    .select("id, project_id, organization_id, status")
    .eq("id", supplierEstimateId)
    .eq("recipient_org_id", orgId)
    .single();

  if (!estimate) return { error: "Estimate not found" };
  if (estimate.status !== "sent" && estimate.status !== "viewed") {
    return { error: "Estimate cannot be accepted in its current state" };
  }

  // Use service client to update (supplier owns the row)
  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    const service = createServiceClient();

    await service
      .from("supplier_estimates")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", supplierEstimateId);
  } catch {
    return { error: "Service unavailable" };
  }

  // Notify supplier
  await createNotification({
    organizationId: estimate.organization_id,
    type: "system",
    title: "Estimate Accepted",
    body: "Your material estimate has been accepted",
    href: `/supplier/projects`,
    entityType: "supplier_estimate",
    entityId: estimate.id,
  });

  revalidatePath("/");
  return { success: true };
}
