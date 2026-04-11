"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const VALID_ROLES = ["homeowner", "contractor", "supplier"] as const;
type DashboardRole = (typeof VALID_ROLES)[number];

export async function switchAdminView(role: DashboardRole) {
  if (!VALID_ROLES.includes(role)) {
    return { error: "Invalid role" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify master admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_master_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_master_admin) {
    return { error: "Not authorized" };
  }

  // Ensure an org exists for this role — create one if needed
  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();

  const { data: existingOrgs } = await service
    .from("organizations")
    .select("id, type")
    .in(
      "id",
      (
        await service
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
      ).data?.map((m) => m.organization_id) ?? []
    )
    .eq("type", role)
    .is("deleted_at", null);

  if (!existingOrgs || existingOrgs.length === 0) {
    // Create an org for this role
    const name =
      role === "homeowner"
        ? `${user.user_metadata?.full_name ?? "Admin"}'s Home`
        : role === "contractor"
          ? `${user.user_metadata?.full_name ?? "Admin"}'s Contracting`
          : `${user.user_metadata?.full_name ?? "Admin"}'s Supply`;

    const { data: newOrg } = await service
      .from("organizations")
      .insert({ name, type: role })
      .select("id")
      .single();

    if (newOrg) {
      await service.from("organization_members").insert({
        organization_id: newOrg.id,
        user_id: user.id,
        role: "owner",
      });
    }
  }

  const cookieStore = await cookies();
  cookieStore.set("deckmetry-admin-view", role, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  revalidatePath("/");
  return { success: true, role };
}

export async function clearAdminView() {
  const cookieStore = await cookies();
  cookieStore.delete("deckmetry-admin-view");
  revalidatePath("/");
  return { success: true };
}

export async function getMasterAdminStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isMasterAdmin: false, activeView: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_master_admin")
    .eq("id", user.id)
    .single();

  const cookieStore = await cookies();
  const activeView = cookieStore.get("deckmetry-admin-view")?.value ?? null;

  return {
    isMasterAdmin: profile?.is_master_admin ?? false,
    activeView,
  };
}
