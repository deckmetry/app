import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PrintButton } from "./print-button";
import { PrintMarginWrapper } from "../_components/print-margin-wrapper";
import {
  Building2,
  Boxes,
  Tags,
  FolderKanban,
  FileSpreadsheet,
  ClipboardList,
  CreditCard,
  Truck,
  Plug,
  Smartphone,
  ShieldCheck,
  Users,
  Server,
  CheckCircle2,
  Clock,
  Rocket,
  Globe,
  HandshakeIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Supplier MVP — 4-Month Roadmap & Budget | Deckmetry",
  description:
    "Development and validation roadmap to deliver the Deckmetry supplier MVP in four months, including a transparent cost breakdown for financing.",
};

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const preparedDate = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/* ----------------------------- MVP scope ----------------------------- */

const inScope = [
  { icon: Building2, label: "Supplier onboarding & multi-tenant accounts" },
  { icon: Users, label: "Customer accounts (contractors & homeowners CRM-lite)" },
  { icon: Boxes, label: "Product catalog management" },
  { icon: Tags, label: "Pricing & price lists" },
  { icon: HandshakeIcon, label: "Lead inbox & assignment" },
  { icon: FolderKanban, label: "Projects workspace" },
  { icon: FileSpreadsheet, label: "Estimates & quotes" },
  { icon: ClipboardList, label: "Purchase orders & status pipeline" },
  { icon: CreditCard, label: "Payments — basic (deposits, manual record)" },
  { icon: Truck, label: "Deliveries — basic tracking + proof of delivery" },
  { icon: Plug, label: "Public API foundation (read endpoints + keys)" },
  { icon: Smartphone, label: "Mobile shell (responsive PWA / wrapped app)" },
];

const deferred = [
  "Delivery routing & optimization",
  "Full payment sync & reconciliation",
  "Stripe Connect supplier payouts",
  "Native iOS / Android feature parity",
  "Contractor & homeowner self-serve portals at scale",
  "Advanced cross-persona automations",
];

/* ------------------------------ Roadmap ------------------------------ */

type Month = {
  month: string;
  window: string;
  title: string;
  icon: typeof Building2;
  build: string[];
  validate: string[];
};

const roadmap: Month[] = [
  {
    month: "Month 1",
    window: "Weeks 1–4",
    title: "Foundation & Supplier Onboarding",
    icon: Building2,
    build: [
      "Multi-tenant data model (orgs, members, roles) + row-level security",
      "Supabase Auth (PKCE) — supplier signup, onboarding, invites",
      "Design system, web app shell, CI/CD, staging environment",
      "Customer accounts — contacts & company records (CRM-lite)",
    ],
    validate: [
      "Project kickoff; acceptance criteria defined with pilot supplier",
      "Onboarding & account flows walked through in co-validation sessions",
    ],
  },
  {
    month: "Month 2",
    window: "Weeks 5–8",
    title: "Product Catalog, Pricing & Leads",
    icon: Boxes,
    build: [
      "Catalog management — brands, collections, products, attributes",
      "Pricing — price lists, tiers, customer-specific pricing",
      "Catalog import (CSV) for fast onboarding of real SKUs",
      "Lead inbox — capture, assign, and triage incoming leads",
    ],
    validate: [
      "Pilot supplier's real catalog & SKUs loaded and reviewed",
      "Pricing-accuracy review sessions against current price sheets",
    ],
  },
  {
    month: "Month 3",
    window: "Weeks 9–12",
    title: "Projects, Estimates & Purchase Orders",
    icon: FolderKanban,
    build: [
      "Projects workspace — link leads to projects and customers",
      "Estimates & quotes from catalog (reuses existing BOM engine)",
      "Purchase order receiving & status pipeline",
      "Transactional email notifications (Resend)",
    ],
    validate: [
      "End-to-end quote → PO dry run with the pilot supplier",
      "Document & pricing accuracy sign-off on generated quotes/POs",
    ],
  },
  {
    month: "Month 4",
    window: "Weeks 13–16",
    title: "Payments, Deliveries, API, Mobile & Launch",
    icon: Rocket,
    build: [
      "Payments (basic) — deposit checkout + manual payment recording",
      "Deliveries (basic) — status tracking + proof of delivery",
      "Public API foundation — read endpoints + API keys",
      "Mobile shell (PWA / wrapped) + hardening, security & UAT",
    ],
    validate: [
      "Pilot supplier runs the full real workflow (UAT)",
      "Go / No-Go review → MVP launch",
    ],
  },
];

