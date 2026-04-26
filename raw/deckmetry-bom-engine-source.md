# Deckmetry BOM Engine — Source Code Reference

> **Type:** Internal codebase documentation
> **Files:** `lib/calculations.ts`, `lib/catalog.ts`, `lib/types.ts`, `lib/store.ts`
> **Date captured:** 2026-04-10

This document references the core algorithm files that power Deckmetry's deck estimator wizard and Bill of Materials (BOM) generation engine.

## File Summary

| File | Lines | Purpose |
|------|-------|---------|
| `lib/calculations.ts` | ~1100 | Main BOM calculation engine — structural, foundation, decking, fasteners, fascia, stairs, railing, lighting |
| `lib/catalog.ts` | ~660 | Hardcoded product catalog — brands, collections, colors, railing systems, span tables, waste factors |
| `lib/types.ts` | ~197 | TypeScript type definitions — EstimateInput, DerivedValues, BomItem, EstimateOutput |
| `lib/store.ts` | ~77 | Wizard form state — default values, step navigation |

## Architecture Notes

- `calculateEstimate(input: EstimateInput): EstimateOutput` is the single entry point
- Runs both client-side (real-time preview) and server-side (authoritative)
- No external API calls — pure computation from input + catalog data
- Produces: `assumptions[]`, `warnings[]`, `bom: BomItem[]`, `derived: DerivedValues`
