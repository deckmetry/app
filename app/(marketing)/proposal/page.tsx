import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PrintButton } from "./print-button";
import {
  Hexagon,
  ClipboardList,
  ListChecks,
  FileCheck2,
  Upload,
  Plug,
  Clock,
  CircleDollarSign,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Building2,
  CalendarClock,
  FileSignature,
  Banknote,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pilot Proposal — Wehrung's | Deckmetry",
  description:
    "Commercial proposal for a 4-month Deckmetry platform pilot with Wehrung's: self-estimate, editable bill of materials, and estimate request/approval workflow.",
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

/* ------------------------------ Scope -------------------------------- */

const inScope = [
  { icon: ClipboardList, label: "Self-estimate wizard for homeowners & contractors" },
  { icon: ListChecks, label: "Editable Bill of Materials — full CRUD on line items" },
  { icon: FileCheck2, label: "Estimate request & approval workflow" },
  { icon: Upload, label: "Price list / catalog upload (CSV)" },
  { icon: Plug, label: "Architecture built for native integration with external systems (incl. Epicor)" },
  { icon: Plug, label: "Deckmetry-exposed APIs for third-party integrations" },
];

const outOfScope = [
  "Building and operating a live connector to a specific third-party system (e.g., Epicor) — scoped and quoted separately in a follow-on phase",
  "Custom features requested outside this roadmap — quoted separately as change orders",
];

/* ------------------------------ Roadmap ------------------------------- */

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
    title: "Foundation & Accounts",
    icon: Building2,
    build: [
      "Supabase Auth (PKCE) — homeowner & contractor signup, login, role-based access",
      "Multi-tenant data model (organizations, members) with row-level security",
      "Persist self-estimates from the existing wizard (save / resume)",
      "Wehrung's branding applied to the estimator (logo, colors, default catalog)",
    ],
    validate: [
      "Kickoff session — confirm acceptance criteria with Wehrung's team",
      "Walkthrough of account creation & estimate save/resume flow",
    ],
  },
  {
    month: "Month 2",
    window: "Weeks 5–8",
    title: "BOM CRUD & Catalog Upload",
    icon: ListChecks,
    build: [
      "Editable BOM table — add, edit, remove, and re-price line items",
      "Price list / catalog upload (CSV) — Wehrung's products & pricing",
      "Catalog management screens (brands, products, pricing) for Wehrung's team",
      "Versioned BOM history — snapshot saved on every change",
    ],
    validate: [
      "Wehrung's real price list uploaded and reviewed for accuracy",
      "BOM editing session with Wehrung's team on real projects",
    ],
  },
  {
    month: "Month 3",
    window: "Weeks 9–12",
    title: "Estimate Requests & Approvals",
    icon: FileCheck2,
    build: [
      "\"Request Estimate\" flow — homeowner/contractor submits to Wehrung's",
      "Wehrung's review queue — accept, edit, or decline requests",
      "Status tracking — Requested → Reviewed → Approved / Declined",
      "PDF export of approved estimates with Deckmetry branding",
    ],
    validate: [
      "End-to-end request → review → approval dry run with Wehrung's",
      "Sign-off on generated estimate PDFs",
    ],
  },
  {
    month: "Month 4",
    window: "Weeks 13–16",
    title: "API Foundation & Validation",
    icon: Plug,
    build: [
      "Public API foundation — authenticated read/write endpoints + API keys",
      "Integration-ready data model documented for Epicor & similar ERPs",
      "Hardening, bug fixes, and go-live readiness review",
    ],
    validate: [
      "Wehrung's team runs the full workflow end-to-end (UAT)",
      "Go / No-Go review and wrap-up of the pilot term",
    ],
  },
];

/* ------------------------------ Team ----------------------------------- */

const team = [
  { name: "Renan Maia", role: "Sales & Account Lead" },
  { name: "Vinicyus Froes", role: "Frontend Engineering" },
  { name: "Eliel Oliveira", role: "Backend Engineering" },
];

/* ------------------------------ Investment ------------------------------ */

