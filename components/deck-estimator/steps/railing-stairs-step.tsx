"use client";

import { useMemo } from "react";
import type { RailingMaterial, OpenSide, StairSection, StairLocation } from "@/lib/types";
import { useWizardStore, useEstimate } from "@/lib/stores/wizard-store";
import { railingSystems } from "@/lib/catalog";
import { generateStairId } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup, Field, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Fence, Palette, Square, ArrowDownToLine, AlertTriangle, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

// Railing material images
const RAILING_IMAGES: Record<string, { src: string; alt: string; description: string }> = {
  vinyl: {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rdi-deck-railing-systems-73018553-64_600.jpeg-1wI140C2D8GOFsAtUgMRdVk7Cab9KV.avif",
    alt: "RDI Finyl Line White Vinyl Railing with Black Round Spindles",
    description: "RDI Finyl Line - White with black round spindles",
  },
  composite: {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TrexTranscendrailsbrown-FxTjpQdeZFvH2wDfJRsg2UMzZXeLSt.jpg",
    alt: "Trex Transcend Composite Railing with Black Balusters",
    description: "Trex Transcend - Composite with metal balusters",
  },
  aluminum: {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sel-001-bk-hz-alum-railing-beauty-BKSAL2537PEND-BKSAL2543PEND__11077-ZhrerSWy3BCg0dryzjzyriDEspP589.jpg",
    alt: "Trex Select Black Aluminum Railing",
    description: "Trex Select - Black aluminum railing",
  },
  cable: {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/keylink-american-series-horizontal-cable-rail-level-1.jpeg-QEKeU2tUfiJQuUKHoigNrSDcJLKt2U.webp",
    alt: "Keylink American Series Horizontal Cable Railing",
    description: "Keylink - Horizontal cable railing",
  },
};

