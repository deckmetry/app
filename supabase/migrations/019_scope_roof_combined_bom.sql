-- Project scope (deck / roof / deck_roof) + roof config on estimates, and
-- combined deck+roof BOM line items (section/brand/color). Deck columns become
-- nullable so roof-only projects can be saved.
--
-- NOTE: ALTER TYPE ... ADD VALUE cannot run in the same transaction that uses the
-- new value, so the enum additions are committed first (idempotent).

ALTER TYPE bom_category ADD VALUE IF NOT EXISTS 'roof';
ALTER TYPE bom_category ADD VALUE IF NOT EXISTS 'other';

ALTER TABLE public.estimates
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'deck',
  ADD COLUMN IF NOT EXISTS roof_config jsonb;

ALTER TABLE public.estimates
  DROP CONSTRAINT IF EXISTS estimates_scope_check;
ALTER TABLE public.estimates
  ADD CONSTRAINT estimates_scope_check CHECK (scope IN ('deck', 'roof', 'deck_roof'));

-- Roof-only projects have no deck geometry.
ALTER TABLE public.estimates
  ALTER COLUMN deck_type DROP NOT NULL,
  ALTER COLUMN deck_width_ft DROP NOT NULL,
  ALTER COLUMN deck_projection_ft DROP NOT NULL,
  ALTER COLUMN deck_height_in DROP NOT NULL,
  ALTER COLUMN joist_spacing_in DROP NOT NULL;

-- Combined BOM line items: display grouping + brand/color (used by roof lines).
ALTER TABLE public.estimate_line_items
  ADD COLUMN IF NOT EXISTS section text,
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS color text;
