"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitOrder, updateOrderStatus } from "@/lib/actions/orders";
import { Loader2, Send, XCircle } from "lucide-react";

interface Props {
  orderId: string;
  status: string;
}

export function ContractorOrderActions({ orderId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  if (status !== "draft") return null;

  const handleSubmit = async () => {
    setLoading("submit");
    const result = await submitOrder(orderId);
    setLoading(null);
    if (result.success) router.refresh();
  };

  const handleCancel = async () => {
    setLoading("cancel");
    const result = await updateOrderStatus(orderId, "cancelled");
    setLoading(null);
    if (result.success) router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button onClick={handleSubmit} disabled={!!loading} className="gap-2">
          {loading === "submit" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Submit to Supplier
        </Button>
        <Button
          onClick={handleCancel}
          disabled={!!loading}
          variant="destructive"
          className="gap-2"
        >
          {loading === "cancel" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          Cancel Order
        </Button>
      </CardContent>
    </Card>
  );
}
