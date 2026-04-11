"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { inngest } from "@/lib/inngest/client";
import { createNotification } from "@/lib/actions/notifications";
import { logActivity } from "@/lib/actions/activity";
import { requirePaidPlan } from "@/lib/subscription";

interface OrderLineItemInput {
  category: string;
  description: string;
  size: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  notes: string | null;
  sort_order: number;
}

interface CreateOrderInput {
  quote_id: string;
  supplier_org_id?: string;
  title: string;
  notes?: string;
  shipping_address?: string;
  requested_delivery_date?: string;
  tax_rate?: number;
  shipping_amount?: number;
  line_items: OrderLineItemInput[];
}

interface OrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export async function createOrderFromQuote(
  quoteId: string
): Promise<OrderResult> {
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

  // Fetch the approved quote with line items
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select(`
      *,
      quote_line_items (*),
      estimates (project_name, project_address)
    `)
    .eq("id", quoteId)
    .eq("status", "approved")
    .is("deleted_at", null)
    .single();

  if (quoteError || !quote) {
    return { success: false, error: "Approved quote not found" };
  }

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      organization_id: profile.default_organization_id,
      quote_id: quoteId,
      created_by: user.id,
      status: "draft",
      title: quote.title,
      shipping_address: quote.estimates?.project_address ?? null,
      tax_rate: Number(quote.tax_rate),
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return { success: false, error: orderError?.message ?? "Failed to create order" };
  }

  // Copy visible line items from quote to order
  const visibleItems = (quote.quote_line_items ?? []).filter(
    (i: any) => i.visible_to_customer
  );

  if (visibleItems.length > 0) {
    const lineItems = visibleItems.map((item: any, idx: number) => ({
      order_id: order.id,
      category: item.category,
      description: item.description,
      size: item.size,
      quantity: Number(item.quantity),
      unit: item.unit,
      unit_price: Number(item.unit_price),
      notes: item.notes,
      sort_order: item.sort_order ?? idx,
    }));

    await supabase.from("order_line_items").insert(lineItems);
  }

  revalidatePath("/contractor/orders");
  revalidatePath("/contractor");

  return { success: true, orderId: order.id };
}

export async function createOrder(input: CreateOrderInput): Promise<OrderResult> {
  try {
    await requirePaidPlan("Creating orders requires a paid plan.");
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

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      organization_id: profile.default_organization_id,
      supplier_org_id: input.supplier_org_id ?? null,
      quote_id: input.quote_id,
      created_by: user.id,
      status: "draft",
      title: input.title,
      notes: input.notes ?? null,
      shipping_address: input.shipping_address ?? null,
      requested_delivery_date: input.requested_delivery_date ?? null,
      tax_rate: input.tax_rate ?? 0,
      shipping_amount: input.shipping_amount ?? 0,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { success: false, error: orderError?.message ?? "Failed to create order" };
  }

  if (input.line_items.length > 0) {
    const lineItems = input.line_items.map((item) => ({
      order_id: order.id,
      ...item,
    }));
    await supabase.from("order_line_items").insert(lineItems);
  }

  revalidatePath("/contractor/orders");
  return { success: true, orderId: order.id };
}

export async function submitOrder(orderId: string): Promise<OrderResult> {
  try {
    await requirePaidPlan("Submitting orders requires a paid plan.");
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Paid plan required" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("orders")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };

  // Fire event for supplier notification
  const { data: order } = await supabase
    .from("orders")
    .select("order_number, title, total, supplier_org_id, organization_id")
    .eq("id", orderId)
    .single();

  if (order?.supplier_org_id) {
    await inngest.send({
      name: "order/submitted",
      data: {
        orderId,
        orderNumber: order.order_number,
        title: order.title,
        total: Number(order.total),
        supplierOrgId: order.supplier_org_id,
      },
    });
  }

  // In-app notification for supplier
  if (order?.supplier_org_id) {
    await createNotification({
      organizationId: order.supplier_org_id,
      type: "order_submitted",
      title: `New order ${order.order_number}`,
      body: order.title,
      href: `/supplier/orders/${orderId}`,
      entityType: "order",
      entityId: orderId,
    });
  }

  revalidatePath("/contractor/orders");
  revalidatePath("/supplier/orders");

  await logActivity({
    orgId: order?.organization_id,
    userId: user.id,
    entityType: "order",
    entityId: orderId,
    action: "submitted",
    details: {
      orderNumber: order?.order_number,
      supplierOrgId: order?.supplier_org_id,
    },
  });

  return { success: true, orderId };
}

export async function confirmOrder(orderId: string): Promise<OrderResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("orders")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };

  // Notify contractor
  const { data: order } = await supabase
    .from("orders")
    .select("order_number, title, organization_id")
    .eq("id", orderId)
    .single();

  if (order) {
    await createNotification({
      organizationId: order.organization_id,
      type: "order_confirmed",
      title: `Order ${order.order_number} confirmed`,
      body: order.title,
      href: `/contractor/orders/${orderId}`,
      entityType: "order",
      entityId: orderId,
    });
  }

  revalidatePath("/supplier/orders");
  revalidatePath("/contractor/orders");

  if (order) {
    await logActivity({
      orgId: order.organization_id,
      userId: user.id,
      entityType: "order",
      entityId: orderId,
      action: "confirmed",
      details: { orderNumber: order.order_number },
    });
  }

  return { success: true, orderId };
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<OrderResult> {
  const supabase = await createClient();

  const updateData: Record<string, any> = { status };
  const now = new Date().toISOString();

  switch (status) {
    case "shipped":
      updateData.shipped_at = now;
      break;
    case "delivered":
      updateData.delivered_at = now;
      break;
    case "cancelled":
      updateData.cancelled_at = now;
      break;
  }

  const { error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/supplier/orders");
  revalidatePath("/contractor/orders");
  return { success: true, orderId };
}

export async function getOrder(orderId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_line_items (*),
      quotes (id, quote_number, title),
      deliveries (*)
    `)
    .eq("id", orderId)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

export async function listOrders(role: "contractor" | "supplier" = "contractor") {
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

  const orgId = profile.default_organization_id;
  const column = role === "supplier" ? "supplier_org_id" : "organization_id";

  let query = supabase
    .from("orders")
    .select(`
      id, order_number, title, status, total,
      shipping_address, requested_delivery_date,
      submitted_at, confirmed_at, shipped_at, delivered_at, created_at,
      quotes (id, quote_number)
    `)
    .eq(column, orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  // Suppliers shouldn't see draft orders
  if (role === "supplier") {
    query = query.neq("status", "draft");
  }

  const { data, error } = await query;
  if (error) return [];
  return data;
}
