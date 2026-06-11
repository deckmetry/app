import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PrintButton } from "./print-button";
import { PrintLetterhead } from "../_components/print-letterhead";
import {
  Hexagon,
  Building2,
  Landmark,
  ScrollText,
  FileCheck2,
  FileSignature,
  Banknote,
  Receipt,
  ShieldCheck,
  ListChecks,
  Handshake,
  Users,
  UserPlus,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Corporate & Legal Structuring Package | Deckmetry",
  description:
    "Internal planning checklist for incorporating Deckmetry as a Pennsylvania LLC, founder ownership & roles, and the contract framework for pilot customers.",
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

/* --------------------------- Formation steps --------------------------- */

const formationSteps = [
  {
    icon: Building2,
    label: "Choose & clear an entity name (e.g., \"Deckmetry LLC\" or closest available variant)",
  },
  {
    icon: Landmark,
    label: "File a Certificate of Organization with the PA Dept. of State, Bureau of Corporations & Charitable Organizations",
  },
  {
    icon: ScrollText,
    label: "Appoint a registered office or commercial registered agent in Pennsylvania",
  },
  {
    icon: FileCheck2,
    label: "Apply for an EIN with the IRS (Form SS-4 — free, online)",
  },
  {
    icon: FileSignature,
    label: "Draft & execute an Operating Agreement — ownership %, roles, governance, future-member admission",
  },
  {
    icon: Banknote,
    label: "Open a business bank account in the LLC's name",
  },
  {
    icon: Receipt,
    label: "Register for PA tax accounts as applicable (sales/use tax, local business privilege tax)",
  },
];

/* ----------------------------- Ownership -------------------------------- */

const members = [
  {
    name: "Vinicyus Froes",
    role: "Co-Founder — Product & Frontend",
    status: "Founding member — equity % to be defined in the Operating Agreement",
  },
  {
    name: "Renan Maia",
    role: "Co-Founder — Sales & Business Development",
    status: "Founding member — equity % to be defined in the Operating Agreement",
  },
  {
    name: "Eliel Oliveira",
    role: "Backend Engineering",
    status: "Future member — admission planned for a subsequent phase",
  },
];

/* --------------------------- Contract framework -------------------------- */

const contractFramework = [
  {
    icon: Handshake,
    label: "Master Service Agreement (MSA) — governing terms: IP ownership, confidentiality, liability, termination",
  },
  {
    icon: FileCheck2,
    label: "Order Form / Statement of Work (SOW) — per-engagement scope, fees & timeline",
  },
  {
    icon: ShieldCheck,
    label: "Mutual Non-Disclosure Agreement (NDA)",
  },
  {
    icon: ListChecks,
    label: "Standard clause checklist — IP split, confidentiality, MVP/liability disclaimer, termination notice, payment terms, change orders",
  },
];

/* ------------------------------- Costs ----------------------------------- */

type CostRow = {
  item: string;
  note: string;
  cost: string;
};

const oneTimeCosts: CostRow[] = [
  {
    item: "PA Certificate of Organization",
    note: "Filed with the PA Dept. of State, Bureau of Corporations & Charitable Organizations",
    cost: currency(125),
  },
  {
    item: "EIN (IRS Form SS-4)",
    note: "Applied for directly with the IRS",
    cost: currency(0),
  },
  {
    item: "Operating Agreement",
    note: "Equity, governance & future-member admission — template + attorney review",
    cost: `${currency(500)} – ${currency(1500)}`,
  },
  {
    item: "Client contract pack",
    note: "MSA + SOW template + mutual NDA — attorney review recommended",
    cost: `${currency(1000)} – ${currency(2000)}`,
  },
];

const oneTimeLow = 125 + 0 + 500 + 1000;
const oneTimeHigh = 125 + 0 + 1500 + 2000;

const ongoingCosts: CostRow[] = [
  {
    item: "Registered agent (PA)",
    note: "Needed if founders don't have a PA business address",
    cost: `${currency(100)} – ${currency(150)} / yr`,
  },
];

/* ------------------------------- Page ------------------------------------ */

export default function LegalStructurePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 print:pt-16 print:pb-10">
      <PrintLetterhead title="Legal Structuring Package" date={preparedDate} />

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
          Internal · Founders&apos; planning document
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Corporate &amp; Legal Structuring Package
        </h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          A planning checklist to incorporate Deckmetry as a Pennsylvania LLC, formalize founder
          ownership and roles, and stand up the contract framework needed to sign paying pilot
          customers such as Wehrung&apos;s with proper legal protection for both sides.
        </p>
        <div className="mt-4 text-xs text-muted-foreground">Prepared {preparedDate}</div>
      </div>

      {/* At a glance */}
      <section className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Building2, label: "Entity type", value: "LLC (Pennsylvania)" },
          { icon: Users, label: "Founding members", value: "2" },
          { icon: UserPlus, label: "Future member", value: "1 (Backend)" },
          { icon: Clock, label: "Status", value: "Pre-formation" },
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

      {/* Formation checklist */}
      <section className="mb-14">
        <h2 className="text-xl font-bold tracking-tight">Entity formation checklist</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Steps to register Deckmetry as an LLC in Pennsylvania and get it ready to sign and bill
          customers.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {formationSteps.map((item, i) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-lg border bg-card p-3"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {i + 1}
              </div>
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Ownership & roles */}
      <section className="mb-14">
        <h2 className="text-xl font-bold tracking-tight">Ownership &amp; roles (initial structure)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Deckmetry forms with two founding members; a third member is added in a later phase.
        </p>

        <Card className="mt-6 break-inside-avoid">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 font-medium">Member</th>
                    <th className="pb-2 font-medium">Role</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.name} className="border-b last:border-0 align-top">
                      <td className="py-2.5 whitespace-nowrap font-medium">{m.name}</td>
                      <td className="py-2.5 text-muted-foreground">{m.role}</td>
                      <td className="py-2.5 text-muted-foreground">{m.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-5 rounded-lg border border-dashed bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">To decide before formation.</span> The
            equity split between Vinicyus and Renan, and the mechanism for admitting Eliel as a
            member (e.g., a vesting schedule for a new membership interest), should be agreed by
            the founders and documented in the Operating Agreement before the LLC is used as the
            contracting party for client agreements such as the Wehrung&apos;s pilot.
          </p>
        </div>
      </section>

      {/* IP assignment */}
      <section className="mb-14">
        <Card className="border-primary/30 bg-primary/5 break-inside-avoid">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold tracking-tight">Founder &amp; contributor IP assignment</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Each founder and contributor — including anyone working on the platform before the
              LLC is formed — assigns to Deckmetry LLC all intellectual property created in
              connection with the platform: code, designs, content, and documentation. This is
              typically a Founder/Contributor IP Assignment Agreement bundled with, or referenced
              by, the Operating Agreement, and protects the company&apos;s ownership of the
              codebase underlying client engagements such as the Wehrung&apos;s pilot.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Client contract framework */}
      <section className="mb-14">
        <h2 className="text-xl font-bold tracking-tight">Client contract framework</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The standard agreement set used for pilot customers — this underlies the{" "}
          <span className="font-medium text-foreground">Wehrung&apos;s pilot proposal</span> and
          should be reused as the template for future pilot customers.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {contractFramework.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-lg border bg-card p-3"
            >
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Costs */}
      <section className="mb-12">
        <h2 className="text-xl font-bold tracking-tight">Estimated setup costs &amp; timeline</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Approximate figures for budgeting — confirm current government fees and get attorney
          quotes before committing.
        </p>

        <Card className="mt-6 break-inside-avoid">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">One-time setup</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 font-medium">Notes</th>
                    <th className="pb-2 text-right font-medium">Estimated cost</th>
                  </tr>
                </thead>
                <tbody>
                  {oneTimeCosts.map((r) => (
                    <tr key={r.item} className="border-b last:border-0">
                      <td className="py-2.5 whitespace-nowrap font-medium">{r.item}</td>
                      <td className="py-2.5 text-muted-foreground">{r.note}</td>
                      <td className="py-2.5 text-right tabular-nums whitespace-nowrap">{r.cost}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="pt-3" colSpan={2}>
                      Estimated one-time total
                    </td>
                    <td className="pt-3 text-right tabular-nums whitespace-nowrap">
                      {currency(oneTimeLow)} – {currency(oneTimeHigh)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-5 break-inside-avoid">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Ongoing</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 font-medium">Notes</th>
                    <th className="pb-2 text-right font-medium">Estimated cost</th>
                  </tr>
                </thead>
                <tbody>
                  {ongoingCosts.map((r) => (
                    <tr key={r.item} className="border-b last:border-0">
                      <td className="py-2.5 whitespace-nowrap font-medium">{r.item}</td>
                      <td className="py-2.5 text-muted-foreground">{r.note}</td>
                      <td className="py-2.5 text-right tabular-nums whitespace-nowrap">{r.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Not legal advice.</span> This page is a
            planning checklist for Deckmetry&apos;s founders. Confirm current PA Department of
            State and IRS fees, and engage a licensed Pennsylvania attorney and accountant to
            finalize entity formation, the Operating Agreement, and client contract templates
            before relying on them or signing customer agreements (including the Wehrung&apos;s
            pilot proposal).
          </p>
        </div>
      </section>

      <footer className="border-t pt-6 text-center text-xs text-muted-foreground">
        Deckmetry · Internal legal structuring package · {preparedDate}
      </footer>
    </div>
  );
}
