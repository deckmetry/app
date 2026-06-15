// Deckmetry Smart Deck Estimator - Type Definitions

export type DeckType = "attached" | "freestanding";
export type JoistSpacing = 12 | 16;
export type RailingMaterial = "vinyl" | "composite" | "aluminum" | "cable";
export type OpenSide = "left" | "front" | "right" | "rear";
export type StairLocation = "left" | "front" | "right";

// Project scope — what a contractor is estimating. Drives which wizard steps show.
export type ProjectScope = "deck" | "roof" | "deck_roof";

// Roof estimator inputs (flat shape mirroring the roof tool UI; mapped to
// RoofInput in lib/roof-calculations.ts when the engine is called).
export interface RoofConfig {
  // Geometry
  roofType: "gable" | "shed";
  widthFt: number;
  lengthFt: number;
  pitch: number; // rise per 12
  attachment: "freestanding" | "attached";
  overhangLeftFt: number;
  overhangRightFt: number;
  overhangFrontFt: number;
  overhangRearFt: number;
  sheathingWasteSheets: number;
  // Roofing
  roofing: "asphalt" | "metal";
  underlaymentCoverageSqft: number;
  dripEdgeStockFt: number;
  valleyLengthFt: number;
  wallIntersectionFt: number;
  metalNotes: string;
  // Roof ceiling (ChamClad, always included)
  chamColor: string;
  panelCoverageFt: number;
  hChannelStockFt: number;
  // Optional
  includeGutters: boolean;
  includeRidgeVent: boolean;
  optionalNotes: string;
  // Fireplace (ventless, optional)
  includeFireplace: boolean;
  fpWidthFt: number;
  fpHeightFt: number;
  fpDepthFt: number;
  fpOpeningWidthFt: number;
  fpOpeningHeightFt: number;
  fpStoneSides: 0 | 1 | 2;
  fpStonePiece: "none" | "hearth" | "mantel" | "hearth_and_mantel";
  fpStoneBoxCoverageSqft: number | "";
  fpAdhesiveCoverageSqft: number;
}

export interface JurisdictionProfile {
  id: string;
  label: string;
  soilBearingPsf: number;
  frostDepthIn: number;
  defaultSonotubeLengthIn: number;
  coastalMode: boolean;
  bagYieldCf80: number;
  bagYieldCf60: number;
}

export interface DeckingColorOption {
  name: string;
  groovedLengthsFt: number[];
  solidLengthsFt: number[];
  fasciaOptions: ("1x8x12" | "1x12x12")[];
  hiddenFastenerSkuGroup: string;
  screwSkuGroup: string;
  plugSkuGroup: string;
}

export interface DeckingCollection {
  id: string;
  name: string;
  brand: "Trex" | "TimberTech" | "Deckorators";
  colors: DeckingColorOption[];
  boardFaceWidthIn: number;
  boardThicknessIn: number;
  notes?: string;
}

export interface DeckingBrand {
  id: string;
  name: "Trex" | "TimberTech" | "Deckorators";
  collections: DeckingCollection[];
}

export interface RailingSystemColor {
  name: string;
}

export interface RailingSystem {
  id: string;
  material: RailingMaterial;
  label: string;
  colors: RailingSystemColor[];
  levelSectionLengthsFt: number[];
  stairSectionLengthsFt: number[];
  levelPostHeightsIn: number[];
  stairPostHeightsIn: number[];
}

export interface StockCatalog {
  framingLengthsFt: number[];
  sonotubeDiametersIn: number[];
  transformerSizesW: number[];
}

// Stair section configuration
export interface StairSection {
  id: string;
  location: StairLocation;
  widthFt: number;
  stepCount: number;
}

export interface EstimateInput {
  // Scope — deck / roof / both
  scope: ProjectScope;

  // Job Info
  contractorName: string;
  email: string;
  phone: string;
  projectName: string;
  projectAddress: string;
  deliveryAddress: string;
  requestedDeliveryDate: string;

  // Deck Geometry
  deckType: DeckType;
  deckWidthFt: number;
  deckProjectionFt: number;
  deckHeightIn: number;
  joistSpacingIn: JoistSpacing;

  // Surface Selection
  deckingBrand: string;
  deckingCollection: string;
  deckingColor: string;
  pictureFrameEnabled: boolean;
  pictureFrameType: "single" | "double" | null;
  pictureFrameColor: string;  // Border 1 color
  pictureFrameColor2: string; // Border 2 color (double board only)

  // Railing + Stairs
  railingRequiredOverride: boolean | null;
  railingMaterial: RailingMaterial | "";
  railingColor: string;
  openSides: OpenSide[];
  stairSections: StairSection[];

  // Add-ons
  latticeSkirt: boolean;
  horizontalSkirt: boolean;
  postCapLights: boolean;
  stairLights: boolean;
  accentLights: boolean;

  // Roof (present when scope includes roof)
  roof?: RoofConfig;

  // Referral source (e.g. "ref_supplier-slug" → resolved to "supplier_<uuid>")
  source?: string | null;
}

export type BomCategory =
  | "foundation"
  | "framing"
  | "decking"
  | "fascia"
  | "fasteners"
  | "railing"
  | "add-ons"
  | "roof"
  | "other";

export interface BomItem {
  id: string;
  category: BomCategory;
  description: string;
  size?: string;
  quantity: number;
  unit: string;
  notes?: string;
  editable?: boolean;
  // Combined-BOM display fields (roof lines carry brand/color; section overrides
  // the category label used for grouping, e.g. "BEAM", "ROOF CEILING").
  section?: string;
  brand?: string;
  color?: string;
}

export interface DerivedValues {
  // Structural
  joistSize: string;
  joistCount: number;
  joistStockLengthFt: number;
  beamSize: string;
  postCountPerBeam: number;
  postSize: string;
  postStockLengthFt: number;
  
  // Foundation
  sonotubeDiameterIn: number;
  sonotubeDepthIn: number;
  sonotubeQty: number;
  concreteBags80: number;
  
  // Decking
  boardRows: number;
  groovedBoardsByLength: Record<number, number>;
  solidBoardsByLength: Record<number, number>;
  
  // Fasteners
  camoHiddenFastenerBuckets: number;
  screwBoxesForPictureFrame: number;
  plugBoxesForPictureFrame: number;
  
  // Fascia
  fascia1x8Count: number;
  fascia1x12Count: number;
  
  // Railing
  guardsRequired: boolean;
  levelRailLf: number;
  stairRailLf: number;
  levelSections6: number;
  levelSections8: number;
  stairSections6: number;
  stairSections8: number;
  levelPostCount: number;
  stairPostCount: number;
  
  // Stairs (per section totals)
  totalRiserCount: number;
  totalTreadCount: number;
  totalStringerCount: number;
  stringerStockLengthFt: number;
  
  // Lighting
  postCapLightQty: number;
  stairLightQty: number;
  accentLightQty: number;
  recommendedTransformerWatts: number;
  
  // Area
  deckAreaSf: number;
  exposedPerimeterFt: number;
}

export interface EstimateOutput {
  assumptions: string[];
  warnings: string[];
  bom: BomItem[];
  derived: DerivedValues;
}

export type WizardStep =
  | "job-info"
  | "geometry"
  | "surface"
  | "railing-stairs"
  | "add-ons"
  | "roof"
  | "review";
