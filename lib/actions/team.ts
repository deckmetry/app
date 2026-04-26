"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { inngest } from "@/lib/inngest/client";

type OrgRole = "owner" | "admin" | "member" | "viewer";

async function getOrgAndVerifyAdmin() {
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

  const orgId = profile.default_organization_id;

  // Verify user is owner or admin
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    throw new Error("Not authorized — owner or admin role required");
  }

  return { supabase, user, orgId, userRole: membership.role as OrgRole };
}

export async function listTeamMembers() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { members: [], currentUserId: "" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_organization_id)
    return { members: [], currentUserId: user.id };

  const { data: members } = await supabase
    .from("organization_members")
    .select(
      `
      id,
      user_id,
      role,
      created_at,
      profiles!inner(full_name, avatar_url)
    `
    )
    .eq("organization_id", profile.default_organization_id)
    .order("created_at", { ascending: true });

  // Get emails via auth - need service client for this
  let memberEmails: Record<string, string> = {};
  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    const service = createServiceClient();
    for (const member of members ?? []) {
      const { data } = await service.auth.admin.getUserById(member.user_id);
      if (data?.user?.email) {
        memberEmails[member.user_id] = data.user.email;
      }
    }
  } catch {
    // Service client may not be available
  }

  return {
    members: (members ?? []).map((m) => ({
      id: m.id,
      userId: m.user_id,
      role: m.role as OrgRole,
      createdAt: m.created_at,
      fullName: (m.profiles as any)?.full_name ?? null,
      avatarUrl: (m.profiles as any)?.avatar_url ?? null,
      email: memberEmails[m.user_id] ?? null,
    })),
    currentUserId: user.id,
  };
}

export async function updateMemberRole(membershipId: string, newRole: OrgRole) {
  const { supabase, orgId, userRole } = await getOrgAndVerifyAdmin();

  // Only owners can promote to admin/owner
  if (
    (newRole === "owner" || newRole === "admin") &&
    userRole !== "owner"
  ) {
    return { error: "Only owners can promote to admin or owner" };
  }

  const { error } = await supabase
    .from("organization_members")
    .update({ role: newRole })
    .eq("id", membershipId)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

export async function removeMember(membershipId: string) {
  const { supabase, user, orgId } = await getOrgAndVerifyAdmin();

  // Can't remove yourself
  const { data: targetMember } = await supabase
    .from("organization_members")
    .select("user_id, role")
    .eq("id", membershipId)
    .eq("organization_id", orgId)
    .single();

  if (!targetMember) return { error: "Member not found" };
  if (targetMember.user_id === user.id) return { error: "Cannot remove yourself" };
  if (targetMember.role === "owner") return { error: "Cannot remove the owner" };

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("id", membershipId)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

export async function inviteMember(email: string, role: OrgRole = "member") {
  const { supabase, user, orgId, userRole } = await getOrgAndVerifyAdmin();

  if ((role === "owner" || role === "admin") && userRole !== "owner") {
    return { error: "Only owners can invite as admin or owner" };
  }

  // Check if already a member
  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    const service = createServiceClient();

    const { data: existingUsers } = await service.auth.admin.listUsers();
    const targetUser = existingUsers?.users?.find((u) => u.email === email);

    if (targetUser) {
      const { data: existingMember } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", orgId)
        .eq("user_id", targetUser.id)
        .single();

      if (existingMember) {
        return { error: "This user is already a member of your organization" };
      }
    }
  } catch {
    // Service client not available, skip check
  }

  // Check for existing pending invitation
  const { data: existingInvite } = await supabase
    .from("invitations")
    .select("id")
    .eq("organization_id", orgId)
    .eq("email", email)
    .eq("status", "pending")
    .single();

  if (existingInvite) {
    return { error: "An invitation is already pending for this email" };
  }

  const { data: invitation, error } = await supabase
    .from("invitations")
    .insert({
      organization_id: orgId,
      invited_by: user.id,
      email,
      role,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Fire Inngest event for invitation email
  await inngest.send({
    name: "team/invitation-sent",
    data: {
      invitationId: invitation?.id,
      email,
      orgId,
      role,
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function listInvitations() {
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

  const { data: invitations } = await supabase
    .from("invitations")
    .select("id, email, role, status, created_at, expires_at")
    .eq("organization_id", profile.default_organization_id)
    .order("created_at", { ascending: false });

  return invitations ?? [];
}

export async function revokeInvitation(invitationId: string) {
  const { supabase, orgId } = await getOrgAndVerifyAdmin();

  const { error } = await supabase
    .from("invitations")
    .update({ status: "revoked" })
    .eq("id", invitationId)
    .eq("organization_id", orgId)
    .eq("status", "pending");

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

export async function getOrgInfo() {
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
    .select("id, name, type, seat_count")
    .eq("id", profile.default_organization_id)
    .single();

  return org;
}