/* ------------------------------ Costs -------------------------------- */

const MONTHS = 4;

const team = [
  { role: "Backend Engineer", alloc: "1.0 FTE", monthly: 1950 },
  { role: "Frontend Engineer", alloc: "1.0 FTE", monthly: 1700 },
  { role: "Product (Design + Management)", alloc: "1.0 FTE", monthly: 1300 },
];

const teamMonthly = team.reduce((s, r) => s + r.monthly, 0);
const teamTotal = teamMonthly * MONTHS;

type Infra = {
  name: string;
  note: string;
  total: number; // 4-month total
};

// Cloud infrastructure, rolled up by category (database, server, APIs, tooling).
const infra: Infra[] = [
  { name: "Database & backend", note: "Supabase — Postgres, Auth, Storage, Realtime", total: 100 },
  { name: "Server & hosting", note: "Vercel — app hosting, edge, deploys", total: 80 },
  { name: "APIs & services", note: "Email, payments & background jobs", total: 80 },
  { name: "Dev & design tooling", note: "Domain, design, AI & CI tooling", total: 261 },
  { name: "Mobile app store accounts", note: "Apple & Google — one-time", total: 124 },
];

const infraTotal = infra.reduce((s, r) => s + r.total, 0);

const grandTotal = teamTotal + infraTotal;

/* ------------------------------ Page --------------------------------- */

