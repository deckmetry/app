"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRealtime } from "./use-realtime";

/**
 * Subscribe to Supabase Realtime changes on a table and call `router.refresh()`
 * to re-fetch server data whenever a row is inserted, updated, or deleted.
 *
 * Drop this into any client component that sits alongside server-fetched data.
 *
 * @param table  - The Postgres table name (e.g. "orders", "invoices")
 * @param filter - Optional Supabase realtime filter (e.g. "supplier_org_id=eq.abc123")
 */
export function useRealtimeRefresh(table: string, filter?: string) {
  const router = useRouter();

  const onEvent = useCallback(() => {
    router.refresh();
  }, [router]);

  useRealtime({ table, filter, onEvent });
}
