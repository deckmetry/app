// Deckmetry Smart Deck Estimator - Calculation Engine

import type {
  EstimateInput,
  EstimateOutput,
  BomItem,
  DerivedValues,
  JoistSpacing,
  DeckingCollection,
  StairSection,
} from "./types";
import {
  stockCatalog,
  joistSpanLookup,
  beamSpanLookup,
  jurisdictionProfile,
  deckingBrands,
  wasteFactors,
  lightingDefaults,
} from "./catalog";

// Helper: Get next available stock length
export function nextStockLength(
  requiredFt: number,
  stock: number[] = stockCatalog.framingLengthsFt
): number {
  for (const length of stock) {
    if (length >= requiredFt) return length;
  }
  return stock[stock.length - 1];
}

// Helper: Get next available sonotube diameter
export function nextAvailableTube(
  requiredIn: number,
  stock: number[] = stockCatalog.sonotubeDiametersIn
): number {
  for (const diameter of stock) {
    if (diameter >= requiredIn) return diameter;
  }
  return stock[stock.length - 1];
}

// Helper: Bucket joist span to lookup table key
export function bucketJoistSpan(
  spanFt: number
): 6 | 8 | 10 | 12 | 14 | 16 | 18 {
  if (spanFt <= 6) return 6;
  if (spanFt <= 8) return 8;
  if (spanFt <= 10) return 10;
  if (spanFt <= 12) return 12;
  if (spanFt <= 14) return 14;
  if (spanFt <= 16) return 16;
  return 18;
}

// Helper: Select joist size based on span and spacing
export function selectJoistSize(
  spanFt: number,
  spacingIn: JoistSpacing
): string {
  const spans = joistSpanLookup[spacingIn];
  const sizes = ["2x6", "2x8", "2x10", "2x12"];

  for (const size of sizes) {
    if (spans[size] >= spanFt) return size;
  }
  return "2x12"; // Default to largest if none qualify
}

// Helper: Select beam size based on joist span bucket
export function selectBeamSize(
  bucket: 6 | 8 | 10 | 12 | 14 | 16 | 18,
  requiredSpanFt: number
): string {
  const spans = beamSpanLookup[bucket];
  const sizes = ["3-2x8", "3-2x10", "3-2x12"];

  for (const size of sizes) {
    if (spans[size] >= requiredSpanFt) return size;
  }
  return "3-2x12";
}

// Helper: Get joist depth in inches from size string
function getJoistDepthIn(joistSize: string): number {
  const match = joistSize.match(/2x(\d+)/);
  return match ? parseInt(match[1]) : 8;
}

// Helper: Get beam depth in inches from size string
function getBeamDepthIn(beamSize: string): number {
  const match = beamSize.match(/2x(\d+)/);
  return match ? parseInt(match[1]) : 10;
}

// Helper: Optimize decking row coverage
export function optimizeDeckRow(
  rowFt: number,
  allowedLengthsFt: number[]
): { lengths: Record<number, number>; wasteFt: number } {
  const sorted = [...allowedLengthsFt].sort((a, b) => b - a);
  const result: Record<number, number> = {};
  let remaining = rowFt;

  // Simple greedy approach - prefer longer boards
  for (const length of sorted) {
    while (remaining > 0 && length <= remaining + 2) {
      // Allow 2ft overhang max
      result[length] = (result[length] || 0) + 1;
      remaining -= length;
    }
  }

  // If we still have remaining, add smallest board
  if (remaining > 0) {
    const smallest = sorted[sorted.length - 1];
    result[smallest] = (result[smallest] || 0) + 1;
    remaining -= smallest;
  }

  const totalUsed = Object.entries(result).reduce(
    (sum, [len, count]) => sum + Number(len) * count,
    0
  );
  const wasteFt = Math.max(0, totalUsed - rowFt);

  return { lengths: result, wasteFt };
}

