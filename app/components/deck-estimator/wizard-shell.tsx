"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS, getStepIndex, initialFormState } from "@/lib/store";
import type { EstimateInput, WizardStep } from "@/lib/types";
import { calculateEstimate } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  Circle,
  Layers,
  Maximize2,
  Download,
  X,
} from "lucide-react";
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

// Layer toggle types
interface DrawingLayers {
  footings: boolean;
  framing: boolean;
  decking: boolean;
  railing: boolean;
  lights: boolean;
}

// Architectural deck drawing component with layer toggles
function DeckDrawing({ 
  formData, 
  estimate,
  layers 
}: { 
  formData: EstimateInput; 
  estimate: ReturnType<typeof calculateEstimate>;
  layers: DrawingLayers;
}) {
  const isAttached = formData.deckType === "attached";
  const hasStairs = formData.stairSections.length > 0;
  
  // Drawing proportions - large architectural style
  const maxWidth = 420;
  const maxHeight = 360;
  const padding = 55;
  
  // Calculate scale to fit
  const scaleX = (maxWidth - padding * 2) / Math.max(formData.deckWidthFt, 10);
  const scaleY = (maxHeight - padding * 2) / Math.max(formData.deckProjectionFt + (isAttached ? 3 : 0), 8);
  const scale = Math.min(scaleX, scaleY);
  
  const deckWidth = formData.deckWidthFt * scale;
  const deckDepth = formData.deckProjectionFt * scale;
  const houseHeight = 30;
  
  // Calculate positions
  const startX = (maxWidth - deckWidth) / 2;
  const startY = isAttached ? padding + houseHeight : padding;
  
  // Colors - lighter architectural style
  const colors = {
    deck: "#E8E4E0",       // Warm light gray
    deckStroke: "#9B9590", // Medium warm gray
    house: "#D4D0CB",      // Slightly darker gray
    houseStroke: "#7A7570",
    boards: "#C5C0BA",     // Board lines
    joist: "#A8A39D",      // Joist lines
    pictureFrame: "#8B7355", // Wood accent for picture frame
    stairs: "#DDD8D2",
    stairsStroke: "#8B8580",
    dimension: "#5A5550",  // Dimension lines
    footings: "#6B8E7D",   // Muted teal/green
    railing: "#7A6B5A",    // Muted brown
    lights: "#C9A227",     // Warm amber
  };

  // Calculate footing positions - ensure no division by zero
  // Footings are 1'-6" (1.5ft) inside from deck edges
  // Max 9' spacing: 16'=3, 20'=3, 24'=4, 32'=5, 36'=5
  const footingInsetFt = 1.5;
  const footingInsetPx = footingInsetFt * scale;
  const effectiveDeckWidthForFootings = formData.deckWidthFt - (footingInsetFt * 2);
  const maxPostSpacing = 9;
  const sectionsNeeded = Math.ceil(effectiveDeckWidthForFootings / maxPostSpacing);
  const postCount = sectionsNeeded + 1;
  const actualSpacing = postCount > 1 ? (deckWidth - footingInsetPx * 2) / (postCount - 1) : 0;
  
  // Beam is 1'-6" inside from deck projection edge
  const beamInsetFt = 1.5;
  const beamInsetPx = beamInsetFt * scale;
  
  // Calculate board positions for decking layer
  const boardFaceIn = 5.5;
  const projectionIn = formData.deckProjectionFt * 12;
  const boardCount = Math.max(1, Math.floor(projectionIn / boardFaceIn));
  const boardSpacing = boardCount > 0 ? deckDepth / boardCount : deckDepth;
  
  // Breaker board logic - prefer exact matches: 24'=2x12', 32'=2x16', 36'=3x12', 40'=2x20'
  const availableBoardLengths = [12, 16, 20];
  const maxBoardLengthFt = 20;
  const needsBreakerBoard = formData.deckWidthFt > maxBoardLengthFt;
  let deckingZones = 1;
  
  if (needsBreakerBoard) {
    // Try exact match first
    let foundMatch = false;
    for (let sections = 2; sections <= 10; sections++) {
      const sectionWidth = formData.deckWidthFt / sections;
      if (availableBoardLengths.includes(sectionWidth)) {
        deckingZones = sections;
        foundMatch = true;
        break;
      }
    }
    // Fallback
    if (!foundMatch) {
      for (let sections = 2; sections <= 10; sections++) {
        const sectionWidth = formData.deckWidthFt / sections;
        if (availableBoardLengths.some(len => len >= sectionWidth)) {
          deckingZones = sections;
          break;
        }
      }
    }
  }
  const zoneWidthPx = deckWidth / deckingZones;

  // Calculate joist positions
  const joistSpacing = formData.joistSpacingIn || 16;
  const deckWidthIn = formData.deckWidthFt * 12;
  const joistCount = Math.max(1, Math.floor(deckWidthIn / joistSpacing));
  const joistPixelSpacing = joistCount > 0 ? deckWidth / joistCount : deckWidth;

  return (
    <svg 
      viewBox={`0 0 ${maxWidth} ${maxHeight}`} 
      className="w-full h-auto"
      style={{ minHeight: "320px" }}
    >
      {/* Background - clean architectural paper */}
      <rect width="100%" height="100%" fill="#FAFAF8" />
      
      {/* Subtle grid pattern */}
      <defs>
        <pattern id="archGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E5E0" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#archGrid)" />
      
      {/* House wall (if attached) */}
      {isAttached && (
        <g>
          <rect
            x={startX - 10}
            y={padding - 5}
            width={deckWidth + 20}
            height={houseHeight + 5}
            fill={colors.house}
            stroke={colors.houseStroke}
            strokeWidth="1.5"
          />
          <text
            x={startX + deckWidth / 2}
            y={padding + houseHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={colors.houseStroke}
            fontSize="10"
            fontWeight="600"
            letterSpacing="0.5"
          >
            HOUSE
          </text>
        </g>
      )}

      {/* LAYER: Footings */}
      {layers.footings && (
        <g>
          {/* Beam line at 1'-6" inside from deck edge */}
          <line 
            x1={startX} 
            y1={startY + deckDepth - beamInsetPx} 
            x2={startX + deckWidth} 
            y2={startY + deckDepth - beamInsetPx} 
            stroke={colors.footings} 
            strokeWidth="2"
            strokeDasharray="6,3"
          />
          <text
            x={startX - 5}
            y={startY + deckDepth - beamInsetPx}
            textAnchor="end"
            dominantBaseline="middle"
            fill={colors.footings}
            fontSize="7"
          >
            BEAM
          </text>
          
          {/* Footings positioned 1'-6" inside from edges */}
          {Array.from({ length: postCount }).map((_, i) => {
            const x = startX + footingInsetPx + i * actualSpacing;
            const y = startY + deckDepth - beamInsetPx;
            return (
              <g key={`footing-${i}`}>
                {/* Footing circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={8}
                  fill="none"
                  stroke={colors.footings}
                  strokeWidth="2"
                />
                {/* Cross mark */}
                <line x1={x - 4} y1={y} x2={x + 4} y2={y} stroke={colors.footings} strokeWidth="1.5" />
                <line x1={x} y1={y - 4} x2={x} y2={y + 4} stroke={colors.footings} strokeWidth="1.5" />
              </g>
            );
          })}
          {/* Freestanding: additional beam row footings at house side */}
          {!isAttached && (
            <>
              <line 
                x1={startX} 
                y1={startY + beamInsetPx} 
                x2={startX + deckWidth} 
                y2={startY + beamInsetPx} 
                stroke={colors.footings} 
                strokeWidth="2"
                strokeDasharray="6,3"
              />
              {Array.from({ length: postCount }).map((_, i) => {
                const x = startX + footingInsetPx + i * actualSpacing;
                const y = startY + beamInsetPx;
                return (
                  <g key={`footing-rear-${i}`}>
                    <circle cx={x} cy={y} r={8} fill="none" stroke={colors.footings} strokeWidth="2" />
                    <line x1={x - 4} y1={y} x2={x + 4} y2={y} stroke={colors.footings} strokeWidth="1.5" />
                    <line x1={x} y1={y - 4} x2={x} y2={y + 4} stroke={colors.footings} strokeWidth="1.5" />
                  </g>
                );
              })}
            </>
          )}
        </g>
      )}

      {/* LAYER: Framing (joists) */}
      {layers.framing && (
        <g>
          {/* Joists - perpendicular to boards, running from ledger to beam */}
          {Array.from({ length: joistCount + 1 }).map((_, i) => {
            const x = startX + i * joistPixelSpacing;
            return (
              <line
                key={`joist-${i}`}
                x1={x}
                y1={startY + 2}
                x2={x}
                y2={startY + deckDepth - 2}
                stroke={colors.joist}
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />
            );
          })}
          {/* Rim boards */}
          <line x1={startX} y1={startY} x2={startX} y2={startY + deckDepth} stroke={colors.joist} strokeWidth="2" />
          <line x1={startX + deckWidth} y1={startY} x2={startX + deckWidth} y2={startY + deckDepth} stroke={colors.joist} strokeWidth="2" />
          <line x1={startX} y1={startY + deckDepth} x2={startX + deckWidth} y2={startY + deckDepth} stroke={colors.joist} strokeWidth="2" />
          {!isAttached && (
            <line x1={startX} y1={startY} x2={startX + deckWidth} y2={startY + deckDepth} stroke={colors.joist} strokeWidth="2" />
          )}
        </g>
      )}
      
      {/* LAYER: Decking */}
      {layers.decking && (
        <g>
          {/* Main deck surface */}
          <rect
            x={startX}
            y={startY}
            width={deckWidth}
            height={deckDepth}
            fill={colors.deck}
            stroke={colors.deckStroke}
            strokeWidth="2"
          />
          
          {/* Board lines - parallel to house (horizontal) */}
          {Array.from({ length: boardCount }).map((_, i) => (
            <line
              key={`board-${i}`}
              x1={startX + 1}
              y1={startY + (i + 1) * boardSpacing}
              x2={startX + deckWidth - 1}
              y2={startY + (i + 1) * boardSpacing}
              stroke={colors.boards}
              strokeWidth="0.75"
            />
          ))}
          
          {/* Breaker board lines - vertical lines where boards meet */}
          {needsBreakerBoard && Array.from({ length: deckingZones - 1 }).map((_, i) => (
            <line
              key={`breaker-${i}`}
              x1={startX + (i + 1) * zoneWidthPx}
              y1={startY + 2}
              x2={startX + (i + 1) * zoneWidthPx}
              y2={startY + deckDepth - 2}
              stroke={colors.pictureFrame}
              strokeWidth="3"
            />
          ))}

          {/* Picture frame border (if enabled) - U-shape, NOT along house */}
          {formData.pictureFrameEnabled && (
            <>
              {/* Left side picture frame */}
              <line x1={startX + 4} y1={startY} x2={startX + 4} y2={startY + deckDepth - 4} stroke={colors.pictureFrame} strokeWidth="4" />
              {/* Front picture frame */}
              <line x1={startX + 4} y1={startY + deckDepth - 4} x2={startX + deckWidth - 4} y2={startY + deckDepth - 4} stroke={colors.pictureFrame} strokeWidth="4" />
              {/* Right side picture frame */}
              <line x1={startX + deckWidth - 4} y1={startY + deckDepth - 4} x2={startX + deckWidth - 4} y2={startY} stroke={colors.pictureFrame} strokeWidth="4" />
              {/* Inner field border - U-shape */}
              <path
                d={`M ${startX + 8} ${startY} L ${startX + 8} ${startY + deckDepth - 8} L ${startX + deckWidth - 8} ${startY + deckDepth - 8} L ${startX + deckWidth - 8} ${startY}`}
                fill="none"
                stroke={colors.pictureFrame}
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            </>
          )}
        </g>
      )}
      
      {/* Stairs with railings on both sides */}
      {hasStairs && formData.stairSections.map((stair, idx) => {
        const stairWidth = stair.widthFt * scale;
        const stairDepth = Math.min(stair.stepCount * 5, 40);
        let stairX = startX + deckWidth / 2 - stairWidth / 2;
        let stairY = startY + deckDepth;
        
        if (stair.location === "left") {
          stairX = startX - stairDepth;
          stairY = startY + deckDepth / 2 - stairWidth / 2;
        } else if (stair.location === "right") {
          stairX = startX + deckWidth;
          stairY = startY + deckDepth / 2 - stairWidth / 2;
        }
        
        const isHorizontal = stair.location === "left" || stair.location === "right";
        const w = isHorizontal ? stairDepth : stairWidth;
        const h = isHorizontal ? stairWidth : stairDepth;
        const needsRailing = formData.deckHeightIn >= 30;
        
        return (
          <g key={stair.id}>
            {/* Stair outline */}
            <rect
              x={stairX}
              y={stairY}
              width={w}
              height={h}
              fill={layers.decking ? colors.stairs : "none"}
              stroke={colors.stairsStroke}
              strokeWidth="1.5"
            />
            {/* Step lines */}
            {layers.decking && Array.from({ length: Math.min(stair.stepCount - 1, 6) }).map((_, i) => {
              if (isHorizontal) {
                const lineX = stairX + (i + 1) * (w / stair.stepCount);
                return (
                  <line key={i} x1={lineX} y1={stairY} x2={lineX} y2={stairY + h} stroke={colors.stairsStroke} strokeWidth="0.75" />
                );
              } else {
                const lineY = stairY + (i + 1) * (h / stair.stepCount);
                return (
                  <line key={i} x1={stairX} y1={lineY} x2={stairX + w} y2={lineY} stroke={colors.stairsStroke} strokeWidth="0.75" />
                );
              }
            })}
            {/* Stair railings on both sides (when deck height >= 30") */}
            {layers.railing && needsRailing && (
              <>
                {isHorizontal ? (
                  <>
                    {/* Top and bottom rails for horizontal stairs */}
                    <line x1={stairX} y1={stairY - 2} x2={stairX + w} y2={stairY - 2} stroke={colors.railing} strokeWidth="2" />
                    <line x1={stairX} y1={stairY + h + 2} x2={stairX + w} y2={stairY + h + 2} stroke={colors.railing} strokeWidth="2" />
                    {/* Posts at top and bottom of stair rails */}
                    <rect x={stairX - 2} y={stairY - 4} width={4} height={4} fill={colors.railing} />
                    <rect x={stairX + w - 2} y={stairY - 4} width={4} height={4} fill={colors.railing} />
                    <rect x={stairX - 2} y={stairY + h} width={4} height={4} fill={colors.railing} />
                    <rect x={stairX + w - 2} y={stairY + h} width={4} height={4} fill={colors.railing} />
                  </>
                ) : (
                  <>
                    {/* Left and right rails for vertical stairs */}
                    <line x1={stairX - 2} y1={stairY} x2={stairX - 2} y2={stairY + h} stroke={colors.railing} strokeWidth="2" />
                    <line x1={stairX + w + 2} y1={stairY} x2={stairX + w + 2} y2={stairY + h} stroke={colors.railing} strokeWidth="2" />
                    {/* Posts at top and bottom of stair rails */}
                    <rect x={stairX - 4} y={stairY - 2} width={4} height={4} fill={colors.railing} />
                    <rect x={stairX - 4} y={stairY + h - 2} width={4} height={4} fill={colors.railing} />
                    <rect x={stairX + w} y={stairY - 2} width={4} height={4} fill={colors.railing} />
                    <rect x={stairX + w} y={stairY + h - 2} width={4} height={4} fill={colors.railing} />
                  </>
                )}
              </>
            )}
            {/* Stair label */}
            <text
              x={stairX + w / 2}
              y={stairY + h / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={colors.stairsStroke}
              fontSize="7"
              fontWeight="500"
            >
              {stair.stepCount} STEPS
            </text>
          </g>
        );
      })}

      {/* LAYER: Railing */}
      {layers.railing && formData.openSides.length > 0 && (() => {
        const hasLeft = formData.openSides.includes("left");
        const hasRight = formData.openSides.includes("right");
        const hasFront = formData.openSides.includes("front");
        const hasRear = formData.openSides.includes("rear");
        
        // Calculate sections per side - prefer 8' sections over 6' to minimize posts
        // For 14': (2) 8' = 16' is better than (3) 6' = 18'
        // For 24': (3) 8' = 24' exactly
        const calcSections = (ft: number) => {
          const all8 = Math.ceil(ft / 8);  // How many 8' sections needed
          const num8floor = Math.floor(ft / 8);
          const remaining = ft - num8floor * 8;
          const num6 = remaining > 0 ? Math.ceil(remaining / 6) : 0;
          const mixTotal = num8floor + num6;
          // Pick fewer total sections
          return all8 <= mixTotal ? all8 : mixTotal;
        };
        
        const frontSections = calcSections(formData.deckWidthFt);
        const sideSections = calcSections(formData.deckProjectionFt);
        
        const frontPostSpacing = deckWidth / frontSections;
        const sidePostSpacing = deckDepth / sideSections;
        
        return (
          <g>
            {/* Rail lines */}
            {hasLeft && <line x1={startX - 3} y1={startY} x2={startX - 3} y2={startY + deckDepth} stroke={colors.railing} strokeWidth="3" />}
            {hasRight && <line x1={startX + deckWidth + 3} y1={startY} x2={startX + deckWidth + 3} y2={startY + deckDepth} stroke={colors.railing} strokeWidth="3" />}
            {hasFront && <line x1={startX} y1={startY + deckDepth + 3} x2={startX + deckWidth} y2={startY + deckDepth + 3} stroke={colors.railing} strokeWidth="3" />}
            {hasRear && <line x1={startX} y1={startY - 3} x2={startX + deckWidth} y2={startY - 3} stroke={colors.railing} strokeWidth="3" />}
            
            {/* Corner posts (shared between sides) */}
            {hasFront && hasLeft && (
              <rect x={startX - 6} y={startY + deckDepth - 3} width={6} height={6} fill={colors.railing} />
            )}
            {hasFront && hasRight && (
              <rect x={startX + deckWidth} y={startY + deckDepth - 3} width={6} height={6} fill={colors.railing} />
            )}
            {hasRear && hasLeft && (
              <rect x={startX - 6} y={startY - 3} width={6} height={6} fill={colors.railing} />
            )}
            {hasRear && hasRight && (
              <rect x={startX + deckWidth} y={startY - 3} width={6} height={6} fill={colors.railing} />
            )}
            
            {/* Interior posts for front (excluding corners) */}
            {hasFront && Array.from({ length: frontSections - 1 }).map((_, i) => (
              <rect key={`front-post-${i}`} x={startX + (i + 1) * frontPostSpacing - 3} y={startY + deckDepth} width={6} height={6} fill={colors.railing} />
            ))}
            
            {/* Interior posts for rear (excluding corners) */}
            {hasRear && Array.from({ length: frontSections - 1 }).map((_, i) => (
              <rect key={`rear-post-${i}`} x={startX + (i + 1) * frontPostSpacing - 3} y={startY - 6} width={6} height={6} fill={colors.railing} />
            ))}
            
            {/* Interior posts for left (excluding corners) */}
            {hasLeft && Array.from({ length: sideSections - 1 }).map((_, i) => (
              <rect key={`left-post-${i}`} x={startX - 6} y={startY + (i + 1) * sidePostSpacing - 3} width={6} height={6} fill={colors.railing} />
            ))}
            
            {/* Interior posts for right (excluding corners) */}
            {hasRight && Array.from({ length: sideSections - 1 }).map((_, i) => (
              <rect key={`right-post-${i}`} x={startX + deckWidth} y={startY + (i + 1) * sidePostSpacing - 3} width={6} height={6} fill={colors.railing} />
            ))}
          </g>
        );
      })()}

      {/* LAYER: Lights - post cap lights on railing posts, step lights on risers */}
      {layers.lights && (formData.postCapLights || formData.stairLights || formData.accentLights) && (() => {
        const hasLeft = formData.openSides.includes("left");
        const hasRight = formData.openSides.includes("right");
        const hasFront = formData.openSides.includes("front");
        const hasRear = formData.openSides.includes("rear");
        
        // Use same section calculation as railing posts
        const calcSections = (ft: number) => {
          const all8 = Math.ceil(ft / 8);
          const num8floor = Math.floor(ft / 8);
          const remaining = ft - num8floor * 8;
          const num6 = remaining > 0 ? Math.ceil(remaining / 6) : 0;
          const mixTotal = num8floor + num6;
          return all8 <= mixTotal ? all8 : mixTotal;
        };
        
        const frontSections = calcSections(formData.deckWidthFt);
        const sideSections = calcSections(formData.deckProjectionFt);
        const frontPostSpacing = deckWidth / frontSections;
        const sidePostSpacing = deckDepth / sideSections;
        
        return (
          <g>
            {/* Post cap lights - one per railing post */}
            {formData.postCapLights && (
              <>
                {/* Corner post lights */}
                {hasFront && hasLeft && (
                  <circle cx={startX - 3} cy={startY + deckDepth} r={4} fill={colors.lights} stroke="#FFF" strokeWidth="1" />
                )}
                {hasFront && hasRight && (
                  <circle cx={startX + deckWidth + 3} cy={startY + deckDepth} r={4} fill={colors.lights} stroke="#FFF" strokeWidth="1" />
                )}
                {hasRear && hasLeft && (
                  <circle cx={startX - 3} cy={startY} r={4} fill={colors.lights} stroke="#FFF" strokeWidth="1" />
                )}
                {hasRear && hasRight && (
                  <circle cx={startX + deckWidth + 3} cy={startY} r={4} fill={colors.lights} stroke="#FFF" strokeWidth="1" />
                )}
                {/* Interior post lights - front */}
                {hasFront && Array.from({ length: frontSections - 1 }).map((_, i) => (
                  <circle key={`light-front-${i}`} cx={startX + (i + 1) * frontPostSpacing} cy={startY + deckDepth + 3} r={4} fill={colors.lights} stroke="#FFF" strokeWidth="1" />
                ))}
                {/* Interior post lights - rear */}
                {hasRear && Array.from({ length: frontSections - 1 }).map((_, i) => (
                  <circle key={`light-rear-${i}`} cx={startX + (i + 1) * frontPostSpacing} cy={startY - 3} r={4} fill={colors.lights} stroke="#FFF" strokeWidth="1" />
                ))}
                {/* Interior post lights - left */}
                {hasLeft && Array.from({ length: sideSections - 1 }).map((_, i) => (
                  <circle key={`light-left-${i}`} cx={startX - 3} cy={startY + (i + 1) * sidePostSpacing} r={4} fill={colors.lights} stroke="#FFF" strokeWidth="1" />
                ))}
                {/* Interior post lights - right */}
                {hasRight && Array.from({ length: sideSections - 1 }).map((_, i) => (
                  <circle key={`light-right-${i}`} cx={startX + deckWidth + 3} cy={startY + (i + 1) * sidePostSpacing} r={4} fill={colors.lights} stroke="#FFF" strokeWidth="1" />
                ))}
              </>
            )}
            {/* Step lights - one per stair riser */}
            {formData.stairLights && formData.stairSections.map((stair, stairIdx) => {
              const stairWidthPx = stair.widthFt * scale;
              const stepDepth = 10.5 / 12 * scale;
              const stairDepthPx = stepDepth * stair.stepCount;
              const isHorizontal = stair.position === "front" || stair.position === "rear";
              
              let stairX = startX + (stair.offsetFt || 0) * scale;
              let stairY = startY + deckDepth;
              
              if (stair.position === "left") {
                stairX = startX - stairDepthPx;
                stairY = startY + (stair.offsetFt || 0) * scale;
              } else if (stair.position === "right") {
                stairX = startX + deckWidth;
                stairY = startY + (stair.offsetFt || 0) * scale;
              }
              
              return Array.from({ length: stair.stepCount }).map((_, riserIdx) => {
                if (isHorizontal) {
                  const riserY = stairY + riserIdx * stepDepth + stepDepth / 2;
                  return (
                    <circle key={`step-light-${stairIdx}-${riserIdx}`} cx={stairX + stairWidthPx / 2} cy={riserY} r={3} fill={colors.lights} stroke="#FFF" strokeWidth="0.5" />
                  );
                } else {
                  const riserX = stair.position === "left" ? stairX + stairDepthPx - riserIdx * stepDepth - stepDepth / 2 : stairX + riserIdx * stepDepth + stepDepth / 2;
                  return (
                    <circle key={`step-light-${stairIdx}-${riserIdx}`} cx={riserX} cy={stairY + stairWidthPx / 2} r={3} fill={colors.lights} stroke="#FFF" strokeWidth="0.5" />
                  );
                }
              });
            })}
            {/* Accent lights around perimeter */}
            {formData.accentLights && (
              <rect
                x={startX + 2}
                y={startY + deckDepth - 4}
                width={Math.max(0, deckWidth - 4)}
                height={2}
                fill={colors.lights}
                opacity="0.6"
              />
            )}
          </g>
        );
      })()}
      
      {/* Dimension lines - always visible */}
      <g>
        {/* Width dimension (top) */}
        <line x1={startX} y1={padding - 20} x2={startX + deckWidth} y2={padding - 20} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX} y1={padding - 25} x2={startX} y2={padding - 15} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX + deckWidth} y1={padding - 25} x2={startX + deckWidth} y2={padding - 15} stroke={colors.dimension} strokeWidth="1" />
        {/* Arrows */}
        <polygon points={`${startX},${padding - 20} ${startX + 5},${padding - 18} ${startX + 5},${padding - 22}`} fill={colors.dimension} />
        <polygon points={`${startX + deckWidth},${padding - 20} ${startX + deckWidth - 5},${padding - 18} ${startX + deckWidth - 5},${padding - 22}`} fill={colors.dimension} />
        <text x={startX + deckWidth / 2} y={padding - 28} textAnchor="middle" fill={colors.dimension} fontSize="11" fontWeight="600">
          {formData.deckWidthFt}&apos;-0&quot;
        </text>
        
        {/* Depth dimension (right) */}
        <line x1={startX + deckWidth + 20} y1={startY} x2={startX + deckWidth + 20} y2={startY + deckDepth} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX + deckWidth + 15} y1={startY} x2={startX + deckWidth + 25} y2={startY} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX + deckWidth + 15} y1={startY + deckDepth} x2={startX + deckWidth + 25} y2={startY + deckDepth} stroke={colors.dimension} strokeWidth="1" />
        <polygon points={`${startX + deckWidth + 20},${startY} ${startX + deckWidth + 18},${startY + 5} ${startX + deckWidth + 22},${startY + 5}`} fill={colors.dimension} />
        <polygon points={`${startX + deckWidth + 20},${startY + deckDepth} ${startX + deckWidth + 18},${startY + deckDepth - 5} ${startX + deckWidth + 22},${startY + deckDepth - 5}`} fill={colors.dimension} />
        <text x={startX + deckWidth + 32} y={startY + deckDepth / 2} textAnchor="start" dominantBaseline="middle" fill={colors.dimension} fontSize="11" fontWeight="600">
          {formData.deckProjectionFt}&apos;-0&quot;
        </text>
      </g>
      
      {/* North arrow */}
      <g transform={`translate(${maxWidth - 25}, ${maxHeight - 30})`}>
        <circle cx="0" cy="0" r="12" fill="none" stroke={colors.dimension} strokeWidth="1" />
        <polygon points="0,-10 3,2 0,-2 -3,2" fill={colors.dimension} />
        <text x="0" y="8" textAnchor="middle" fill={colors.dimension} fontSize="8" fontWeight="600">N</text>
      </g>
      
      {/* Scale indicator */}
      <text x={25} y={maxHeight - 10} fill={colors.dimension} fontSize="8" fontWeight="500">
        SCALE: 1&quot; = {Math.round(12 / scale)}&apos;
      </text>
    </svg>
  );
}