export function RailingStairsStep() {
  const formData = useWizardStore((s) => s.formData);
  const updateFormData = useWizardStore((s) => s.updateFormData);
  const estimate = useEstimate();
  const guardsRequired = estimate.derived.guardsRequired;
  // Get selected railing system
  const selectedSystem = useMemo(
    () => railingSystems.find((s) => s.material === formData.railingMaterial),
    [formData.railingMaterial]
  );

  // Calculate if railing is actually needed based on override or auto
  const railingNeeded =
    formData.railingRequiredOverride !== null
      ? formData.railingRequiredOverride
      : guardsRequired;

  // Handle material change - reset color
  const handleMaterialChange = (material: RailingMaterial) => {
    const system = railingSystems.find((s) => s.material === material);
    const firstColor = system?.colors[0];

    updateFormData({
      railingMaterial: material,
      railingColor: firstColor?.name || "",
    });
  };

  // Handle open side toggle
  const handleSideToggle = (side: OpenSide, checked: boolean) => {
    const newSides = checked
      ? [...formData.openSides, side]
      : formData.openSides.filter((s) => s !== side);

    updateFormData({ openSides: newSides });
  };

  // Add a new stair section
  const addStairSection = () => {
    const newStair: StairSection = {
      id: generateStairId(),
      location: "front",
      widthFt: 4,
      stepCount: Math.ceil(formData.deckHeightIn / 7.75),
    };
    updateFormData({
      stairSections: [...formData.stairSections, newStair],
    });
  };

  // Remove a stair section
  const removeStairSection = (id: string) => {
    updateFormData({
      stairSections: formData.stairSections.filter((s) => s.id !== id),
    });
  };

  // Update a stair section
  const updateStairSection = (id: string, updates: Partial<StairSection>) => {
    updateFormData({
      stairSections: formData.stairSections.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  };

  const availableSides: { id: OpenSide; label: string }[] = [
    { id: "left", label: "Left Side" },
    { id: "front", label: "Front" },
    { id: "right", label: "Right Side" },
    ...(formData.deckType === "freestanding"
      ? [{ id: "rear" as OpenSide, label: "Rear" }]
      : []),
  ];

  const stairLocations: { id: StairLocation; label: string }[] = [
    { id: "left", label: "Left Side" },
    { id: "front", label: "Front" },
    { id: "right", label: "Right Side" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Railing & Stairs</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure railing requirements and add stairs if needed.
        </p>
      </div>

      {/* Guard Requirement Notice */}
      {guardsRequired && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Guardrails are typically required for decks over 30&quot; above grade.
            Your deck height ({formData.deckHeightIn}&quot;) triggers this requirement.
          </AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field>
          <div className="flex items-center justify-between">
            <div>
              <FieldLabel className="mb-0 flex items-center gap-2">
                <Fence className="h-4 w-4 text-muted-foreground" />
                Include Railing
              </FieldLabel>
              <p className="text-xs text-muted-foreground">
                {guardsRequired
                  ? "Required based on deck height"
                  : "Optional for low decks"}
              </p>
            </div>
            <Switch
              checked={railingNeeded}
              onCheckedChange={(checked) =>
                updateFormData({ railingRequiredOverride: checked })
              }
            />
          </div>
        </Field>

        {railingNeeded && (
          <>
            <Field>
              <FieldLabel className="flex items-center gap-2">
                <Square className="h-4 w-4 text-muted-foreground" />
                Railing Material
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                {railingSystems.map((system) => {
                  const imageData = RAILING_IMAGES[system.material];
                  return (
                    <button
                      key={system.id}
                      type="button"
                      onClick={() =>
                        handleMaterialChange(system.material as RailingMaterial)
                      }
                      className={cn(
                        "rounded-lg border-2 overflow-hidden transition-all hover:bg-muted/50 flex flex-col",
                        formData.railingMaterial === system.material
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      {imageData && (
                        <div className="relative w-full aspect-square bg-muted">
                          <Image
                            src={imageData.src}
                            alt={imageData.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, 25vw"
                          />
                        </div>
                      )}
                      <div className="px-3 py-2 text-center">
                        <p className="text-sm font-medium capitalize">
                          {system.material}
                        </p>
                        {imageData && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {imageData.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field>
              <FieldLabel className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                Railing Color
              </FieldLabel>
              <Select
                value={formData.railingColor}
                onValueChange={(value) => updateFormData({ railingColor: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSystem?.colors.map((color) => (
                    <SelectItem key={color.name} value={color.name}>
                      {color.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <FieldSet>
              <FieldLegend>Open Sides (Select sides that need railing)</FieldLegend>
              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                {availableSides.map((side) => (
                  <Label
                    key={side.id}
                    htmlFor={`side-${side.id}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 transition-all hover:bg-muted/50",
                      formData.openSides.includes(side.id)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <Checkbox
                      id={`side-${side.id}`}
                      checked={formData.openSides.includes(side.id)}
                      onCheckedChange={(checked) =>
                        handleSideToggle(side.id, !!checked)
                      }
                    />
                    <span className="text-sm font-medium">{side.label}</span>
                  </Label>
                ))}
              </div>
              {formData.deckType === "attached" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Rear side (house) is not available for attached decks.
                </p>
              )}
            </FieldSet>
          </>
        )}
      </FieldGroup>

      <hr />

      {/* Stairs Section */}
      <FieldGroup>
        <div className="flex items-center justify-between">
          <div>
            <FieldLabel className="mb-0 flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
              Stair Sections
            </FieldLabel>
            <p className="text-xs text-muted-foreground">
              Add one or more stair sections to your deck
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addStairSection}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Stairs
          </Button>
        </div>

        {formData.stairSections.length === 0 && (
          <div className="rounded-lg border-2 border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No stairs configured. Click &quot;Add Stairs&quot; to add a stair section.
            </p>
          </div>
        )}

        {formData.stairSections.map((stair, index) => (
          <div
            key={stair.id}
            className="rounded-lg border bg-muted/30 p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Stair Section {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeStairSection(stair.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel>Location</FieldLabel>
                <Select
                  value={stair.location}
                  onValueChange={(value) =>
                    updateStairSection(stair.id, { location: value as StairLocation })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stairLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Width (ft)</FieldLabel>
                <Select
                  value={String(stair.widthFt)}
                  onValueChange={(value) =>
                    updateStairSection(stair.id, { widthFt: Number(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 8].map((width) => (
                      <SelectItem key={width} value={String(width)}>
                        {width}&apos; wide
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Number of Steps</FieldLabel>
                <Input
                  type="number"
                  min={2}
                  max={20}
                  value={stair.stepCount}
                  onChange={(e) =>
                    updateStairSection(stair.id, {
                      stepCount: Math.max(2, Math.min(20, Number(e.target.value) || 2)),
                    })
                  }
                />
              </Field>
            </div>

            <div className="text-xs text-muted-foreground bg-background rounded p-2">
              <strong>Stringers:</strong> {stair.widthFt + 1} (2x12) |{" "}
              <strong>Treads:</strong> {Math.max(0, stair.stepCount - 1)} |{" "}
              <strong>Risers:</strong> {stair.stepCount}
            </div>
          </div>
        ))}
      </FieldGroup>

      {/* Summary */}
      <div className="rounded-lg bg-secondary/50 p-4">
        <p className="text-sm font-medium">Configuration Summary</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {railingNeeded
            ? `${formData.railingColor} ${formData.railingMaterial} railing on ${formData.openSides.length} side(s)`
            : "No railing selected"}
          {formData.stairSections.length > 0 && (
            <>
              {" "}
              | {formData.stairSections.length} stair section(s)
            </>
          )}
        </p>
        {formData.stairSections.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Total stringers:{" "}
            {formData.stairSections.reduce((acc, s) => acc + s.widthFt + 1, 0)}
          </p>
        )}
      </div>
    </div>
  );
}
