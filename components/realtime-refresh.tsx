"use client";

import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

/**
 * Invisible client component that subscribes to Supabase Realtime changes
 * on the given table and triggers a Next.js server-data refresh.
 *
 * Use inside server components to add live updates without converting the
 * whole page to a client component:
 *
 * @example
 * // In a server component page.tsx:
 * import { RealtimeRefresh } from "@/components/realtime-refresh";
 *
 * export default async function OrdersPage() {
 *   const orders = await fetchOrders();
 *   return (
 *     <>
 *       <RealtimeRefresh table="orders" />
 *       <OrderList orders={orders} />
 *     </>
 *   );
 * }
 */
export function RealtimeRefresh({
  table,
  filter,
}: {
  table: string;
  filter?: string;
}) {
  useRealtimeRefresh(table, filter);
  return null;
}