// Helper: Choose rail sections for a single run - prefer fewer sections (8' over 6')
// For a 14' run: (2) 8' = 16' is better than (3) 6' = 18' - fewer posts
export function chooseRailSectionsForRun(
  runFt: number,
  allowed: number[] = [6, 8]
): { sections: Record<number, number>; totalSections: number; wasteFt: number } {
  // Try different combinations and pick the one with fewest total sections
  const sorted = [...allowed].sort((a, b) => b - a); // [8, 6]
  
  let bestResult: Record<number, number> = {};
  let bestTotalSections = Infinity;
  let bestWaste = Infinity;
  
  // Try using mostly 8' first
  for (let num8 = Math.ceil(runFt / 8); num8 >= 0; num8--) {
    const covered8 = num8 * 8;
    const remaining = runFt - covered8;
    
    if (remaining <= 0 && num8 > 0) {
      // All 8' covers it
      const totalSections = num8;
      const waste = covered8 - runFt;
      if (totalSections < bestTotalSections || (totalSections === bestTotalSections && waste < bestWaste)) {
        bestResult = { 8: num8 };
        bestTotalSections = totalSections;
        bestWaste = waste;
      }
    } else if (remaining > 0) {
      // Need some 6' sections
      const num6 = Math.ceil(remaining / 6);
      const covered6 = num6 * 6;
      const totalCovered = covered8 + covered6;
      const totalSections = num8 + num6;
      const waste = totalCovered - runFt;
      
      if (totalSections < bestTotalSections || (totalSections === bestTotalSections && waste < bestWaste)) {
        bestResult = {};
        if (num8 > 0) bestResult[8] = num8;
        if (num6 > 0) bestResult[6] = num6;
        bestTotalSections = totalSections;
        bestWaste = waste;
      }
    }
  }
  
  // Ensure we have at least some result
  if (bestTotalSections === Infinity) {
    const num6 = Math.ceil(runFt / 6);
    bestResult = { 6: num6 };
    bestTotalSections = num6;
    bestWaste = num6 * 6 - runFt;
  }
  
  return { sections: bestResult, totalSections: bestTotalSections, wasteFt: bestWaste };
}

// Helper: Choose rail sections for multiple runs combined
export function chooseRailSections(
  segmentFt: number,
  allowed: number[] = [6, 8]
): { sections: Record<number, number>; wasteFt: number } {
  const result = chooseRailSectionsForRun(segmentFt, allowed);
  return { sections: result.sections, wasteFt: result.wasteFt };
}

// Helper: Get next transformer size based on required wattage
export function nextTransformerSize(
  requiredWatts: number,
  sizes: number[] = stockCatalog.transformerSizesW
): number {
  for (const size of sizes) {
    if (size >= requiredWatts) return size;
  }
  return sizes[sizes.length - 1];
}

// Helper: Get collection from catalog
export function getCollection(
  brandId: string,
  collectionId: string
): DeckingCollection | undefined {
  const brand = deckingBrands.find((b) => b.id === brandId);
  if (!brand) return undefined;
  return brand.collections.find((c) => c.id === collectionId);
}

// Helper: Calculate stair diagonal length
function calculateStairDiagonalFt(heightIn: number, stepCount: number): number {
  const riseIn = heightIn;
  const runIn = stepCount * 10; // 10" tread depth
  const diagonalIn = Math.sqrt(riseIn ** 2 + runIn ** 2);
  return diagonalIn / 12;
}

