"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Auth Helper ─────────────────────────────────────────────

async function getUserOrgId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_organization_id)
    throw new Error("No organization found");

  return { supabase, user, orgId: profile.default_organization_id };
}

// ─── List Customers ──────────────────────────────────────────

export async function listCustomers() {
  const { supabase, orgId } = await getUserOrgId();

  const { data, error } = await supabase
    .from("org_customers")
    .select(
      `
      id,
      customer_org_id,
      customer_role,
      notes,
      status,
      created_at,
      updated_at,
      organizations:customer_org_id (
        id, name, type, email, phone, address, city, state, zip
      )
    `
    )
    .eq("owner_org_id", orgId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) return [];

  // Count shared projects for each customer via project_stakeholders
  const customerOrgIds = (data ?? []).map((c) => c.customer_org_id);

  let projectCounts: Record<string, number> = {};

  if (customerOrgIds.length > 0) {
    // Get all projects where the owner org is a stakeholder
    const { data: ownerStakes } = await supabase
      .from("project_stakeholders")
      .select("project_id")
      .eq("organization_id", orgId);

    const ownerProjectIds = (ownerStakes ?? []).map((s) => s.project_id);

    if (ownerProjectIds.length > 0) {
      // Get all stakeholders in those projects that match customer orgs
      const { data: customerStakes } = await supabase
        .from("project_stakeholders")
        .select("organization_id, project_id")
        .in("project_id", ownerProjectIds)
        .in("organization_id", customerOrgIds);

      for (const stake of customerStakes ?? []) {
        projectCounts[stake.organization_id] =
          (projectCounts[stake.organization_id] ?? 0) + 1;
      }
    }
  }

  return (data ?? []).map((c) => ({
    id: c.id,
    customerOrgId: c.customer_org_id,
    customerRole: c.customer_role,
    notes: c.notes,
    status: c.status,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    organization: (c.organizations as unknown) as {
      id: string;
      name: string;
      type: string;
      email: string | null;
      phone: string | null;
      address: string | null;
      city: string | null;
      state: string | null;
      zip: string | null;
    } | null,
    projectCount: projectCounts[c.customer_org_id] ?? 0,
  }));
}

// ─── Get Single Customer ─────────────────────────────────────

export async function getCustomer(customerId: string) {
  const { supabase, orgId } = await getUserOrgId();

  const { data: customer, error } = await supabase
    .from("org_customers")
    .select(
      `
      id,
      customer_org_id,
      customer_role,
      notes,
      status,
      created_at,
      updated_at,
      organizations:customer_org_id (
        id, name, type, email, phone, address, city, state, zip
      )
    `
    )
    .eq("id", customerId)
    .single();

  if (error || !customer) return null;

  // Fetch shared projects: projects where both owner and customer are stakeholders
  const { data: ownerStakes } = await supabase
    .from("project_stakeholders")
    .select("project_id")
    .eq("organization_id", orgId);

  const ownerProjectIds = (ownerStakes ?? []).map((s) => s.project_id);

  let sharedProjects: Array<{
    id: string;
    name: string;
    status: string;
    project_number: string;
    created_at: string;
  }> = [];

  if (ownerProjectIds.length > 0) {
    const { data: customerStakes } = await supabase
      .from("project_stakeholders")
      .select("project_id")
      .eq("organization_id", customer.customer_org_id)
      .in("project_id", ownerProjectIds);

    const sharedProjectIds = (customerStakes ?? []).map((s) => s.project_id);

    if (sharedProjectIds.length > 0) {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name, status, project_number, created_at")
        .in("id", sharedProjectIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      sharedProjects = projects ?? [];
    }
  }

  return {
    id: customer.id,
    customerOrgId: customer.customer_org_id,
    customerRole: customer.customer_role,
    notes: customer.notes,
    status: customer.status,
    createdAt: customer.created_at,
    updatedAt: customer.updated_at,
    organization: (customer.organizations as unknown) as {
      id: string;
      name: string;
      type: string;
      email: string | null;
      phone: string | null;
      address: string | null;
      city: string | null;
      state: string | null;
      zip: string | null;
    } | null,
    projects: sharedProjects,
  };
}

// ─── Search Customer by Email ────────────────────────────────

export async function searchCustomerByEmail(email: string) {
  const { orgId } = await getUserOrgId();

  if (!email || !email.trim()) {
    return { found: false, alreadyCustomer: false };
  }

  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();

  // Search organizations by exact email match
  const { data: org } = await service
    .from("organizations")
    .select("id, name, type, email")
    .eq("email", email.trim())
    .is("deleted_at", null)
    .single();

  if (!org) {
    return { found: false, alreadyCustomer: false };
  }

  // Check if already a customer of the calling org
  const { data: existing } = await service
    .from("org_customers")
    .select("id")
    .eq("owner_org_id", orgId)
    .eq("customer_org_id", org.id)
    .single();

  return {
    found: true,
    organization: {
      id: org.id,
      name: org.name,
      type: org.type,
      email: org.email,
    },
    alreadyCustomer: !!existing,
  };
}

// ─── Add Existing Customer ───────────────────────────────────

export async function addExistingCustomer(
  customerOrgId: string,
  notes?: string
) {
  const { supabase, orgId } = await getUserOrgId();

  // Get caller's org type to determine expected customer role
  const { data: callerOrg } = await supabase
    .from("organizations")
    .select("type")
    .eq("id", orgId)
    .single();

  // Get the target org's type (this is the customer role)
  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();

  const { data: targetOrg } = await service
    .from("organizations")
    .select("type")
    .eq("id", customerOrgId)
    .single();

  if (!targetOrg) {
    return { success: false, error: "Organization not found" };
  }

  const customerRole = targetOrg.type as string;

  // Upsert into org_customers
  const { data: relation, error } = await service
    .from("org_customers")
    .upsert(
      {
        owner_org_id: orgId,
        customer_org_id: customerOrgId,
        customer_role: customerRole,
        notes: notes || null,
        status: "active",
      },
      { onConflict: "owner_org_id,customer_org_id" }
    )
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true, customerRelationId: relation?.id };
}

