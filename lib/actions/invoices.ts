"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface InvoiceResult {
  success: boolean;
  invoiceId?: string;
  error?: string;
}

export async function createInvoiceFromOrder(
  orderId: string
): Promise<InvoiceResult> {
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

  // Fetch the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, order_line_items (*)")
    .eq("id", orderId)
    .in("status", ["confirmed", "processing", "shipped", "delivered"])
    .is("deleted_at", null)
    .single();

  if (orderError || !order) {
    return { success: false, error: "Confirmed order not found" };
  }

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      organization_id: profile.default_organization_id,
      contractor_org_id: order.organization_id,
      order_id: orderId,
      created_by: user.id,
      status: "draft",
      title: `Invoice for ${order.title}`,
      subtotal: Number(order.subtotal),
      tax_rate: Number(order.tax_rate),
      tax_amount: Number(order.tax_amount),
      total: Number(order.total),
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    })
    .select("id, invoice_number")
    .single();

  if (invoiceError || !invoice) {
    return {
      success: false,
      error: invoiceError?.message ?? "Failed to create invoice",
    };
  }

  revalidatePath("/supplier/invoices");
  return { success: true, invoiceId: invoice.id };
}

export async function sendInvoice(invoiceId: string): Promise<InvoiceResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("invoices")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/supplier/invoices");
  return { success: true, invoiceId };
}

export async function markInvoicePaid(
  invoiceId: string
): Promise<InvoiceResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("invoices")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/supplier/invoices");
  return { success: true, invoiceId };
}

export async function voidInvoice(invoiceId: string): Promise<InvoiceResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("invoices")
    .update({ status: "void", voided_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/supplier/invoices");
  return { success: true, invoiceId };
}

export async function getInvoice(invoiceId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      orders (
        id, order_number, title, shipping_address,
        order_line_items (*)
      )
    `)
    .eq("id", invoiceId)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

export async function listInvoices(
  role: "supplier" | "contractor" = "supplier"
) {
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

  const column =
    role === "supplier" ? "organization_id" : "contractor_org_id";

  const { data, error } = await supabase
    .from("invoices")
    .select(`
      id, invoice_number, title, status, total, due_date,
      sent_at, paid_at, created_at,
      orders (id, order_number)
    `)
    .eq(column, profile.default_organization_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}
