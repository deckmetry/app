"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { NotificationRow } from "@/lib/types/database";

/**
 * Subscribe to real-time notification inserts for the current user's org.
 * Returns new notifications as they arrive.
 */
export function useRealtimeNotifications(organizationId: string | null) {
  const [newNotifications, setNewNotifications] = useState<NotificationRow[]>(
    []
  );

  const clearNew = useCallback(() => {
    setNewNotifications([]);
  }, []);

  useEffect(() => {
    if (!organizationId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          setNewNotifications((prev) => [
            payload.new as NotificationRow,
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId]);

  return { newNotifications, clearNew };
}

/**
 * Subscribe to real-time changes on a specific table for an org.
 * Generic hook for orders, quotes, deliveries, etc.
 */
export function useRealtimeTable<T extends Record<string, any>>(
  table: string,
  filterColumn: string,
  filterValue: string | null,
  event: "INSERT" | "UPDATE" | "DELETE" | "*" = "*"
) {
  const [changes, setChanges] = useState<T[]>([]);

  useEffect(() => {
    if (!filterValue) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`${table}:${filterValue}`)
      .on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          filter: `${filterColumn}=eq.${filterValue}`,
        },
        (payload) => {
          setChanges((prev) => [payload.new as T, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filterColumn, filterValue, event]);

  return changes;
}
