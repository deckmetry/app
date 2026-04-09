"use client";

import type { EstimateInput, DeckType, JoistSpacing } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Home, Footprints, Ruler, MoveVertical, Grid3X3 } from "lucide-react";

interface GeometryStepProps {
  formData: EstimateInput;
  updateFormData: (updates: Partial<EstimateInput>) => void;
}

export function GeometryStep({ formData, updateFormData }: GeometryStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Deck Geometry</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Define the basic dimensions and configuration of your deck.
        </p>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel className="flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            Deck Type
          </FieldLabel>
          <RadioGroup
            value={formData.deckType}
            onValueChange={(value) =>
              updateFormData({ deckType: value as DeckType })
            }
            className="grid grid-cols-2 gap-4 pt-2"
          >
            <Label
              htmlFor="attached"
              className={cn(
                "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-muted/50",
                formData.deckType === "attached"
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <RadioGroupItem value="attached" id="attached" className="sr-only" />
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Home className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium">Attached</p>
                <p className="text-xs text-muted-foreground">
                  Connected to house with ledger
                </p>
              </div>
            </Label>

            <Label
              htmlFor="freestanding"
              className={cn(
                "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-muted/50",
                formData.deckType === "freestanding"
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <RadioGroupItem
                value="freestanding"
                id="freestanding"
                className="sr-only"
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Footprints className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium">Freestanding</p>
                <p className="text-xs text-muted-foreground">
                  Independent structure
                </p>
              </div>
            </Label>
          </RadioGroup>
        </Field>
      </FieldGroup>

      <hr />

      <FieldGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              Deck Width (ft)
            </FieldLabel>
            <Input
              type="number"
              min={4}
              max={30}
              value={formData.deckWidthFt}
              onChange={(e) =>
                updateFormData({ deckWidthFt: Number(e.target.value) })
              }
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Parallel to house (typically 8-24 ft)
            </p>
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              Deck Projection (ft)
            </FieldLabel>
            <Input
              type="number"
              min={4}
              max={20}
              value={formData.deckProjectionFt}
              onChange={(e) =>
                updateFormData({ deckProjectionFt: Number(e.target.value) })
              }
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Away from house (typically 8-18 ft)
            </p>
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-2">
              <MoveVertical className="h-4 w-4 text-muted-foreground" />
              Finished Deck Height (in)
            </FieldLabel>
            <Input
              type="number"
              min={6}
              max={120}
              value={formData.deckHeightIn}
              onChange={(e) =>
                updateFormData({ deckHeightIn: Number(e.target.value) })
              }
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Above grade to deck surface
            </p>
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              Joist Spacing
            </FieldLabel>
            <RadioGroup
              value={String(formData.joistSpacingIn)}
              onValueChange={(value) =>
                updateFormData({ joistSpacingIn: Number(value) as JoistSpacing })
              }
              className="flex gap-4 pt-2"
            >
              <Label
                htmlFor="joist-12"
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 transition-all hover:bg-muted/50",
                  formData.joistSpacingIn === 12
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
              >
                <RadioGroupItem value="12" id="joist-12" className="sr-only" />
                <span className="font-medium">12&quot; O.C.</span>
                <span className="text-xs text-muted-foreground">(Default)</span>
              </Label>

              <Label
                htmlFor="joist-16"
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 transition-all hover:bg-muted/50",
                  formData.joistSpacingIn === 16
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
              >
                <RadioGroupItem value="16" id="joist-16" className="sr-only" />
                <span className="font-medium">16&quot; O.C.</span>
              </Label>
            </RadioGroup>
            <p className="mt-1 text-xs text-muted-foreground">
              12&quot; recommended for composite decking
            </p>
          </Field>
        </div>
      </FieldGroup>

      {/* Area Preview */}
      <div className="rounded-xl bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Calculated Area</span>
          <span className="text-lg font-semibold">
            {formData.deckWidthFt * formData.deckProjectionFt} sq ft
          </span>
        </div>
      </div>
    </div>
  );
}
