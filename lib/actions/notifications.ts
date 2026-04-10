"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { NotificationType } from "@/lib/types/database";

interface CreateNotificationInput {
  organizationId: string;
  userId?: string;
  type: NotificationType;
  title: string;
  body?: string;
  href?: string;
  entityType?: string;
  entityId?: string;
}

/**
 * Create a notification for an org (or specific user within org).
 * Called from other server actions when events occur.
 */
export async function createNotification(input: CreateNotificationInput) {
  const supabase = await createClient();

  await supabase.from("notifications").insert({
    organization_id: input.organizationId,
    user_id: input.userId ?? null,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    href: input.href ?? null,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
  });
}

/**
 * List notifications for the current user's org.
 */
export async function listNotifications(limit = 20) {
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
    .from("notifications")
    .select("*")
    .eq("organization_id", profile.default_organization_id)
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .is("dismissed_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
}

/**
 * Count unread notifications for the current user.
 */
export async function countUnreadNotifications(): Promise<number> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_organization_id) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", profile.default_organization_id)
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .is("read_at", null)
    .is("dismissed_at", null);

  return count ?? 0;
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);

  revalidatePath("/");
}

/**
 * Mark all notifications as read for the current user.
 */
export async function markAllNotificationsRead() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_organization_id) return;

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("organization_id", profile.default_organization_id)
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .is("read_at", null);

  revalidatePath("/");
}

/**
 * Dismiss a notification (soft-hide).
 */
export async function dismissNotification(notificationId: string) {
  const supabase = await createClient();

  await supabase
    .from("notifications")
    .update({ dismissed_at: new Date().toISOString() })
    .eq("id", notificationId);

  revalidatePath("/");
}
