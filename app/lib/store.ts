// Deckmetry Smart Deck Estimator - Form State Store

import type { EstimateInput, WizardStep } from "./types";

export const initialFormState: EstimateInput = {
  // Job Info
  contractorName: "",
  email: "",
  phone: "",
  projectName: "",
  projectAddress: "",
  deliveryAddress: "",
  requestedDeliveryDate: "",

  // Deck Geometry
  deckType: "attached",
  deckWidthFt: 16,
  deckProjectionFt: 12,
  deckHeightIn: 36,
  joistSpacingIn: 12,

  // Surface Selection
  deckingBrand: "trex",
  deckingCollection: "trex-enhance",
  deckingColor: "Honey Grove",
  pictureFrameColor: "Honey Grove",
  pictureFrameEnabled: true,

  // Railing + Stairs
  railingRequiredOverride: null,
  railingMaterial: "composite",
  railingColor: "White",
  openSides: ["left", "front", "right"],
  stairSections: [],

  // Add-ons
  latticeSkirt: false,
  horizontalSkirt: false,
  postCapLights: false,
  stairLights: false,
  accentLights: false,
};

export const WIZARD_STEPS: { id: WizardStep; label: string; shortLabel: string }[] = [
  { id: "job-info", label: "Job Information", shortLabel: "Job Info" },
  { id: "geometry", label: "Deck Geometry", shortLabel: "Geometry" },
  { id: "surface", label: "Surface Selection", shortLabel: "Surface" },
  { id: "railing-stairs", label: "Railing & Stairs", shortLabel: "Railing" },
  { id: "add-ons", label: "Add-ons", shortLabel: "Add-ons" },
  { id: "review", label: "Review & BOM", shortLabel: "Review" },
];

export function getStepIndex(step: WizardStep): number {
  return WIZARD_STEPS.findIndex((s) => s.id === step);
}

export function getNextStep(currentStep: WizardStep): WizardStep | null {
  const currentIndex = getStepIndex(currentStep);
  if (currentIndex < WIZARD_STEPS.length - 1) {
    return WIZARD_STEPS[currentIndex + 1].id;
  }
  return null;
}

export function getPreviousStep(currentStep: WizardStep): WizardStep | null {
  const currentIndex = getStepIndex(currentStep);
  if (currentIndex > 0) {
    return WIZARD_STEPS[currentIndex - 1].id;
  }
  return null;
}

// Generate unique ID for stair sections
export function generateStairId(): string {
  return `stair-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
