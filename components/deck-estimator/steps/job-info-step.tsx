"use client";

import { useWizardStore } from "@/lib/stores/wizard-store";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { ProjectScope } from "@/lib/types";
import { User, Mail, Phone, MapPin, Square, Triangle, Layers, CheckCircle2 } from "lucide-react";

const SCOPE_OPTIONS: { id: ProjectScope; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "deck", title: "Deck only", desc: "Framing, decking, railing", icon: Square },
  { id: "roof", title: "Roof only", desc: "Pavilion / porch cover", icon: Triangle },
  { id: "deck_roof", title: "Deck + Roof", desc: "One combined material list", icon: Layers },
];

export function JobInfoStep() {
  const formData = useWizardStore((s) => s.formData);
  const updateFormData = useWizardStore((s) => s.updateFormData);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Job Information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Start a new project: choose what you&apos;re estimating, then tell us where it&apos;s being built.
        </p>
      </div>

      {/* Project scope — drives which estimator sections show */}
      <div>
        <FieldLabel className="mb-2 block">What are you estimating?</FieldLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SCOPE_OPTIONS.map((opt) => {
            const active = formData.scope === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateFormData({ scope: opt.id })}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3 text-left transition-all",
                  active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/50"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                  {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </div>
                <div className="font-semibold">{opt.title}</div>
                <div className="text-xs text-muted-foreground">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <hr />

      <FieldGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Full Name
            </FieldLabel>
            <Input
              placeholder="Jane Smith"
              value={formData.contractorName}
              onChange={(e) => updateFormData({ contractorName: e.target.value })}
              required
            />
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Address
            </FieldLabel>
            <Input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              required
            />
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone Number
            </FieldLabel>
            <Input
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              required
            />
          </Field>

          <Field>
            <FieldLabel>Project Name</FieldLabel>
            <Input
              placeholder="e.g., Backyard Deck"
              value={formData.projectName}
              onChange={(e) => updateFormData({ projectName: e.target.value })}
              required
            />
          </Field>
        </div>
      </FieldGroup>

      <hr />

      <FieldGroup>
        <Field>
          <FieldLabel className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Project Address
          </FieldLabel>
          <AddressAutocomplete
            value={formData.projectAddress}
            onChange={(val) => updateFormData({ projectAddress: val })}
            placeholder="123 Main St, City, State ZIP"
            required
          />
        </Field>

      </FieldGroup>
    </div>
  );
}
