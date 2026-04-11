"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { calculateEstimate } from "@/lib/calculations";
import { inngest } from "@/lib/inngest/client";
import type { EstimateInput, BomItem } from "@/lib/types";

interface SaveAnonymousEstimateInput {
  formData: EstimateInput;
  homeownerName?: string;
  homeownerEmail: string;
  homeownerPhone?: string;
  supplierSlug: string;
}

interface SaveAnonymousEstimateResult {
  success: boolean;
  shareToken?: string;
  error?: string;
}

export async function saveAnonymousEstimate(
  input: SaveAnonymousEstimateInput
): Promise<SaveAnonymousEstimateResult> {
  const { formData, homeownerName, homeownerEmail, homeownerPhone, supplierSlug } = input;
  const supabase = createServiceClient();

  // Look up supplier org by slug
  const { data: supplierOrg } = await supabase
    .from("organizations")
    .select("id, name, logo_url, primary_color")
    .eq("slug", supplierSlug)
    .eq("type", "supplier")
    .is("deleted_at", null)
    .single();

  if (!supplierOrg) {
    return { success: false, error: "Supplier not found" };
  }

  // Run BOM engine server-side
  const estimate = calculateEstimate(formData);

  // Generate share token
  const shareToken = crypto.randomUUID().replace(/-/g, "");

  // Insert estimate — created_by is NULL (anonymous)
  const { data: savedEstimate, error: estimateError } = await supabase
    .from("estimates")
    .insert({
      organization_id: supplierOrg.id,
      created_by: null,
      status: "completed" as const,

      // Job info
      project_name: formData.projectName || "Deck Estimate",
      project_address: formData.projectAddress || null,
      delivery_address: formData.deliveryAddress || null,
      requested_delivery_date: formData.requestedDeliveryDate || null,
      contractor_name: formData.contractorName || null,
      email: homeownerEmail,
      phone: homeownerPhone || null,

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

      // Computed
      total_area_sf: estimate.derived.deckAreaSf,
      total_bom_items: estimate.bom.length,

      // Sharing
      share_token: shareToken,

      // Source — embed_<org_id>
      source: `embed_${supplierOrg.id}`,

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

    await supabase.from("estimate_line_items").insert(lineItems);
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

    await supabase.from("estimate_stair_sections").insert(stairSections);
  }

  // Insert supplier lead
  await supabase.from("supplier_leads").insert({
    supplier_org_id: supplierOrg.id,
    homeowner_name: homeownerName || null,
    homeowner_email: homeownerEmail,
    homeowner_phone: homeownerPhone || null,
    project_address: formData.projectAddress || null,
    estimate_id: estimateId,
    status: "new",
  });

  // Fire Inngest event for BOM email + lead notification
  await inngest.send({
    name: "embed/bom-created",
    data: {
      estimateId,
      shareToken,
      homeownerEmail,
      homeownerName: homeownerName || null,
      homeownerPhone: homeownerPhone || null,
      supplierOrgId: supplierOrg.id,
      supplierName: supplierOrg.name,
      supplierLogoUrl: supplierOrg.logo_url,
      supplierPrimaryColor: supplierOrg.primary_color,
      deckSpecs: {
        type: formData.deckType,
        widthFt: formData.deckWidthFt,
        projectionFt: formData.deckProjectionFt,
        areaSf: estimate.derived.deckAreaSf,
        bomItems: estimate.bom.length,
        brand: formData.deckingBrand || null,
        color: formData.deckingColor || null,
      },
      projectAddress: formData.projectAddress || null,
    },
  });

  return { success: true, shareToken };
}
