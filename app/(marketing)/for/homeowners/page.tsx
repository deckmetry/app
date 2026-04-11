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
  Ruler,
  Box,
  UserCheck,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { HomeownerWizardMockup } from "@/components/marketing/homeowner-wizard-mockup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Homeowners | Deckmetry",
  description:
    "Know exactly what your deck will need. Instant material lists, professional designs, and expert reviews.",
};

const features = [
  {
    icon: Calculator,
    title: "Instant Material List",
    description:
      "Enter your deck dimensions and get a complete bill of materials in minutes. Free, no account required.",
  },
  {
    icon: DollarSign,
    title: "Budget Confidence",
    description:
      "Know exactly what materials you need before talking to contractors. No surprises, no guesswork.",
  },
  {
    icon: Ruler,
    title: "Permit-Ready Designs",
    description:
      "Get professional drawings formatted for your local building department. Skip the architect.",
  },
  {
    icon: Box,
    title: "3D Visualization",
    description:
      "See exactly what your deck will look like with photorealistic 3D renderings of your specific design.",
  },
  {
    icon: UserCheck,
    title: "Professional Review",
    description:
      "Have your plan reviewed by an experienced deck professional who can spot issues before you build.",
  },
  {
    icon: FileText,
    title: "SVG Floor Plans",
    description:
      "Interactive floor plans with layer controls for footings, framing, decking, railing, and lighting.",
  },
];

export default function ForHomeownersPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-24">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            For Homeowners
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Know Exactly What Your
            <span className="text-primary"> Deck Will Need</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Generate a complete material list for your deck project in minutes.
            Free to use, no account required. Get professional designs and
            expert reviews when you need them.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/estimate">
              <Button size="lg" className="gap-2">
                Estimate Your Deck
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Mockup */}
      <section className="py-16 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4">
          <HomeownerWizardMockup />
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">
              Plan Your Deck Project with Confidence
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From material list to professional design — everything you need to
              plan your dream deck.
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
            Simple as 1-2-3
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Enter Your Deck Specs",
                description:
                  "Tell us the size, height, and style of your deck. Choose your decking brand and colors.",
              },
              {
                step: "2",
                title: "Get Your Material List",
                description:
                  "Receive a complete BOM with every board, fastener, footing, and railing piece counted.",
              },
              {
                step: "3",
                title: "Take the Next Step",
                description:
                  "Save your estimate, get professional drawings, or request an expert review.",
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
            Start Planning Your Deck Today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Free to use. No account required. Get your material list in minutes.
          </p>
          <div className="mt-8">
            <Link href="/estimate">
              <Button size="lg" className="gap-2">
                Estimate Your Deck
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
