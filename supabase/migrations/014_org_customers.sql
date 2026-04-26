-- org_customers: org-to-org customer relationships
-- Allows contractors to manage homeowners, suppliers to manage contractors, etc.

-- ============================================================
-- 1. TABLE
-- ============================================================

CREATE TABLE org_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_org_id UUID NOT NULL REFERENCES organizations(id),
  customer_org_id UUID NOT NULL REFERENCES organizations(id),
  customer_role TEXT NOT NULL CHECK (customer_role IN ('homeowner', 'contractor', 'supplier')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_org_id, customer_org_id)
);

CREATE INDEX idx_org_customers_owner ON org_customers(owner_org_id) WHERE status = 'active';
CREATE INDEX idx_org_customers_customer ON org_customers(customer_org_id);

-- ============================================================
-- 2. UPDATED_AT TRIGGER
-- ============================================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON org_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. RLS
-- ============================================================

ALTER TABLE org_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their customers"
  ON org_customers FOR ALL
  USING (owner_org_id IN (SELECT get_user_org_ids()))
  WITH CHECK (owner_org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Customers can view their relationship"
  ON org_customers FOR SELECT
  USING (customer_org_id IN (SELECT get_user_org_ids()));
