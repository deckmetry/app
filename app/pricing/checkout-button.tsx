"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createCheckoutSession } from "@/lib/actions/stripe";

interface CheckoutButtonProps {
  priceId: string;
  planName: string;
}

export function CheckoutButton({ priceId, planName }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      await createCheckoutSession(priceId);
    } catch {
      // redirect throws on success (NEXT_REDIRECT), only real errors land here
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={loading} className="w-full">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting...
        </>
      ) : (
        `Subscribe to ${planName}`
      )}
    </Button>
  );
}
