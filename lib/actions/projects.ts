"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { inngest } from "@/lib/inngest/client";

// Project status order for forward-only progression
const STATUS_ORDER = [
  "bom_created",
  "estimate_requested",
  "estimate_received",
  "proposal_sent",
  "proposal_viewed",
  "agreement_signed",
  "po_submitted",
  "po_confirmed",
  "materials_shipped",
  "materials_delivered",
  "complete",
  "cancelled",
] as const;

type ProjectStatus = (typeof STATUS_ORDER)[number];

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

// ─── Create Project ──────────────────────────────────────────

interface CreateProjectInput {
  name: string;
  address?: string;
  description?: string;
  linkedOrgId?: string;
  linkedOrgRole?: "homeowner" | "contractor" | "supplier";
  inviteEmail?: string;
  // Inline customer creation — creates a homeowner org and links it
  newCustomer?: {
    name: string;
    email?: string;
    phone?: string;
  };
}

export async function createProject(input: CreateProjectInput) {
  const { supabase, user, orgId } = await getUserOrgId();

  // Get caller's org type
  const { data: org } = await supabase
    .from("organizations")
    .select("type")
    .eq("id", orgId)
    .single();

  const callerRole = (org?.type as "homeowner" | "contractor" | "supplier") ?? "homeowner";

  // Resolve linked org: existing org, inline customer creation, or none
  let linkedOrgId = input.linkedOrgId;
  let linkedOrgRole = input.linkedOrgRole;

  if (!linkedOrgId && input.newCustomer?.name) {
    // Inline customer creation
    const customerResult = await createCustomer(input.newCustomer);
    if (customerResult.success && customerResult.customerId) {
      linkedOrgId = customerResult.customerId;
      linkedOrgRole = "homeowner";
    }
  }

  // Build insert payload
  const insertData: Record<string, unknown> = {
    created_by_org_id: orgId,
    created_by: user.id,
    [`${callerRole}_org_id`]: orgId,
    name: input.name,
    address: input.address || null,
    description: input.description || null,
  };

  // If linking an org (existing or just-created), set the corresponding *_org_id
  if (linkedOrgId && linkedOrgRole) {
    insertData[`${linkedOrgRole}_org_id`] = linkedOrgId;
  }

  // Use service client to bypass RLS for project creation
  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();

  const { data: project, error } = await service
    .from("projects")
    .insert(insertData)
    .select("id")
    .single();

  if (error || !project) {
    console.error("[createProject] project insert failed:", error?.message);
    return { success: false, error: error?.message ?? "Failed to create project" };
  }

  // Add caller as stakeholder — critical: without this the project is invisible via RLS
  const { error: stakeError } = await service.from("project_stakeholders").insert({
    project_id: project.id,
    organization_id: orgId,
    role: callerRole,
  });

  if (stakeError) {
    console.error("[createProject] stakeholder insert failed:", stakeError.message);
    await service.from("projects").delete().eq("id", project.id);
    return { success: false, error: "Failed to set up project access. Please try again." };
  }

  // Add linked org as stakeholder (non-critical — project still works without this)
  if (linkedOrgId && linkedOrgRole) {
    const { error: linkError } = await service.from("project_stakeholders").insert({
      project_id: project.id,
      organization_id: linkedOrgId,
      role: linkedOrgRole,
    });
    if (linkError) {
      console.error("[createProject] linked stakeholder insert failed:", linkError.message);
    }

    // Auto-track as customer relationship
    const { ensureCustomerRelationship } = await import("@/lib/actions/customers");
    await ensureCustomerRelationship(orgId, linkedOrgId, linkedOrgRole);
  }

  // If inviting by email (no linked org), create a project share
  if (input.inviteEmail && !linkedOrgId) {
    const { error: shareError } = await service.from("project_shares").insert({
      project_id: project.id,
      shared_by: user.id,
      shared_with_email: input.inviteEmail,
    });
    if (shareError) {
      console.error("[createProject] share insert failed:", shareError.message);
    }
  }

  revalidatePath("/");
  return { success: true, projectId: project.id };
}

// ─── Create Customer (homeowner org on behalf of contractor/supplier) ──

interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export async function createCustomer(input: CreateCustomerInput) {
  const { user, orgId } = await getUserOrgId();

  if (!input.name.trim()) {
    return { success: false, error: "Customer name is required" };
  }

  // Use service client to create org (caller can't insert into orgs they don't belong to)
  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();

  // Check for duplicate by email if provided
  if (input.email?.trim()) {
    const { data: existing } = await service
      .from("organizations")
      .select("id, name")
      .eq("email", input.email.trim())
      .eq("type", "homeowner")
      .is("deleted_at", null)
      .single();

    if (existing) {
      return {
        success: true,
        customerId: existing.id,
        customerName: existing.name,
        alreadyExists: true,
      };
    }
  }

  const { data: newOrg, error } = await service
    .from("organizations")
    .insert({
      name: input.name.trim(),
      type: "homeowner",
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
    })
    .select("id, name")
    .single();

  if (error || !newOrg) {
    return { success: false, error: error?.message ?? "Failed to create customer" };
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

  return {
    success: true,
    customerId: newOrg.id,
    customerName: newOrg.name,
    alreadyExists: false,
  };
}

// ─── Search Organizations (service client — bypasses RLS) ────

export async function searchOrganizations(
  query: string,
  type?: "homeowner" | "contractor" | "supplier"
) {
  const { orgId } = await getUserOrgId();

  if (!query || query.length < 2) return [];

  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();

  let q = service
    .from("organizations")
    .select("id, name, type, email")
    .is("deleted_at", null)
    .neq("id", orgId)
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10);

  if (type) {
    q = q.eq("type", type);
  }

  const { data } = await q;
  return data ?? [];
}

// ─── List Projects ───────────────────────────────────────────

export async function listProjects() {
  const { orgId } = await getUserOrgId();

  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();

  const { data: projects, error } = await service
    .from("projects")
    .select(
      `
      id, name, address, status, project_number,
      homeowner_org_id, contractor_org_id, supplier_org_id,
      created_at, updated_at,
      project_stakeholders (
        organization_id, role
      )
    `
    )
    .is("deleted_at", null)
    .or(`homeowner_org_id.eq.${orgId},contractor_org_id.eq.${orgId},supplier_org_id.eq.${orgId},created_by_org_id.eq.${orgId}`)
    .order("created_at", { ascending: false });

  if (error) return [];
  return projects;
}

export async function getProject(projectId: string) {
  await getUserOrgId(); // auth check only

  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();

  const { data: project, error } = await service
    .from("projects")
    .select(
      `
      *,
      project_stakeholders (
        id, organization_id, role, added_at,
        organizations:organization_id (id, name, type, logo_url)
      ),
      estimates (
        id, bom_number, project_name, status, deck_type, deck_width_ft, deck_projection_ft,
        total_area_sf, total_bom_items, decking_brand, decking_collection,
        decking_color, share_token, created_at
      ),
      quotes (
        id, quote_number, title, status, total, share_token,
        estimate_id, sent_at, viewed_at, approved_at, created_at
      ),
      orders (
        id, order_number, title, status, total,
        quote_id, supplier_estimate_id,
        submitted_at, confirmed_at, shipped_at, delivered_at, created_at
      ),
      supplier_estimates (
        id, estimate_number, title, status, total, share_token,
        sent_at, viewed_at, accepted_at, created_at,
        organizations:organization_id (id, name)
      ),
      approvals (
        id, signer_name, signer_email, approved_at, approved_total, created_at
      ),
      invoices (
        id, invoice_number, title, status, total,
        order_id, sent_at, paid_at, created_at
      ),
      deliveries (
        id, delivery_number, tracking_number, carrier, status,
        order_id, shipped_at, delivered_at, created_at
      )
    `
    )
    .eq("id", projectId)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return project;
}