// Helper: Generate unique BOM item ID
function generateBomId(): string {
  return `bom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Main calculation function
export function calculateEstimate(input: EstimateInput): EstimateOutput {
  const assumptions: string[] = [];
  const warnings: string[] = [];
  const bom: BomItem[] = [];

  // Add standard assumptions
  assumptions.push("Single-level rectangular deck");
  assumptions.push("Conservative PT framing (No. 2 lumber, wet service)");
  assumptions.push("40 psf live load, 10 psf dead load");
  assumptions.push(`Soil bearing: ${jurisdictionProfile.soilBearingPsf} psf`);
  assumptions.push(`Frost depth: ${jurisdictionProfile.frostDepthIn}"`);
  assumptions.push("Standard 16\" x 36\" concrete footings");

  // Validate and generate warnings
  if (input.deckWidthFt > 24) {
    warnings.push("Deck width exceeds 24ft - manual review required");
  }
  if (input.deckProjectionFt > 18) {
    warnings.push("Deck projection exceeds 18ft - manual review required");
  }
  if (input.deckHeightIn > 96) {
    warnings.push("Deck height exceeds 96 inches - manual review required");
  }
  if (input.latticeSkirt && input.horizontalSkirt) {
    warnings.push("Both lattice and horizontal skirt selected - choose one");
  }

  // Get collection info
  const collection = getCollection(input.deckingBrand, input.deckingCollection);
  const boardFaceWidthIn = collection?.boardFaceWidthIn || 5.5;
  const deckingThicknessIn = collection?.boardThicknessIn || 0.94;

  // === STRUCTURAL CALCULATIONS ===

  // Joist sizing
  const joistSize = selectJoistSize(
    input.deckProjectionFt,
    input.joistSpacingIn
  );
  const joistDepthIn = getJoistDepthIn(joistSize);

  // Joist count
  const deckWidthIn = input.deckWidthFt * 12;
  const joistCount = Math.ceil(deckWidthIn / input.joistSpacingIn) + 1;

  // Joist stock length
  const joistStockLengthFt = nextStockLength(input.deckProjectionFt);

  // Beam sizing
  const joistSpanBucket = bucketJoistSpan(input.deckProjectionFt);
  const beamSize = selectBeamSize(joistSpanBucket, input.deckWidthFt / 3);
  const beamDepthIn = getBeamDepthIn(beamSize);

  // Beam and footing positioning
  // Beam is always 1'-6" inside from the deck projection edge
  // Footings are 1'-6" inside from deck width edges
  const beamInsetFt = 1.5;
  const footingInsetFt = 1.5;
  
  // Effective beam span (beam position from house)
  const beamDistanceFromHouseFt = input.deckProjectionFt - beamInsetFt;
  assumptions.push(`Beam positioned ${beamDistanceFromHouseFt}'-${Math.round((beamDistanceFromHouseFt % 1) * 12)}" from house (1'-6" inside from deck edge)`);
  
  // Effective width for footing spacing (1'-6" inside from each side)
  const effectiveWidthForFootingsFt = input.deckWidthFt - (footingInsetFt * 2);
  
  // Post count based on max 9' spacing within the effective width
  // Examples: 16'=3, 20'=3, 24'=4, 32'=5, 36'=5
  const maxPostSpacingFt = 9;
  const sectionsNeeded = Math.ceil(effectiveWidthForFootingsFt / maxPostSpacingFt);
  const postCountPerBeam = sectionsNeeded + 1;

  // Post sizing
  const guardsRequired = input.deckHeightIn > 30;
  const hasStairs = input.stairSections.length > 0;
  const needsLargePost =
    guardsRequired ||
    hasStairs ||
    input.deckType === "freestanding" ||
    input.deckHeightIn > 30;
  const postSize = needsLargePost ? "6x6" : "4x4";

  // Post stock length
  const supportHeightIn = input.deckHeightIn - deckingThicknessIn - joistDepthIn;
  const postCutHeightIn = supportHeightIn - beamDepthIn;
  const postStockLengthFt = nextStockLength((postCutHeightIn + 12) / 12);

  // === FOUNDATION CALCULATIONS ===
  // Standard footing: 16" diameter x 36" deep

  const sonotubeDiameterIn = 16;
  const sonotubeDepthIn = 36;

  // Sonotube quantity
  const sonotubeQty = input.deckType === "attached" ? postCountPerBeam : postCountPerBeam * 2;

  // Concrete volume (16" dia x 36" depth)
  const tubeRadiusFt = sonotubeDiameterIn / 12 / 2;
  const tubeLengthFt = sonotubeDepthIn / 12;
  const volumePerFootingCf = Math.PI * tubeRadiusFt * tubeRadiusFt * tubeLengthFt;
  const totalConcreteCf = volumePerFootingCf * sonotubeQty;
  const concreteBags80 = Math.ceil(totalConcreteCf / jurisdictionProfile.bagYieldCf80);

  // === DECKING CALCULATIONS ===
  // Boards run PARALLEL to the house (along deck width direction)
  // So board length covers deck width, and rows cover deck projection

  const deckAreaSf = input.deckWidthFt * input.deckProjectionFt;

  // Board rows run perpendicular to boards (along projection)
  const projectionIn = input.deckProjectionFt * 12;
  const boardRows = Math.ceil(projectionIn / boardFaceWidthIn);

  // Get color info for available lengths
  const colorInfo = collection?.colors.find((c) => c.name === input.deckingColor);
  const groovedLengths = colorInfo?.groovedLengthsFt || [12, 16, 20];
  const solidLengths = colorInfo?.solidLengthsFt || [20];

  // Breaker board logic: boards come in 12', 16', 20'
  // When deck width exceeds max board length, use breaker boards
  // Prefer exact matches: 24'=2x12', 32'=2x16', 36'=3x12', 40'=2x20'
  const availableBoardLengths = [12, 16, 20];
  const maxBoardLengthFt = Math.max(...groovedLengths);
  const needsBreakerBoard = input.deckWidthFt > maxBoardLengthFt;
  let breakerBoardCount = 0;
  let deckingZones = 1;
  let selectedBoardLengthFt = maxBoardLengthFt;
  
  if (needsBreakerBoard) {
    // Try to find exact match first (preferred)
    let foundExactMatch = false;
    for (let sections = 2; sections <= 10; sections++) {
      const sectionWidth = input.deckWidthFt / sections;
      if (availableBoardLengths.includes(sectionWidth)) {
        deckingZones = sections;
        selectedBoardLengthFt = sectionWidth;
        foundExactMatch = true;
        break;
      }
    }
    
    // Fallback: use smallest number of sections that work
    if (!foundExactMatch) {
      for (let sections = 2; sections <= 10; sections++) {
        const sectionWidth = input.deckWidthFt / sections;
        const boardLength = availableBoardLengths.find(len => len >= sectionWidth);
        if (boardLength) {
          deckingZones = sections;
          selectedBoardLengthFt = boardLength;
          break;
        }
      }
    }
    
    breakerBoardCount = deckingZones - 1;
    assumptions.push(`Deck width ${input.deckWidthFt}' uses ${deckingZones} zones of ${selectedBoardLengthFt}' boards with ${breakerBoardCount} breaker board(s)`);
  }

  // Calculate board counts with waste factor
  // Board length needs to cover deck width (parallel to house)
  const groovedBoardsByLength: Record<number, number> = {};
  
  if (needsBreakerBoard) {
    // Each zone uses boards of the selected length
    // Each row needs (deckingZones) boards of (selectedBoardLengthFt)
    const totalForAllRows = deckingZones * boardRows;
    const withWaste = Math.ceil(totalForAllRows * (1 + wasteFactors.decking));
    groovedBoardsByLength[selectedBoardLengthFt] = withWaste;
  } else {
    const rowOptimization = optimizeDeckRow(input.deckWidthFt, groovedLengths);
    for (const [length, count] of Object.entries(rowOptimization.lengths)) {
      const totalForAllRows = count * boardRows;
      const withWaste = Math.ceil(totalForAllRows * (1 + wasteFactors.decking));
      groovedBoardsByLength[Number(length)] = withWaste;
    }
  }

  // === FASTENER CALCULATIONS ===
  // Camo Hidden Fasteners: 1 bucket per 500 sf
  const camoHiddenFastenerBuckets = Math.ceil(deckAreaSf / 500);

// Picture frame perimeter boards need screws and plugs
  // Picture frame is on front and sides only (NOT along house)
  // Perimeter = width + 2*projection
  const perimeterLf = input.pictureFrameEnabled
  ? input.deckWidthFt + (2 * input.deckProjectionFt)
  : 0;

  // Stair boards also need screws
  let totalStairSteps = 0;
  for (const stair of input.stairSections) {
    totalStairSteps += stair.stepCount;
  }

  // Screws: 1 box per 5 steps for stairs, plus picture frame
  const screwBoxesForStairs = Math.ceil(totalStairSteps / 5);
  const screwBoxesForPictureFrame = input.pictureFrameEnabled
    ? Math.ceil(perimeterLf / 50) + screwBoxesForStairs
    : screwBoxesForStairs;
  const plugBoxesForPictureFrame = screwBoxesForPictureFrame;

  // === FASCIA CALCULATIONS ===
  // Every deck needs BOTH 1x8 AND 1x12
  // 1x8: Each step riser needs one board (width of stair)
  // 1x12: Exterior perimeter of deck + diagonal length of stairs

  // Deck perimeter for 1x12
  let deckPerimeterLf = 0;
  if (input.deckType === "attached") {
    deckPerimeterLf = input.deckWidthFt + input.deckProjectionFt * 2;
  } else {
    deckPerimeterLf = input.deckWidthFt * 2 + input.deckProjectionFt * 2;
  }

  // Stair diagonal lengths for 1x12 (both sides of each stair)
  let stairDiagonalLf = 0;
  for (const stair of input.stairSections) {
    const diagonalFt = calculateStairDiagonalFt(input.deckHeightIn, stair.stepCount);
    stairDiagonalLf += diagonalFt * 2; // Both sides
  }

  // 1x12 count: deck perimeter + stair diagonals
  const total1x12Lf = deckPerimeterLf + stairDiagonalLf;
  const fascia1x12Count = Math.ceil((total1x12Lf * (1 + wasteFactors.fascia)) / 12);

  // 1x8 count: step risers (based on stair width and step count)
  let total1x8Lf = 0;
  for (const stair of input.stairSections) {
    // Each riser needs coverage across the stair width
    total1x8Lf += stair.widthFt * stair.stepCount;
  }
  const fascia1x8Count = Math.ceil((total1x8Lf * (1 + wasteFactors.fascia)) / 12);

  // === STAIR CALCULATIONS ===

  let totalRiserCount = 0;
  let totalTreadCount = 0;
  let totalStringerCount = 0;
  let stringerStockLengthFt = 0;

  for (const stair of input.stairSections) {
    totalRiserCount += stair.stepCount;
    totalTreadCount += Math.max(0, stair.stepCount - 1);

    // UPDATED: Stringer count = stair width + 1
    // e.g., 4' stair = 5 stringers
    const stringersForThisStair = stair.widthFt + 1;
    totalStringerCount += stringersForThisStair;

    // Calculate stringer length needed
    const risePerStep = input.deckHeightIn / stair.stepCount;
    const runPerStep = 10; // Standard 10" tread depth
    const totalRun = (stair.stepCount - 1) * runPerStep;
    const stringerLengthIn = Math.sqrt(input.deckHeightIn ** 2 + totalRun ** 2);
    const thisStairStringerLengthFt = nextStockLength((stringerLengthIn + 12) / 12); // +12" for notches
    stringerStockLengthFt = Math.max(stringerStockLengthFt, thisStairStringerLengthFt);
  }

  // === RAILING CALCULATIONS ===

  const railingRequired =
    input.railingRequiredOverride !== null
      ? input.railingRequiredOverride
      : guardsRequired;

  let levelRailLf = 0;
  let stairRailLf = 0;
  let levelSections6 = 0;
  let levelSections8 = 0;
  let stairSections6 = 0;
  let stairSections8 = 0;
  let levelPostCount = 0;
  let stairPostCount = 0;

  if (railingRequired && input.openSides.length > 0 && input.railingMaterial) {
    // Calculate level rail linear footage
    for (const side of input.openSides) {
      if (side === "left" || side === "right") {
        levelRailLf += input.deckProjectionFt;
      } else if (side === "front" || side === "rear") {
        let sideLength = input.deckWidthFt;
        // Subtract stair openings on this side
        for (const stair of input.stairSections) {
          if (
            (side === "front" && stair.location === "front") ||
            (side === "left" && stair.location === "left") ||
            (side === "right" && stair.location === "right")
          ) {
            sideLength -= stair.widthFt;
          }
        }
        levelRailLf += Math.max(0, sideLength);
      }
    }

    // Calculate posts with shared corners (corner posts connect adjacent sides)
    // Posts are determined by section count per side
    const hasLeft = input.openSides.includes("left");
    const hasRight = input.openSides.includes("right");
    const hasFront = input.openSides.includes("front");
    const hasRear = input.openSides.includes("rear");
    
    // Calculate sections per side (prefer fewer sections = 8' over 6')
    const frontRun = hasFront ? chooseRailSectionsForRun(input.deckWidthFt) : null;
    const rearRun = hasRear ? chooseRailSectionsForRun(input.deckWidthFt) : null;
    const leftRun = hasLeft ? chooseRailSectionsForRun(input.deckProjectionFt) : null;
    const rightRun = hasRight ? chooseRailSectionsForRun(input.deckProjectionFt) : null;
    
    // Sum up all sections
    levelSections6 = (frontRun?.sections[6] || 0) + (rearRun?.sections[6] || 0) + 
                     (leftRun?.sections[6] || 0) + (rightRun?.sections[6] || 0);
    levelSections8 = (frontRun?.sections[8] || 0) + (rearRun?.sections[8] || 0) + 
                     (leftRun?.sections[8] || 0) + (rightRun?.sections[8] || 0);
    
    // Corner posts (shared between sides)
    let cornerPosts = 0;
    if (hasFront && hasLeft) cornerPosts++;   // front-left corner
    if (hasFront && hasRight) cornerPosts++;  // front-right corner
    if (hasRear && hasLeft) cornerPosts++;    // rear-left corner
    if (hasRear && hasRight) cornerPosts++;   // rear-right corner
    
    // Interior posts per side = totalSections - 1 (corners handled separately)
    let interiorPosts = 0;
    
    if (frontRun) {
      // Front has (totalSections + 1) posts total, minus corners
      const frontPosts = frontRun.totalSections + 1;
      const frontCorners = (hasLeft ? 1 : 0) + (hasRight ? 1 : 0);
      interiorPosts += Math.max(0, frontPosts - frontCorners);
    }
    if (rearRun) {
      const rearPosts = rearRun.totalSections + 1;
      const rearCorners = (hasLeft ? 1 : 0) + (hasRight ? 1 : 0);
      interiorPosts += Math.max(0, rearPosts - rearCorners);
    }
    if (leftRun) {
      const leftPosts = leftRun.totalSections + 1;
      const leftCorners = (hasFront ? 1 : 0) + (hasRear ? 1 : 0);
      interiorPosts += Math.max(0, leftPosts - leftCorners);
    }
    if (rightRun) {
      const rightPosts = rightRun.totalSections + 1;
      const rightCorners = (hasFront ? 1 : 0) + (hasRear ? 1 : 0);
      interiorPosts += Math.max(0, rightPosts - rightCorners);
    }
    
    levelPostCount = cornerPosts + interiorPosts;

    // Stair railing - one rail on each side of stairs
    // Each stair has: 2 posts at deck connection + 2 posts at bottom = 4 posts per stair
    // Stair railing sections are 6' or 8' like deck railing
    if (input.stairSections.length > 0 && input.deckHeightIn >= 30) {
      for (const stair of input.stairSections) {
        const diagonalFt = calculateStairDiagonalFt(input.deckHeightIn, stair.stepCount);
        stairRailLf += diagonalFt * 2; // Both sides of stairs
      }
      // Calculate sections per side, then double for both sides
      const singleSideOptimization = chooseRailSections(stairRailLf / 2);
      stairSections6 = (singleSideOptimization.sections[6] || 0) * 2;
      stairSections8 = (singleSideOptimization.sections[8] || 0) * 2;
      // 4 posts per stair (2 at deck level, 2 at bottom) - 45" posts for stairs
      stairPostCount = input.stairSections.length * 4;
    }
  }

  // === LIGHTING CALCULATIONS ===
  // Post cap lights: one per railing post (deck + stair posts)
  // Step lights: one per stair riser

  const totalRailPostCount = levelPostCount + stairPostCount;
  const postCapLightQty = input.postCapLights ? totalRailPostCount : 0;
  // Step lights go on risers, which equals stepCount per stair
  const stairLightQty = input.stairLights ? totalRiserCount : 0;

  const exposedPerimeterFt =
    input.deckType === "attached"
      ? input.deckWidthFt + input.deckProjectionFt * 2
      : input.deckWidthFt * 2 + input.deckProjectionFt * 2;

  const accentLightQty = input.accentLights
    ? Math.ceil(exposedPerimeterFt / 6)
    : 0;

  const totalWatts =
    postCapLightQty * lightingDefaults.watts.postCap +
    stairLightQty * lightingDefaults.watts.stair +
    accentLightQty * lightingDefaults.watts.accent;

  const recommendedTransformerWatts =
    totalWatts > 0 ? nextTransformerSize(totalWatts * 1.2) : 0;

  // === BUILD BOM ===

  // Foundation
  bom.push({
    id: generateBomId(),
    category: "foundation",
    description: `Sonotube Form`,
    size: `${sonotubeDiameterIn}" x ${sonotubeDepthIn}"`,
    quantity: sonotubeQty,
    unit: "ea",
    notes: "Standard 16\" x 36\" footing",
    editable: true,
  });

  bom.push({
    id: generateBomId(),
    category: "foundation",
    description: "Concrete (80lb bags)",
    quantity: concreteBags80,
    unit: "bags",
    editable: true,
  });

  bom.push({
    id: generateBomId(),
    category: "foundation",
    description: "Post Base",
    size: postSize === "6x6" ? "6x6" : "4x4",
    quantity: sonotubeQty,
    unit: "ea",
    editable: true,
  });

  // Stair footings
  if (input.stairSections.length > 0 && input.deckHeightIn >= 30) {
    bom.push({
      id: generateBomId(),
      category: "foundation",
      description: "Stair Landing Footing",
      size: `${sonotubeDiameterIn}" x ${sonotubeDepthIn}"`,
      quantity: input.stairSections.length * 2,
      unit: "ea",
      editable: true,
    });
  }

  // Framing
  if (input.deckType === "attached") {
    bom.push({
      id: generateBomId(),
      category: "framing",
      description: "Ledger Board",
      size: `2x${joistDepthIn} x ${nextStockLength(input.deckWidthFt)}'`,
      quantity: 1,
      unit: "ea",
      editable: true,
    });
  }

  bom.push({
    id: generateBomId(),
    category: "framing",
    description: "Joists",
    size: `${joistSize} x ${joistStockLengthFt}'`,
    quantity: Math.ceil(joistCount * (1 + wasteFactors.framing)),
    unit: "ea",
    editable: true,
  });

  // Beam plies
  const beamCount = input.deckType === "attached" ? 1 : 2;
  const beamPlySize = beamSize.replace("3-", "");
  const beamStockLength = nextStockLength(input.deckWidthFt);

  bom.push({
    id: generateBomId(),
    category: "framing",
    description: `Beam (${beamSize})`,
    size: `${beamPlySize} x ${beamStockLength}'`,
    quantity: 3 * beamCount,
    unit: "ea",
    notes: "3-ply built-up beam",
    editable: true,
  });

  // Rim/Band boards
  bom.push({
    id: generateBomId(),
    category: "framing",
    description: "Rim/Band Board",
    size: `2x${joistDepthIn} x ${nextStockLength(input.deckProjectionFt)}'`,
    quantity: 2,
    unit: "ea",
    editable: true,
  });

  bom.push({
    id: generateBomId(),
    category: "framing",
    description: "Front Rim Board",
    size: `2x${joistDepthIn} x ${nextStockLength(input.deckWidthFt)}'`,
    quantity: input.deckType === "freestanding" ? 2 : 1,
    unit: "ea",
    editable: true,
  });

  // Posts
  bom.push({
    id: generateBomId(),
    category: "framing",
    description: "Support Posts",
    size: `${postSize} x ${postStockLengthFt}'`,
    quantity: sonotubeQty,
    unit: "ea",
    editable: true,
  });

  // Blocking
  const blockingRows = Math.max(0, Math.ceil(input.deckProjectionFt / 6) - 1);
  if (blockingRows > 0) {
    const blockingPieces = (joistCount - 1) * blockingRows;
    bom.push({
      id: generateBomId(),
      category: "framing",
      description: "Blocking",
      size: `2x${joistDepthIn}`,
      quantity: Math.ceil(blockingPieces * (1 + wasteFactors.framing)),
      unit: "ea",
      editable: true,
    });
  }

  // Joist hangers
  bom.push({
    id: generateBomId(),
    category: "framing",
    description: "Joist Hangers",
    size: `2x${joistDepthIn}`,
    quantity: joistCount,
    unit: "ea",
    editable: true,
  });

  // Stair stringers
  if (totalStringerCount > 0) {
    bom.push({
      id: generateBomId(),
      category: "framing",
      description: "Stair Stringers",
      size: `2x12 x ${stringerStockLengthFt}'`,
      quantity: totalStringerCount,
      unit: "ea",
      notes: `${input.stairSections.length} stair section(s)`,
      editable: true,
    });
  }

  // Decking
  for (const [length, count] of Object.entries(groovedBoardsByLength)) {
    if (count > 0) {
      bom.push({
        id: generateBomId(),
        category: "decking",
        description: `${input.deckingColor} Grooved Deck Board`,
        size: `${length}'`,
        quantity: count,
        unit: "ea",
        editable: true,
      });
    }
  }

  // Picture frame boards (solid edge boards)
  if (input.pictureFrameEnabled) {
    const pictureFrameBoards = Math.ceil(perimeterLf / solidLengths[0]) + 4;
    bom.push({
      id: generateBomId(),
      category: "decking",
      description: `${input.pictureFrameColor} Solid Board (Picture Frame)`,
      size: `${solidLengths[0]}'`,
      quantity: Math.ceil(pictureFrameBoards * (1 + wasteFactors.decking)),
      unit: "ea",
      editable: true,
    });
  }

  // Breaker boards (when deck width exceeds max board length)
  if (breakerBoardCount > 0) {
    // Breaker boards run the full projection length
    const breakerBoardsNeeded = Math.ceil(input.deckProjectionFt / solidLengths[0]) * breakerBoardCount;
    bom.push({
      id: generateBomId(),
      category: "decking",
      description: `${input.pictureFrameColor || input.deckingColor} Solid Board (Breaker)`,
      size: `${solidLengths[0]}'`,
      quantity: Math.ceil(breakerBoardsNeeded * (1 + wasteFactors.decking)),
      unit: "ea",
      notes: `${breakerBoardCount} breaker line(s) for ${input.deckWidthFt}' deck width`,
      editable: true,
    });
  }

  // Solid boards for stairs
  if (input.stairSections.length > 0) {
    let stairTreadBoards = 0;
    for (const stair of input.stairSections) {
      // 2 boards per tread width per step
      stairTreadBoards += Math.ceil((stair.widthFt / solidLengths[0]) * 2 * stair.stepCount);
    }
    bom.push({
      id: generateBomId(),
      category: "decking",
      description: `${input.deckingColor} Solid Deck Board (Stair Treads)`,
      size: `${solidLengths[0]}'`,
      quantity: Math.ceil(stairTreadBoards * (1 + wasteFactors.decking)),
      unit: "ea",
      editable: true,
    });
  }

  // Fasteners
  bom.push({
    id: generateBomId(),
    category: "fasteners",
    description: "Camo Hidden Fastener Bucket",
    quantity: camoHiddenFastenerBuckets,
    unit: "bucket",
    notes: "1 bucket per 500 sf",
    editable: true,
  });

  // Screws & Plugs combo box (for picture frame, breaker boards, and stairs)
  const totalScrewPlugBoxes = Math.max(screwBoxesForPictureFrame, screwBoxesForStairs);
  if (totalScrewPlugBoxes > 0) {
    bom.push({
      id: generateBomId(),
      category: "fasteners",
      description: "Color-Match Screws & Plugs Kit",
      quantity: totalScrewPlugBoxes,
      unit: "box",
      notes: "For picture frame, breaker boards & stairs",
      editable: true,
    });
  }

  // Fascia - always include both sizes
  if (fascia1x12Count > 0) {
    bom.push({
      id: generateBomId(),
      category: "fascia",
      description: `${input.deckingColor} Fascia Board`,
      size: "1x12x12",
      quantity: fascia1x12Count,
      unit: "ea",
      notes: "Deck perimeter & stair sides",
      editable: true,
    });
  }

  if (fascia1x8Count > 0) {
    bom.push({
      id: generateBomId(),
      category: "fascia",
      description: `${input.deckingColor} Fascia Board`,
      size: "1x8x12",
      quantity: fascia1x8Count,
      unit: "ea",
      notes: "Stair risers",
      editable: true,
    });
  }

  // Railing
  if (railingRequired && input.railingMaterial) {
    if (levelSections8 > 0) {
      bom.push({
        id: generateBomId(),
        category: "railing",
        description: `${input.railingColor} Level Rail Section`,
        size: "8'",
        quantity: levelSections8,
        unit: "ea",
        editable: true,
      });
    }
    if (levelSections6 > 0) {
      bom.push({
        id: generateBomId(),
        category: "railing",
        description: `${input.railingColor} Level Rail Section`,
        size: "6'",
        quantity: levelSections6,
        unit: "ea",
        editable: true,
      });
    }

    if (stairSections8 > 0) {
      bom.push({
        id: generateBomId(),
        category: "railing",
        description: `${input.railingColor} Stair Rail Section`,
        size: "8'",
        quantity: stairSections8,
        unit: "ea",
        editable: true,
      });
    }
    if (stairSections6 > 0) {
      bom.push({
        id: generateBomId(),
        category: "railing",
        description: `${input.railingColor} Stair Rail Section`,
        size: "6'",
        quantity: stairSections6,
        unit: "ea",
        editable: true,
      });
    }

    if (levelPostCount > 0) {
      bom.push({
        id: generateBomId(),
        category: "railing",
        description: `${input.railingColor} Level Rail Post`,
        size: '39"',
        quantity: levelPostCount,
        unit: "ea",
        editable: true,
      });
    }

    if (stairPostCount > 0) {
      bom.push({
        id: generateBomId(),
        category: "railing",
        description: `${input.railingColor} Stair Rail Post`,
        size: '45"',
        quantity: stairPostCount,
        unit: "ea",
        editable: true,
      });
    }

    const totalSections = levelSections6 + levelSections8 + stairSections6 + stairSections8;
    if (totalSections > 0) {
      bom.push({
        id: generateBomId(),
        category: "railing",
        description: "Rail Hardware Pack",
        quantity: Math.ceil(totalSections / 2),
        unit: "pack",
        editable: true,
      });
    }
  }

  // Add-ons
  if (input.latticeSkirt) {
    const skirtAreaSf = exposedPerimeterFt * (input.deckHeightIn / 12);
    bom.push({
      id: generateBomId(),
      category: "add-ons",
      description: "Vinyl Lattice Panels (4x8)",
      quantity: Math.ceil(skirtAreaSf / 32),
      unit: "ea",
      editable: true,
    });
  }

  if (input.horizontalSkirt) {
    const skirtBoardsLf = exposedPerimeterFt * Math.ceil(input.deckHeightIn / 6);
    bom.push({
      id: generateBomId(),
      category: "add-ons",
      description: "Horizontal Skirt Boards",
      size: "1x6",
      quantity: Math.ceil(skirtBoardsLf / 12),
      unit: "ea",
      editable: true,
    });
  }

if (postCapLightQty > 0) {
  bom.push({
  id: generateBomId(),
  category: "add-ons",
  description: "Post Cap Lights",
  notes: `${levelPostCount} deck posts + ${stairPostCount} stair posts`,
  quantity: postCapLightQty,
  unit: "ea",
  editable: true,
  });
  }

if (stairLightQty > 0) {
  bom.push({
  id: generateBomId(),
  category: "add-ons",
  description: "Stair Riser Lights",
  notes: "One light per riser",
  quantity: stairLightQty,
  unit: "ea",
  editable: true,
  });
  }

  if (accentLightQty > 0) {
    bom.push({
      id: generateBomId(),
      category: "add-ons",
      description: "Accent Lights",
      quantity: accentLightQty,
      unit: "ea",
      editable: true,
    });
  }

  if (recommendedTransformerWatts > 0) {
    bom.push({
      id: generateBomId(),
      category: "add-ons",
      description: "Low-Voltage Transformer",
      size: `${recommendedTransformerWatts}W`,
      quantity: 1,
      unit: "ea",
      editable: true,
    });
  }

  // Build derived values
  const derived: DerivedValues = {
    joistSize,
    joistCount,
    joistStockLengthFt,
    beamSize,
    postCountPerBeam,
    postSize,
    postStockLengthFt,
    sonotubeDiameterIn,
    sonotubeDepthIn,
    sonotubeQty,
    concreteBags80,
    boardRows,
    groovedBoardsByLength,
    solidBoardsByLength: {},
    camoHiddenFastenerBuckets,
    screwBoxesForPictureFrame,
    plugBoxesForPictureFrame,
    fascia1x8Count,
    fascia1x12Count,
    guardsRequired,
    levelRailLf,
    stairRailLf,
    levelSections6,
    levelSections8,
    stairSections6,
    stairSections8,
    levelPostCount,
    stairPostCount,
    totalRiserCount,
    totalTreadCount,
    totalStringerCount,
    stringerStockLengthFt,
    postCapLightQty,
    stairLightQty,
    accentLightQty,
    recommendedTransformerWatts,
    deckAreaSf,
    exposedPerimeterFt,
  };

  return {
    assumptions,
    warnings,
    bom,
    derived,
  };
}