export default function RoadmapPage() {
  return (
    <PrintMarginWrapper>
      <div className="px-4 py-14 print:p-0">

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-4">
              Supplier-first · Investment proposal
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Supplier MVP — 4-Month Roadmap &amp; Budget
            </h1>
          </div>
          <PrintButton />
        </div>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Deckmetry is the virtual hub where homeowners, contractors and suppliers receive leads
          and manage customer accounts, product catalog &amp; pricing, projects, estimates,
          purchase orders, deliveries and payments — delivered with native API integrations across
          web and mobile (Android &amp; iOS). This plan takes today&apos;s prototype to a launched,
          supplier-first MVP in four months, built and validated four-hands with a pilot supplier.
        </p>
      </div>

      {/* At a glance */}
      <section className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Clock, label: "Timeline", value: "4 months" },
          { icon: Building2, label: "Focus", value: "Suppliers" },
          { icon: Users, label: "Core team", value: "3.0 FTE" },
          { icon: Globe, label: "Surfaces", value: "Web + Mobile + API" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex flex-col gap-1 pt-6">
              <s.icon className="h-5 w-5 text-primary" />
              <span className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                {s.label}
              </span>
              <span className="text-lg font-semibold">{s.value}</span>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* MVP scope */}
      <section className="mb-14">
        <h2 className="text-xl font-bold tracking-tight">What the MVP includes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Scoped to the supplier&apos;s end-to-end day: from lead to delivery and deposit.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {inScope.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-lg border bg-card p-3"
            >
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-dashed bg-muted/40 p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Deferred to post-MVP</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            The most complex work is intentionally sequenced after launch to de-risk the MVP and
            control cost.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {deferred.map((d) => (
              <Badge key={d} variant="outline" className="font-normal">
                {d}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* 4-hands methodology */}
      <section className="mb-14">
        <Card className="border-primary/30 bg-primary/5 break-inside-avoid">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <HandshakeIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold tracking-tight">Built &amp; validated four-hands</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              A pilot supplier is onboarded from week one. Each milestone ships against explicit
              acceptance criteria and is validated in weekly co-working sessions pairing the
              Deckmetry team with the customer&apos;s domain expert — so what we build matches how
              suppliers actually work, with course corrections every two weeks instead of a single
              reveal at the end.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Roadmap */}
      <section className="mb-16">
        <h2 className="text-xl font-bold tracking-tight">The 4-month roadmap</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each month carries a build track and a validation track in parallel.
        </p>

        <div className="mt-6 space-y-5">
          {roadmap.map((m) => (
            <Card key={m.month} className="overflow-hidden break-inside-avoid">
              <CardContent className="grid gap-6 pt-6 md:grid-cols-[200px_1fr]">
                <div className="flex flex-col gap-2 md:border-r md:pr-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <m.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {m.month}
                  </div>
                  <div className="font-semibold leading-snug">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.window}</div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Boxes className="h-4 w-4 text-muted-foreground" />
                      Build
                    </div>
                    <ul className="space-y-1.5">
                      {m.build.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <HandshakeIcon className="h-4 w-4 text-muted-foreground" />
                      Validate (4-hands)
                    </div>
                    <ul className="space-y-1.5">
                      {m.validate.map((v) => (
                        <li key={v} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <span>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Budget */}
      <section className="mb-12">
        <h2 className="text-xl font-bold tracking-tight">Budget for financing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Costs only — what it takes to build and validate the MVP over the four-month period.
        </p>

        {/* Team */}
        <Card className="mt-6 break-inside-avoid">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Team ({MONTHS} months)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 font-medium">Role</th>
                    <th className="pb-2 font-medium">Allocation</th>
                    <th className="pb-2 text-right font-medium">Monthly</th>
                    <th className="pb-2 text-right font-medium">{MONTHS}-month total</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((r) => (
                    <tr key={r.role} className="border-b last:border-0">
                      <td className="py-2.5">{r.role}</td>
                      <td className="py-2.5 text-muted-foreground">{r.alloc}</td>
                      <td className="py-2.5 text-right tabular-nums">{currency(r.monthly)}</td>
                      <td className="py-2.5 text-right tabular-nums">
                        {currency(r.monthly * MONTHS)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="pt-3" colSpan={2}>
                      Team subtotal
                    </td>
                    <td className="pt-3 text-right tabular-nums">{currency(teamMonthly)}/mo</td>
                    <td className="pt-3 text-right tabular-nums">{currency(teamTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Infra */}
        <Card className="mt-5 break-inside-avoid">
          <CardContent className="pt-6">
            <div className="mb-1 flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Cloud infrastructure</h3>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Database, server, APIs and tooling — all cloud-hosted, no on-premise hardware.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium">Covers</th>
                    <th className="pb-2 text-right font-medium">{MONTHS}-month total</th>
                  </tr>
                </thead>
                <tbody>
                  {infra.map((r) => (
                    <tr key={r.name} className="border-b last:border-0">
                      <td className="py-2.5 whitespace-nowrap font-medium">{r.name}</td>
                      <td className="py-2.5 text-muted-foreground">{r.note}</td>
                      <td className="py-2.5 text-right tabular-nums">{currency(r.total)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="pt-3" colSpan={2}>
                      Cloud infrastructure subtotal
                    </td>
                    <td className="pt-3 text-right tabular-nums">{currency(infraTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="mt-5 border-primary/40 bg-primary/5 break-inside-avoid">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Team ({MONTHS} months)</span>
                <span className="tabular-nums">{currency(teamTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Cloud infrastructure ({MONTHS} months)
                </span>
                <span className="tabular-nums">{currency(infraTotal)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-base font-bold">
                <span>Total financing required</span>
                <span className="tabular-nums">{currency(grandTotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Team {currency(teamTotal)} + cloud infrastructure {currency(infraTotal)} ={" "}
                {currency(grandTotal)}.
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Blended monthly burn</span>
                <span className="tabular-nums">≈ {currency(grandTotal / MONTHS)}/mo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-5 flex items-start gap-2 rounded-lg border bg-muted/40 p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Assumptions.</span> The financing ask is{" "}
            {currency(grandTotal)} for the four-month build period — costs only, no margin. Figures
            are in USD. Team covers three full-time developers (backend, frontend, product); rates
            reflect a lean, blended staffing plan to be finalized against the actual roster and
            location. Infrastructure uses entry-tier cloud plans sized for an MVP and pilot load.
          </p>
        </div>
      </section>

      <div className="border-t pt-6 text-center text-xs text-muted-foreground">
        Deckmetry · Supplier MVP proposal · Prepared {new Date().getFullYear()}
      </div>

      </div>
    </PrintMarginWrapper>
  );
}
