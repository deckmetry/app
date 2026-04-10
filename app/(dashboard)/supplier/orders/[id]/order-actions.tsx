"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { confirmOrder, updateOrderStatus } from "@/lib/actions/orders";
import {
  CheckCircle2,
  Loader2,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

interface OrderActionsProps {
  orderId: string;
  status: string;
}

export function OrderActions({ orderId, status }: OrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    setLoading(action);
    let result;

    if (action === "confirm") {
      result = await confirmOrder(orderId);
    } else {
      result = await updateOrderStatus(orderId, action);
    }

    setLoading(null);
    if (result.success) {
      router.refresh();
    }
  };

  if (status === "delivered" || status === "cancelled") return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {status === "submitted" && (
          <Button
            onClick={() => handleAction("confirm")}
            disabled={!!loading}
            className="gap-2"
          >
            {loading === "confirm" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Confirm Order
          </Button>
        )}

        {(status === "confirmed" || status === "processing") && (
          <>
            {status === "confirmed" && (
              <Button
                onClick={() => handleAction("processing")}
                disabled={!!loading}
                variant="outline"
                className="gap-2"
              >
                {loading === "processing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
                Mark Processing
              </Button>
            )}
            <Button
              onClick={() => handleAction("shipped")}
              disabled={!!loading}
              className="gap-2"
            >
              {loading === "shipped" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Truck className="h-4 w-4" />
              )}
              Mark Shipped
            </Button>
          </>
        )}

        {status === "shipped" && (
          <Button
            onClick={() => handleAction("delivered")}
            disabled={!!loading}
            className="gap-2"
          >
            {loading === "delivered" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Mark Delivered
          </Button>
        )}

        {status !== "cancelled" &&
          status !== "delivered" &&
          status !== "shipped" && (
            <Button
              onClick={() => handleAction("cancelled")}
              disabled={!!loading}
              variant="destructive"
              className="gap-2"
            >
              {loading === "cancelled" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Cancel Order
            </Button>
          )}
      </CardContent>
    </Card>
  );
}
