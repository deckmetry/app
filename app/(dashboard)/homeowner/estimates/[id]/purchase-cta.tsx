"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ShoppingCart } from "lucide-react";
import { createHomeownerCheckoutSession, type HomeownerProduct } from "@/lib/actions/purchases";

const PRODUCTS: {
  type: HomeownerProduct;
  label: string;
  price: string;
  description: string;
}[] = [
  {
    type: "bom",
    label: "Full BOM",
    price: "$27",
    description: "Complete bill of materials with quantities and sizing",
  },
  {
    type: "permit_design",
    label: "Permit-Ready Design",
    price: "$197",
    description: "Professional drawings for your building permit",
  },
  {
    type: "3d_design",
    label: "3D Design",
    price: "$1,597",
    description: "Photorealistic 3D rendering of your deck",
  },
  {
    type: "pro_review",
    label: "Pro Review",
    price: "$97",
    description: "Professional engineer review of your plan",
  },
];

export function PurchaseCta({ estimateId }: { estimateId: string }) {
  const [isPending, startTransition] = useTransition();

  const handlePurchase = (productType: HomeownerProduct) => {
    startTransition(async () => {
      await createHomeownerCheckoutSession(productType, estimateId);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart className="h-5 w-5" />
          Unlock Your Full Estimate
        </CardTitle>
        <CardDescription>
          Purchase access to your complete BOM, professional designs, or expert review.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {PRODUCTS.map((product) => (
            <div
              key={product.type}
              className="flex flex-col justify-between rounded-lg border p-4"
            >
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{product.label}</span>
                  <span className="text-sm font-bold text-primary">
                    {product.price}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {product.description}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handlePurchase(product.type)}
                disabled={isPending}
                className="w-full"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : null}
                Purchase
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
