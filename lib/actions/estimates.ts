"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateEstimate } from "@/lib/calculations";
import type { EstimateInput, BomItem } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { checkEstimateLimit } from "@/lib/subscription";
import { logActivity } from "@/lib/actions/activity";
import { getFullCatalog } from "@/lib/catalog-db";

interface SaveEstimateResult {
  success: boolean;
  estimateId?: string;
  projectId?: string;
  error?: string;
}

export async function saveEstimate(
  formData: EstimateInput,
  existingProjectId?: string
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

  // Resolve referral source (ref_<slug> → supplier_<uuid>)
  let resolvedSource: string | null = null;
  if (formData.source?.startsWith("ref_")) {
    const slug = formData.source.slice(4);
    const { data: supplierOrg } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", slug)
      .eq("type", "supplier")
      .single();

    if (supplierOrg) {
      resolvedSource = `supplier_${supplierOrg.id}`;
    }
  }

  // Fetch catalog data from DB (authoritative source) with hardcoded fallback
  const catalog = await getFullCatalog();

  // Run the BOM engine server-side (authoritative calculation)
  const estimate = calculateEstimate(formData, catalog);

  // Generate share token
  const shareToken = crypto.randomUUID().replace(/-/g, "");

  // Resolve project — create FIRST so the estimate always has a project_id
  let projectId: string;

  if (existingProjectId) {
    projectId = existingProjectId;
  } else {
    const { data: org } = await supabase
      .from("organizations")
      .select("type")
      .eq("id", orgId)
      .single();

    const orgType = (org?.type as "homeowner" | "contractor" | "supplier") ?? "homeowner";

    const { data: newProject, error: projectError } = await supabase
      .from("projects")
      .insert({
        created_by_org_id: orgId,
        created_by: user.id,
        [`${orgType}_org_id`]: orgId,
        name: formData.projectName || "Untitled Project",
        address: formData.projectAddress || null,
      })
      .select("id")
      .single();

    if (projectError || !newProject) {
      return {
        success: false,
        error: projectError?.message ?? "Failed to create project",
      };
    }

    projectId = newProject.id;

    // Use service client — RLS on project_stakeholders sub-selects projects,
    // which may not be visible yet through the user's RLS context.
    const { createServiceClient } = await import("@/lib/supabase/service");
    const service = createServiceClient();

    const { error: stakeError } = await service.from("project_stakeholders").insert({
      project_id: projectId,
      organization_id: orgId,
      role: orgType,
    });

    if (stakeError) {
      console.error("[saveEstimate] stakeholder insert failed:", stakeError.message);
      await service.from("projects").delete().eq("id", projectId);
      return { success: false, error: "Failed to set up project. Please try again." };
    }
  }

  // Insert estimate with project_id set from the start
  const { data: savedEstimate, error: estimateError } = await supabase
    .from("estimates")
    .insert({
      organization_id: orgId,
      created_by: user.id,
      project_id: projectId,
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

      // Referral source
      source: resolvedSource,

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
      projectId,
    },
  });

  return { success: true, estimateId, projectId };
}

export async function updateEstimate(
  estimateId: string,
  formData: EstimateInput
): Promise<SaveEstimateResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const estimate = calculateEstimate(formData);

  const { error: updateError } = await supabase
    .from("estimates")
    .update({
      project_name: formData.projectName || "Untitled Estimate",
      project_address: formData.projectAddress || null,
      contractor_name: formData.contractorName || null,
      email: formData.email || null,
      phone: formData.phone || null,
      deck_type: formData.deckType,
      deck_width_ft: formData.deckWidthFt,
      deck_projection_ft: formData.deckProjectionFt,
      deck_height_in: formData.deckHeightIn,
      joist_spacing_in: formData.joistSpacingIn,
      decking_brand: formData.deckingBrand || null,
      decking_collection: formData.deckingCollection || null,
      decking_color: formData.deckingColor || null,
      picture_frame_color: formData.pictureFrameColor || null,
      picture_frame_enabled: formData.pictureFrameEnabled,
      railing_required_override: formData.railingRequiredOverride,
      railing_material: formData.railingMaterial || null,
      railing_color: formData.railingColor || null,
      open_sides: formData.openSides,
      lattice_skirt: formData.latticeSkirt,
      horizontal_skirt: formData.horizontalSkirt,
      post_cap_lights: formData.postCapLights,
      stair_lights: formData.stairLights,
      accent_lights: formData.accentLights,
      total_area_sf: estimate.derived.deckAreaSf,
      total_bom_items: estimate.bom.length,
      assumptions: estimate.assumptions,
      warnings: estimate.warnings,
    })
    .eq("id", estimateId);

  if (updateError) return { success: false, error: updateError.message };

  // Replace line items
  await supabase.from("estimate_line_items").delete().eq("estimate_id", estimateId);
  if (estimate.bom.length > 0) {
    await supabase.from("estimate_line_items").insert(
      estimate.bom.map((item: BomItem, index: number) => ({
        estimate_id: estimateId,
        category: item.category,
        description: item.description,
        size: item.size || null,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes || null,
        sort_order: index,
        is_manual_override: false,
      }))
    );
  }

  // Replace stair sections
  await supabase.from("estimate_stair_sections").delete().eq("estimate_id", estimateId);
  if (formData.stairSections.length > 0) {
    await supabase.from("estimate_stair_sections").insert(
      formData.stairSections.map((stair, index) => ({
        estimate_id: estimateId,
        location: stair.location,
        width_ft: stair.widthFt,
        step_count: stair.stepCount,
        sort_order: index,
      }))
    );
  }

  revalidatePath(`/contractor/estimates/${estimateId}`);
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
    .select("id, bom_number, project_name, status, deck_type, deck_width_ft, deck_projection_ft, total_area_sf, total_bom_items, created_at, updated_at")
    .eq("organization_id", profile.default_organization_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return [];
  return estimates;
}
