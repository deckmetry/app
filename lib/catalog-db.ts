/**
 * Server-side catalog reader — fetches catalog data from Supabase.
 *
 * Returns the same shapes as lib/catalog.ts so the calculation engine
 * can consume either source without changes.
 *
 * Usage: Server Actions and Route Handlers only (uses cookies-based client).
 * The client-side wizard still imports directly from lib/catalog.ts
 * for instant previews without network round-trips.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  DeckingBrand,
  DeckingCollection,
  DeckingColorOption,
  RailingSystem,
  RailingSystemColor,
  StockCatalog,
  JurisdictionProfile,
} from "./types";

// Re-export the hardcoded catalog as a fallback
import {
  deckingBrands as hardcodedBrands,
  railingSystems as hardcodedRailingSystems,
  stockCatalog as hardcodedStockCatalog,
  jurisdictionProfile as hardcodedJurisdictionProfile,
  joistSpanLookup as hardcodedJoistSpanLookup,
  beamSpanLookup as hardcodedBeamSpanLookup,
  wasteFactors as hardcodedWasteFactors,
  lightingDefaults as hardcodedLightingDefaults,
} from "./catalog";

// ─── Row types from Supabase ────────────────────────────────

interface BrandRow {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
}

interface CollectionRow {
  id: string;
  brand_id: string;
  slug: string;
  name: string;
  brand_name: string;
  board_face_width_in: number;
  board_thickness_in: number;
  notes: string | null;
  sort_order: number;
}

interface ColorRow {
  id: string;
  collection_id: string;
  name: string;
  grooved_lengths_ft: number[];
  solid_lengths_ft: number[];
  fascia_options: string[];
  hidden_fastener_sku_group: string | null;
  screw_sku_group: string | null;
  plug_sku_group: string | null;
  sort_order: number;
}

interface RailingSystemRow {
  id: string;
  slug: string;
  material: string;
  label: string;
  level_section_lengths_ft: number[];
  stair_section_lengths_ft: number[];
  level_post_heights_in: number[];
  stair_post_heights_in: number[];
  sort_order: number;
}

interface RailingColorRow {
  id: string;
  railing_system_id: string;
  name: string;
  sort_order: number;
}

interface StockRow {
  key: string;
  values_json: unknown;
}

interface JurisdictionRow {
  slug: string;
  label: string;
  soil_bearing_psf: number;
  frost_depth_in: number;
  default_sonotube_length_in: number;
  coastal_mode: boolean;
  bag_yield_cf_80: number;
  bag_yield_cf_60: number;
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Fetch all decking brands with nested collections and colors.
 * Returns the same DeckingBrand[] shape as catalog.ts.
 */
export async function getCatalogBrands(): Promise<DeckingBrand[]> {
  try {
    const supabase = await createClient();

    const [brandsRes, collectionsRes, colorsRes] = await Promise.all([
      supabase
        .from("catalog_brands")
        .select("*")
        .is("deleted_at", null)
        .order("sort_order"),
      supabase
        .from("catalog_collections")
        .select("*")
        .is("deleted_at", null)
        .order("sort_order"),
      supabase
        .from("catalog_colors")
        .select("*")
        .is("deleted_at", null)
        .order("sort_order"),
    ]);

    if (brandsRes.error || collectionsRes.error || colorsRes.error) {
      console.error("catalog-db: fetch error, falling back to hardcoded", {
        brands: brandsRes.error,
        collections: collectionsRes.error,
        colors: colorsRes.error,
      });
      return hardcodedBrands;
    }

    const brands = brandsRes.data as BrandRow[];
    const collections = collectionsRes.data as CollectionRow[];
    const colors = colorsRes.data as ColorRow[];

    // If DB is empty, fall back
    if (brands.length === 0) {
      return hardcodedBrands;
    }

    // Group colors by collection_id
    const colorsByCollection = new Map<string, ColorRow[]>();
    for (const color of colors) {
      const existing = colorsByCollection.get(color.collection_id) ?? [];
      existing.push(color);
      colorsByCollection.set(color.collection_id, existing);
    }

    // Group collections by brand_id
    const collectionsByBrand = new Map<string, CollectionRow[]>();
    for (const col of collections) {
      const existing = collectionsByBrand.get(col.brand_id) ?? [];
      existing.push(col);
      collectionsByBrand.set(col.brand_id, existing);
    }

    // Assemble the nested structure
    return brands.map((brand): DeckingBrand => ({
      id: brand.slug,
      name: brand.name as DeckingBrand["name"],
      collections: (collectionsByBrand.get(brand.id) ?? []).map(
        (col): DeckingCollection => ({
          id: col.slug,
          name: col.name,
          brand: col.brand_name as DeckingCollection["brand"],
          boardFaceWidthIn: Number(col.board_face_width_in),
          boardThicknessIn: Number(col.board_thickness_in),
          notes: col.notes ?? undefined,
          colors: (colorsByCollection.get(col.id) ?? []).map(
            (color): DeckingColorOption => ({
              name: color.name,
              groovedLengthsFt: color.grooved_lengths_ft,
              solidLengthsFt: color.solid_lengths_ft,
              fasciaOptions: color.fascia_options as DeckingColorOption["fasciaOptions"],
              hiddenFastenerSkuGroup: color.hidden_fastener_sku_group ?? "",
              screwSkuGroup: color.screw_sku_group ?? "",
              plugSkuGroup: color.plug_sku_group ?? "",
            })
          ),
        })
      ),
    }));
  } catch (err) {
    console.error("catalog-db: unexpected error, falling back to hardcoded", err);
    return hardcodedBrands;
  }
}

