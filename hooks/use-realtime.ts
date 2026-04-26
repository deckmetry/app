"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseRealtimeOptions {
  table: string;
  schema?: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  /** Called whenever a matching postgres_changes event fires. */
  onEvent: (payload: {
    eventType: "INSERT" | "UPDATE" | "DELETE";
    new: Record<string, unknown>;
    old: Record<string, unknown>;
    schema: string;
    table: string;
    commit_timestamp: string;
    errors: string[] | null;
  }) => void;
}

/**
 * Generic hook to subscribe to Supabase Realtime postgres_changes on a table.
 *
 * @example
 * useRealtime({
 *   table: "orders",
 *   event: "INSERT",
 *   filter: `supplier_org_id=eq.${orgId}`,
 *   onEvent: (payload) => console.log("New order:", payload.new),
 * });
 */
export function useRealtime({
  table,
  schema = "public",
  event = "*",
  filter,
  onEvent,
}: UseRealtimeOptions) {
  useEffect(() => {
    const supabase = createClient();

    const channelName = filter
      ? `realtime-${table}-${filter}`
      : `realtime-${table}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event, schema, table, filter },
        (payload) => onEvent(payload as Parameters<typeof onEvent>[0])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, schema, event, filter, onEvent]);
}
