"use client";

import type { EstimateInput } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { User, Mail, Phone, MapPin, Truck, Calendar } from "lucide-react";

interface JobInfoStepProps {
  formData: EstimateInput;
  updateFormData: (updates: Partial<EstimateInput>) => void;
}

export function JobInfoStep({ formData, updateFormData }: JobInfoStepProps) {
  // Calculate minimum date (48 hours from now)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Job Information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the contractor and project details for this estimate.
        </p>
      </div>

      <FieldGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Contractor / Company
            </FieldLabel>
            <Input
              placeholder="Enter contractor or company name"
              value={formData.contractorName}
              onChange={(e) => updateFormData({ contractorName: e.target.value })}
            />
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Address
            </FieldLabel>
            <Input
              type="email"
              placeholder="contractor@example.com"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
            />
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone Number
              <span className="text-muted-foreground">(Optional)</span>
            </FieldLabel>
            <Input
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
            />
          </Field>

          <Field>
            <FieldLabel>
              Project Name
              <span className="text-muted-foreground ml-1">(Optional)</span>
            </FieldLabel>
            <Input
              placeholder="e.g., Smith Residence Deck"
              value={formData.projectName}
              onChange={(e) => updateFormData({ projectName: e.target.value })}
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
          <Input
            placeholder="123 Main St, City, State ZIP"
            value={formData.projectAddress}
            onChange={(e) => updateFormData({ projectAddress: e.target.value })}
          />
        </Field>

        <Field>
          <FieldLabel className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            Delivery Address
          </FieldLabel>
          <p className="text-xs text-muted-foreground mb-2">
            If different from Project Address
          </p>
          <Input
            placeholder="Leave blank if same as project address"
            value={formData.deliveryAddress}
            onChange={(e) => updateFormData({ deliveryAddress: e.target.value })}
          />
        </Field>

        <Field>
          <FieldLabel className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Requested Delivery Date
          </FieldLabel>
          <p className="text-xs text-muted-foreground mb-2">
            Minimum 48 hours lead time required
          </p>
          <Input
            type="date"
            min={minDateStr}
            value={formData.requestedDeliveryDate}
            onChange={(e) =>
              updateFormData({ requestedDeliveryDate: e.target.value })
            }
          />
        </Field>
      </FieldGroup>
    </div>
  );
}
