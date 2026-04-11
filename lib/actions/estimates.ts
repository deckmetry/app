"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateEstimate } from "@/lib/calculations";
import type { EstimateInput, BomItem } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { checkEstimateLimit } from "@/lib/subscription";
import { logActivity } from "@/lib/actions/activity";

interface SaveEstimateResult {
  success: boolean;
  estimateId?: string;
  error?: string;
}

export async function saveEstimate(
  formData: EstimateInput
): Promise<SaveEstimateResult> {
  const supabase = await createClient();

  // Verify auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check free-tier estimate limit
  const limit = await checkEstimateLimit();
  if (!limit.allowed) {
    return {
      success: false,
      error: `Free plan limit reached (${limit.used}/${limit.limit} estimates this month). Upgrade to Pro for unlimited estimates.`,
    };
  }

  // Get user's default organization
  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_organization_id) {
    return { success: false, error: "No organization found" };
  }

  const orgId = profile.default_organization_id;

  // Run the BOM engine server-side (authoritative calculation)
  const estimate = calculateEstimate(formData);

  // Generate share token
  const shareToken = crypto.randomUUID().replace(/-/g, "");

  // Insert estimate
  const { data: savedEstimate, error: estimateError } = await supabase
    .from("estimates")
    .insert({
      organization_id: orgId,
      created_by: user.id,
      status: "completed" as const,

      // Job info
      project_name: formData.projectName || "Untitled Estimate",
      project_address: formData.projectAddress || null,
      delivery_address: formData.deliveryAddress || null,
      requested_delivery_date: formData.requestedDeliveryDate || null,
      contractor_name: formData.contractorName || null,
      email: formData.email || null,
      phone: formData.phone || null,

      // Geometry
      deck_type: formData.deckType,
      deck_width_ft: formData.deckWidthFt,
      deck_projection_ft: formData.deckProjectionFt,
      deck_height_in: formData.deckHeightIn,
      joist_spacing_in: formData.joistSpacingIn,

      // Surface
      decking_brand: formData.deckingBrand || null,
      decking_collection: formData.deckingCollection || null,
      decking_color: formData.deckingColor || null,
      picture_frame_color: formData.pictureFrameColor || null,
      picture_frame_enabled: formData.pictureFrameEnabled,

      // Railing
      railing_required_override: formData.railingRequiredOverride,
      railing_material: formData.railingMaterial || null,
      railing_color: formData.railingColor || null,
      open_sides: formData.openSides,

      // Add-ons
      lattice_skirt: formData.latticeSkirt,
      horizontal_skirt: formData.horizontalSkirt,
      post_cap_lights: formData.postCapLights,
      stair_lights: formData.stairLights,
      accent_lights: formData.accentLights,

      // Computed summary
      total_area_sf: estimate.derived.deckAreaSf,
      total_bom_items: estimate.bom.length,

      // Sharing
      share_token: shareToken,

      // Metadata
      assumptions: estimate.assumptions,
      warnings: estimate.warnings,
    })
    .select("id")
    .single();

  if (estimateError || !savedEstimate) {
    return {
      success: false,
      error: estimateError?.message ?? "Failed to save estimate",
    };
  }

  const estimateId = savedEstimate.id;

  // Insert BOM line items
  if (estimate.bom.length > 0) {
    const lineItems = estimate.bom.map((item: BomItem, index: number) => ({
      estimate_id: estimateId,
      category: item.category,
      description: item.description,
      size: item.size || null,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes || null,
      sort_order: index,
      is_manual_override: false,
    }));

    const { error: lineItemsError } = await supabase
      .from("estimate_line_items")
      .insert(lineItems);

    if (lineItemsError) {
      // Estimate was saved but line items failed — log but don't fail
      console.error("Failed to save line items:", lineItemsError);
    }
  }

  // Insert stair sections
  if (formData.stairSections.length > 0) {
    const stairSections = formData.stairSections.map((stair, index) => ({
      estimate_id: estimateId,
      location: stair.location,
      width_ft: stair.widthFt,
      step_count: stair.stepCount,
      sort_order: index,
    }));

    const { error: stairsError } = await supabase
      .from("estimate_stair_sections")
      .insert(stairSections);

    if (stairsError) {
      console.error("Failed to save stair sections:", stairsError);
    }
  }

  revalidatePath("/dashboard");

  await logActivity({
    orgId,
    userId: user.id,
    entityType: "estimate",
    entityId: estimateId,
    action: "created",
    details: {
      projectName: formData.projectName || "Untitled Estimate",
      deckType: formData.deckType,
      areaSf: estimate.derived.deckAreaSf,
      bomItems: estimate.bom.length,
    },
  });

  return { success: true, estimateId };
}

export async function getEstimate(estimateId: string) {
  const supabase = await createClient();

  const { data: estimate, error } = await supabase
    .from("estimates")
    .select(
      `
      *,
      estimate_line_items (*),
      estimate_stair_sections (*)
    `
    )
    .eq("id", estimateId)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return estimate;
}

export async function listEstimates() {
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

  const { data: estimates, error } = await supabase
    .from("estimates")
    .select("id, project_name, status, deck_type, deck_width_ft, deck_projection_ft, total_area_sf, total_bom_items, created_at, updated_at")
    .eq("organization_id", profile.default_organization_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return [];
  return estimates;
}
