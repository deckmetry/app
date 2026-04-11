import { Check, Home, Hammer, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "./checkout-button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Deckmetry",
  description:
    "Simple, transparent pricing for homeowners, contractors, and suppliers.",
};

// ---- Homeowner products (pay-per-use) ----

const homeownerProducts = [
  {
    name: "BOM Generation",
    price: "$27",
    description: "Complete bill of materials with quantities, sizes, and specs",
  },
  {
    name: "Permit-Ready Design",
    price: "$197",
    description:
      "Professional drawings ready for your local building department",
  },
  {
    name: "3D Design",
    price: "$1,597",
    description:
      "Photorealistic 3D rendering of your deck from multiple angles",
  },
  {
    name: "Pro Review",
    price: "$97",
    description:
      "Professional engineer review of your deck plan and materials",
  },
];

// ---- Contractor plans ----

interface PlanFeature {
  text: string;
}

interface ContractorPlan {
  name: string;
  description: string;
  priceLabel: string;
  priceSubtext?: string;
  features: PlanFeature[];
  priceId: string | null;
  popular?: boolean;
  seatBased?: boolean;
}

const contractorPlans: ContractorPlan[] = [
  {
    name: "Free",
    description: "Try Deckmetry with up to 3 projects per month",
    priceLabel: "Free",
    features: [
      { text: "3 estimates per month" },
      { text: "Basic BOM generation" },
      { text: "PDF proposals" },
      { text: "Email support" },
    ],
    priceId: null,
  },
  {
    name: "Solo",
    description: "For sole proprietorships — up to 50 projects/month",
    priceLabel: "$79",
    priceSubtext: "/month",
    features: [
      { text: "50 estimates per month" },
      { text: "Unlimited proposals" },
      { text: "Customer approval workflow" },
      { text: "Order management" },
      { text: "Priority support" },
    ],
    priceId: process.env.STRIPE_CONTRACTOR_SOLO_PRICE_ID ?? null,
    popular: true,
  },
  {
    name: "Teams",
    description: "For contractor teams with multiple users",
    priceLabel: "$79",
    priceSubtext: "/month + $20/seat",
    features: [
      { text: "Unlimited estimates" },
      { text: "Unlimited proposals" },
      { text: "Multiple team members" },
      { text: "Role-based permissions" },
      { text: "Custom branding" },
      { text: "Dedicated support" },
    ],
    priceId: process.env.STRIPE_CONTRACTOR_TEAM_BASE_PRICE_ID ?? null,
    seatBased: true,
  },
];

// ---- Supplier plan ----

const supplierFeatures: PlanFeature[] = [
  { text: "Full order inbox + management" },
  { text: "Invoice generation + payments" },
  { text: "Delivery tracking with POD" },
  { text: "Realtime notifications" },
  { text: "Analytics dashboard" },
  { text: "Multiple team members" },
];

export default async function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Pay only for what you use. No hidden fees, no long-term contracts.
        </p>
      </div>

      {/* ---- Homeowner Section ---- */}
      <section className="mb-20">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Home className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Homeowners</h2>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-2">
          Pay per use — only when you need it.
        </p>
        <p className="text-center text-xs text-muted-foreground mb-8">
          Free when you go through a supplier website for a quote.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
          {homeownerProducts.map((product) => (
            <Card key={product.name} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-3xl font-bold tracking-tight">
                    {product.price}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    one-time
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/signup?role=homeowner" className="w-full">
                  <Button variant="outline" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* ---- Contractor Section ---- */}
      <section className="mb-20">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Hammer className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Contractors</h2>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-8">
          Everything you need to estimate, quote, and deliver deck projects.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {contractorPlans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.popular
                  ? "relative border-primary shadow-lg shadow-primary/5"
                  : "border-border"
              }
            >
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.priceLabel}
                  </span>
                  {plan.priceSubtext && (
                    <span className="text-muted-foreground">
                      {plan.priceSubtext}
                    </span>
                  )}
                </div>
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li
                      key={f.text}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.priceId ? (
                  <CheckoutButton priceId={plan.priceId} planName={plan.name} />
                ) : (
                  <Link href="/signup?role=contractor" className="w-full">
                    <Button variant="outline" className="w-full">
                      Get Started Free
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* ---- Supplier Section ---- */}
      <section className="mb-20">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Warehouse className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Suppliers</h2>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-8">
          Manage the full sales cycle from order to delivery.
        </p>
        <div className="max-w-md mx-auto">
          <Card className="border-primary shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle>Platform</CardTitle>
              <CardDescription>
                Full-featured order and delivery management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <span className="text-4xl font-bold tracking-tight">$497</span>
                <span className="text-muted-foreground">/month</span>
                <span className="text-sm text-muted-foreground ml-1">
                  + $20/seat
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Includes 1 seat. Additional seats $20/month each. One-time setup
                fee applies.
              </p>
              <ul className="space-y-2.5">
                {supplierFeatures.map((f) => (
                  <li
                    key={f.text}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {process.env.STRIPE_SUPPLIER_PLATFORM_PRICE_ID ? (
                <CheckoutButton
                  priceId={process.env.STRIPE_SUPPLIER_PLATFORM_PRICE_ID}
                  planName="Platform"
                />
              ) : (
                <Link href="/signup?role=supplier" className="w-full">
                  <Button className="w-full">Contact Sales</Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* FAQ note */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>
          All plans include SSL encryption, 99.9% uptime SLA, and GDPR
          compliance.
        </p>
        <p>
          Questions?{" "}
          <Link href="/contact" className="underline underline-offset-4">
            Contact our sales team
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
