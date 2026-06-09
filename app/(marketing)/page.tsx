import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Ruler, ClipboardList, Phone, CheckCircle2, Sparkles, Hammer,
} from "lucide-react";

const steps = [
  {
    icon: Ruler,
    title: "Tell us about your deck",
    description: "Pick your project type, size, height, decking, color, railing, stairs, and add-ons — in a few taps.",
  },
  {
    icon: ClipboardList,
    title: "Get your instant estimate",
    description: "See an estimated material range and a detailed material list built from real decking products.",
  },
  {
    icon: Phone,
    title: "Plan your next steps",
    description: "Request a pro contact, permit-ready drawings, or a 3D rendering — and we'll help from there.",
  },
];

const brands = ["Trex", "Deckorators", "TimberTech"];

const benefits = [
  "Free to use — no account required",
  "Real composite decking brands & colors",
  "Detailed, printable material list",
  "Built for homeowners and showrooms",
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Instant deck material estimates
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Design your dream deck,{" "}
              <span className="text-primary">get an instant estimate</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Answer a few quick questions and Deckmetry builds your estimated material range and a
              detailed material list — in minutes, for free.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/estimate">
                <Button size="lg" className="gap-2 px-8 text-base">
                  Start Your Free Estimate
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No account needed. Takes about 2 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-muted-foreground">Three simple steps from idea to material list.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <Card key={s.title} className="transition-all hover:shadow-lg hover:border-primary/30">
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-3xl font-extrabold text-muted-foreground/20">{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/estimate">
              <Button size="lg" className="gap-2 px-8 text-base">
                Start Your Free Estimate
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Materials + benefits */}
      <section className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium">
                <Hammer className="h-4 w-4 text-primary" />
                Real materials, real estimates
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Premium composite decking you can choose from
              </h2>
              <p className="mt-3 text-muted-foreground">
                Estimates are built from leading composite decking lines and colors — so your material list
                reflects what actually goes on your deck.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {brands.map((b) => (
                  <span key={b} className="rounded-full border bg-card px-4 py-1.5 text-sm font-semibold">{b}</span>
                ))}
              </div>
            </div>
            <ul className="space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-base">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary/5">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Ready to estimate your deck?</h2>
            <p className="mt-4 text-muted-foreground">
              Get your estimated material range and detailed material list in just a few minutes — completely free.
            </p>
            <div className="mt-8">
              <Link href="/estimate">
                <Button size="lg" className="gap-2 px-8 text-base">
                  Start Your Free Estimate
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