/**
 * Fetch collections for a specific brand by brand slug.
 */
export async function getCatalogCollections(
  brandSlug: string
): Promise<DeckingCollection[]> {
  const brands = await getCatalogBrands();
  const brand = brands.find((b) => b.id === brandSlug);
  return brand?.collections ?? [];
}

/**
 * Fetch colors for a specific collection by collection slug.
 */
export async function getCatalogColors(
  collectionSlug: string
): Promise<DeckingColorOption[]> {
  const brands = await getCatalogBrands();
  for (const brand of brands) {
    const collection = brand.collections.find((c) => c.id === collectionSlug);
    if (collection) return collection.colors;
  }
  return [];
}

/**
 * Fetch all railing systems with nested colors.
 * Returns the same RailingSystem[] shape as catalog.ts.
 */
export async function getRailingSystems(): Promise<RailingSystem[]> {
  try {
    const supabase = await createClient();

    const [systemsRes, colorsRes] = await Promise.all([
      supabase
        .from("catalog_railing_systems")
        .select("*")
        .is("deleted_at", null)
        .order("sort_order"),
      supabase
        .from("catalog_railing_colors")
        .select("*")
        .is("deleted_at", null)
        .order("sort_order"),
    ]);

    if (systemsRes.error || colorsRes.error) {
      console.error("catalog-db: railing fetch error, falling back", {
        systems: systemsRes.error,
        colors: colorsRes.error,
      });
      return hardcodedRailingSystems;
    }

    const systems = systemsRes.data as RailingSystemRow[];
    const colors = colorsRes.data as RailingColorRow[];

    if (systems.length === 0) {
      return hardcodedRailingSystems;
    }

    // Group colors by railing_system_id
    const colorsBySystem = new Map<string, RailingColorRow[]>();
    for (const color of colors) {
      const existing = colorsBySystem.get(color.railing_system_id) ?? [];
      existing.push(color);
      colorsBySystem.set(color.railing_system_id, existing);
    }

    return systems.map(
      (sys): RailingSystem => ({
        id: sys.slug,
        material: sys.material as RailingSystem["material"],
        label: sys.label,
        colors: (colorsBySystem.get(sys.id) ?? []).map(
          (c): RailingSystemColor => ({ name: c.name })
        ),
        levelSectionLengthsFt: sys.level_section_lengths_ft,
        stairSectionLengthsFt: sys.stair_section_lengths_ft,
        levelPostHeightsIn: sys.level_post_heights_in,
        stairPostHeightsIn: sys.stair_post_heights_in,
      })
    );
  } catch (err) {
    console.error("catalog-db: unexpected railing error, falling back", err);
    return hardcodedRailingSystems;
  }
}

/**
 * Fetch stock catalog data (framing lengths, sonotube diameters, etc.).
 * Returns the same StockCatalog shape as catalog.ts.
 */
