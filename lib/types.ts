// Deckmetry Smart Deck Estimator - Type Definitions

export type DeckType = "attached" | "freestanding";
export type JoistSpacing = 12 | 16;
export type RailingMaterial = "vinyl" | "composite" | "aluminum" | "cable";
export type OpenSide = "left" | "front" | "right" | "rear";
export type StairLocation = "left" | "front" | "right";

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
  pictureFrameColor: string; // Can be same or different from main deck
  pictureFrameEnabled: boolean;

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

  // Referral source (e.g. "ref_supplier-slug" → resolved to "supplier_<uuid>")
  source?: string | null;
}

export interface BomItem {
  id: string;
  category: "foundation" | "framing" | "decking" | "fascia" | "fasteners" | "railing" | "add-ons";
  description: string;
  size?: string;
  quantity: number;
  unit: string;
  notes?: string;
  editable?: boolean;
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
  | "review";
