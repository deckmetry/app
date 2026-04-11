-- Deckmetry — Supplier Embed System
-- Adds branding columns, anonymous estimates, supplier leads, contractor-supplier links

-- ============================================================
-- 1. EMBED BRANDING ON ORGANIZATIONS
-- ============================================================

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#2d7a6b';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS embed_config JSONB DEFAULT '{"show_header": true}';

-- ============================================================
-- 2. ALLOW ANONYMOUS ESTIMATES (created_by nullable)
-- ============================================================

ALTER TABLE estimates ALTER COLUMN created_by DROP NOT NULL;

-- ============================================================
-- 3. SUPPLIER LEADS TABLE
-- ============================================================

CREATE TABLE supplier_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_org_id UUID NOT NULL REFERENCES organizations(id),
  homeowner_name TEXT,
  homeowner_email TEXT NOT NULL,
  homeowner_phone TEXT,
  project_address TEXT,
  estimate_id UUID REFERENCES estimates(id),
  status TEXT NOT NULL DEFAULT 'new',  -- new | contacted | converted | archived
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_supplier_leads_org ON supplier_leads(supplier_org_id);
CREATE INDEX idx_supplier_leads_status ON supplier_leads(supplier_org_id, status);

ALTER TABLE supplier_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Supplier org members can view their leads"
  ON supplier_leads FOR SELECT USING (
    supplier_org_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Supplier org members can update their leads"
  ON supplier_leads FOR UPDATE USING (
    supplier_org_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Service role inserts leads (anonymous embed flow), no INSERT policy needed for users

-- ============================================================
-- 4. CONTRACTOR-SUPPLIER LINKS
-- ============================================================

CREATE TABLE contractor_supplier_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_org_id UUID NOT NULL REFERENCES organizations(id) UNIQUE,
  supplier_org_id UUID NOT NULL REFERENCES organizations(id),
  status TEXT NOT NULL DEFAULT 'active',  -- active | independent
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contractor_supplier_links_supplier ON contractor_supplier_links(supplier_org_id);

ALTER TABLE contractor_supplier_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Both parties can view their links"
  ON contractor_supplier_links FOR SELECT USING (
    contractor_org_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    OR supplier_org_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );
