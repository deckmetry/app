"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function getSupplierOrgId() {
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
  return profile?.default_organization_id ?? null;
}

// ── Groups ────────────────────────────────────────────────────────────────────

export async function listCatalogGroups() {
  const supabase = await createClient();
  const orgId = await getSupplierOrgId();
  if (!orgId) return [];
  const { data } = await supabase
    .from("supplier_catalog_groups")
    .select("*")
    .eq("supplier_org_id", orgId)
    .eq("active", true)
    .order("sort_order")
    .order("name");
  return data ?? [];
}

export async function createCatalogGroup(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getSupplierOrgId();
  if (!orgId) return { success: false, error: "Not authenticated" };

  const name = formData.get("name")?.toString().trim();
  if (!name) return { success: false, error: "Group name is required" };

  const { error } = await supabase.from("supplier_catalog_groups").insert({
    supplier_org_id: orgId,
    name,
    description: formData.get("description")?.toString() ?? null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/supplier/catalog");
  return { success: true };
}

// ── Items ─────────────────────────────────────────────────────────────────────

const ItemSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  description: z.string().min(1, "Description is required"),
  group_id: z.string().optional(),
  brand: z.string().optional(),
  collection: z.string().optional(),
  color: z.string().optional(),
  unit: z.string().min(1),
  base_price: z.coerce.number().min(0),
  stock_status: z.enum(["in_stock", "low_stock", "out_of_stock", "special_order"]),
  special_order: z.coerce.boolean().default(false),
  taxable: z.coerce.boolean().default(true),
  notes: z.string().optional(),
});

export async function listCatalogItems(groupId?: string) {
  const supabase = await createClient();
  const orgId = await getSupplierOrgId();
  if (!orgId) return [];

  let query = supabase
    .from("supplier_catalog_items")
    .select("*, supplier_catalog_groups(name)")
    .eq("supplier_org_id", orgId)
    .eq("active", true)
    .order("sku");

  if (groupId) query = query.eq("group_id", groupId);

  const { data } = await query;
  return data ?? [];
}

export async function createCatalogItem(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getSupplierOrgId();
  if (!orgId) return { success: false, error: "Not authenticated" };

  const raw = Object.fromEntries(formData);
  const parsed = ItemSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { group_id, ...rest } = parsed.data;

  const { error } = await supabase.from("supplier_catalog_items").insert({
    supplier_org_id: orgId,
    group_id: group_id || null,
    ...rest,
    brand: rest.brand || null,
    collection: rest.collection || null,
    color: rest.color || null,
    notes: rest.notes || null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/supplier/catalog");
  return { success: true };
}

export async function updateCatalogItem(id: string, formData: FormData) {
  const supabase = await createClient();
  const orgId = await getSupplierOrgId();
  if (!orgId) return { success: false, error: "Not authenticated" };

  const raw = Object.fromEntries(formData);
  const parsed = ItemSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { group_id, ...rest } = parsed.data;

  const { error } = await supabase
    .from("supplier_catalog_items")
    .update({
      group_id: group_id || null,
      ...rest,
      brand: rest.brand || null,
      collection: rest.collection || null,
      color: rest.color || null,
      notes: rest.notes || null,
    })
    .eq("id", id)
    .eq("supplier_org_id", orgId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/supplier/catalog");
  return { success: true };
}

export async function deactivateCatalogItem(id: string) {
  const supabase = await createClient();
  const orgId = await getSupplierOrgId();
  if (!orgId) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("supplier_catalog_items")
    .update({ active: false })
    .eq("id", id)
    .eq("supplier_org_id", orgId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/supplier/catalog");
  return { success: true };
}
