"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";

// Activity log uses service role — it's an immutable audit trail.
// Regular users can read (via RLS), only service role inserts.

function getAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface LogActivityInput {
  orgId: string;
  userId: string;
  entityType: string; // "estimate" | "quote" | "order" | "invoice" | "delivery"
  entityId: string;
  action: string; // "created" | "sent" | "submitted" | "confirmed" | "updated" etc.
  details?: Record<string, unknown>;
}

/**
 * Insert an immutable activity log entry.
 * Runs with service role — bypasses RLS.
 * Fire-and-forget: errors are logged but never thrown.
 */
export async function logActivity(input: LogActivityInput) {
  try {
    const supabase = getAdminClient();
    await supabase.from("activity_log").insert({
      organization_id: input.orgId,
      user_id: input.userId,
      entity_type: input.entityType,
      entity_id: input.entityId,
      action: input.action,
      details: input.details ?? null,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}