const MONTHS = 4;
const TOTAL_FEE = 15000;
const MONTHLY_FEE = TOTAL_FEE / MONTHS;

const payments = roadmap.map((m, i) => ({
  month: m.month,
  milestone: m.title,
  amount: MONTHLY_FEE,
  due: i === 0 ? "Due at signing" : `Due at start of ${m.month.toLowerCase()}`,
}));

/* ------------------------------ Terms ----------------------------------- */

const terms = [
  {
    icon: CalendarClock,
    title: "Term & scope",
    body: "Fixed 4-month pilot term, structured around the roadmap above. Scope is limited to the items listed under \"What's included.\" Any additional features or third-party integrations are handled under a written change order or follow-on Statement of Work.",
  },
  {
    icon: Banknote,
    title: "Fees & payment",
    body: `A fixed total fee of ${currency(TOTAL_FEE)}, billed as ${MONTHS} equal monthly installments of ${currency(MONTHLY_FEE)}, due at the start of each month.`,
  },
  {
    icon: FileSignature,
    title: "Intellectual property",
    body: "Deckmetry retains ownership of the underlying platform, source code, and reusable components. Wehrung's retains ownership of its catalog, pricing, branding assets, and any customer data entered into the platform.",
  },
  {
    icon: ShieldCheck,
    title: "Confidentiality",
    body: "Both parties agree to keep confidential information shared during the engagement — including pricing, roadmap, and business data — confidential during the term and afterward, under a mutual NDA.",
  },
  {
    icon: Clock,
    title: "MVP disclaimer",
    body: "The platform is delivered as a working MVP under active development. Deckmetry will use commercially reasonable efforts to maintain availability and respond to issues; no formal SLA applies during the pilot term.",
  },
  {
    icon: XCircle,
    title: "Termination",
    body: "Either party may terminate this agreement for convenience with 30 days' written notice. Fees for work completed, or in progress and pro-rated, through the termination date remain payable.",
  },
];

/* ------------------------------ Page --------------------------------- */

