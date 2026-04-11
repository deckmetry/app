import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calculator,
  FileText,
  Package,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Contractors | Deckmetry",
  description:
    "Estimate, quote, and deliver faster. Professional BOM engine, proposal builder, and order management for deck contractors.",
};

const features = [
  {
    icon: Calculator,
    title: "Instant BOM Engine",
    description:
      "Generate accurate material lists in minutes. Supports Trex, TimberTech, Deckorators with real product specs and waste factors.",
  },
  {
    icon: FileText,
    title: "Professional Proposals",
    description:
      "Build branded proposals with line-item detail. Homeowners can review and approve online with a single click.",
  },
  {
    icon: Package,
    title: "Order Management",
    description:
      "Convert approved proposals into purchase orders. Track materials from quote to delivery in one place.",
  },
  {
    icon: Clock,
    title: "Save Hours Per Project",
    description:
      "Stop hand-counting materials and building spreadsheet quotes. Deckmetry does the math so you can focus on building.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Pipeline",
    description:
      "Manage all your projects in one dashboard. See which estimates are pending, which quotes are out, and which orders are in progress.",
  },
  {
    icon: Users,
    title: "Supplier Network",
    description:
      "Connect directly with local suppliers for competitive pricing. Submit orders and track deliveries without phone tag.",
  },
];

export default function ForContractorsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-24">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            For Deck Contractors
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Estimate, Quote, and
            <span className="text-primary"> Deliver Faster</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            The professional deck estimator that generates accurate BOMs,
            builds client-ready proposals, and manages your entire order
            pipeline.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup?role=contractor">
              <Button size="lg" className="gap-2">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">
              Built for Deck Professionals
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need from first estimate to final delivery.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-16">
            Your Workflow, Simplified
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: "1",
                title: "Create Estimate",
                description: "Enter deck specs and get an instant, accurate BOM.",
              },
              {
                step: "2",
                title: "Build Proposal",
                description: "Add your markup and send a professional quote.",
              },
              {
                step: "3",
                title: "Get Approval",
                description:
                  "Homeowner reviews and approves online with e-signature.",
              },
              {
                step: "4",
                title: "Order & Deliver",
                description:
                  "Submit PO to supplier and track through delivery.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Start Estimating for Free
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            3 free estimates per month on the Starter plan. No credit card
            required.
          </p>
          <div className="mt-8">
            <Link href="/signup?role=contractor">
              <Button size="lg" className="gap-2">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
