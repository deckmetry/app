"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ContractorSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  contact_name: z.string().optional(),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  discount_pct: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().optional(),
});

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

export async function listContractors() {
  const supabase = await createClient();
  const orgId = await getSupplierOrgId();
  if (!orgId) return [];

  const { data } = await supabase
    .from("org_customers")
    .select("*")
    .eq("owner_org_id", orgId)
    .eq("customer_role", "contractor")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getContractor(id: string) {
  const supabase = await createClient();
  const orgId = await getSupplierOrgId();
  if (!orgId) return null;

  const { data } = await supabase
    .from("org_customers")
    .select("*")
    .eq("id", id)
    .eq("owner_org_id", orgId)
    .eq("customer_role", "contractor")
    .single();

  return data;
}

export async function getContractorProjects(contractorOrgId: string) {
  const supabase = await createClient();
  const orgId = await getSupplierOrgId();
  if (!orgId) return [];

  const { data } = await supabase
    .from("projects")
    .select("id, name, project_number, status, created_at, updated_at")
    .eq("supplier_org_id", orgId)
    .eq("contractor_org_id", contractorOrgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function createContractor(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getSupplierOrgId();
  if (!orgId) return { success: false, error: "Not authenticated" };

  const parsed = ContractorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }
  const { company_name, contact_name, email, phone, address, discount_pct, notes } = parsed.data;

  const serviceClient = createServiceClient();
  const { data: org, error: orgErr } = await serviceClient
    .from("organizations")
    .insert({ name: company_name, type: "contractor" })
    .select("id")
    .single();

  if (orgErr || !org) {
    return { success: false, error: orgErr?.message ?? "Failed to create contractor" };
  }

  const { error: relErr } = await supabase.from("org_customers").insert({
    owner_org_id: orgId,
    customer_org_id: org.id,
    customer_role: "contractor",
    company_name,
    contact_name: contact_name ?? null,
    email,
    phone: phone ?? null,
    address: address ?? null,
    discount_pct,
    notes: notes ?? null,
    status: "active",
  });

  if (relErr) {
    return { success: false, error: relErr.message };
  }

  const { error: inviteErr } = await serviceClient.auth.admin.inviteUserByEmail(email, {
    data: {
      role: "contractor",
      org_id: org.id,
      full_name: contact_name ?? company_name,
    },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/contractor`,
  });

  if (inviteErr) {
    revalidatePath("/supplier/contractors");
    return { success: true, orgId: org.id, warning: `Contractor added but invite email failed: ${inviteErr.message}` };
  }

  revalidatePath("/supplier/contractors");
  return { success: true, orgId: org.id };
}

export async function updateContractor(id: string, formData: FormData) {
  const supabase = await createClient();
  const orgId = await getSupplierOrgId();
  if (!orgId) return { success: false, error: "Not authenticated" };

  const parsed = ContractorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }
  const { company_name, contact_name, email, phone, address, discount_pct, notes } = parsed.data;

  const { error } = await supabase
    .from("org_customers")
    .update({
      company_name,
      contact_name: contact_name ?? null,
      email,
      phone: phone ?? null,
      address: address ?? null,
      discount_pct,
      notes: notes ?? null,
    })
    .eq("id", id)
    .eq("owner_org_id", orgId)
    .eq("customer_role", "contractor");

  if (error) return { success: false, error: error.message };

  revalidatePath("/supplier/contractors");
  revalidatePath(`/supplier/contractors/${id}`);
  return { success: true };
}

export async function resendContractorInvite(id: string) {
  const supabase = await createClient();
  const orgId = await getSupplierOrgId();
  if (!orgId) return { success: false, error: "Not authenticated" };

  const { data: contractor } = await supabase
    .from("org_customers")
    .select("email, company_name, contact_name, customer_org_id")
    .eq("id", id)
    .eq("owner_org_id", orgId)
    .eq("customer_role", "contractor")
    .single();

  if (!contractor?.email) {
    return { success: false, error: "No email address on file for this contractor" };
  }

  const serviceClient = createServiceClient();
  const { error } = await serviceClient.auth.admin.inviteUserByEmail(contractor.email, {
    data: {
      role: "contractor",
      org_id: contractor.customer_org_id,
      full_name: contractor.contact_name ?? contractor.company_name,
    },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/contractor`,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function archiveContractor(id: string) {
  const supabase = await createClient();
  const orgId = await getSupplierOrgId();
  if (!orgId) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("org_customers")
    .update({ status: "archived" })
    .eq("id", id)
    .eq("owner_org_id", orgId)
    .eq("customer_role", "contractor");

  if (error) return { success: false, error: error.message };

  revalidatePath("/supplier/contractors");
  return { success: true };
}