export async function updateProject(
  projectId: string,
  data: { name?: string; address?: string; description?: string }
) {
  const { supabase } = await getUserOrgId();

  const { error } = await supabase
    .from("projects")
    .update(data)
    .eq("id", projectId);

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

export async function advanceProjectStatus(
  projectId: string,
  newStatus: ProjectStatus
) {
  const { supabase } = await getUserOrgId();

  // Get current status
  const { data: project } = await supabase
    .from("projects")
    .select("status")
    .eq("id", projectId)
    .single();

  if (!project) return;

  const currentIdx = STATUS_ORDER.indexOf(
    project.status as ProjectStatus
  );
  const newIdx = STATUS_ORDER.indexOf(newStatus);

  // Only allow forward progression (or cancel from any state)
  if (newStatus === "cancelled" || newIdx > currentIdx) {
    await supabase
      .from("projects")
      .update({ status: newStatus })
      .eq("id", projectId);
  }
}

export async function addStakeholder(
  projectId: string,
  orgId: string,
  role: "homeowner" | "contractor" | "supplier"
) {
  const { supabase } = await getUserOrgId();

  // Insert stakeholder
  const { error: stakeError } = await supabase
    .from("project_stakeholders")
    .upsert(
      { project_id: projectId, organization_id: orgId, role },
      { onConflict: "project_id,organization_id" }
    );

  if (stakeError) return { error: stakeError.message };

  // Also update the project's role-specific org_id
  const updateField = `${role}_org_id`;
  await supabase
    .from("projects")
    .update({ [updateField]: orgId })
    .eq("id", projectId);

  revalidatePath("/");
  return { success: true };
}

export async function shareProject(
  projectId: string,
  email: string,
  permission: "view" | "edit" = "view"
) {
  const { supabase, user } = await getUserOrgId();

  // Check for existing share
  const { data: existing } = await supabase
    .from("project_shares")
    .select("id")
    .eq("project_id", projectId)
    .eq("shared_with_email", email)
    .single();

  if (existing) {
    return { error: "This project is already shared with that email" };
  }

  const { data: share, error } = await supabase
    .from("project_shares")
    .insert({
      project_id: projectId,
      shared_by: user.id,
      shared_with_email: email,
      permission,
    })
    .select("id, token")
    .single();

  if (error) return { error: error.message };

  await inngest.send({
    name: "project/shared",
    data: {
      projectId,
      sharedByUserId: user.id,
      sharedWithEmail: email,
      token: share?.token,
    },
  });

  revalidatePath("/");
  return { success: true, token: share?.token };
}

export async function revokeProjectShare(shareId: string) {
  const { supabase } = await getUserOrgId();

  const { error } = await supabase
    .from("project_shares")
    .update({ status: "revoked" })
    .eq("id", shareId);

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

export async function listProjectShares(projectId: string) {
  const { supabase } = await getUserOrgId();

  const { data: shares } = await supabase
    .from("project_shares")
    .select("id, shared_with_email, permission, status, accepted_at, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return shares ?? [];
}

export async function acceptProjectShare(token: string) {
  const { supabase, user, orgId } = await getUserOrgId();

  const { data: share, error: fetchError } = await supabase
    .from("project_shares")
    .select("id, project_id, status")
    .eq("token", token)
    .single();

  if (fetchError || !share) return { error: "Invalid or expired share link" };
  if (share.status !== "pending") return { error: "This invitation has already been used" };

  // Use service client to update (sharer owns the row via RLS)
  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    const service = createServiceClient();

    await service
      .from("project_shares")
      .update({
        status: "accepted",
        shared_with_user_id: user.id,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", share.id);

    // Auto-link accepting user's org to the project as a stakeholder
    const { data: org } = await supabase
      .from("organizations")
      .select("type")
      .eq("id", orgId)
      .single();

    const accepterRole = (org?.type as "homeowner" | "contractor" | "supplier") ?? "homeowner";

    // Add as stakeholder (upsert to avoid duplicates)
    await service
      .from("project_stakeholders")
      .upsert(
        { project_id: share.project_id, organization_id: orgId, role: accepterRole },
        { onConflict: "project_id,organization_id" }
      );

    // Set the role-specific org_id on the project if not already set
    const orgIdField = `${accepterRole}_org_id`;
    const { data: project } = await service
      .from("projects")
      .select(orgIdField)
      .eq("id", share.project_id)
      .single();

    if (project && !(project as unknown as Record<string, unknown>)[orgIdField]) {
      await service
        .from("projects")
        .update({ [orgIdField]: orgId })
        .eq("id", share.project_id);
    }
  } catch {
    return { error: "Service unavailable" };
  }

  revalidatePath("/");
  return { success: true, projectId: share.project_id };
}
