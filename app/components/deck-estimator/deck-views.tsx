"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { EstimateInput } from "@/lib/types";
import { calculateEstimate } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Layer toggle types
interface DrawingLayers {
  footings: boolean;
  framing: boolean;
  decking: boolean;
  railing: boolean;
  lights: boolean;
}

type ViewPage = "top" | "front" | "left" | "right";

const VIEW_PAGES: { id: ViewPage; label: string; shortLabel: string }[] = [
  { id: "top", label: "Top View", shortLabel: "Top" },
  { id: "front", label: "Front View", shortLabel: "Front" },
  { id: "left", label: "Left Side", shortLabel: "Left" },
  { id: "right", label: "Right Side", shortLabel: "Right" },
];

interface DeckViewsProps {
  formData: EstimateInput;
  estimate: ReturnType<typeof calculateEstimate>;
  layers: DrawingLayers;
  isFullscreen?: boolean;
}

// Colors for all views
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
  beam: "#8B7355",
  post: "#6B5B4A",
  ledger: "#7A6B5A",
  concrete: "#A0A0A0",
  ground: "#C4B8A8",
  hardware: "#4A6FA5",
  annotation: "#333333",
};

// Top View Component (existing plan view)
function TopView({ formData, estimate, layers, isFullscreen }: DeckViewsProps) {
  const isAttached = formData.deckType === "attached";
  const hasStairs = formData.stairSections.length > 0;
  
  // Full HD: 1920x1080, minus space for header/controls (~200px)
  const maxWidth = isFullscreen ? 1800 : 420;
  const maxHeight = isFullscreen ? 800 : 360;
  const padding = isFullscreen ? 120 : 55;
  
  const scaleX = (maxWidth - padding * 2) / Math.max(formData.deckWidthFt, 10);
  const scaleY = (maxHeight - padding * 2) / Math.max(formData.deckProjectionFt + (isAttached ? 3 : 0), 8);
  const scale = Math.min(scaleX, scaleY);
  
  const deckWidth = formData.deckWidthFt * scale;
  const deckDepth = formData.deckProjectionFt * scale;
  const houseHeight = isFullscreen ? 40 : 30;
  
  const startX = (maxWidth - deckWidth) / 2;
  const startY = isAttached ? padding + houseHeight : padding;

  // Calculate footing positions
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
  
  // Breaker board logic
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
      className="w-full h-auto"
      style={{ minHeight: isFullscreen ? "800px" : "320px" }}
    >
      <rect width="100%" height="100%" fill="#FAFAF8" />
      
      <defs>
        <pattern id="archGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E5E0" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#archGrid)" />
      
      {/* Title */}
      <text x={maxWidth / 2} y={20} textAnchor="middle" fontSize="14" fontWeight="600" fill={colors.annotation}>
        TOP VIEW - PLAN
      </text>
      
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
          
          {Array.from({ length: postCount }).map((_, i) => {
            const x = startX + footingInsetPx + i * actualSpacing;
            const y = startY + deckDepth - beamInsetPx;
            return (
              <g key={`footing-${i}`}>
                <circle cx={x} cy={y} r={8} fill="none" stroke={colors.footings} strokeWidth="2" />
                <line x1={x - 4} y1={y} x2={x + 4} y2={y} stroke={colors.footings} strokeWidth="1.5" />
                <line x1={x} y1={y - 4} x2={x} y2={y + 4} stroke={colors.footings} strokeWidth="1.5" />
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

      {/* LAYER: Framing */}
      {layers.framing && (
        <g>
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
          <line x1={startX} y1={startY} x2={startX} y2={startY + deckDepth} stroke={colors.joist} strokeWidth="2" />
          <line x1={startX + deckWidth} y1={startY} x2={startX + deckWidth} y2={startY + deckDepth} stroke={colors.joist} strokeWidth="2" />
          <line x1={startX} y1={startY + deckDepth} x2={startX + deckWidth} y2={startY + deckDepth} stroke={colors.joist} strokeWidth="2" />
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
            strokeWidth="2"
          />
          
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

          {formData.pictureFrameEnabled && (
            <>
              <line x1={startX + 4} y1={startY} x2={startX + 4} y2={startY + deckDepth - 4} stroke={colors.pictureFrame} strokeWidth="4" />
              <line x1={startX + 4} y1={startY + deckDepth - 4} x2={startX + deckWidth - 4} y2={startY + deckDepth - 4} stroke={colors.pictureFrame} strokeWidth="4" />
              <line x1={startX + deckWidth - 4} y1={startY + deckDepth - 4} x2={startX + deckWidth - 4} y2={startY} stroke={colors.pictureFrame} strokeWidth="4" />
            </>
          )}
        </g>
      )}

      {/* Stairs */}
      {hasStairs && formData.stairSections.map((stair) => {
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
        
        return (
          <g key={stair.id}>
            <rect
              x={stairX}
              y={stairY}
              width={w}
              height={h}
              fill={layers.decking ? colors.stairs : "none"}
              stroke={colors.stairsStroke}
              strokeWidth="1.5"
            />
            {layers.decking && Array.from({ length: Math.min(stair.stepCount - 1, 6) }).map((_, i) => {
              if (isHorizontal) {
                const lineX = stairX + (i + 1) * (w / stair.stepCount);
                return <line key={i} x1={lineX} y1={stairY} x2={lineX} y2={stairY + h} stroke={colors.stairsStroke} strokeWidth="0.75" />;
              } else {
                const lineY = stairY + (i + 1) * (h / stair.stepCount);
                return <line key={i} x1={stairX} y1={lineY} x2={stairX + w} y2={lineY} stroke={colors.stairsStroke} strokeWidth="0.75" />;
              }
            })}
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

      {/* LAYER: Railing with Posts */}
      {layers.railing && formData.openSides.length > 0 && (() => {
        const hasLeft = formData.openSides.includes("left");
        const hasRight = formData.openSides.includes("right");
        const hasFront = formData.openSides.includes("front");
        
        // Post spacing - typically 6ft apart, calculate number of posts
        const postSpacingFt = 6;
        const postSize = isFullscreen ? 8 : 5;
        
        // Calculate posts for each side
        const leftPosts = hasLeft ? Math.max(2, Math.floor(formData.deckProjectionFt / postSpacingFt) + 1) : 0;
        const rightPosts = hasRight ? Math.max(2, Math.floor(formData.deckProjectionFt / postSpacingFt) + 1) : 0;
        const frontPosts = hasFront ? Math.max(2, Math.floor(formData.deckWidthFt / postSpacingFt) + 1) : 0;
        
        return (
          <g>
            {/* Rail lines */}
            {hasLeft && <line x1={startX - 3} y1={startY} x2={startX - 3} y2={startY + deckDepth} stroke={colors.railing} strokeWidth="3" />}
            {hasRight && <line x1={startX + deckWidth + 3} y1={startY} x2={startX + deckWidth + 3} y2={startY + deckDepth} stroke={colors.railing} strokeWidth="3" />}
            {hasFront && <line x1={startX} y1={startY + deckDepth + 3} x2={startX + deckWidth} y2={startY + deckDepth + 3} stroke={colors.railing} strokeWidth="3" />}
            
            {/* Left side posts */}
            {hasLeft && Array.from({ length: leftPosts }).map((_, i) => {
              const postY = startY + (i * deckDepth / (leftPosts - 1 || 1));
              return (
                <rect
                  key={`left-post-${i}`}
                  x={startX - postSize - 2}
                  y={postY - postSize / 2}
                  width={postSize}
                  height={postSize}
                  fill={colors.post}
                  stroke={colors.deckStroke}
                  strokeWidth="1"
                />
              );
            })}
            
            {/* Right side posts */}
            {hasRight && Array.from({ length: rightPosts }).map((_, i) => {
              const postY = startY + (i * deckDepth / (rightPosts - 1 || 1));
              return (
                <rect
                  key={`right-post-${i}`}
                  x={startX + deckWidth + 2}
                  y={postY - postSize / 2}
                  width={postSize}
                  height={postSize}
                  fill={colors.post}
                  stroke={colors.deckStroke}
                  strokeWidth="1"
                />
              );
            })}
            
            {/* Front posts */}
            {hasFront && Array.from({ length: frontPosts }).map((_, i) => {
              const postX = startX + (i * deckWidth / (frontPosts - 1 || 1));
              // Skip corners if already covered by left/right posts
              if ((i === 0 && hasLeft) || (i === frontPosts - 1 && hasRight)) return null;
              return (
                <rect
                  key={`front-post-${i}`}
                  x={postX - postSize / 2}
                  y={startY + deckDepth + 2}
                  width={postSize}
                  height={postSize}
                  fill={colors.post}
                  stroke={colors.deckStroke}
                  strokeWidth="1"
                />
              );
            })}
            
            {/* Corner posts where rails meet */}
            {hasLeft && hasFront && (
              <rect
                x={startX - postSize - 2}
                y={startY + deckDepth - postSize / 2}
                width={postSize}
                height={postSize}
                fill={colors.post}
                stroke={colors.deckStroke}
                strokeWidth="1"
              />
            )}
            {hasRight && hasFront && (
              <rect
                x={startX + deckWidth + 2}
                y={startY + deckDepth - postSize / 2}
                width={postSize}
                height={postSize}
                fill={colors.post}
                stroke={colors.deckStroke}
                strokeWidth="1"
              />
            )}
          </g>
        );
      })()}

      {/* Dimension lines */}
      <g>
        {/* Width dimension */}
        <line x1={startX} y1={startY + deckDepth + 25} x2={startX + deckWidth} y2={startY + deckDepth + 25} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX} y1={startY + deckDepth + 20} x2={startX} y2={startY + deckDepth + 30} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX + deckWidth} y1={startY + deckDepth + 20} x2={startX + deckWidth} y2={startY + deckDepth + 30} stroke={colors.dimension} strokeWidth="1" />
        <text x={startX + deckWidth / 2} y={startY + deckDepth + 38} textAnchor="middle" fontSize="9" fill={colors.dimension} fontWeight="500">
          {formData.deckWidthFt}&apos;-0&quot;
        </text>
        
        {/* Depth dimension */}
        <line x1={startX + deckWidth + 25} y1={startY} x2={startX + deckWidth + 25} y2={startY + deckDepth} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX + deckWidth + 20} y1={startY} x2={startX + deckWidth + 30} y2={startY} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX + deckWidth + 20} y1={startY + deckDepth} x2={startX + deckWidth + 30} y2={startY + deckDepth} stroke={colors.dimension} strokeWidth="1" />
        <text x={startX + deckWidth + 38} y={startY + deckDepth / 2} textAnchor="middle" fontSize="9" fill={colors.dimension} fontWeight="500" transform={`rotate(90, ${startX + deckWidth + 38}, ${startY + deckDepth / 2})`}>
          {formData.deckProjectionFt}&apos;-0&quot;
        </text>
      </g>
    </svg>
  );
}

// Front View Component (elevation from front)
function FrontView({ formData, estimate, layers, isFullscreen }: DeckViewsProps) {
  const isAttached = formData.deckType === "attached";
  const hasStairs = formData.stairSections.some(s => s.location === "front");
  
  // Full HD: 1920x1080, minus space for header/controls (~200px)
  const maxWidth = isFullscreen ? 1800 : 420;
  const maxHeight = isFullscreen ? 800 : 360;
  const padding = isFullscreen ? 120 : 55;
  
  // Deck dimensions
  const deckHeightFt = formData.deckHeightIn / 12;
  const maxDeckHeight = Math.max(deckHeightFt, 3);
  
  const scaleX = (maxWidth - padding * 2) / Math.max(formData.deckWidthFt, 10);
  const scaleY = (maxHeight - padding * 2) / (maxDeckHeight + 3);
  const scale = Math.min(scaleX, scaleY);
  
  const deckWidth = formData.deckWidthFt * scale;
  const deckHeight = deckHeightFt * scale;
  const railingHeight = 36 / 12 * scale; // 36" railing
  
  const startX = (maxWidth - deckWidth) / 2;
  const groundY = maxHeight - padding;
  const deckTopY = groundY - deckHeight;
  
  // Footing/post positions
  const footingInsetFt = 1.5;
  const footingInsetPx = footingInsetFt * scale;
  const effectiveDeckWidthForFootings = formData.deckWidthFt - (footingInsetFt * 2);
  const maxPostSpacing = 9;
  const sectionsNeeded = Math.ceil(effectiveDeckWidthForFootings / maxPostSpacing);
  const postCount = sectionsNeeded + 1;
  const actualSpacing = postCount > 1 ? (deckWidth - footingInsetPx * 2) / (postCount - 1) : 0;
  
  // Front stairs
  const frontStair = formData.stairSections.find(s => s.location === "front");
  const stairWidth = frontStair ? frontStair.widthFt * scale : 0;
  const stairRise = 7.5; // inches
  const stepCount = frontStair?.stepCount || 0;

  return (
    <svg 
      viewBox={`0 0 ${maxWidth} ${maxHeight}`} 
      className="w-full h-auto"
      style={{ minHeight: isFullscreen ? "800px" : "320px" }}
    >
      <rect width="100%" height="100%" fill="#FAFAF8" />
      
      <defs>
        <pattern id="archGridFront" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E5E0" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#archGridFront)" />
      
      {/* Title */}
      <text x={maxWidth / 2} y={20} textAnchor="middle" fontSize="14" fontWeight="600" fill={colors.annotation}>
        FRONT ELEVATION
      </text>
      
      {/* Ground line */}
      <line x1={padding - 20} y1={groundY} x2={maxWidth - padding + 20} y2={groundY} stroke={colors.ground} strokeWidth="2" />
      <text x={maxWidth - padding + 25} y={groundY + 4} fontSize="8" fill={colors.dimension}>GRADE</text>
      
      {/* Footings (below grade) */}
      {layers.footings && Array.from({ length: postCount }).map((_, i) => {
        const x = startX + footingInsetPx + i * actualSpacing;
        const footingWidth = 16 * scale / 12; // 16" footing
        const footingDepth = 8 * scale / 12; // 8" deep shown
        return (
          <g key={`footing-front-${i}`}>
            <rect
              x={x - footingWidth / 2}
              y={groundY}
              width={footingWidth}
              height={footingDepth}
              fill={colors.concrete}
              stroke={colors.footings}
              strokeWidth="1.5"
            />
          </g>
        );
      })}
      
      {/* Posts */}
      {layers.framing && Array.from({ length: postCount }).map((_, i) => {
        const x = startX + footingInsetPx + i * actualSpacing;
        const postWidth = 5.5 * scale / 12; // 6x6 post
        return (
          <rect
            key={`post-front-${i}`}
            x={x - postWidth / 2}
            y={deckTopY}
            width={postWidth}
            height={deckHeight}
            fill={colors.post}
            stroke={colors.deckStroke}
            strokeWidth="1"
          />
        );
      })}
      
      {/* Beam */}
      {layers.framing && (
        <rect
          x={startX}
          y={deckTopY - 4}
          width={deckWidth}
          height={8}
          fill={colors.beam}
          stroke={colors.deckStroke}
          strokeWidth="1.5"
        />
      )}
      
      {/* Deck surface */}
      {layers.decking && (
        <rect
          x={startX - 3}
          y={deckTopY - 8}
          width={deckWidth + 6}
          height={5}
          fill={colors.deck}
          stroke={colors.deckStroke}
          strokeWidth="1.5"
        />
      )}
      
      {/* Fascia */}
      {layers.decking && (
        <rect
          x={startX - 3}
          y={deckTopY - 8}
          width={deckWidth + 6}
          height={12}
          fill="none"
          stroke={colors.deckStroke}
          strokeWidth="1.5"
        />
      )}
      
      {/* Railing (front) - 36" from deck surface */}
      {layers.railing && formData.openSides.includes("front") && (
        <g>
          {/* Top rail - 36" above deck surface */}
          <line
            x1={startX}
            y1={deckTopY - railingHeight - 8}
            x2={startX + deckWidth}
            y2={deckTopY - railingHeight - 8}
            stroke={colors.railing}
            strokeWidth="3"
          />
          {/* Bottom rail - 4" above deck surface */}
          <line
            x1={startX}
            y1={deckTopY - 12}
            x2={startX + deckWidth}
            y2={deckTopY - 12}
            stroke={colors.railing}
            strokeWidth="2"
          />
          {/* Balusters */}
          {Array.from({ length: Math.floor(formData.deckWidthFt * 2) }).map((_, i) => {
            const x = startX + (i + 1) * (deckWidth / (formData.deckWidthFt * 2 + 1));
            return (
              <line
                key={`baluster-${i}`}
                x1={x}
                y1={deckTopY - 12}
                x2={x}
                y2={deckTopY - railingHeight - 8}
                stroke={colors.railing}
                strokeWidth="1"
              />
            );
          })}
          {/* Posts */}
          <rect x={startX - 2} y={deckTopY - railingHeight - 10} width={5} height={railingHeight + 6} fill={colors.railing} />
          <rect x={startX + deckWidth - 3} y={deckTopY - railingHeight - 10} width={5} height={railingHeight + 6} fill={colors.railing} />
          
          {/* Railing height dimension - 36" */}
          <line x1={startX + deckWidth + 35} y1={deckTopY - 8} x2={startX + deckWidth + 35} y2={deckTopY - railingHeight - 8} stroke={colors.dimension} strokeWidth="1" strokeDasharray="2,2" />
          <line x1={startX + deckWidth + 30} y1={deckTopY - 8} x2={startX + deckWidth + 40} y2={deckTopY - 8} stroke={colors.dimension} strokeWidth="1" />
          <line x1={startX + deckWidth + 30} y1={deckTopY - railingHeight - 8} x2={startX + deckWidth + 40} y2={deckTopY - railingHeight - 8} stroke={colors.dimension} strokeWidth="1" />
          <text x={startX + deckWidth + 50} y={(deckTopY - 8 + deckTopY - railingHeight - 8) / 2 + 3} fontSize="8" fill={colors.dimension} fontWeight="500">
            36&quot;
          </text>
        </g>
      )}
      
      {/* Front stairs */}
      {hasStairs && frontStair && (
        <g>
          {Array.from({ length: stepCount }).map((_, i) => {
            const stepY = deckTopY + (i + 1) * (deckHeight / stepCount);
            const stepX = startX + deckWidth / 2 - stairWidth / 2;
            const treadDepth = 10 * scale / 12;
            return (
              <g key={`step-front-${i}`}>
                {/* Riser */}
                <rect
                  x={stepX}
                  y={stepY - (deckHeight / stepCount)}
                  width={stairWidth}
                  height={deckHeight / stepCount}
                  fill={colors.stairs}
                  stroke={colors.stairsStroke}
                  strokeWidth="1"
                />
              </g>
            );
          })}
          {/* Stair railings */}
          {layers.railing && formData.deckHeightIn >= 30 && (
            <>
              <line
                x1={startX + deckWidth / 2 - stairWidth / 2 - 3}
                y1={deckTopY - railingHeight - 8}
                x2={startX + deckWidth / 2 - stairWidth / 2 - 3}
                y2={groundY}
                stroke={colors.railing}
                strokeWidth="2"
              />
              <line
                x1={startX + deckWidth / 2 + stairWidth / 2 + 3}
                y1={deckTopY - railingHeight - 8}
                x2={startX + deckWidth / 2 + stairWidth / 2 + 3}
                y2={groundY}
                stroke={colors.railing}
                strokeWidth="2"
              />
            </>
          )}
        </g>
      )}
      
      {/* Dimension lines */}
      <g>
        {/* Width dimension */}
        <line x1={startX} y1={groundY + 25} x2={startX + deckWidth} y2={groundY + 25} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX} y1={groundY + 20} x2={startX} y2={groundY + 30} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX + deckWidth} y1={groundY + 20} x2={startX + deckWidth} y2={groundY + 30} stroke={colors.dimension} strokeWidth="1" />
        <text x={startX + deckWidth / 2} y={groundY + 40} textAnchor="middle" fontSize="9" fill={colors.dimension} fontWeight="500">
          {formData.deckWidthFt}&apos;-0&quot;
        </text>
        
        {/* Height dimension */}
        <line x1={startX - 25} y1={groundY} x2={startX - 25} y2={deckTopY - 8} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX - 30} y1={groundY} x2={startX - 20} y2={groundY} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX - 30} y1={deckTopY - 8} x2={startX - 20} y2={deckTopY - 8} stroke={colors.dimension} strokeWidth="1" />
        <text x={startX - 35} y={(groundY + deckTopY - 8) / 2} textAnchor="middle" fontSize="9" fill={colors.dimension} fontWeight="500" transform={`rotate(-90, ${startX - 35}, ${(groundY + deckTopY - 8) / 2})`}>
          {formData.deckHeightIn}&quot;
        </text>
      </g>
    </svg>
  );
}

