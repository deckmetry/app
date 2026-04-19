"use client";

import { useWizardStore } from "@/lib/stores/wizard-store";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { User, Mail, Phone, MapPin } from "lucide-react";

export function JobInfoStep() {
  const formData = useWizardStore((s) => s.formData);
  const updateFormData = useWizardStore((s) => s.updateFormData);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Job Information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us a bit about yourself and where the deck will be built.
        </p>
      </div>

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
