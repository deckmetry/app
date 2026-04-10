"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface DeliveryResult {
  success: boolean;
  deliveryId?: string;
  error?: string;
}

interface CreateDeliveryInput {
  order_id: string;
  carrier?: string;
  tracking_number?: string;
  tracking_url?: string;
  estimated_date?: string;
  notes?: string;
}

export async function createDelivery(
  input: CreateDeliveryInput
): Promise<DeliveryResult> {
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

  const { data: delivery, error } = await supabase
    .from("deliveries")
    .insert({
      order_id: input.order_id,
      organization_id: profile.default_organization_id,
      status: "pending",
      carrier: input.carrier ?? null,
      tracking_number: input.tracking_number ?? null,
      tracking_url: input.tracking_url ?? null,
      estimated_date: input.estimated_date ?? null,
      notes: input.notes ?? null,
    })
    .select("id")
    .single();

  if (error || !delivery) {
    return { success: false, error: error?.message ?? "Failed to create delivery" };
  }

  revalidatePath("/supplier/deliveries");
  return { success: true, deliveryId: delivery.id };
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: string,
  extra?: { tracking_number?: string; tracking_url?: string; pod_signer_name?: string }
): Promise<DeliveryResult> {
  const supabase = await createClient();

  const updateData: Record<string, any> = { status, ...extra };
  const now = new Date().toISOString();

  switch (status) {
    case "in_transit":
      updateData.shipped_at = now;
      break;
    case "delivered":
      updateData.delivered_at = now;
      updateData.actual_date = new Date().toISOString().split("T")[0];
      break;
  }

  const { error } = await supabase
    .from("deliveries")
    .update(updateData)
    .eq("id", deliveryId);

  if (error) return { success: false, error: error.message };

  // If delivered, also update the parent order
  if (status === "delivered") {
    const { data: delivery } = await supabase
      .from("deliveries")
      .select("order_id")
      .eq("id", deliveryId)
      .single();

    if (delivery?.order_id) {
      await supabase
        .from("orders")
        .update({ status: "delivered", delivered_at: now })
        .eq("id", delivery.order_id);
    }
  }

  revalidatePath("/supplier/deliveries");
  revalidatePath("/supplier/orders");
  revalidatePath("/contractor/orders");
  return { success: true, deliveryId };
}

export async function listDeliveries() {
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
    .from("deliveries")
    .select(`
      id, status, carrier, tracking_number, tracking_url,
      estimated_date, actual_date, shipped_at, delivered_at, created_at,
      orders (id, order_number, title, shipping_address)
    `)
    .eq("organization_id", profile.default_organization_id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}