// Side View Component (left or right elevation)
function SideView({ formData, estimate, layers, isFullscreen, side }: DeckViewsProps & { side: "left" | "right" }) {
  const isAttached = formData.deckType === "attached";
  
  // Full HD: 1920x1080, minus space for header/controls (~200px)
  const maxWidth = isFullscreen ? 1800 : 420;
  const maxHeight = isFullscreen ? 800 : 360;
  const padding = isFullscreen ? 120 : 55;
  
  const deckHeightFt = formData.deckHeightIn / 12;
  const maxDeckHeight = Math.max(deckHeightFt, 3);
  
  const scaleX = (maxWidth - padding * 2) / Math.max(formData.deckProjectionFt + (isAttached ? 2 : 0), 8);
  const scaleY = (maxHeight - padding * 2) / (maxDeckHeight + 3);
  const scale = Math.min(scaleX, scaleY);
  
  const deckDepth = formData.deckProjectionFt * scale;
  const deckHeight = deckHeightFt * scale;
  const railingHeight = 36 / 12 * scale;
  const houseWidth = isAttached ? 2 * scale : 0;
  
  const groundY = maxHeight - padding;
  const deckTopY = groundY - deckHeight;
  const startX = padding + (isAttached ? houseWidth : 0);
  
  // Post positions for side view
  const beamInsetFt = 1.5;
  const beamInsetPx = beamInsetFt * scale;
  
  // Side stairs
  const sideStair = formData.stairSections.find(s => s.location === side);
  const hasStairs = !!sideStair;

  return (
    <svg 
      viewBox={`0 0 ${maxWidth} ${maxHeight}`} 
      className="w-full h-auto"
      style={{ minHeight: isFullscreen ? "800px" : "320px" }}
    >
      <rect width="100%" height="100%" fill="#FAFAF8" />
      
      <defs>
        <pattern id={`archGridSide${side}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E5E0" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#archGridSide${side})`} />
      
      {/* Title */}
      <text x={maxWidth / 2} y={20} textAnchor="middle" fontSize="14" fontWeight="600" fill={colors.annotation}>
        {side.toUpperCase()} SIDE ELEVATION
      </text>
      
      {/* Ground line */}
      <line x1={padding - 20} y1={groundY} x2={maxWidth - padding + 20} y2={groundY} stroke={colors.ground} strokeWidth="2" />
      <text x={maxWidth - padding + 25} y={groundY + 4} fontSize="8" fill={colors.dimension}>GRADE</text>
      
      {/* House wall (if attached) */}
      {isAttached && (
        <g>
          <rect
            x={padding - 10}
            y={deckTopY - 60}
            width={houseWidth + 10}
            height={deckHeight + 80}
            fill={colors.house}
            stroke={colors.houseStroke}
            strokeWidth="1.5"
          />
          <text
            x={padding + houseWidth / 2 - 5}
            y={deckTopY - 20}
            textAnchor="middle"
            fontSize="8"
            fill={colors.houseStroke}
            fontWeight="600"
            transform={`rotate(-90, ${padding + houseWidth / 2 - 5}, ${deckTopY - 20})`}
          >
            HOUSE
          </text>
        </g>
      )}
      
      {/* Ledger board (if attached) */}
      {isAttached && layers.framing && (
        <rect
          x={startX - 5}
          y={deckTopY - 2}
          width={8}
          height={10}
          fill={colors.ledger}
          stroke={colors.deckStroke}
          strokeWidth="1"
        />
      )}
      
      {/* Footings */}
      {layers.footings && (
        <g>
          {/* Front footing */}
          <rect
            x={startX + deckDepth - beamInsetPx - 8}
            y={groundY}
            width={16}
            height={8}
            fill={colors.concrete}
            stroke={colors.footings}
            strokeWidth="1.5"
          />
          {/* Rear footing (if freestanding) */}
          {!isAttached && (
            <rect
              x={startX + beamInsetPx - 8}
              y={groundY}
              width={16}
              height={8}
              fill={colors.concrete}
              stroke={colors.footings}
              strokeWidth="1.5"
            />
          )}
        </g>
      )}
      
      {/* Posts */}
      {layers.framing && (
        <g>
          {/* Front post */}
          <rect
            x={startX + deckDepth - beamInsetPx - 3}
            y={deckTopY}
            width={6}
            height={deckHeight}
            fill={colors.post}
            stroke={colors.deckStroke}
            strokeWidth="1"
          />
          {/* Rear post (if freestanding) */}
          {!isAttached && (
            <rect
              x={startX + beamInsetPx - 3}
              y={deckTopY}
              width={6}
              height={deckHeight}
              fill={colors.post}
              stroke={colors.deckStroke}
              strokeWidth="1"
            />
          )}
        </g>
      )}
      
      {/* Beam */}
      {layers.framing && (
        <rect
          x={startX}
          y={deckTopY - 4}
          width={deckDepth}
          height={8}
          fill={colors.beam}
          stroke={colors.deckStroke}
          strokeWidth="1.5"
        />
      )}
      
      {/* Joists (shown as cross-section) */}
      {layers.framing && (
        <g>
          {Array.from({ length: 3 }).map((_, i) => {
            const x = startX + (i + 1) * (deckDepth / 4);
            return (
              <rect
                key={`joist-side-${i}`}
                x={x - 1}
                y={deckTopY - 12}
                width={3}
                height={8}
                fill={colors.joist}
                stroke={colors.deckStroke}
                strokeWidth="0.5"
              />
            );
          })}
        </g>
      )}
      
      {/* Deck surface */}
      {layers.decking && (
        <rect
          x={startX - 3}
          y={deckTopY - 16}
          width={deckDepth + 6}
          height={5}
          fill={colors.deck}
          stroke={colors.deckStroke}
          strokeWidth="1.5"
        />
      )}
      
      {/* Railing (side) - 36" from deck surface */}
      {layers.railing && formData.openSides.includes(side) && (
        <g>
          {/* Top rail - 36" above deck surface */}
          <line
            x1={startX}
            y1={deckTopY - railingHeight - 16}
            x2={startX + deckDepth}
            y2={deckTopY - railingHeight - 16}
            stroke={colors.railing}
            strokeWidth="3"
          />
          {/* Bottom rail - 4" above deck surface */}
          <line
            x1={startX}
            y1={deckTopY - 20}
            x2={startX + deckDepth}
            y2={deckTopY - 20}
            stroke={colors.railing}
            strokeWidth="2"
          />
          {/* Balusters */}
          {Array.from({ length: Math.floor(formData.deckProjectionFt * 2) }).map((_, i) => {
            const x = startX + (i + 1) * (deckDepth / (formData.deckProjectionFt * 2 + 1));
            return (
              <line
                key={`baluster-side-${i}`}
                x1={x}
                y1={deckTopY - 20}
                x2={x}
                y2={deckTopY - railingHeight - 16}
                stroke={colors.railing}
                strokeWidth="1"
              />
            );
          })}
          {/* Posts */}
          {!isAttached && (
            <rect x={startX - 2} y={deckTopY - railingHeight - 18} width={5} height={railingHeight + 6} fill={colors.railing} />
          )}
          <rect x={startX + deckDepth - 3} y={deckTopY - railingHeight - 18} width={5} height={railingHeight + 6} fill={colors.railing} />
          
          {/* Railing height dimension - 36" */}
          <line x1={startX + deckDepth + 45} y1={deckTopY - 16} x2={startX + deckDepth + 45} y2={deckTopY - railingHeight - 16} stroke={colors.dimension} strokeWidth="1" strokeDasharray="2,2" />
          <line x1={startX + deckDepth + 40} y1={deckTopY - 16} x2={startX + deckDepth + 50} y2={deckTopY - 16} stroke={colors.dimension} strokeWidth="1" />
          <line x1={startX + deckDepth + 40} y1={deckTopY - railingHeight - 16} x2={startX + deckDepth + 50} y2={deckTopY - railingHeight - 16} stroke={colors.dimension} strokeWidth="1" />
          <text x={startX + deckDepth + 55} y={(deckTopY - 16 + deckTopY - railingHeight - 16) / 2 + 3} fontSize="8" fill={colors.dimension} fontWeight="500">
            36&quot;
          </text>
        </g>
      )}
      
      {/* Dimension lines */}
      <g>
        {/* Depth dimension */}
        <line x1={startX} y1={groundY + 25} x2={startX + deckDepth} y2={groundY + 25} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX} y1={groundY + 20} x2={startX} y2={groundY + 30} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX + deckDepth} y1={groundY + 20} x2={startX + deckDepth} y2={groundY + 30} stroke={colors.dimension} strokeWidth="1" />
        <text x={startX + deckDepth / 2} y={groundY + 40} textAnchor="middle" fontSize="9" fill={colors.dimension} fontWeight="500">
          {formData.deckProjectionFt}&apos;-0&quot;
        </text>
        
        {/* Height dimension */}
        <line x1={startX + deckDepth + 25} y1={groundY} x2={startX + deckDepth + 25} y2={deckTopY - 16} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX + deckDepth + 20} y1={groundY} x2={startX + deckDepth + 30} y2={groundY} stroke={colors.dimension} strokeWidth="1" />
        <line x1={startX + deckDepth + 20} y1={deckTopY - 16} x2={startX + deckDepth + 30} y2={deckTopY - 16} stroke={colors.dimension} strokeWidth="1" />
        <text x={startX + deckDepth + 40} y={(groundY + deckTopY - 16) / 2} textAnchor="middle" fontSize="9" fill={colors.dimension} fontWeight="500" transform={`rotate(90, ${startX + deckDepth + 40}, ${(groundY + deckTopY - 16) / 2})`}>
          {formData.deckHeightIn}&quot;
        </text>
      </g>
    </svg>
  );
}