export default function ProposalPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 print:p-0">

      {/* Letterhead */}
      <div className="mb-8 flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Hexagon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight">Deckmetry</div>
            <div className="text-xs text-muted-foreground">deckmetry.com</div>
          </div>
        </div>
        <PrintButton />
      </div>

      {/* Header */}
      <div className="mb-12">
        <Badge variant="secondary" className="mb-4">
          Pilot engagement · Commercial proposal
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Deckmetry Platform Pilot — Self-Estimate, BOM &amp; Approvals
        </h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          A 4-month pilot to put Deckmetry&apos;s self-estimate tool, an editable bill of
          materials, and an estimate request/approval workflow in front of Wehrung&apos;s
          customers — built and validated together, with the platform&apos;s data model and APIs
          designed from day one to connect with Wehrung&apos;s existing systems, including Epicor.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Prepared for
            </div>
            <div className="font-medium">Wehrung&apos;s (wehrungs.com)</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Prepared by
            </div>
            <div className="font-medium">Renan Maia · Deckmetry Sales</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Date</div>
            <div className="font-medium">{preparedDate}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Proposal validity
            </div>
            <div className="font-medium">30 days from date above</div>
          </div>
        </div>
      </div>

      {/* At a glance */}
      <section className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Clock, label: "Timeline", value: `${MONTHS} months` },
          { icon: CircleDollarSign, label: "Investment", value: currency(TOTAL_FEE) },
          { icon: Users, label: "Core team", value: "3 people" },
          { icon: FileSignature, label: "Engagement", value: "Pilot agreement" },
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

      {/* Scope */}
      <section className="mb-14">
        <h2 className="text-xl font-bold tracking-tight">What&apos;s included</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything below is delivered and validated within the 4-month pilot term.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
            <span className="text-sm font-semibold">Not included in this pilot</span>
          </div>
          <ul className="mt-3 space-y-1.5">
            {outOfScope.map((d) => (
              <li key={d} className="flex items-start gap-2 text-sm text-muted-foreground">
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Roadmap */}
      <section className="mb-16">
        <h2 className="text-xl font-bold tracking-tight">The 4-month roadmap</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each month carries a build track and a validation track in parallel. Month 4 is
          focused on validation but still carries significant build work to reach the API
          foundation.
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
                      <ListChecks className="h-4 w-4 text-muted-foreground" />
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
                      <FileCheck2 className="h-4 w-4 text-muted-foreground" />
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

      {/* Team */}
      <section className="mb-14">
        <h2 className="text-xl font-bold tracking-tight">Your Deckmetry team</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {team.map((m) => (
            <Card key={m.name}>
              <CardContent className="flex items-center gap-3 pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold leading-snug">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Investment */}
      <section className="mb-12 break-inside-avoid">
        <h2 className="text-xl font-bold tracking-tight">Investment &amp; payment schedule</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A fixed fee for the full pilot, billed in equal monthly installments.
        </p>

        <Card className="mt-6 break-inside-avoid">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 font-medium">Month</th>
                    <th className="pb-2 font-medium">Milestone</th>
                    <th className="pb-2 font-medium">Payment terms</th>
                    <th className="pb-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.month} className="border-b last:border-0">
                      <td className="py-2.5 whitespace-nowrap font-medium">{p.month}</td>
                      <td className="py-2.5 text-muted-foreground">{p.milestone}</td>
                      <td className="py-2.5 text-muted-foreground">{p.due}</td>
                      <td className="py-2.5 text-right tabular-nums">{currency(p.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="pt-3" colSpan={3}>
                      Total pilot investment
                    </td>
                    <td className="pt-3 text-right tabular-nums">{currency(TOTAL_FEE)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pilot agreement & protections */}
      <section className="mb-14 break-inside-avoid">
        <h2 className="text-xl font-bold tracking-tight">Pilot agreement &amp; protections</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Short-term commercial terms designed to give both Wehrung&apos;s and Deckmetry legal
          certainty during the pilot, ahead of any longer-term agreement.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {terms.map((t) => (
            <Card key={t.title} className="break-inside-avoid">
              <CardContent className="pt-6">
                <div className="mb-2 flex items-center gap-2">
                  <t.icon className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">{t.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{t.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-5 rounded-lg border bg-primary/5 border-primary/30 p-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Renewal &amp; next steps</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            At the end of the 4-month term, both parties will jointly review results and agree
            on either (a) a standard subscription under Deckmetry&apos;s published pricing, or
            (b) a new Statement of Work for continued development and integration work, such as
            a live Epicor connector.
          </p>
        </div>
      </section>

      {/* Acceptance */}
      <section className="mb-12 break-inside-avoid">
        <h2 className="text-xl font-bold tracking-tight">Acceptance</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          By signing below, both parties agree to the scope, timeline, and terms described in
          this proposal for the 4-month pilot engagement.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 text-sm font-semibold">For Deckmetry</div>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Name</div>
                  <div className="mt-1 border-b pb-1">Renan Maia</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Title</div>
                  <div className="mt-1 border-b pb-1">Sales &amp; Account Lead</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Signature</div>
                  <div className="mt-1 border-b pb-6" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Date</div>
                  <div className="mt-1 border-b pb-1">&nbsp;</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 text-sm font-semibold">For Wehrung&apos;s</div>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Name</div>
                  <div className="mt-1 border-b pb-1">&nbsp;</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Title</div>
                  <div className="mt-1 border-b pb-1">&nbsp;</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Signature</div>
                  <div className="mt-1 border-b pb-6" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Date</div>
                  <div className="mt-1 border-b pb-1">&nbsp;</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Note.</span> This proposal summarizes
            commercial terms for the pilot engagement. A short-form pilot agreement reflecting
            the terms above will be issued alongside this proposal for signature.
          </p>
        </div>
      </section>

      <div className="border-t pt-6 text-center text-xs text-muted-foreground">
        Deckmetry · Pilot proposal prepared for Wehrung&apos;s · {preparedDate}
      </div>
    </div>
  );
}
