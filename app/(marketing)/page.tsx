import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Calculator,
  FileText,
  Package,
  Truck,
  Shield,
  Zap,
  Users,
  CheckCircle2,
} from "lucide-react";

const personas = [
  {
    title: "Homeowners",
    description:
      "Generate accurate BOMs, get professional drawings, and connect with contractors — all for free.",
    icon: Users,
    cta: "Start Estimating",
    href: "/estimate",
    features: [
      "Free deck estimator wizard",
      "Professional floor plan drawings",
      "Material bill of quantities",
      "Compare contractor proposals",
    ],
  },
  {
    title: "Contractors",
    description:
      "Quote materials, build professional proposals, and manage the full project workflow.",
    icon: Calculator,
    cta: "Start Free Trial",
    href: "/signup?role=contractor",
    features: [
      "Instant BOM generation",
      "Professional PDF proposals",
      "Customer approval workflow",
      "Order management",
    ],
  },
  {
    title: "Suppliers",
    description:
      "Receive orders, generate invoices, and track deliveries — all in one platform.",
    icon: Truck,
    cta: "Join as Supplier",
    href: "/signup?role=supplier",
    features: [
      "Order inbox & management",
      "Invoice generation",
      "Payment processing",
      "Delivery tracking",
    ],
  },
];

const features = [
  {
    icon: Calculator,
    title: "Smart BOM Engine",
    description:
      "Automatically calculates every board, joist, footing, and fastener from your deck dimensions. Supports Trex, TimberTech, and Deckorators.",
  },
  {
    icon: FileText,
    title: "Professional Proposals",
    description:
      "Generate branded PDF proposals with line items, totals, and customer approval workflow. Share via a unique link — no login required.",
  },
  {
    icon: Package,
    title: "Order Management",
    description:
      "Convert approved proposals into purchase orders. Track from order to delivery with real-time status updates.",
  },
  {
    icon: Shield,
    title: "Multi-Tenant Platform",
    description:
      "Each organization has its own workspace with role-based permissions. Homeowners, contractors, and suppliers all in one platform.",
  },
  {
    icon: Zap,
    title: "Real-Time Updates",
    description:
      "Get instant notifications when proposals are viewed, approved, orders ship, or deliveries arrive. Never miss a project milestone.",
  },
  {
    icon: Truck,
    title: "Full Supply Chain",
    description:
      "From estimate to delivery confirmation — manage the entire deck-building supply chain. BOM → Quote → Approval → Order → Invoice → Delivery.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              The modern deck-building platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Estimate, quote, and deliver{" "}
              <span className="text-primary">deck projects</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Deckmetry connects homeowners, contractors, and suppliers on one
              platform. From material estimates to delivery confirmation — manage
              the entire deck-building workflow.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 text-base">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg" className="text-base">
                  See How It Works
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free for homeowners. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Personas */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              Built for every role in the supply chain
            </h2>
            <p className="mt-3 text-muted-foreground">
              Whether you&apos;re building a deck, quoting materials, or
              delivering lumber — Deckmetry has you covered.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {personas.map((persona) => (
              <Card
                key={persona.title}
                className="group transition-all duration-200 hover:shadow-lg hover:border-primary/30"
              >
                <CardContent className="pt-6 space-y-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <persona.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{persona.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {persona.description}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {persona.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={persona.href}>
                    <Button
                      variant="outline"
                      className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      {persona.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mt-3 text-muted-foreground">
              Purpose-built tools for the deck-building supply chain.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <feature.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary/5">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to streamline your deck projects?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join Deckmetry today. Homeowners start free, contractors get 3
              projects per month on the free plan.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 text-base">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="text-base">
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