// ─── Create and Add Customer ─────────────────────────────────

interface CreateAndAddCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export async function createAndAddCustomer(input: CreateAndAddCustomerInput) {
  const { supabase, user, orgId } = await getUserOrgId();

  if (!input.name.trim()) {
    return { success: false, error: "Customer name is required" };
  }

  // Get caller's org type to determine customer role
  const { data: callerOrg } = await supabase
    .from("organizations")
    .select("type")
    .eq("id", orgId)
    .single();

  const callerType = callerOrg?.type as string;

  // Determine customer role based on caller type
  let customerRole: string;
  if (callerType === "contractor") {
    customerRole = "homeowner";
  } else if (callerType === "supplier") {
    customerRole = "contractor";
  } else {
    customerRole = "contractor"; // fallback
  }

  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();

  // Check for duplicate by email if provided
  if (input.email?.trim()) {
    const { data: existing } = await service
      .from("organizations")
      .select("id, name")
      .eq("email", input.email.trim())
      .is("deleted_at", null)
      .single();

    if (existing) {
      // Org already exists — just add as customer
      const addResult = await addExistingCustomer(existing.id, input.notes);
      return {
        success: addResult.success,
        customerId: existing.id,
        customerRelationId: addResult.customerRelationId,
        alreadyExists: true,
        error: addResult.error,
      };
    }
  }

  // Create the new org
  const { data: newOrg, error: orgError } = await service
    .from("organizations")
    .insert({
      name: input.name.trim(),
      type: customerRole,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
    })
    .select("id, name")
    .single();

  if (orgError || !newOrg) {
    return {
      success: false,
      error: orgError?.message ?? "Failed to create customer organization",
    };
  }

  // Insert into org_customers
  const { data: relation, error: relError } = await service
    .from("org_customers")
    .insert({
      owner_org_id: orgId,
      customer_org_id: newOrg.id,
      customer_role: customerRole,
      notes: input.notes || null,
    })
    .select("id")
    .single();

  if (relError) {
    return { success: false, error: relError.message };
  }

  // Log activity
  const { logActivity } = await import("@/lib/actions/activity");
  await logActivity({
    orgId,
    userId: user.id,
    entityType: "organization",
    entityId: newOrg.id,
    action: "created",
    details: { customerName: newOrg.name, createdBy: orgId },
  });

  // Fire Inngest event for invitation email if email provided
  if (input.email?.trim()) {
    try {
      const { inngest } = await import("@/lib/inngest/client");

      // Get owner org name for the email
      const { data: ownerOrg } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", orgId)
        .single();

      await inngest.send({
        name: "customer/invited",
        data: {
          email: input.email.trim(),
          customerOrgId: newOrg.id,
          ownerOrgId: orgId,
          ownerOrgName: ownerOrg?.name ?? "Unknown",
        },
      });
    } catch (err) {
      // Non-blocking — invitation email can be retried
      console.error("Failed to send customer invitation event:", err);
    }
  }

  revalidatePath("/");
  return {
    success: true,
    customerId: newOrg.id,
    customerRelationId: relation?.id,
    alreadyExists: false,
  };
}

// ─── Update Customer ─────────────────────────────────────────

export async function updateCustomer(
  customerId: string,
  data: { notes?: string }
) {
  const { supabase } = await getUserOrgId();

  const { error } = await supabase
    .from("org_customers")
    .update({ notes: data.notes ?? null })
    .eq("id", customerId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  return { success: true };
}

// ─── Archive Customer ────────────────────────────────────────

export async function archiveCustomer(customerId: string) {
  const { supabase } = await getUserOrgId();

  const { error } = await supabase
    .from("org_customers")
    .update({ status: "archived" })
    .eq("id", customerId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  return { success: true };
}

// ─── Restore Customer ────────────────────────────────────────

export async function restoreCustomer(customerId: string) {
  const { supabase } = await getUserOrgId();

  const { error } = await supabase
    .from("org_customers")
    .update({ status: "active" })
    .eq("id", customerId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  return { success: true };
}

// ─── Auto-link Helper ────────────────────────────────────────

/**
 * Upserts an org_customers relationship using service client (bypasses RLS).
 * Called by createProject() when linking an org to auto-track the customer relationship.
 */
export async function ensureCustomerRelationship(
  ownerOrgId: string,
  customerOrgId: string,
  customerRole: string
) {
  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    const service = createServiceClient();

    await service
      .from("org_customers")
      .upsert(
        {
          owner_org_id: ownerOrgId,
          customer_org_id: customerOrgId,
          customer_role: customerRole,
          status: "active",
        },
        { onConflict: "owner_org_id,customer_org_id" }
      );
  } catch (err) {
    // Non-blocking — the relationship is a convenience, not a hard requirement
    console.error("Failed to ensure customer relationship:", err);
  }
}
