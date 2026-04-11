"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { EstimateInput, WizardStep } from "@/lib/types";
import { WIZARD_STEPS } from "@/lib/store";
import {
  useWizardStore,
  useEstimate,
  useCurrentStepIndex,
} from "@/lib/stores/wizard-store";
import { useDrawingStore } from "@/lib/stores/drawing-store";
import type { DrawingLayers } from "@/lib/stores/drawing-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  Circle,
  Layers,
  Maximize2,
  Download,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JobInfoStep } from "./steps/job-info-step";
import { GeometryStep } from "./steps/geometry-step";
import { SurfaceStep } from "./steps/surface-step";
import { RailingStairsStep } from "./steps/railing-stairs-step";
import { AddOnsStep } from "./steps/add-ons-step";
import { ReviewStep } from "./steps/review-step";
import { DeckViews } from "./deck-views";

// Layer toggle controls
function LayerControls() {
  const layers = useDrawingStore((s) => s.layers);
  const setLayers = useDrawingStore((s) => s.setLayers);

  const layerConfig = [
    { key: "footings" as const, label: "Footings", color: "#6B8E7D" },
    { key: "framing" as const, label: "Framing", color: "#A8A39D" },
    { key: "decking" as const, label: "Decking", color: "#9B9590" },
    { key: "railing" as const, label: "Railing", color: "#7A6B5A" },
    { key: "lights" as const, label: "Lights", color: "#C9A227" },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {layerConfig.map(({ key, label, color }) => (
        <div key={key} className="flex items-center gap-1.5">
          <Switch
            id={`layer-${key}`}
            checked={layers[key]}
            onCheckedChange={(checked) =>
              setLayers((prev: DrawingLayers) => ({ ...prev, [key]: checked }))
            }
            className="scale-75"
          />
          <Label
            htmlFor={`layer-${key}`}
            className="text-[10px] font-medium cursor-pointer flex items-center gap-1"
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: color }}
            />
            {label}
          </Label>
        </div>
      ))}
    </div>
  );
}

