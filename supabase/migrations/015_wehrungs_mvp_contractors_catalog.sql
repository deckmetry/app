-- Wehrung's MVP: contractor discount + supplier-managed catalog
-- ============================================================

-- 1. Add discount_pct to org_customers (contractor-specific discount)
ALTER TABLE org_customers
  ADD COLUMN IF NOT EXISTS discount_pct NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (discount_pct >= 0 AND discount_pct <= 100),
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS assigned_salesperson_id UUID REFERENCES auth.users(id);

-- 2. Supplier-managed catalog groups (Framing, Decking, Railing, etc.)
CREATE TABLE IF NOT EXISTS supplier_catalog_groups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scg_supplier ON supplier_catalog_groups(supplier_org_id) WHERE active = true;

-- 3. Supplier-managed catalog items (SKU-level products with pricing)
CREATE TABLE IF NOT EXISTS supplier_catalog_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  group_id        UUID REFERENCES supplier_catalog_groups(id) ON DELETE SET NULL,
  sku             TEXT NOT NULL,
  description     TEXT NOT NULL,
  brand           TEXT,
  collection      TEXT,
  color           TEXT,
  unit            TEXT NOT NULL DEFAULT 'each',
  base_price      NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock_status    TEXT NOT NULL DEFAULT 'in_stock'
    CHECK (stock_status IN ('in_stock','low_stock','out_of_stock','special_order')),
  special_order   BOOLEAN NOT NULL DEFAULT false,
  taxable         BOOLEAN NOT NULL DEFAULT true,
  active          BOOLEAN NOT NULL DEFAULT true,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(supplier_org_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_sci_supplier ON supplier_catalog_items(supplier_org_id) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_sci_group    ON supplier_catalog_items(group_id);

-- 4. updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON supplier_catalog_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON supplier_catalog_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. RLS
ALTER TABLE supplier_catalog_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_catalog_items  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Supplier manages own catalog groups"
  ON supplier_catalog_groups FOR ALL
  USING (supplier_org_id IN (SELECT get_user_org_ids()))
  WITH CHECK (supplier_org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Catalog groups readable by linked contractors"
  ON supplier_catalog_groups FOR SELECT
  USING (
    supplier_org_id IN (
      SELECT owner_org_id FROM org_customers
      WHERE customer_org_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "Supplier manages own catalog items"
  ON supplier_catalog_items FOR ALL
  USING (supplier_org_id IN (SELECT get_user_org_ids()))
  WITH CHECK (supplier_org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Catalog items readable by linked contractors"
  ON supplier_catalog_items FOR SELECT
  USING (
    supplier_org_id IN (
      SELECT owner_org_id FROM org_customers
      WHERE customer_org_id IN (SELECT get_user_org_ids())
    )
  );
