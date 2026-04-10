"use client";

import type { EstimateInput } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Grid2X2, Sun, Lightbulb, AlertTriangle } from "lucide-react";

interface AddOnsStepProps {
  formData: EstimateInput;
  updateFormData: (updates: Partial<EstimateInput>) => void;
}

export function AddOnsStep({ formData, updateFormData }: AddOnsStepProps) {
  // Show warning if both skirt options selected
  const bothSkirtsSelected = formData.latticeSkirt && formData.horizontalSkirt;

  // Calculate if lighting is selected
  const hasLighting =
    formData.postCapLights || formData.stairLights || formData.accentLights;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Add-ons</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional additions for your deck project including skirting and lighting.
        </p>
      </div>

      {/* Skirting Section */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Grid2X2 className="h-4 w-4" />
          Skirting Options
        </h3>

        {bothSkirtsSelected && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please select only one skirting option. Both lattice and horizontal
              skirt cannot be installed together.
            </AlertDescription>
          </Alert>
        )}

        <FieldGroup>
          <Field>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FieldLabel className="mb-0">Lattice Skirt</FieldLabel>
                <p className="text-xs text-muted-foreground">
                  Traditional lattice panels to enclose the underside of the deck
                </p>
              </div>
              <Switch
                checked={formData.latticeSkirt}
                onCheckedChange={(checked) => {
                  updateFormData({
                    latticeSkirt: checked,
                    horizontalSkirt: checked ? false : formData.horizontalSkirt,
                  });
                }}
              />
            </div>
          </Field>

          <Field>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FieldLabel className="mb-0">Horizontal Skirt</FieldLabel>
                <p className="text-xs text-muted-foreground">
                  Modern horizontal deck boards to match your decking color
                </p>
              </div>
              <Switch
                checked={formData.horizontalSkirt}
                onCheckedChange={(checked) => {
                  updateFormData({
                    horizontalSkirt: checked,
                    latticeSkirt: checked ? false : formData.latticeSkirt,
                  });
                }}
              />
            </div>
          </Field>
        </FieldGroup>
      </div>

      <hr />

      {/* Lighting Section */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Sun className="h-4 w-4" />
          Low-Voltage Lighting
        </h3>

        <FieldGroup>
          <Field>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Lightbulb className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <FieldLabel className="mb-0">Post Cap Lights</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Decorative lights on top of each railing post
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.postCapLights}
                onCheckedChange={(checked) =>
                  updateFormData({ postCapLights: checked })
                }
              />
            </div>
          </Field>

          <Field>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Lightbulb className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <FieldLabel className="mb-0">Stair Lights</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Riser-mounted lights for safe stair navigation
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.stairLights}
                onCheckedChange={(checked) =>
                  updateFormData({ stairLights: checked })
                }
                disabled={formData.stairCount === 0}
              />
            </div>
            {formData.stairCount === 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Add stairs to enable stair lights
              </p>
            )}
          </Field>

          <Field>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Lightbulb className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <FieldLabel className="mb-0">Perimeter Accent Lights</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Accent lighting along the deck perimeter (1 per 6&apos;)
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.accentLights}
                onCheckedChange={(checked) =>
                  updateFormData({ accentLights: checked })
                }
              />
            </div>
          </Field>
        </FieldGroup>

        {hasLighting && (
          <div className="mt-4 rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> A low-voltage transformer and wire kit will be
              automatically included in your BOM based on total wattage requirements.
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-muted/50 p-4">
        <p className="text-sm font-medium">Selected Add-ons</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {[
            formData.latticeSkirt && "Lattice Skirt",
            formData.horizontalSkirt && "Horizontal Skirt",
            formData.postCapLights && "Post Cap Lights",
            formData.stairLights && "Stair Lights",
            formData.accentLights && "Accent Lights",
          ]
            .filter(Boolean)
            .join(", ") || "No add-ons selected"}
        </p>
      </div>
    </div>
  );
}
