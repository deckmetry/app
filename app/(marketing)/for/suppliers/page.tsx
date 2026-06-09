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
  Code,
  Users,
  BarChart3,
  Palette,
  Zap,
  Shield,
  ArrowRight,
} from "lucide-react";
import { SupplierWebsiteMockup } from "@/components/marketing/supplier-website-mockup";
import { WaitlistForm } from "@/components/showroom/waitlist-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Suppliers | Deckmetry",
  description:
    "Turn your website into a sales machine. Embed a deck estimator, capture leads, and manage contractor relationships.",
};

const features = [
  {
    icon: Code,
    title: "Embeddable BOM Wizard",
    description:
      "Add a fully-branded deck estimator to your website with a single iframe. Homeowners get instant material lists without leaving your site.",
  },
  {
    icon: Users,
    title: "Lead Capture",
    description:
      "Every homeowner who uses your estimator becomes a lead in your dashboard — with their name, email, phone, and project specs.",
  },
  {
    icon: Palette,
    title: "Full Customization",
    description:
      "Your logo, your colors, your brand. The estimator looks like part of your website, not a third-party tool.",
  },
  {
    icon: BarChart3,
    title: "Contractor Management",
    description:
      "Give contractors a direct signup link scoped to your account. Track their activity and manage the relationship.",
  },
  {
    icon: Zap,
    title: "Instant BOM Emails",
    description:
      "Homeowners receive their material list by email immediately. You get notified of every new lead in real time.",
  },
  {
    icon: Shield,
    title: "Order Pipeline",
    description:
      "From BOM to quote to order to delivery — manage the entire sales cycle through Deckmetry.",
  },
];

export default function ForSuppliersPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-24">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700 mb-6 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Coming Soon — For Deck Material Suppliers
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Turn Your Website Into a
            <span className="text-primary"> Sales Machine</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Embed a professional deck estimator on your website. Homeowners get
            instant BOMs, you get qualified leads with full project details.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="#waitlist">
              <Button size="lg" className="gap-2">
                Join the Waitlist
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Mockup */}
      <section className="py-16 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4">
          <SupplierWebsiteMockup />
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything You Need to Generate Leads
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              One platform to power your website, capture leads, and manage your
              contractor network.
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
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Configure Your Embed",
                description:
                  "Upload your logo, set your brand colors, and grab the iframe code from your settings page.",
              },
              {
                step: "2",
                title: "Add to Your Website",
                description:
                  "Paste the embed code anywhere on your site. The estimator loads instantly and looks native.",
              },
              {
                step: "3",
                title: "Receive Leads",
                description:
                  "When homeowners complete an estimate, you get their details and project specs in your dashboard.",
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

      {/* Waitlist */}
      <section id="waitlist" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-2xl px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">
              Join the Supplier Waitlist
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The supplier platform is launching soon. Join the waitlist and
              we&apos;ll notify you the moment access opens.
            </p>
          </div>
          <Card className="border-2">
            <CardContent className="pt-6">
              <WaitlistForm
                type="supplier_waitlist"
                buttonLabel="Join Supplier Waitlist"
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