// Fullscreen deck drawing component (larger version)
function FullscreenDeckDrawing({ 
  formData, 
  estimate,
  layers 
}: { 
  formData: EstimateInput; 
  estimate: ReturnType<typeof calculateEstimate>;
  layers: DrawingLayers;
}) {
  const isAttached = formData.deckType === "attached";
  const hasStairs = formData.stairSections.length > 0;
  
  // Fixed dimensions for fullscreen: 1280w x 1080h pixels (landscape)
  const maxWidth = 1280;
  const maxHeight = 1080;
  const padding = 120;
  
  // Calculate scale to fit the deck within the canvas
  const availableWidth = maxWidth - padding * 2;
  const availableHeight = maxHeight - padding * 2 - (isAttached ? 100 : 0);
  const scaleX = availableWidth / formData.deckWidthFt;
  const scaleY = availableHeight / formData.deckProjectionFt;
  const scale = Math.min(scaleX, scaleY);
  
  const deckWidth = formData.deckWidthFt * scale;
  const deckDepth = formData.deckProjectionFt * scale;
  const houseHeight = 60;
  
  // Calculate positions
  const startX = (maxWidth - deckWidth) / 2;
  const startY = isAttached ? padding + houseHeight : padding;
  
  // Colors - same as regular drawing
  const colors = {
    deck: "#E8E4E0",
    deckStroke: "#9B9590",
    house: "#D4D0CB",
    houseStroke: "#7A7570",
    boards: "#C5C0BA",
    joist: "#A8A39D",
    pictureFrame: "#8B7355",
    stairs: "#DDD8D2",
    stairsStroke: "#8B8580",
    dimension: "#5A5550",
    footings: "#6B8E7D",
    railing: "#7A6B5A",
    lights: "#C9A227",
  };

  // Calculate footing positions - max 9' spacing
  // 16'=3, 20'=3, 24'=4, 32'=5, 36'=5
  const footingInsetFt = 1.5;
  const footingInsetPx = footingInsetFt * scale;
  const effectiveDeckWidthForFootings = formData.deckWidthFt - (footingInsetFt * 2);
  const maxPostSpacing = 9;
  const sectionsNeeded = Math.ceil(effectiveDeckWidthForFootings / maxPostSpacing);
  const postCount = sectionsNeeded + 1;
  const actualSpacing = postCount > 1 ? (deckWidth - footingInsetPx * 2) / (postCount - 1) : 0;
  
  const beamInsetFt = 1.5;
  const beamInsetPx = beamInsetFt * scale;
  
  // Calculate board positions
  const boardFaceIn = 5.5;
  const projectionIn = formData.deckProjectionFt * 12;
  const boardCount = Math.max(1, Math.floor(projectionIn / boardFaceIn));
  const boardSpacing = boardCount > 0 ? deckDepth / boardCount : deckDepth;
  
  // Breaker board logic - prefer exact matches: 24'=2x12', 32'=2x16', 36'=3x12', 40'=2x20'
  const availableBoardLengths = [12, 16, 20];
  const maxBoardLengthFt = 20;
  const needsBreakerBoard = formData.deckWidthFt > maxBoardLengthFt;
  let deckingZones = 1;
  
  if (needsBreakerBoard) {
    let foundMatch = false;
    for (let sections = 2; sections <= 10; sections++) {
      const sectionWidth = formData.deckWidthFt / sections;
      if (availableBoardLengths.includes(sectionWidth)) {
        deckingZones = sections;
        foundMatch = true;
        break;
      }
    }
    if (!foundMatch) {
      for (let sections = 2; sections <= 10; sections++) {
        const sectionWidth = formData.deckWidthFt / sections;
        if (availableBoardLengths.some(len => len >= sectionWidth)) {
          deckingZones = sections;
          break;
        }
      }
    }
  }
  const zoneWidthPx = deckWidth / deckingZones;

  // Calculate joist positions
  const joistSpacing = formData.joistSpacingIn || 16;
  const deckWidthIn = formData.deckWidthFt * 12;
  const joistCount = Math.max(1, Math.floor(deckWidthIn / joistSpacing));
  const joistPixelSpacing = joistCount > 0 ? deckWidth / joistCount : deckWidth;

  return (
    <svg 
      viewBox={`0 0 ${maxWidth} ${maxHeight}`} 
      width="1280"
      height="1080"
      className="mx-auto block"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Background */}
      <rect width="100%" height="100%" fill="#FAFAF8" />
      
      {/* Grid pattern */}
      <defs>
        <pattern id="archGridLarge" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E5E0" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#archGridLarge)" />
      
      {/* House wall (if attached) */}
      {isAttached && (
        <g>
          <rect
            x={startX - 15}
            y={padding - 10}
            width={deckWidth + 30}
            height={houseHeight + 10}
            fill={colors.house}
            stroke={colors.houseStroke}
            strokeWidth="2"
          />
          <text
            x={startX + deckWidth / 2}
            y={padding + houseHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={colors.houseStroke}
            fontSize="16"
            fontWeight="600"
            letterSpacing="1"
          >
            HOUSE
          </text>
        </g>
      )}

      {/* LAYER: Footings */}
      {layers.footings && (
        <g>
          <line 
            x1={startX} 
            y1={startY + deckDepth - beamInsetPx} 
            x2={startX + deckWidth} 
            y2={startY + deckDepth - beamInsetPx} 
            stroke={colors.footings} 
            strokeWidth="3"
            strokeDasharray="10,5"
          />
          <text
            x={startX - 10}
            y={startY + deckDepth - beamInsetPx}
            textAnchor="end"
            dominantBaseline="middle"
            fill={colors.footings}
            fontSize="12"
            fontWeight="600"
          >
            BEAM
          </text>
          
          {Array.from({ length: postCount }).map((_, i) => {
            const x = startX + footingInsetPx + i * actualSpacing;
            const y = startY + deckDepth - beamInsetPx;
            return (
              <g key={`footing-${i}`}>
                <circle cx={x} cy={y} r={14} fill="none" stroke={colors.footings} strokeWidth="3" />
                <line x1={x - 8} y1={y} x2={x + 8} y2={y} stroke={colors.footings} strokeWidth="2" />
                <line x1={x} y1={y - 8} x2={x} y2={y + 8} stroke={colors.footings} strokeWidth="2" />
              </g>
            );
          })}
          
          {!isAttached && (
            <>
              <line 
                x1={startX} 
                y1={startY + beamInsetPx} 
                x2={startX + deckWidth} 
                y2={startY + beamInsetPx} 
                stroke={colors.footings} 
                strokeWidth="3"
                strokeDasharray="10,5"
              />
              {Array.from({ length: postCount }).map((_, i) => {
                const x = startX + footingInsetPx + i * actualSpacing;
                const y = startY + beamInsetPx;
                return (
                  <g key={`footing-rear-${i}`}>
                    <circle cx={x} cy={y} r={14} fill="none" stroke={colors.footings} strokeWidth="3" />
                    <line x1={x - 8} y1={y} x2={x + 8} y2={y} stroke={colors.footings} strokeWidth="2" />
                    <line x1={x} y1={y - 8} x2={x} y2={y + 8} stroke={colors.footings} strokeWidth="2" />
                  </g>
                );
              })}
            </>
          )}
        </g>
      )}

      {/* LAYER: Framing */}
      {layers.framing && (
        <g>
          {Array.from({ length: joistCount + 1 }).map((_, i) => {
            const x = startX + i * joistPixelSpacing;
            return (
              <line
                key={`joist-${i}`}
                x1={x}
                y1={startY + 3}
                x2={x}
                y2={startY + deckDepth - 3}
                stroke={colors.joist}
                strokeWidth="2"
                strokeDasharray="6,4"
              />
            );
          })}
          <line x1={startX} y1={startY} x2={startX} y2={startY + deckDepth} stroke={colors.joist} strokeWidth="3" />
          <line x1={startX + deckWidth} y1={startY} x2={startX + deckWidth} y2={startY + deckDepth} stroke={colors.joist} strokeWidth="3" />
          <line x1={startX} y1={startY + deckDepth} x2={startX + deckWidth} y2={startY + deckDepth} stroke={colors.joist} strokeWidth="3" />
        </g>
      )}
      
      {/* LAYER: Decking */}
      {layers.decking && (
        <g>
          <rect
            x={startX}
            y={startY}
            width={deckWidth}
            height={deckDepth}
            fill={colors.deck}
            stroke={colors.deckStroke}
            strokeWidth="3"
          />
          
          {Array.from({ length: boardCount }).map((_, i) => (
            <line
              key={`board-${i}`}
              x1={startX + 2}
              y1={startY + (i + 1) * boardSpacing}
              x2={startX + deckWidth - 2}
              y2={startY + (i + 1) * boardSpacing}
              stroke={colors.boards}
              strokeWidth="1"
            />
          ))}
          
          {needsBreakerBoard && Array.from({ length: deckingZones - 1 }).map((_, i) => (
            <line
              key={`breaker-${i}`}
              x1={startX + (i + 1) * zoneWidthPx}
              y1={startY + 3}
              x2={startX + (i + 1) * zoneWidthPx}
              y2={startY + deckDepth - 3}
              stroke={colors.pictureFrame}
              strokeWidth="5"
            />
          ))}

          {formData.pictureFrameEnabled && (
            <>
              {/* Picture frame - U-shape, NOT along house */}
              <line x1={startX + 6} y1={startY} x2={startX + 6} y2={startY + deckDepth - 6} stroke={colors.pictureFrame} strokeWidth="6" />
              <line x1={startX + 6} y1={startY + deckDepth - 6} x2={startX + deckWidth - 6} y2={startY + deckDepth - 6} stroke={colors.pictureFrame} strokeWidth="6" />
              <line x1={startX + deckWidth - 6} y1={startY + deckDepth - 6} x2={startX + deckWidth - 6} y2={startY} stroke={colors.pictureFrame} strokeWidth="6" />
              {/* Inner field border - U-shape */}
              <path
                d={`M ${startX + 12} ${startY} L ${startX + 12} ${startY + deckDepth - 12} L ${startX + deckWidth - 12} ${startY + deckDepth - 12} L ${startX + deckWidth - 12} ${startY}`}
                fill="none"
                stroke={colors.pictureFrame}
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            </>
          )}
        </g>
      )}
      
      {/* Stairs with railings on both sides */}
      {hasStairs && formData.stairSections.map((stair, idx) => {
        const stairWidth = stair.widthFt * scale;
        const stairDepth = Math.min(stair.stepCount * 10, 80);
        let stairX = startX + deckWidth / 2 - stairWidth / 2;
        let stairY = startY + deckDepth;
        
        if (stair.location === "left") {
          stairX = startX - stairDepth;
          stairY = startY + deckDepth / 2 - stairWidth / 2;
        } else if (stair.location === "right") {
          stairX = startX + deckWidth;
          stairY = startY + deckDepth / 2 - stairWidth / 2;
        }
        
        const isHorizontal = stair.location === "left" || stair.location === "right";
        const w = isHorizontal ? stairDepth : stairWidth;
        const h = isHorizontal ? stairWidth : stairDepth;
        const needsRailing = formData.deckHeightIn >= 30;
        
        return (
          <g key={stair.id}>
            <rect
              x={stairX}
              y={stairY}
              width={w}
              height={h}
              fill={layers.decking ? colors.stairs : "none"}
              stroke={colors.stairsStroke}
              strokeWidth="2"
            />
            {layers.decking && Array.from({ length: Math.min(stair.stepCount - 1, 8) }).map((_, i) => {
              if (isHorizontal) {
                const lineX = stairX + (i + 1) * (w / stair.stepCount);
                return (
                  <line key={i} x1={lineX} y1={stairY} x2={lineX} y2={stairY + h} stroke={colors.stairsStroke} strokeWidth="1" />
                );
              } else {
                const lineY = stairY + (i + 1) * (h / stair.stepCount);
                return (
                  <line key={i} x1={stairX} y1={lineY} x2={stairX + w} y2={lineY} stroke={colors.stairsStroke} strokeWidth="1" />
                );
              }
            })}
            {/* Stair railings on both sides (when deck height >= 30") */}
            {layers.railing && needsRailing && (
              <>
                {isHorizontal ? (
                  <>
                    {/* Top and bottom rails for horizontal stairs */}
                    <line x1={stairX} y1={stairY - 3} x2={stairX + w} y2={stairY - 3} stroke={colors.railing} strokeWidth="3" />
                    <line x1={stairX} y1={stairY + h + 3} x2={stairX + w} y2={stairY + h + 3} stroke={colors.railing} strokeWidth="3" />
                    {/* Posts at top and bottom of stair rails */}
                    <rect x={stairX - 4} y={stairY - 7} width={8} height={8} fill={colors.railing} />
                    <rect x={stairX + w - 4} y={stairY - 7} width={8} height={8} fill={colors.railing} />
                    <rect x={stairX - 4} y={stairY + h - 1} width={8} height={8} fill={colors.railing} />
                    <rect x={stairX + w - 4} y={stairY + h - 1} width={8} height={8} fill={colors.railing} />
                  </>
                ) : (
                  <>
                    {/* Left and right rails for vertical stairs */}
                    <line x1={stairX - 3} y1={stairY} x2={stairX - 3} y2={stairY + h} stroke={colors.railing} strokeWidth="3" />
                    <line x1={stairX + w + 3} y1={stairY} x2={stairX + w + 3} y2={stairY + h} stroke={colors.railing} strokeWidth="3" />
                    {/* Posts at top and bottom of stair rails */}
                    <rect x={stairX - 7} y={stairY - 4} width={8} height={8} fill={colors.railing} />
                    <rect x={stairX - 7} y={stairY + h - 4} width={8} height={8} fill={colors.railing} />
                    <rect x={stairX + w - 1} y={stairY - 4} width={8} height={8} fill={colors.railing} />
                    <rect x={stairX + w - 1} y={stairY + h - 4} width={8} height={8} fill={colors.railing} />
                  </>
                )}
              </>
            )}
            <text
              x={stairX + w / 2}
              y={stairY + h / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={colors.stairsStroke}
              fontSize="12"
              fontWeight="600"
            >
              {stair.stepCount} STEPS
            </text>
          </g>
        );
      })}

      {/* LAYER: Railing */}
      {layers.railing && formData.openSides.length > 0 && (() => {
        const hasLeft = formData.openSides.includes("left");
        const hasRight = formData.openSides.includes("right");
        const hasFront = formData.openSides.includes("front");
        const hasRear = formData.openSides.includes("rear");
        
        // Calculate sections per side - prefer 8' sections over 6' to minimize posts
        const calcSections = (ft: number) => {
          const all8 = Math.ceil(ft / 8);
          const num8floor = Math.floor(ft / 8);
          const remaining = ft - num8floor * 8;
          const num6 = remaining > 0 ? Math.ceil(remaining / 6) : 0;
          const mixTotal = num8floor + num6;
          return all8 <= mixTotal ? all8 : mixTotal;
        };
        
        const frontSections = calcSections(formData.deckWidthFt);
        const sideSections = calcSections(formData.deckProjectionFt);
        const frontPostSpacing = deckWidth / frontSections;
        const sidePostSpacing = deckDepth / sideSections;
        
        return (
          <g>
            {/* Rail lines */}
            {hasLeft && <line x1={startX - 5} y1={startY} x2={startX - 5} y2={startY + deckDepth} stroke={colors.railing} strokeWidth="5" />}
            {hasRight && <line x1={startX + deckWidth + 5} y1={startY} x2={startX + deckWidth + 5} y2={startY + deckDepth} stroke={colors.railing} strokeWidth="5" />}
            {hasFront && <line x1={startX} y1={startY + deckDepth + 5} x2={startX + deckWidth} y2={startY + deckDepth + 5} stroke={colors.railing} strokeWidth="5" />}
            {hasRear && <line x1={startX} y1={startY - 5} x2={startX + deckWidth} y2={startY - 5} stroke={colors.railing} strokeWidth="5" />}
            
            {/* Corner posts (shared) */}
            {hasFront && hasLeft && <rect x={startX - 10} y={startY + deckDepth - 5} width={10} height={10} fill={colors.railing} />}
            {hasFront && hasRight && <rect x={startX + deckWidth} y={startY + deckDepth - 5} width={10} height={10} fill={colors.railing} />}
            {hasRear && hasLeft && <rect x={startX - 10} y={startY - 5} width={10} height={10} fill={colors.railing} />}
            {hasRear && hasRight && <rect x={startX + deckWidth} y={startY - 5} width={10} height={10} fill={colors.railing} />}
            
            {/* Interior posts */}
            {hasFront && Array.from({ length: frontSections - 1 }).map((_, i) => (
              <rect key={`front-post-${i}`} x={startX + (i + 1) * frontPostSpacing - 5} y={startY + deckDepth} width={10} height={10} fill={colors.railing} />
            ))}
            {hasRear && Array.from({ length: frontSections - 1 }).map((_, i) => (
              <rect key={`rear-post-${i}`} x={startX + (i + 1) * frontPostSpacing - 5} y={startY - 10} width={10} height={10} fill={colors.railing} />
            ))}
            {hasLeft && Array.from({ length: sideSections - 1 }).map((_, i) => (
              <rect key={`left-post-${i}`} x={startX - 10} y={startY + (i + 1) * sidePostSpacing - 5} width={10} height={10} fill={colors.railing} />
            ))}
            {hasRight && Array.from({ length: sideSections - 1 }).map((_, i) => (
              <rect key={`right-post-${i}`} x={startX + deckWidth} y={startY + (i + 1) * sidePostSpacing - 5} width={10} height={10} fill={colors.railing} />
            ))}
          </g>
        );
      })()}

      {/* LAYER: Lights - post cap lights on railing posts, step lights on risers */}
      {layers.lights && (formData.postCapLights || formData.stairLights || formData.accentLights) && (() => {
        const hasLeft = formData.openSides.includes("left");
        const hasRight = formData.openSides.includes("right");
        const hasFront = formData.openSides.includes("front");
        const hasRear = formData.openSides.includes("rear");
        
        // Use same section calculation as railing posts
        const calcSections = (ft: number) => {
          const all8 = Math.ceil(ft / 8);
          const num8floor = Math.floor(ft / 8);
          const remaining = ft - num8floor * 8;
          const num6 = remaining > 0 ? Math.ceil(remaining / 6) : 0;
          const mixTotal = num8floor + num6;
          return all8 <= mixTotal ? all8 : mixTotal;
        };
        
        const frontSections = calcSections(formData.deckWidthFt);
        const sideSections = calcSections(formData.deckProjectionFt);
        const frontPostSpacing = deckWidth / frontSections;
        const sidePostSpacing = deckDepth / sideSections;
        
        return (
          <g>
            {/* Post cap lights - one per railing post */}
            {formData.postCapLights && (
              <>
                {/* Corner post lights */}
                {hasFront && hasLeft && (
                  <circle cx={startX - 5} cy={startY + deckDepth} r={7} fill={colors.lights} stroke="#FFF" strokeWidth="2" />
                )}
                {hasFront && hasRight && (
                  <circle cx={startX + deckWidth + 5} cy={startY + deckDepth} r={7} fill={colors.lights} stroke="#FFF" strokeWidth="2" />
                )}
                {hasRear && hasLeft && (
                  <circle cx={startX - 5} cy={startY} r={7} fill={colors.lights} stroke="#FFF" strokeWidth="2" />
                )}
                {hasRear && hasRight && (
                  <circle cx={startX + deckWidth + 5} cy={startY} r={7} fill={colors.lights} stroke="#FFF" strokeWidth="2" />
                )}
                {/* Interior post lights - front */}
                {hasFront && Array.from({ length: frontSections - 1 }).map((_, i) => (
                  <circle key={`light-front-${i}`} cx={startX + (i + 1) * frontPostSpacing} cy={startY + deckDepth + 5} r={7} fill={colors.lights} stroke="#FFF" strokeWidth="2" />
                ))}
                {/* Interior post lights - rear */}
                {hasRear && Array.from({ length: frontSections - 1 }).map((_, i) => (
                  <circle key={`light-rear-${i}`} cx={startX + (i + 1) * frontPostSpacing} cy={startY - 5} r={7} fill={colors.lights} stroke="#FFF" strokeWidth="2" />
                ))}
                {/* Interior post lights - left */}
                {hasLeft && Array.from({ length: sideSections - 1 }).map((_, i) => (
                  <circle key={`light-left-${i}`} cx={startX - 5} cy={startY + (i + 1) * sidePostSpacing} r={7} fill={colors.lights} stroke="#FFF" strokeWidth="2" />
                ))}
                {/* Interior post lights - right */}
                {hasRight && Array.from({ length: sideSections - 1 }).map((_, i) => (
                  <circle key={`light-right-${i}`} cx={startX + deckWidth + 5} cy={startY + (i + 1) * sidePostSpacing} r={7} fill={colors.lights} stroke="#FFF" strokeWidth="2" />
                ))}
              </>
            )}
            {/* Step lights - one per stair riser */}
            {formData.stairLights && formData.stairSections.map((stair, stairIdx) => {
              const stairWidthPx = stair.widthFt * scale;
              const stepDepth = 10.5 / 12 * scale;
              const stairDepthPx = stepDepth * stair.stepCount;
              const isHorizontal = stair.position === "front" || stair.position === "rear";
              
              let stairX = startX + (stair.offsetFt || 0) * scale;
              let stairY = startY + deckDepth;
              
              if (stair.position === "left") {
                stairX = startX - stairDepthPx;
                stairY = startY + (stair.offsetFt || 0) * scale;
              } else if (stair.position === "right") {
                stairX = startX + deckWidth;
                stairY = startY + (stair.offsetFt || 0) * scale;
              }
              
              return Array.from({ length: stair.stepCount }).map((_, riserIdx) => {
                if (isHorizontal) {
                  const riserY = stairY + riserIdx * stepDepth + stepDepth / 2;
                  return (
                    <circle key={`step-light-${stairIdx}-${riserIdx}`} cx={stairX + stairWidthPx / 2} cy={riserY} r={5} fill={colors.lights} stroke="#FFF" strokeWidth="1" />
                  );
                } else {
                  const riserX = stair.position === "left" ? stairX + stairDepthPx - riserIdx * stepDepth - stepDepth / 2 : stairX + riserIdx * stepDepth + stepDepth / 2;
                  return (
                    <circle key={`step-light-${stairIdx}-${riserIdx}`} cx={riserX} cy={stairY + stairWidthPx / 2} r={5} fill={colors.lights} stroke="#FFF" strokeWidth="1" />
                  );
                }
              });
            })}
          </g>
        );
      })()}
      
      {/* Dimension lines */}
      <g>
        {/* Width dimension */}
        <line x1={startX} y1={padding - 35} x2={startX + deckWidth} y2={padding - 35} stroke={colors.dimension} strokeWidth="1.5" />
        <line x1={startX} y1={padding - 45} x2={startX} y2={padding - 25} stroke={colors.dimension} strokeWidth="1.5" />
        <line x1={startX + deckWidth} y1={padding - 45} x2={startX + deckWidth} y2={padding - 25} stroke={colors.dimension} strokeWidth="1.5" />
        <polygon points={`${startX},${padding - 35} ${startX + 8},${padding - 32} ${startX + 8},${padding - 38}`} fill={colors.dimension} />
        <polygon points={`${startX + deckWidth},${padding - 35} ${startX + deckWidth - 8},${padding - 32} ${startX + deckWidth - 8},${padding - 38}`} fill={colors.dimension} />
        <text x={startX + deckWidth / 2} y={padding - 50} textAnchor="middle" fill={colors.dimension} fontSize="16" fontWeight="600">
          {formData.deckWidthFt}&apos;-0&quot;
        </text>
        
        {/* Depth dimension */}
        <line x1={startX + deckWidth + 35} y1={startY} x2={startX + deckWidth + 35} y2={startY + deckDepth} stroke={colors.dimension} strokeWidth="1.5" />
        <line x1={startX + deckWidth + 25} y1={startY} x2={startX + deckWidth + 45} y2={startY} stroke={colors.dimension} strokeWidth="1.5" />
        <line x1={startX + deckWidth + 25} y1={startY + deckDepth} x2={startX + deckWidth + 45} y2={startY + deckDepth} stroke={colors.dimension} strokeWidth="1.5" />
        <polygon points={`${startX + deckWidth + 35},${startY} ${startX + deckWidth + 32},${startY + 8} ${startX + deckWidth + 38},${startY + 8}`} fill={colors.dimension} />
        <polygon points={`${startX + deckWidth + 35},${startY + deckDepth} ${startX + deckWidth + 32},${startY + deckDepth - 8} ${startX + deckWidth + 38},${startY + deckDepth - 8}`} fill={colors.dimension} />
        <text x={startX + deckWidth + 55} y={startY + deckDepth / 2} textAnchor="start" dominantBaseline="middle" fill={colors.dimension} fontSize="16" fontWeight="600">
          {formData.deckProjectionFt}&apos;-0&quot;
        </text>
      </g>
      
      {/* North arrow */}
      <g transform={`translate(${maxWidth - 45}, ${maxHeight - 50})`}>
        <circle cx="0" cy="0" r="20" fill="none" stroke={colors.dimension} strokeWidth="1.5" />
        <polygon points="0,-16 5,4 0,-2 -5,4" fill={colors.dimension} />
        <text x="0" y="12" textAnchor="middle" fill={colors.dimension} fontSize="12" fontWeight="600">N</text>
      </g>
      
      {/* Scale indicator */}
      <text x={40} y={maxHeight - 20} fill={colors.dimension} fontSize="12" fontWeight="500">
        SCALE: 1&quot; = {Math.round(12 / scale)}&apos;
      </text>
      
      {/* Title block */}
      <g>
        <text x={40} y={40} fill={colors.dimension} fontSize="18" fontWeight="700">
          DECK PLAN
        </text>
        <text x={40} y={58} fill={colors.dimension} fontSize="12">
          {formData.deckWidthFt}&apos; x {formData.deckProjectionFt}&apos; {formData.deckType.charAt(0).toUpperCase() + formData.deckType.slice(1)} Deck
        </text>
      </g>
    </svg>
  );
}

// Layer toggle controls
function LayerControls({ 
  layers, 
  setLayers 
}: { 
  layers: DrawingLayers; 
  setLayers: React.Dispatch<React.SetStateAction<DrawingLayers>>;
}) {
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
            onCheckedChange={(checked) => setLayers(prev => ({ ...prev, [key]: checked }))}
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
  const [currentStep, setCurrentStep] = useState<WizardStep>("job-info");
  const [formData, setFormData] = useState<EstimateInput>(initialFormState);
  const [layers, setLayers] = useState<DrawingLayers>({
    footings: true,
    framing: true,
    decking: true,
    railing: true,
    lights: true,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Function to download drawing as PDF
  const downloadPDF = async () => {
    const svgElement = document.getElementById(isFullscreen ? "deck-drawing-fullscreen" : "deck-drawing-main");
    if (!svgElement) return;

    // Get SVG as string
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create canvas to convert SVG to image
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 2; // Higher resolution
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FAFAF8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        
        // Convert to PDF using canvas
        const imgData = canvas.toDataURL("image/png");
        
        // Create a simple PDF-like download (actually a PNG for now)
        // For true PDF, we'd need jsPDF library
        const link = document.createElement("a");
        link.download = `deck-plan-${formData.deckWidthFt}x${formData.deckProjectionFt}.png`;
        link.href = imgData;
        link.click();
      }
      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  };

  const currentStepIndex = getStepIndex(currentStep);

  const estimate = useMemo(() => {
    return calculateEstimate(formData);
  }, [formData]);

  const updateFormData = (updates: Partial<EstimateInput>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  const goNext = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStep(WIZARD_STEPS[currentStepIndex + 1].id);
    }
  };

  const goPrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(WIZARD_STEPS[currentStepIndex - 1].id);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "job-info":
        return <JobInfoStep formData={formData} updateFormData={updateFormData} />;
      case "geometry":
        return <GeometryStep formData={formData} updateFormData={updateFormData} />;
      case "surface":
        return <SurfaceStep formData={formData} updateFormData={updateFormData} />;
      case "railing-stairs":
        return (
          <RailingStairsStep
            formData={formData}
            updateFormData={updateFormData}
            guardsRequired={estimate.derived.guardsRequired}
          />
        );
      case "add-ons":
        return <AddOnsStep formData={formData} updateFormData={updateFormData} />;
      case "review":
        return (
          <ReviewStep
            formData={formData}
            estimate={estimate}
            updateFormData={updateFormData}
          />
        );
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Hexagon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Deckmetry
              </h1>
              <p className="text-xs text-muted-foreground">
                Smart Deck Estimator
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            Prototype
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
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
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
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">No Project Data Yet</h3>
                    <p className="text-xs text-muted-foreground/70 max-w-[200px]">
                      Fill out the job information form to see your deck plan and project summary.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Deck Drawing with Layers */}
                    <div className="bg-muted/20 rounded-lg border border-border overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border">
                        <div className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Plan View</span>
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
                        <DeckViews formData={formData} estimate={estimate} layers={layers} />
                      </div>
                      <div className="px-4 py-3 bg-muted/30 border-t border-border">
                        <LayerControls layers={layers} setLayers={setLayers} />
                      </div>
                    </div>

                    {/* Fullscreen Drawing Dialog - Full HD 1920x1080 */}
                    <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                      <DialogContent className="flex flex-col !w-[1920px] !h-[1080px] !max-w-[1920px] !max-h-[1080px] p-6">
                        <DialogHeader className="flex-shrink-0">
                          <DialogTitle className="flex items-center justify-between">
                            <span className="text-lg">Deck Views - {formData.deckWidthFt}&apos; x {formData.deckProjectionFt}&apos;</span>
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
                            Multi-page architectural drawings with toggleable layers. Use the tabs to navigate between views.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 flex flex-col min-h-0 mt-4">
                          <div className="flex-1 flex flex-col bg-muted/20 rounded-lg border border-border overflow-hidden">
                            <div className="flex-1 flex items-center justify-center p-6 min-h-0" id="deck-drawing-fullscreen">
                              <DeckViews formData={formData} estimate={estimate} layers={layers} isFullscreen={true} />
                            </div>
                            <div className="flex-shrink-0 px-6 py-4 bg-muted/30 border-t border-border">
                              <LayerControls layers={layers} setLayers={setLayers} />
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Deck Specs */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/40 rounded-lg p-3">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Type</p>
                          <p className="text-sm font-semibold capitalize mt-1">{formData.deckType}</p>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-3">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Height</p>
                          <p className="text-sm font-semibold mt-1">{formData.deckHeightIn}&quot;</p>
                        </div>
                      </div>
                      
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-baseline justify-between">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Total Area</p>
                          <p className="text-2xl font-bold text-primary">
                            {estimate.derived.deckAreaSf}
                            <span className="text-sm font-normal text-muted-foreground ml-1">sq ft</span>
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formData.deckWidthFt}&apos; W x {formData.deckProjectionFt}&apos; D @ {formData.joistSpacingIn}&quot; O.C.
                        </p>
                      </div>
                    </div>

                    {formData.deckingColor && (
                      <>
                        <hr className="border-border" />
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Decking</p>
                              <p className="text-sm font-semibold mt-1">{formData.deckingColor}</p>
                            </div>
                          </div>
                          {formData.pictureFrameEnabled && (
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Picture Frame</p>
                                <p className="text-sm font-semibold mt-1">{formData.pictureFrameColor}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {estimate.warnings.length > 0 && (
                      <>
                        <hr className="border-border" />
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-2">Warnings</p>
                          <ul className="space-y-1">
                            {estimate.warnings.map((warning, index) => (
                              <li key={index} className="text-xs text-amber-700 flex items-start gap-2">
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
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">BOM Items</p>
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
