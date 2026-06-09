import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Sparkles, Ruler, Layers, ClipboardList, Phone,
  Calculator, FileText, Tablet, Box, Download,
} from "lucide-react";

const howItWorks = [
  { icon: Ruler, title: "Choose Your Deck Options", description: "Select deck size, height, decking, color, railing, stairs, lighting, and upgrades." },
  { icon: Layers, title: "See Your Live Plan View", description: "Watch your deck take shape with an interactive plan-view drawing as you make selections." },
  { icon: ClipboardList, title: "Get Your Detailed Material List", description: "A complete bill of materials with quantities — decking, framing, railing, fascia, fasteners, hardware, and lighting." },
  { icon: Phone, title: "Request Next Steps", description: "Request a pro review or pro contact, get a 3D rendering, or download your material list." },
];

const features = [
  { icon: Calculator, title: "Smart Material Estimator", description: "Builds a complete material list from your deck size, material selections, railing, stairs, and add-ons." },
  { icon: Layers, title: "Live Plan-View Drawing", description: "An interactive top, front, and side view of your deck updates as you choose options." },
  { icon: FileText, title: "Detailed Material List", description: "A full bill of materials with quantities for decking, framing, railing, fascia, fasteners, hardware, and lighting." },
  { icon: Download, title: "Download Your Material List", description: "Print or save your material list to share with a contractor or supplier." },
  { icon: Tablet, title: "Showroom-Friendly Workflow", description: "Designed for iPad use in showrooms so a salesperson can guide a homeowner through deck options in minutes." },
  { icon: Phone, title: "Pro Contact & Review", description: "Request help from a professional to review your plan, materials, and next steps — or request a 3D rendering." },
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
              Plan your deck, select your materials, and get a detailed material list in minutes — with a live
              plan-view drawing. Then request a pro review, pro contact, or a 3D rendering.
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
              Free to use. No account required.
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
          <div className="mt-10 text-center">
            <Link href="/estimate">
              <Button size="lg" className="gap-2 px-8 text-base">
                Start Free Deck Estimate
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
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

      {/* Final CTA */}
      <section className="border-t bg-primary/5">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Ready to plan your deck?</h2>
            <p className="mt-4 text-muted-foreground">
              Build your deck plan and get your detailed material list — free.
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