// Main component with page navigation
export function DeckViews({ formData, estimate, layers, isFullscreen = false }: DeckViewsProps) {
  const [currentPage, setCurrentPage] = useState<ViewPage>("top");
  
  const currentIndex = VIEW_PAGES.findIndex(p => p.id === currentPage);
  
  const goNext = () => {
    if (currentIndex < VIEW_PAGES.length - 1) {
      setCurrentPage(VIEW_PAGES[currentIndex + 1].id);
    }
  };
  
  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentPage(VIEW_PAGES[currentIndex - 1].id);
    }
  };

  const renderCurrentView = () => {
    switch (currentPage) {
      case "top":
        return <TopView formData={formData} estimate={estimate} layers={layers} isFullscreen={isFullscreen} />;
      case "front":
        return <FrontView formData={formData} estimate={estimate} layers={layers} isFullscreen={isFullscreen} />;
      case "left":
        return <SideView formData={formData} estimate={estimate} layers={layers} isFullscreen={isFullscreen} side="left" />;
      case "right":
        return <SideView formData={formData} estimate={estimate} layers={layers} isFullscreen={isFullscreen} side="right" />;
      default:
        return <TopView formData={formData} estimate={estimate} layers={layers} isFullscreen={isFullscreen} />;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Page navigation tabs */}
      <div className="flex items-center justify-between gap-1 px-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={goPrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-1 overflow-x-auto">
          {VIEW_PAGES.map((page, index) => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className={cn(
                "px-2 py-1 text-[9px] font-medium rounded transition-colors whitespace-nowrap",
                currentPage === page.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {isFullscreen ? page.label : page.shortLabel}
            </button>
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={goNext}
          disabled={currentIndex === VIEW_PAGES.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Page indicator */}
      <div className="text-center">
        <span className="text-[9px] text-muted-foreground">
          Page {currentIndex + 1} of {VIEW_PAGES.length}
        </span>
      </div>
      
      {/* Current view */}
      <div className="border border-border rounded-lg overflow-hidden bg-white">
        {renderCurrentView()}
      </div>
    </div>
  );
}

export { TopView, FrontView, SideView };
