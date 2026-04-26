-- Deckmetry — Catalog Tables & Seed Data
-- Creates catalog_brands, catalog_collections, catalog_colors,
-- catalog_railing_systems, catalog_railing_colors, catalog_stock,
-- jurisdiction_profiles and seeds from hardcoded catalog.ts data.

-- ============================================================
-- 1. CATALOG TABLES
-- ============================================================

CREATE TABLE catalog_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE catalog_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES catalog_brands(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  board_face_width_in NUMERIC(5,2) NOT NULL DEFAULT 5.5,
  board_thickness_in NUMERIC(5,2) NOT NULL DEFAULT 0.94,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_catalog_collections_brand ON catalog_collections(brand_id) WHERE deleted_at IS NULL;

CREATE TABLE catalog_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES catalog_collections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grooved_lengths_ft INTEGER[] NOT NULL DEFAULT '{12,16,20}',
  solid_lengths_ft INTEGER[] NOT NULL DEFAULT '{20}',
  fascia_options TEXT[] NOT NULL DEFAULT '{"1x12x12"}',
  hidden_fastener_sku_group TEXT,
  screw_sku_group TEXT,
  plug_sku_group TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_catalog_colors_collection ON catalog_colors(collection_id) WHERE deleted_at IS NULL;

CREATE TABLE catalog_railing_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  material railing_material NOT NULL,
  label TEXT NOT NULL,
  level_section_lengths_ft INTEGER[] NOT NULL DEFAULT '{6,8}',
  stair_section_lengths_ft INTEGER[] NOT NULL DEFAULT '{6,8}',
  level_post_heights_in INTEGER[] NOT NULL DEFAULT '{39}',
  stair_post_heights_in INTEGER[] NOT NULL DEFAULT '{45}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE catalog_railing_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  railing_system_id UUID NOT NULL REFERENCES catalog_railing_systems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_railing_colors_system ON catalog_railing_colors(railing_system_id) WHERE deleted_at IS NULL;

CREATE TABLE catalog_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  values_json JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE jurisdiction_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  soil_bearing_psf INTEGER NOT NULL DEFAULT 2000,
  frost_depth_in INTEGER NOT NULL DEFAULT 36,
  default_sonotube_length_in INTEGER NOT NULL DEFAULT 48,
  coastal_mode BOOLEAN NOT NULL DEFAULT false,
  bag_yield_cf_80 NUMERIC(4,2) NOT NULL DEFAULT 0.6,
  bag_yield_cf_60 NUMERIC(4,2) NOT NULL DEFAULT 0.45,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ============================================================
-- 2. TRIGGERS — auto-update updated_at
-- ============================================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON catalog_brands FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON catalog_collections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON catalog_colors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON catalog_railing_systems FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON catalog_railing_colors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON catalog_stock FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON jurisdiction_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. RLS — catalog tables are public SELECT (no auth required)
-- ============================================================

ALTER TABLE catalog_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_railing_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_railing_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurisdiction_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access (anon + authenticated)
CREATE POLICY "Public read catalog_brands" ON catalog_brands FOR SELECT USING (true);
CREATE POLICY "Public read catalog_collections" ON catalog_collections FOR SELECT USING (true);
CREATE POLICY "Public read catalog_colors" ON catalog_colors FOR SELECT USING (true);
CREATE POLICY "Public read catalog_railing_systems" ON catalog_railing_systems FOR SELECT USING (true);
CREATE POLICY "Public read catalog_railing_colors" ON catalog_railing_colors FOR SELECT USING (true);
CREATE POLICY "Public read catalog_stock" ON catalog_stock FOR SELECT USING (true);
CREATE POLICY "Public read jurisdiction_profiles" ON jurisdiction_profiles FOR SELECT USING (true);

-- ============================================================
-- 4. SEED DATA
-- ============================================================

-- 4a. Jurisdiction Profile
INSERT INTO jurisdiction_profiles (slug, label, soil_bearing_psf, frost_depth_in, default_sonotube_length_in, coastal_mode, bag_yield_cf_80, bag_yield_cf_60, sort_order)
VALUES ('east-coast-default', 'East Coast Default', 2000, 36, 48, false, 0.60, 0.45, 0)
ON CONFLICT (slug) DO NOTHING;

-- 4b. Stock Catalog
INSERT INTO catalog_stock (key, values_json, description) VALUES
  ('framingLengthsFt', '[8, 10, 12, 14, 16, 18, 20]', 'Available framing lumber lengths in feet'),
  ('sonotubeDiametersIn', '[10, 12, 14, 16, 18, 20, 22, 24]', 'Available sonotube diameters in inches'),
  ('transformerSizesW', '[45, 60, 100, 150, 200, 300]', 'Available transformer sizes in watts'),
  ('wasteFactors', '{"framing": 0.05, "decking": 0.07, "fascia": 0.1, "railing": 0.03}', 'Waste factors by material category'),
  ('lightingDefaults', '{"watts": {"postCap": 1.5, "stair": 1.0, "accent": 2.0}}', 'Default wattage per lighting type'),
  ('joistSpanLookup', '{"12": {"2x6": 9.5, "2x8": 12.5, "2x10": 15.67, "2x12": 18}, "16": {"2x6": 8.33, "2x8": 11.08, "2x10": 13.58, "2x12": 15.75}}', 'Joist span lookup by spacing and size'),
  ('beamSpanLookup', '{"6": {"3-2x8": 9.42, "3-2x10": 11.75, "3-2x12": 13.67}, "8": {"3-2x8": 8.25, "3-2x10": 10.17, "3-2x12": 11.83}, "10": {"3-2x8": 7.33, "3-2x10": 9.08, "3-2x12": 10.5}, "12": {"3-2x8": 6.67, "3-2x10": 8.25, "3-2x12": 9.58}, "14": {"3-2x8": 6.17, "3-2x10": 7.58, "3-2x12": 8.83}, "16": {"3-2x8": 5.75, "3-2x10": 7.08, "3-2x12": 8.25}, "18": {"3-2x8": 5.42, "3-2x10": 6.67, "3-2x12": 7.83}}', 'Beam span lookup by joist span bucket and beam size')
ON CONFLICT (key) DO NOTHING;

-- 4c. Brands
-- Use DO block with variables to chain parent IDs into child inserts
DO $$
DECLARE
  -- Brand IDs
  brand_trex UUID;
  brand_timbertech UUID;
  brand_deckorators UUID;
  -- Collection IDs
  col_enhance_naturals UUID;
  col_select UUID;
  col_transcend UUID;
  col_lineage UUID;
  col_signature UUID;
  col_prime_plus UUID;
  col_terrain UUID;
  col_landmark UUID;
  col_venture UUID;
  col_voyage UUID;
  col_summit UUID;
  -- Railing system IDs
  rail_vinyl UUID;
  rail_composite UUID;
  rail_aluminum UUID;
  rail_cable UUID;
BEGIN

  -- ==================== BRANDS ====================
  INSERT INTO catalog_brands (slug, name, sort_order)
  VALUES ('trex', 'Trex', 0)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO brand_trex;

  INSERT INTO catalog_brands (slug, name, sort_order)
  VALUES ('timbertech', 'TimberTech', 1)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO brand_timbertech;

  INSERT INTO catalog_brands (slug, name, sort_order)
  VALUES ('deckorators', 'Deckorators', 2)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO brand_deckorators;

  -- ==================== TREX COLLECTIONS ====================

  INSERT INTO catalog_collections (brand_id, slug, name, brand_name, board_face_width_in, board_thickness_in, sort_order)
  VALUES (brand_trex, 'trex-enhance-naturals', 'Enhance Naturals', 'Trex', 5.5, 0.94, 0)
  ON CONFLICT (slug) DO UPDATE SET brand_id = EXCLUDED.brand_id
  RETURNING id INTO col_enhance_naturals;

  INSERT INTO catalog_collections (brand_id, slug, name, brand_name, board_face_width_in, board_thickness_in, sort_order)
  VALUES (brand_trex, 'trex-select', 'Select', 'Trex', 5.5, 0.82, 1)
  ON CONFLICT (slug) DO UPDATE SET brand_id = EXCLUDED.brand_id
  RETURNING id INTO col_select;

  INSERT INTO catalog_collections (brand_id, slug, name, brand_name, board_face_width_in, board_thickness_in, sort_order)
  VALUES (brand_trex, 'trex-transcend', 'Transcend', 'Trex', 5.5, 0.94, 2)
  ON CONFLICT (slug) DO UPDATE SET brand_id = EXCLUDED.brand_id
  RETURNING id INTO col_transcend;

  INSERT INTO catalog_collections (brand_id, slug, name, brand_name, board_face_width_in, board_thickness_in, sort_order)
  VALUES (brand_trex, 'trex-lineage', 'Transcend Lineage', 'Trex', 5.5, 0.94, 3)
  ON CONFLICT (slug) DO UPDATE SET brand_id = EXCLUDED.brand_id
  RETURNING id INTO col_lineage;

  INSERT INTO catalog_collections (brand_id, slug, name, brand_name, board_face_width_in, board_thickness_in, sort_order)
  VALUES (brand_trex, 'trex-signature', 'Signature', 'Trex', 5.5, 1.0, 4)
  ON CONFLICT (slug) DO UPDATE SET brand_id = EXCLUDED.brand_id
  RETURNING id INTO col_signature;

  -- ==================== TIMBERTECH COLLECTIONS ====================

  INSERT INTO catalog_collections (brand_id, slug, name, brand_name, board_face_width_in, board_thickness_in, sort_order)
  VALUES (brand_timbertech, 'tt-prime-plus', 'Prime+', 'TimberTech', 5.36, 0.94, 0)
  ON CONFLICT (slug) DO UPDATE SET brand_id = EXCLUDED.brand_id
  RETURNING id INTO col_prime_plus;

  INSERT INTO catalog_collections (brand_id, slug, name, brand_name, board_face_width_in, board_thickness_in, sort_order)
  VALUES (brand_timbertech, 'tt-terrain', 'Terrain+', 'TimberTech', 5.36, 0.94, 1)
  ON CONFLICT (slug) DO UPDATE SET brand_id = EXCLUDED.brand_id
  RETURNING id INTO col_terrain;

  INSERT INTO catalog_collections (brand_id, slug, name, brand_name, board_face_width_in, board_thickness_in, sort_order)
  VALUES (brand_timbertech, 'tt-landmark', 'Landmark', 'TimberTech', 5.5, 1.0, 2)
  ON CONFLICT (slug) DO UPDATE SET brand_id = EXCLUDED.brand_id
  RETURNING id INTO col_landmark;

  -- ==================== DECKORATORS COLLECTIONS ====================

  INSERT INTO catalog_collections (brand_id, slug, name, brand_name, board_face_width_in, board_thickness_in, sort_order)
  VALUES (brand_deckorators, 'deckorators-venture', 'Venture', 'Deckorators', 5.5, 0.94, 0)
  ON CONFLICT (slug) DO UPDATE SET brand_id = EXCLUDED.brand_id
  RETURNING id INTO col_venture;

  INSERT INTO catalog_collections (brand_id, slug, name, brand_name, board_face_width_in, board_thickness_in, sort_order)
  VALUES (brand_deckorators, 'deckorators-voyage', 'Voyage', 'Deckorators', 5.5, 0.94, 1)
  ON CONFLICT (slug) DO UPDATE SET brand_id = EXCLUDED.brand_id
  RETURNING id INTO col_voyage;

  INSERT INTO catalog_collections (brand_id, slug, name, brand_name, board_face_width_in, board_thickness_in, sort_order)
  VALUES (brand_deckorators, 'deckorators-summit', 'Summit', 'Deckorators', 5.5, 0.94, 2)
  ON CONFLICT (slug) DO UPDATE SET brand_id = EXCLUDED.brand_id
  RETURNING id INTO col_summit;

  -- ==================== TREX ENHANCE NATURALS COLORS ====================

  INSERT INTO catalog_colors (collection_id, name, grooved_lengths_ft, solid_lengths_ft, fascia_options, hidden_fastener_sku_group, screw_sku_group, plug_sku_group, sort_order)
  VALUES
    (col_enhance_naturals, 'Toasted Sand', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-enhance-hidden', 'trex-enhance-screws', 'trex-enhance-plugs', 0),
    (col_enhance_naturals, 'Cinnamon Cove', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-enhance-hidden', 'trex-enhance-screws', 'trex-enhance-plugs', 1),
    (col_enhance_naturals, 'Rocky Harbour', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-enhance-hidden', 'trex-enhance-screws', 'trex-enhance-plugs', 2),
    (col_enhance_naturals, 'Foggy Wharf', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-enhance-hidden', 'trex-enhance-screws', 'trex-enhance-plugs', 3),
    (col_enhance_naturals, 'Honey Grove', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-enhance-hidden', 'trex-enhance-screws', 'trex-enhance-plugs', 4),
    (col_enhance_naturals, 'Golden Hour', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-enhance-hidden', 'trex-enhance-screws', 'trex-enhance-plugs', 5)
  ON CONFLICT DO NOTHING;

  -- ==================== TREX SELECT COLORS ====================

  INSERT INTO catalog_colors (collection_id, name, grooved_lengths_ft, solid_lengths_ft, fascia_options, hidden_fastener_sku_group, screw_sku_group, plug_sku_group, sort_order)
  VALUES
    (col_select, 'Whiskey Barrel', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-select-hidden', 'trex-select-screws', 'trex-select-plugs', 0),
    (col_select, 'Millstone', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-select-hidden', 'trex-select-screws', 'trex-select-plugs', 1)
  ON CONFLICT DO NOTHING;

  -- ==================== TREX TRANSCEND COLORS ====================

  INSERT INTO catalog_colors (collection_id, name, grooved_lengths_ft, solid_lengths_ft, fascia_options, hidden_fastener_sku_group, screw_sku_group, plug_sku_group, sort_order)
  VALUES
    (col_transcend, 'Rope Swing', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-transcend-hidden', 'trex-transcend-screws', 'trex-transcend-plugs', 0),
    (col_transcend, 'Havana Gold', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-transcend-hidden', 'trex-transcend-screws', 'trex-transcend-plugs', 1),
    (col_transcend, 'Lava Rock', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-transcend-hidden', 'trex-transcend-screws', 'trex-transcend-plugs', 2),
    (col_transcend, 'Tiki Torch', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-transcend-hidden', 'trex-transcend-screws', 'trex-transcend-plugs', 3),
    (col_transcend, 'Spiced Rum', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-transcend-hidden', 'trex-transcend-screws', 'trex-transcend-plugs', 4),
    (col_transcend, 'Island Mist', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-transcend-hidden', 'trex-transcend-screws', 'trex-transcend-plugs', 5)
  ON CONFLICT DO NOTHING;

  -- ==================== TREX TRANSCEND LINEAGE COLORS ====================

  INSERT INTO catalog_colors (collection_id, name, grooved_lengths_ft, solid_lengths_ft, fascia_options, hidden_fastener_sku_group, screw_sku_group, plug_sku_group, sort_order)
  VALUES
    (col_lineage, 'Rainier', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-lineage-hidden', 'trex-lineage-screws', 'trex-lineage-plugs', 0),
    (col_lineage, 'Carmel', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-lineage-hidden', 'trex-lineage-screws', 'trex-lineage-plugs', 1),
    (col_lineage, 'Weathered Teak', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-lineage-hidden', 'trex-lineage-screws', 'trex-lineage-plugs', 2),
    (col_lineage, 'Biscayne', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-lineage-hidden', 'trex-lineage-screws', 'trex-lineage-plugs', 3),
    (col_lineage, 'Pebble Beach', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-lineage-hidden', 'trex-lineage-screws', 'trex-lineage-plugs', 4),
    (col_lineage, 'Jasper', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-lineage-hidden', 'trex-lineage-screws', 'trex-lineage-plugs', 5),
    (col_lineage, 'Ember', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-lineage-hidden', 'trex-lineage-screws', 'trex-lineage-plugs', 6)
  ON CONFLICT DO NOTHING;

  -- ==================== TREX SIGNATURE COLORS ====================

  INSERT INTO catalog_colors (collection_id, name, grooved_lengths_ft, solid_lengths_ft, fascia_options, hidden_fastener_sku_group, screw_sku_group, plug_sku_group, sort_order)
  VALUES
    (col_signature, 'Whidbey', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-signature-hidden', 'trex-signature-screws', 'trex-signature-plugs', 0),
    (col_signature, 'Ocotillo', '{12,16,20}', '{20}', '{"1x8x12","1x12x12"}', 'trex-signature-hidden', 'trex-signature-screws', 'trex-signature-plugs', 1)
  ON CONFLICT DO NOTHING;

  -- ==================== TIMBERTECH PRIME+ COLORS ====================

  INSERT INTO catalog_colors (collection_id, name, grooved_lengths_ft, solid_lengths_ft, fascia_options, hidden_fastener_sku_group, screw_sku_group, plug_sku_group, sort_order)
  VALUES
    (col_prime_plus, 'Coconut Husk', '{12,16,20}', '{20}', '{"1x12x12"}', 'tt-primeplus-hidden', 'tt-primeplus-screws', 'tt-primeplus-plugs', 0),
    (col_prime_plus, 'Sea Salt Gray', '{12,16,20}', '{20}', '{"1x12x12"}', 'tt-primeplus-hidden', 'tt-primeplus-screws', 'tt-primeplus-plugs', 1),
    (col_prime_plus, 'Dark Cocoa', '{12,16,20}', '{20}', '{"1x12x12"}', 'tt-primeplus-hidden', 'tt-primeplus-screws', 'tt-primeplus-plugs', 2)
  ON CONFLICT DO NOTHING;

  -- ==================== TIMBERTECH TERRAIN+ COLORS ====================

  INSERT INTO catalog_colors (collection_id, name, grooved_lengths_ft, solid_lengths_ft, fascia_options, hidden_fastener_sku_group, screw_sku_group, plug_sku_group, sort_order)
  VALUES
    (col_terrain, 'Sandy Birch', '{12,16,20}', '{20}', '{"1x12x12"}', 'tt-terrain-hidden', 'tt-terrain-screws', 'tt-terrain-plugs', 0),
    (col_terrain, 'Stone Ash', '{12,16,20}', '{20}', '{"1x12x12"}', 'tt-terrain-hidden', 'tt-terrain-screws', 'tt-terrain-plugs', 1),
    (col_terrain, 'Silver Maple', '{12,16,20}', '{20}', '{"1x12x12"}', 'tt-terrain-hidden', 'tt-terrain-screws', 'tt-terrain-plugs', 2),
    (col_terrain, 'Brown Oak', '{12,16,20}', '{20}', '{"1x12x12"}', 'tt-terrain-hidden', 'tt-terrain-screws', 'tt-terrain-plugs', 3),
    (col_terrain, 'Rustic Elm', '{12,16,20}', '{20}', '{"1x12x12"}', 'tt-terrain-hidden', 'tt-terrain-screws', 'tt-terrain-plugs', 4)
  ON CONFLICT DO NOTHING;

  -- ==================== TIMBERTECH LANDMARK COLORS ====================

  INSERT INTO catalog_colors (collection_id, name, grooved_lengths_ft, solid_lengths_ft, fascia_options, hidden_fastener_sku_group, screw_sku_group, plug_sku_group, sort_order)
  VALUES
    (col_landmark, 'Boardwalk', '{12,16,20}', '{20}', '{"1x12x12"}', 'tt-landmark-hidden', 'tt-landmark-screws', 'tt-landmark-plugs', 0),
    (col_landmark, 'French White Oak', '{12,16,20}', '{20}', '{"1x12x12"}', 'tt-landmark-hidden', 'tt-landmark-screws', 'tt-landmark-plugs', 1),
    (col_landmark, 'Castle Gate', '{12,16,20}', '{20}', '{"1x12x12"}', 'tt-landmark-hidden', 'tt-landmark-screws', 'tt-landmark-plugs', 2),
    (col_landmark, 'American Walnut', '{12,16,20}', '{20}', '{"1x12x12"}', 'tt-landmark-hidden', 'tt-landmark-screws', 'tt-landmark-plugs', 3)
  ON CONFLICT DO NOTHING;

  -- ==================== DECKORATORS VENTURE COLORS ====================

  INSERT INTO catalog_colors (collection_id, name, grooved_lengths_ft, solid_lengths_ft, fascia_options, hidden_fastener_sku_group, screw_sku_group, plug_sku_group, sort_order)
  VALUES
    (col_venture, 'Saltwater', '{12,16,20}', '{20}', '{"1x12x12"}', 'deckorators-venture-hidden', 'deckorators-venture-screws', 'deckorators-venture-plugs', 0),
    (col_venture, 'Sandbar', '{12,16,20}', '{20}', '{"1x12x12"}', 'deckorators-venture-hidden', 'deckorators-venture-screws', 'deckorators-venture-plugs', 1),
    (col_venture, 'Shoreline', '{12,16,20}', '{20}', '{"1x12x12"}', 'deckorators-venture-hidden', 'deckorators-venture-screws', 'deckorators-venture-plugs', 2)
  ON CONFLICT DO NOTHING;

  -- ==================== DECKORATORS VOYAGE COLORS ====================

  INSERT INTO catalog_colors (collection_id, name, grooved_lengths_ft, solid_lengths_ft, fascia_options, hidden_fastener_sku_group, screw_sku_group, plug_sku_group, sort_order)
  VALUES
    (col_voyage, 'Costa', '{12,16,20}', '{20}', '{"1x12x12"}', 'deckorators-voyage-hidden', 'deckorators-voyage-screws', 'deckorators-voyage-plugs', 0),
    (col_voyage, 'Sierra', '{12,16,20}', '{20}', '{"1x12x12"}', 'deckorators-voyage-hidden', 'deckorators-voyage-screws', 'deckorators-voyage-plugs', 1),
    (col_voyage, 'Khaya', '{12,16,20}', '{20}', '{"1x12x12"}', 'deckorators-voyage-hidden', 'deckorators-voyage-screws', 'deckorators-voyage-plugs', 2),
    (col_voyage, 'Tundra', '{12,16,20}', '{20}', '{"1x12x12"}', 'deckorators-voyage-hidden', 'deckorators-voyage-screws', 'deckorators-voyage-plugs', 3),
    (col_voyage, 'Sedona', '{12,16,20}', '{20}', '{"1x12x12"}', 'deckorators-voyage-hidden', 'deckorators-voyage-screws', 'deckorators-voyage-plugs', 4),
    (col_voyage, 'Mesa', '{12,16,20}', '{20}', '{"1x12x12"}', 'deckorators-voyage-hidden', 'deckorators-voyage-screws', 'deckorators-voyage-plugs', 5)
  ON CONFLICT DO NOTHING;

  -- ==================== DECKORATORS SUMMIT COLORS ====================

  INSERT INTO catalog_colors (collection_id, name, grooved_lengths_ft, solid_lengths_ft, fascia_options, hidden_fastener_sku_group, screw_sku_group, plug_sku_group, sort_order)
  VALUES
    (col_summit, 'Glacier', '{12,16,20}', '{20}', '{"1x12x12"}', 'deckorators-summit-hidden', 'deckorators-summit-screws', 'deckorators-summit-plugs', 0),
    (col_summit, 'Boulder', '{12,16,20}', '{20}', '{"1x12x12"}', 'deckorators-summit-hidden', 'deckorators-summit-screws', 'deckorators-summit-plugs', 1),
    (col_summit, 'Cliffside', '{12,16,20}', '{20}', '{"1x12x12"}', 'deckorators-summit-hidden', 'deckorators-summit-screws', 'deckorators-summit-plugs', 2)
  ON CONFLICT DO NOTHING;

  -- ==================== RAILING SYSTEMS ====================

  INSERT INTO catalog_railing_systems (slug, material, label, level_section_lengths_ft, stair_section_lengths_ft, level_post_heights_in, stair_post_heights_in, sort_order)
  VALUES ('vinyl-rail', 'vinyl', 'Vinyl Railing', '{6,8}', '{6,8}', '{39}', '{45}', 0)
  ON CONFLICT (slug) DO UPDATE SET material = EXCLUDED.material
  RETURNING id INTO rail_vinyl;

  INSERT INTO catalog_railing_systems (slug, material, label, level_section_lengths_ft, stair_section_lengths_ft, level_post_heights_in, stair_post_heights_in, sort_order)
  VALUES ('composite-rail', 'composite', 'Composite Railing', '{6,8}', '{6,8}', '{39}', '{45}', 1)
  ON CONFLICT (slug) DO UPDATE SET material = EXCLUDED.material
  RETURNING id INTO rail_composite;

  INSERT INTO catalog_railing_systems (slug, material, label, level_section_lengths_ft, stair_section_lengths_ft, level_post_heights_in, stair_post_heights_in, sort_order)
  VALUES ('aluminum-rail', 'aluminum', 'Aluminum Railing', '{6,8}', '{6,8}', '{39}', '{45}', 2)
  ON CONFLICT (slug) DO UPDATE SET material = EXCLUDED.material
  RETURNING id INTO rail_aluminum;

  INSERT INTO catalog_railing_systems (slug, material, label, level_section_lengths_ft, stair_section_lengths_ft, level_post_heights_in, stair_post_heights_in, sort_order)
  VALUES ('cable-rail', 'cable', 'Cable Railing', '{6,8}', '{6,8}', '{39}', '{45}', 3)
  ON CONFLICT (slug) DO UPDATE SET material = EXCLUDED.material
  RETURNING id INTO rail_cable;

  -- ==================== RAILING COLORS ====================

  -- Vinyl: White, Clay, Khaki
  INSERT INTO catalog_railing_colors (railing_system_id, name, sort_order) VALUES
    (rail_vinyl, 'White', 0),
    (rail_vinyl, 'Clay', 1),
    (rail_vinyl, 'Khaki', 2)
  ON CONFLICT DO NOTHING;

  -- Composite: White, Black, Brown
  INSERT INTO catalog_railing_colors (railing_system_id, name, sort_order) VALUES
    (rail_composite, 'White', 0),
    (rail_composite, 'Black', 1),
    (rail_composite, 'Brown', 2)
  ON CONFLICT DO NOTHING;

  -- Aluminum: Black, Bronze, White
  INSERT INTO catalog_railing_colors (railing_system_id, name, sort_order) VALUES
    (rail_aluminum, 'Black', 0),
    (rail_aluminum, 'Bronze', 1),
    (rail_aluminum, 'White', 2)
  ON CONFLICT DO NOTHING;

  -- Cable: Black, Silver
  INSERT INTO catalog_railing_colors (railing_system_id, name, sort_order) VALUES
    (rail_cable, 'Black', 0),
    (rail_cable, 'Silver', 1)
  ON CONFLICT DO NOTHING;

END $$;
