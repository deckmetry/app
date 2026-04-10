import { Check } from "lucide-react";
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

interface PlanFeature {
  text: string;
}

interface PlanDef {
  name: string;
  description: string;
  priceLabel: string;
  priceSubtext?: string;
  features: PlanFeature[];
  priceId: string | null;
  popular?: boolean;
}

const contractorPlans: PlanDef[] = [
  {
    name: "Starter",
    description: "Get started with 3 projects per month",
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
    name: "Pro",
    description: "For growing contractors",
    priceLabel: "$79",
    priceSubtext: "/month",
    features: [
      { text: "Unlimited estimates" },
      { text: "Unlimited proposals" },
      { text: "Customer approval workflow" },
      { text: "Order management" },
      { text: "Priority support" },
    ],
    priceId: process.env.STRIPE_CONTRACTOR_PRO_PRICE_ID ?? null,
    popular: true,
  },
  {
    name: "Team",
    description: "For contractor teams",
    priceLabel: "$199",
    priceSubtext: "/month",
    features: [
      { text: "Everything in Pro" },
      { text: "Up to 10 team members" },
      { text: "Role-based permissions" },
      { text: "Custom branding" },
      { text: "API access" },
      { text: "Dedicated support" },
    ],
    priceId: process.env.STRIPE_CONTRACTOR_TEAM_PRICE_ID ?? null,
  },
];

const supplierPlans: PlanDef[] = [
  {
    name: "Directory",
    description: "Free listing in supplier directory",
    priceLabel: "Free",
    features: [
      { text: "Supplier directory listing" },
      { text: "Receive order requests" },
      { text: "Basic profile page" },
    ],
    priceId: null,
  },
  {
    name: "Connected",
    description: "Full sales cycle management",
    priceLabel: "$199",
    priceSubtext: "/month",
    features: [
      { text: "Everything in Directory" },
      { text: "Order inbox + management" },
      { text: "Invoice generation" },
      { text: "Payment processing" },
      { text: "Delivery tracking" },
      { text: "Analytics dashboard" },
    ],
    priceId: process.env.STRIPE_SUPPLIER_CONNECTED_PRICE_ID ?? null,
    popular: true,
  },
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
            Homeowners always use Deckmetry for free. Contractors and suppliers
            can start free and upgrade as they grow.
          </p>
        </div>

        {/* Homeowner callout */}
        <div className="mb-16 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border bg-emerald-50 dark:bg-emerald-950/30 px-6 py-3">
            <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-sm">
              <strong>Homeowners</strong> — Always free. Generate estimates,
              get drawings, and connect with contractors at no cost.
            </p>
          </div>
        </div>

        {/* Contractor Plans */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">
            Contractor Plans
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-8">
            Everything you need to estimate, quote, and deliver deck projects.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {contractorPlans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </section>

        {/* Supplier Plans */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">
            Supplier Plans
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-8">
            Manage orders, invoices, and deliveries all in one place.
          </p>
          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {supplierPlans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </section>

        {/* Transaction fee note */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Plus 1.5% transaction fee on homeowner deposits collected via
            Deckmetry (capped at $150 per transaction).
          </p>
        </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: PlanDef }) {
  return (
    <Card
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
            <span className="text-muted-foreground">{plan.priceSubtext}</span>
          )}
        </div>
        <ul className="space-y-2.5">
          {plan.features.map((f) => (
            <li key={f.text} className="flex items-start gap-2.5 text-sm">
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
          <Link href="/signup" className="w-full">
            <Button variant="outline" className="w-full">
              Get Started Free
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
