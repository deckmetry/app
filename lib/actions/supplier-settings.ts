"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSupplierEmbedConfig() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_organization_id) return null;

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, logo_url, primary_color, embed_config")
    .eq("id", profile.default_organization_id)
    .single();

  return org;
}

interface UpdateEmbedInput {
  slug?: string;
  logoUrl?: string;
  primaryColor?: string;
  showHeader?: boolean;
}

export async function updateSupplierEmbed(
  input: UpdateEmbedInput
): Promise<{ success: boolean; error?: string }> {
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

  // Build update payload
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.slug !== undefined) {
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(input.slug)) {
      return {
        success: false,
        error: "Slug must contain only lowercase letters, numbers, and hyphens",
      };
    }
    if (input.slug.length < 3 || input.slug.length > 50) {
      return {
        success: false,
        error: "Slug must be between 3 and 50 characters",
      };
    }

    // Check uniqueness
    const { data: existing } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", input.slug)
      .neq("id", orgId)
      .single();

    if (existing) {
      return { success: false, error: "This slug is already taken" };
    }

    update.slug = input.slug;
  }

  if (input.logoUrl !== undefined) {
    update.logo_url = input.logoUrl;
  }

  if (input.primaryColor !== undefined) {
    update.primary_color = input.primaryColor;
  }

  if (input.showHeader !== undefined) {
    // Fetch current embed_config and merge
    const { data: org } = await supabase
      .from("organizations")
      .select("embed_config")
      .eq("id", orgId)
      .single();

    const currentConfig = (org?.embed_config as Record<string, unknown>) ?? {};
    update.embed_config = { ...currentConfig, show_header: input.showHeader };
  }

  const { error } = await supabase
    .from("organizations")
    .update(update)
    .eq("id", orgId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/supplier/settings");
  return { success: true };
}
