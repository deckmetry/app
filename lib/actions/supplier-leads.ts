"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function listSupplierLeads() {
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

  const { data: leads, error } = await supabase
    .from("supplier_leads")
    .select(
      `
      *,
      estimates (
        id, share_token, deck_type, deck_width_ft, deck_projection_ft,
        total_area_sf, total_bom_items, decking_brand, decking_color
      )
    `
    )
    .eq("supplier_org_id", profile.default_organization_id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return leads;
}

export async function updateLeadStatus(
  leadId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("supplier_leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", leadId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/supplier/leads");
  return { success: true };
}
