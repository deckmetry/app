import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Ruler, Gauge, ClipboardList, Phone, CheckCircle2 } from "lucide-react";

const steps = [
  { icon: Ruler, title: "Choose your deck options", description: "Size, height, decking, color, railing, stairs, lighting, and upgrades." },
  { icon: Gauge, title: "Get an instant budget range", description: "A guided material estimate range based on your selections." },
  { icon: ClipboardList, title: "Unlock the detailed BOM", description: "A detailed bill of materials with quantities, railing, fascia, fasteners, and accessories." },
  { icon: Phone, title: "Request next steps", description: "Pro contact, permit-ready drawings, or 3D renderings for your project." },
];

const benefits = [
  "Free estimate range — no account required",
  "Real composite decking brands and colors",
  "Detailed BOM upgrade when you're ready",
  "Request pro contact, drawings, or 3D renderings",
];

export default function ForHomeownersPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Plan your deck with confidence</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Deckmetry gives homeowners an instant material budget range and a detailed planning material list —
            so you can move from idea to next steps in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/estimate">
              <Button size="lg" className="gap-2 px-8 text-base">Start Free Deck Estimate <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <Link href="/showroom-demo">
              <Button variant="outline" size="lg" className="text-base">View Showroom Demo</Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Free estimate range. Detailed BOM available as a paid upgrade.</p>
        </div>
      </section>

      <section className="bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Card key={s.title}>
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

      <section className="border-t">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <ul className="grid gap-3 sm:grid-cols-2">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-base"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />{b}</li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Link href="/estimate"><Button size="lg" className="gap-2 px-8 text-base">Start Free Deck Estimate <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}
