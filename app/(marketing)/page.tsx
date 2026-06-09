import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Sparkles, CheckCircle2, Ruler, Gauge, ClipboardList, Phone,
  Calculator, FileText, Tablet, PencilRuler, Box,
} from "lucide-react";

const howItWorks = [
  { icon: Ruler, title: "Choose Your Deck Options", description: "Select deck size, height, decking, color, railing, stairs, lighting, and upgrades." },
  { icon: Gauge, title: "Get an Instant Budget Range", description: "Receive a guided material estimate range based on your selected options." },
  { icon: ClipboardList, title: "Unlock the Detailed BOM", description: "Get a detailed bill of materials with quantities, railing package, fascia, fasteners, hardware, and accessories." },
  { icon: Phone, title: "Request Next Steps", description: "Request pro contact, permit-ready drawings, or 3D renderings for your project." },
];

const features = [
  { icon: Calculator, title: "Smart Estimate Engine", description: "Build a guided material budget range from deck size, material selections, railing, stairs, and add-ons." },
  { icon: FileText, title: "Detailed BOM Upgrade", description: "Unlock a detailed bill of materials when you're ready to move from budget planning to material preparation." },
  { icon: Tablet, title: "Showroom-Friendly Workflow", description: "Designed for iPad use in showrooms so a salesperson can guide a homeowner through deck options in minutes." },
  { icon: Phone, title: "Pro Contact Requests", description: "Homeowners can request help from a professional to review materials, budget, contractor options, and next steps." },
  { icon: PencilRuler, title: "Permit-Ready Drawing Requests", description: "Move serious projects forward by requesting professionally prepared permit-ready drawings." },
  { icon: Box, title: "3D Rendering Requests", description: "Help homeowners visualize their deck and outdoor space before moving forward." },
];

const freeIncludes = [
  "Project summary",
  "Selected materials",
  "Estimated material range",
  "Pro contact request",
  "Drawing request",
  "3D rendering request",
];
const paidIncludes = [
  "Decking quantity breakdown",
  "Railing package",
  "Fascia and skirting list",
  "Fasteners and hardware",
  "Lighting items if selected",
  "Printable project summary",
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
              The modern deck estimating platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Instant Deck Material Estimates
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Plan your deck, select materials, and receive a guided material budget range in minutes.
              When you&apos;re ready, unlock a detailed BOM or request pro contact, permit-ready drawings,
              and 3D renderings.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/estimate">
                <Button size="lg" className="gap-2 px-8 text-base">
                  Start Free Deck Estimate
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/showroom-demo">
                <Button variant="outline" size="lg" className="text-base">
                  View Showroom Demo
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free estimate range. Detailed BOM available as a paid upgrade.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">How Deckmetry Works</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              From first idea to material planning, Deckmetry helps homeowners move from estimate to next steps.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((s, i) => (
              <Card key={s.title} className="transition-all hover:shadow-lg hover:border-primary/30">
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-3xl font-extrabold text-muted-foreground/20">{i + 1}</span>
                  </div>
                  <h3 className="text-base font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to plan your deck</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <f.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free vs Paid */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Start Free. Unlock the Details When You&apos;re Ready.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Use the estimator for free, then unlock the detailed BOM when you are ready to plan materials.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardContent className="flex h-full flex-col pt-6">
                <h3 className="text-lg font-semibold">Free Estimate</h3>
                <p className="mt-1 text-3xl font-extrabold">Free</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {freeIncludes.map((x) => (
                    <li key={x} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{x}</li>
                  ))}
                </ul>
                <Link href="/estimate" className="mt-6 block">
                  <Button variant="outline" className="w-full gap-2">Start Free Estimate <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-primary/40 ring-1 ring-primary/10">
              <CardContent className="flex h-full flex-col pt-6">
                <h3 className="text-lg font-semibold">Detailed BOM</h3>
                <p className="mt-1 text-3xl font-extrabold">$79</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {paidIncludes.map((x) => (
                    <li key={x} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{x}</li>
                  ))}
                </ul>
                <Link href="/estimate" className="mt-6 block">
                  <Button className="w-full gap-2">Unlock BOM <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-primary/5">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Ready to plan your deck?</h2>
            <p className="mt-4 text-muted-foreground">
              Start with a free deck estimate and unlock the detailed BOM when you&apos;re ready.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/estimate">
                <Button size="lg" className="gap-2 px-8 text-base">Start Free Estimate <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link href="/showroom-demo">
                <Button variant="outline" size="lg" className="text-base">View Showroom Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
