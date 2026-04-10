import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Calculator,
  FileText,
  Package,
  Truck,
  Bell,
  CreditCard,
  Shield,
  Layers,
  PenTool,
  BarChart3,
  Zap,
} from "lucide-react";

const workflowSteps = [
  {
    step: "1",
    title: "Estimate",
    description:
      "Enter deck dimensions and material preferences. Our BOM engine calculates every board, joist, footing, and fastener.",
    icon: Calculator,
  },
  {
    step: "2",
    title: "Quote",
    description:
      "Convert estimates into professional proposals with custom pricing, cover notes, and payment terms.",
    icon: FileText,
  },
  {
    step: "3",
    title: "Approve",
    description:
      "Share proposals via a unique link. Homeowners review and e-sign — no account required.",
    icon: Shield,
  },
  {
    step: "4",
    title: "Order",
    description:
      "Create purchase orders from approved quotes and send directly to your preferred supplier.",
    icon: Package,
  },
  {
    step: "5",
    title: "Invoice & Pay",
    description:
      "Suppliers generate invoices, contractors pay via Stripe. Full payment tracking and reconciliation.",
    icon: CreditCard,
  },
  {
    step: "6",
    title: "Deliver",
    description:
      "Track shipments with carrier info and delivery confirmation. Everyone stays in the loop in real time.",
    icon: Truck,
  },
];

const capabilities = [
  {
    icon: Layers,
    title: "6-Step Estimator Wizard",
    description:
      "Job Info, Geometry, Surface, Railing & Stairs, Add-ons, Review. Each step validates and feeds the next.",
  },
  {
    icon: PenTool,
    title: "SVG Deck Drawings",
    description:
      "Auto-generated floor plans with toggleable layers: footings, framing, decking, railing, and lights.",
  },
  {
    icon: Calculator,
    title: "Multi-Brand Catalog",
    description:
      "Supports Trex, TimberTech, and Deckorators with accurate SKU-level material calculations.",
  },
  {
    icon: FileText,
    title: "PDF Proposals",
    description:
      "Server-side PDF generation with line items, totals, project details, and your branding.",
  },
  {
    icon: Bell,
    title: "Real-Time Notifications",
    description:
      "Live updates via Supabase Realtime. Know instantly when proposals are viewed or orders ship.",
  },
  {
    icon: BarChart3,
    title: "Pipeline Dashboard",
    description:
      "Track estimates, quotes, orders, and deliveries. See what needs attention at a glance.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Multi-tenant workspaces. Homeowners see their projects, contractors see their pipeline, suppliers see their orders.",
  },
  {
    icon: Zap,
    title: "Stripe Integration",
    description:
      "Subscriptions for plans, Connect for supplier payouts, and Checkout for seamless payments.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            How Deckmetry works
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            From the first measurement to the final delivery — six steps that
            connect every stakeholder in the deck-building supply chain.
          </p>
        </div>
      </section>

      {/* Workflow */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-12">
            The full workflow
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workflowSteps.map((item) => (
              <Card key={item.title} className="relative overflow-hidden">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {item.step}
                    </span>
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight">
              Platform capabilities
            </h2>
            <p className="mt-2 text-muted-foreground">
              Built for the specific needs of deck construction professionals.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((cap) => (
              <div key={cap.title} className="space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <cap.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cap.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary/5">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Ready to get started?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Create your free account and start estimating in minutes.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