export async function getStockCatalog(): Promise<StockCatalog> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("catalog_stock")
      .select("key, values_json");

    if (error || !data || data.length === 0) {
      return hardcodedStockCatalog;
    }

    const rows = data as StockRow[];
    const stockMap = new Map<string, unknown>();
    for (const row of rows) {
      stockMap.set(row.key, row.values_json);
    }

    return {
      framingLengthsFt: (stockMap.get("framingLengthsFt") as number[]) ?? hardcodedStockCatalog.framingLengthsFt,
      sonotubeDiametersIn: (stockMap.get("sonotubeDiametersIn") as number[]) ?? hardcodedStockCatalog.sonotubeDiametersIn,
      transformerSizesW: (stockMap.get("transformerSizesW") as number[]) ?? hardcodedStockCatalog.transformerSizesW,
    };
  } catch {
    return hardcodedStockCatalog;
  }
}

/**
 * Fetch jurisdiction profile. Returns the East Coast default.
 */
export async function getJurisdictionProfile(
  slug = "east-coast-default"
): Promise<JurisdictionProfile> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jurisdiction_profiles")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      return hardcodedJurisdictionProfile;
    }

    const row = data as JurisdictionRow;
    return {
      id: row.slug,
      label: row.label,
      soilBearingPsf: row.soil_bearing_psf,
      frostDepthIn: row.frost_depth_in,
      defaultSonotubeLengthIn: row.default_sonotube_length_in,
      coastalMode: row.coastal_mode,
      bagYieldCf80: Number(row.bag_yield_cf_80),
      bagYieldCf60: Number(row.bag_yield_cf_60),
    };
  } catch {
    return hardcodedJurisdictionProfile;
  }
}

/**
 * Fetch waste factors from catalog_stock.
 */
export async function getWasteFactors(): Promise<typeof hardcodedWasteFactors> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("catalog_stock")
      .select("values_json")
      .eq("key", "wasteFactors")
      .single();

    if (error || !data) {
      return hardcodedWasteFactors;
    }

    return (data as StockRow).values_json as typeof hardcodedWasteFactors;
  } catch {
    return hardcodedWasteFactors;
  }
}

/**
 * Fetch lighting defaults from catalog_stock.
 */
export async function getLightingDefaults(): Promise<typeof hardcodedLightingDefaults> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("catalog_stock")
      .select("values_json")
      .eq("key", "lightingDefaults")
      .single();

    if (error || !data) {
      return hardcodedLightingDefaults;
    }

    return (data as StockRow).values_json as typeof hardcodedLightingDefaults;
  } catch {
    return hardcodedLightingDefaults;
  }
}

/**
 * Fetch joist span lookup from catalog_stock.
 */
export async function getJoistSpanLookup(): Promise<typeof hardcodedJoistSpanLookup> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("catalog_stock")
      .select("values_json")
      .eq("key", "joistSpanLookup")
      .single();

    if (error || !data) {
      return hardcodedJoistSpanLookup;
    }

    return (data as StockRow).values_json as typeof hardcodedJoistSpanLookup;
  } catch {
    return hardcodedJoistSpanLookup;
  }
}

/**
 * Fetch beam span lookup from catalog_stock.
 */
export async function getBeamSpanLookup(): Promise<typeof hardcodedBeamSpanLookup> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("catalog_stock")
      .select("values_json")
      .eq("key", "beamSpanLookup")
      .single();

    if (error || !data) {
      return hardcodedBeamSpanLookup;
    }

    return (data as StockRow).values_json as typeof hardcodedBeamSpanLookup;
  } catch {
    return hardcodedBeamSpanLookup;
  }
}

/**
 * Fetch the complete catalog in one call — brands, railing systems,
 * stock catalog, jurisdiction, and lookup tables.
 * Returns all data shapes matching what catalog.ts exports.
 */
export async function getFullCatalog() {
  const [
    deckingBrands,
    railingSystems,
    stockCatalog,
    jurisdictionProfile,
    wasteFactors,
    lightingDefaults,
    joistSpanLookup,
    beamSpanLookup,
  ] = await Promise.all([
    getCatalogBrands(),
    getRailingSystems(),
    getStockCatalog(),
    getJurisdictionProfile(),
    getWasteFactors(),
    getLightingDefaults(),
    getJoistSpanLookup(),
    getBeamSpanLookup(),
  ]);

  return {
    deckingBrands,
    railingSystems,
    stockCatalog,
    jurisdictionProfile,
    wasteFactors,
    lightingDefaults,
    joistSpanLookup,
    beamSpanLookup,
  };
}
