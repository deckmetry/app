// Deckmetry Smart Deck Estimator - Form State Store

import type { EstimateInput, ProjectScope, RoofConfig, WizardStep } from "./types";

export const DEFAULT_ROOF_CONFIG: RoofConfig = {
  roofType: "gable",
  widthFt: 24,
  lengthFt: 16,
  pitch: 6,
  attachment: "freestanding",
  overhangLeftFt: 1,
  overhangRightFt: 1,
  overhangFrontFt: 1,
  overhangRearFt: 0,
  sheathingWasteSheets: 4,
  roofing: "asphalt",
  underlaymentCoverageSqft: 1000,
  dripEdgeStockFt: 10,
  valleyLengthFt: 0,
  wallIntersectionFt: 0,
  metalNotes: "",
  chamColor: "Atlantic White",
  panelCoverageFt: 1,
  hChannelStockFt: 12,
  includeGutters: false,
  includeRidgeVent: false,
  optionalNotes: "",
  includeFireplace: false,
  fpWidthFt: 6,
  fpHeightFt: 8,
  fpDepthFt: 2,
  fpOpeningWidthFt: 3,
  fpOpeningHeightFt: 2,
  fpStoneSides: 2,
  fpStonePiece: "none",
  fpStoneBoxCoverageSqft: "",
  fpAdhesiveCoverageSqft: 75,
};

export const initialFormState: EstimateInput = {
  // Scope
  scope: "deck",

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
  pictureFrameEnabled: false,
  pictureFrameType: null,
  pictureFrameColor: "Honey Grove",
  pictureFrameColor2: "Honey Grove",

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
  roof: DEFAULT_ROOF_CONFIG,
};

type WizardStepDef = { id: WizardStep; label: string; shortLabel: string };

// Master ordered list — Job Info first, deck steps, roof, then review.
export const WIZARD_STEPS: WizardStepDef[] = [
  { id: "job-info", label: "Job Information", shortLabel: "Job Info" },
  { id: "geometry", label: "Deck Geometry", shortLabel: "Geometry" },
  { id: "surface", label: "Surface Selection", shortLabel: "Surface" },
  { id: "railing-stairs", label: "Railing & Stairs", shortLabel: "Railing" },
  { id: "add-ons", label: "Add-ons", shortLabel: "Add-ons" },
  { id: "roof", label: "Roof", shortLabel: "Roof" },
  { id: "review", label: "Review & BOM", shortLabel: "Review" },
];

const DECK_STEPS: WizardStep[] = ["geometry", "surface", "railing-stairs", "add-ons"];

/** Steps visible for a given project scope, in order. */
export function getStepsForScope(scope: ProjectScope): WizardStepDef[] {
  const includeDeck = scope === "deck" || scope === "deck_roof";
  const includeRoof = scope === "roof" || scope === "deck_roof";
  return WIZARD_STEPS.filter((s) => {
    if (s.id === "job-info" || s.id === "review") return true;
    if (s.id === "roof") return includeRoof;
    if (DECK_STEPS.includes(s.id)) return includeDeck;
    return true;
  });
}

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