export function WizardShell() {
  const currentStep = useWizardStore((s) => s.currentStep);
  const formData = useWizardStore((s) => s.formData);
  const goToStep = useWizardStore((s) => s.goToStep);
  const goNext = useWizardStore((s) => s.goNext);
  const goPrevious = useWizardStore((s) => s.goPrevious);
  const updateFormData = useWizardStore((s) => s.updateFormData);
  const setSource = useWizardStore((s) => s.setSource);
  const currentStepIndex = useCurrentStepIndex();
  const estimate = useEstimate();

  const layers = useDrawingStore((s) => s.layers);
  const isFullscreen = useDrawingStore((s) => s.isFullscreen);
  const setIsFullscreen = useDrawingStore((s) => s.setIsFullscreen);

  // Read URL params for supplier referral + project pre-population
  const searchParams = useSearchParams();
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setSource(`ref_${ref}`);
    }

    // Pre-populate from project data
    const projectName = searchParams.get("projectName");
    const projectAddress = searchParams.get("projectAddress");
    const startStep = searchParams.get("startStep") as WizardStep | null;

    const updates: Partial<EstimateInput> = {};
    if (projectName) updates.projectName = projectName;
    if (projectAddress) updates.projectAddress = projectAddress;

    if (Object.keys(updates).length > 0) {
      updateFormData(updates);
    }
    if (startStep && WIZARD_STEPS.some((s) => s.id === startStep)) {
      goToStep(startStep);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Download drawing as PNG
  const downloadPDF = async () => {
    const svgElement = document.getElementById(
      isFullscreen ? "deck-drawing-fullscreen" : "deck-drawing-main"
    );
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FAFAF8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `deck-plan-${formData.deckWidthFt}x${formData.deckProjectionFt}.png`;
        link.href = imgData;
        link.click();
      }
      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  };

  const renderStep = () => {
    switch (currentStep) {
      case "job-info":
        return <JobInfoStep />;
      case "geometry":
        return <GeometryStep />;
      case "surface":
        return <SurfaceStep />;
      case "railing-stairs":
        return <RailingStairsStep />;
      case "add-ons":
        return <AddOnsStep />;
      case "review":
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 print:hidden">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Hexagon className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-foreground">
                  Deckmetry
                </h1>
                <p className="text-[11px] text-muted-foreground">
                  Smart Deck Estimator
                </p>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            Step {currentStepIndex + 1} of {WIZARD_STEPS.length}
          </Badge>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 print:max-w-none print:px-0 print:py-0">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 print:block">
          {/* Left Column: Steps & Form - 70% */}
          <div className="lg:w-[68%] space-y-6 print:w-full print:max-w-none">
            {/* Step Progress */}
            <nav className="overflow-x-auto print:hidden">
              <ol className="flex min-w-max gap-2">
                {WIZARD_STEPS.map((step, index) => {
                  const isActive = step.id === currentStep;
                  const isComplete = index < currentStepIndex;
                  const isClickable = index <= currentStepIndex;

                  return (
                    <li key={step.id} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => isClickable && goToStep(step.id)}
                        disabled={!isClickable}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : isComplete
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                              : "bg-muted text-muted-foreground",
                          !isClickable && "cursor-not-allowed opacity-50"
                        )}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <span
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold",
                              isActive
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-muted-foreground/20 text-muted-foreground"
                            )}
                          >
                            {index + 1}
                          </span>
                        )}
                        <span className="hidden sm:inline">{step.label}</span>
                        <span className="sm:hidden">{step.shortLabel}</span>
                      </button>
                      {index < WIZARD_STEPS.length - 1 && (
                        <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground/50" />
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            {/* Form Content */}
            <div className="rounded-xl border bg-card p-6 shadow-sm print:rounded-none print:border-none print:shadow-none print:p-0">
              {renderStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between print:hidden">
              {currentStepIndex > 0 ? (
                <Button
                  variant="outline"
                  onClick={goPrevious}
                  className="border-2"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              ) : (
                <div />
              )}
              {currentStepIndex < WIZARD_STEPS.length - 1 ? (
                <Button
                  onClick={goNext}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* Right Column: Live Summary - 30% of screen */}
          <aside className="lg:sticky lg:top-24 lg:w-[30%] lg:min-w-[360px] lg:max-w-[480px] lg:self-start print:hidden">
            <div className="rounded-xl border-2 border-border bg-card shadow-sm overflow-hidden">
              {/* Summary Header */}
              <div className="bg-primary px-6 py-4">
                <h2 className="text-base font-semibold text-primary-foreground">
                  Project Summary
                </h2>
              </div>

              <div className="p-5 space-y-5">
                {/* Show empty state on first page before user has entered data */}
                {currentStep === "job-info" ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <Layers className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                      No Project Data Yet
                    </h3>
                    <p className="text-xs text-muted-foreground/70 max-w-[200px]">
                      Fill out the job information form to see your deck plan and
                      project summary.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Deck Drawing with Layers */}
                    <div className="bg-muted/20 rounded-lg border border-border overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border">
                        <div className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            Plan View
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={downloadPDF}
                            title="Download as PNG"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setIsFullscreen(true)}
                            title="Expand drawing"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-2" id="deck-drawing-main">
                        <DeckViews
                          formData={formData}
                          estimate={estimate}
                          layers={layers}
                        />
                      </div>
                      <div className="px-4 py-3 bg-muted/30 border-t border-border">
                        <LayerControls />
                      </div>
                    </div>

                    {/* Fullscreen Drawing Dialog - Full HD 1920x1080 */}
                    <Dialog
                      open={isFullscreen}
                      onOpenChange={setIsFullscreen}
                    >
                      <DialogContent className="flex flex-col !w-[1920px] !h-[1080px] !max-w-[1920px] !max-h-[1080px] p-6">
                        <DialogHeader className="flex-shrink-0">
                          <DialogTitle className="flex items-center justify-between">
                            <span className="text-lg">
                              Deck Views - {formData.deckWidthFt}&apos; x{" "}
                              {formData.deckProjectionFt}&apos;
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadPDF}
                                className="gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Download PNG
                              </Button>
                            </div>
                          </DialogTitle>
                          <DialogDescription>
                            Multi-page architectural drawings with toggleable
                            layers. Use the tabs to navigate between views.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 flex flex-col min-h-0 mt-4">
                          <div className="flex-1 flex flex-col bg-muted/20 rounded-lg border border-border overflow-hidden">
                            <div
                              className="flex-1 flex items-center justify-center p-6 min-h-0"
                              id="deck-drawing-fullscreen"
                            >
                              <DeckViews
                                formData={formData}
                                estimate={estimate}
                                layers={layers}
                                isFullscreen={true}
                              />
                            </div>
                            <div className="flex-shrink-0 px-6 py-4 bg-muted/30 border-t border-border">
                              <LayerControls />
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Deck Specs */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/40 rounded-lg p-3">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            Type
                          </p>
                          <p className="text-sm font-semibold capitalize mt-1">
                            {formData.deckType}
                          </p>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-3">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            Height
                          </p>
                          <p className="text-sm font-semibold mt-1">
                            {formData.deckHeightIn}&quot;
                          </p>
                        </div>
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-baseline justify-between">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            Total Area
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {estimate.derived.deckAreaSf}
                            <span className="text-sm font-normal text-muted-foreground ml-1">
                              sq ft
                            </span>
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formData.deckWidthFt}&apos; W x{" "}
                          {formData.deckProjectionFt}&apos; D @{" "}
                          {formData.joistSpacingIn}&quot; O.C.
                        </p>
                      </div>
                    </div>

                    {formData.deckingColor && (
                      <>
                        <hr className="border-border" />
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                Decking
                              </p>
                              <p className="text-sm font-semibold mt-1">
                                {formData.deckingColor}
                              </p>
                            </div>
                          </div>
                          {formData.pictureFrameEnabled && (
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                  Picture Frame
                                </p>
                                <p className="text-sm font-semibold mt-1">
                                  {formData.pictureFrameColor}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {estimate.warnings.length > 0 && (
                      <>
                        <hr className="border-border" />
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                          <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-2">
                            Warnings
                          </p>
                          <ul className="space-y-1">
                            {estimate.warnings.map((warning, index) => (
                              <li
                                key={index}
                                className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2"
                              >
                                <Circle className="h-1.5 w-1.5 mt-1.5 fill-current flex-shrink-0" />
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}

                    <hr className="border-border" />
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                        BOM Items
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {estimate.bom.length} items
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
