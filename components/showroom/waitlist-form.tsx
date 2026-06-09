"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

export function WaitlistForm({
  type,
  buttonLabel,
}: {
  type: "contractor_waitlist" | "supplier_waitlist";
  buttonLabel: string;
}) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const valid = name.trim() && company.trim() && email.trim();

  const submit = () => {
    const entry = {
      type,
      name,
      company_name: company,
      email,
      phone,
      created_date: new Date().toISOString(),
      status: "New Waitlist Lead",
    };
    fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).catch(() => {});
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
        <CheckCircle2 className="h-6 w-6 shrink-0" />
        <p className="text-sm font-medium">
          Thanks — we&apos;ll notify you when access becomes available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label>Company name *</Label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label>Email *</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label>Phone (optional)</Label>
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" />
        </div>
      </div>
      <Button size="lg" className="w-full sm:w-auto px-8" disabled={!valid} onClick={submit}>
        {buttonLabel}
      </Button>
    </div>
  );
}
