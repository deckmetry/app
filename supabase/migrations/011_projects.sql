-- Project-centric architecture: projects, supplier estimates, stakeholders, sharing
-- Zero breaking changes — all new FKs on existing tables are nullable.

-- ============================================================
-- 1. NEW TYPES
-- ============================================================

CREATE TYPE project_status AS ENUM (
  'bom_created',
  'estimate_requested',
  'estimate_received',
  'proposal_sent',
  'proposal_viewed',
  'agreement_signed',
  'po_submitted',
  'po_confirmed',
  'materials_shipped',
  'materials_delivered',
  'complete',
  'cancelled'
);

CREATE TYPE supplier_estimate_status AS ENUM (
  'draft', 'sent', 'viewed', 'accepted', 'expired', 'revised'
);

CREATE TYPE project_stakeholder_role AS ENUM (
  'homeowner', 'contractor', 'supplier'
);

-- ============================================================
-- 2. PROJECTS TABLE
-- ============================================================

CREATE SEQUENCE project_number_seq START 1;

CREATE TABLE projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_org_id UUID NOT NULL REFERENCES organizations(id),
  created_by        UUID REFERENCES auth.users(id),
  homeowner_org_id  UUID REFERENCES organizations(id),
  contractor_org_id UUID REFERENCES organizations(id),
  supplier_org_id   UUID REFERENCES organizations(id),
  name              TEXT NOT NULL DEFAULT 'Untitled Project',
  address           TEXT,
  description       TEXT,
  status            project_status NOT NULL DEFAULT 'bom_created',
  share_token       TEXT UNIQUE DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  project_number    TEXT NOT NULL UNIQUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

-- Auto-generate project numbers
CREATE OR REPLACE FUNCTION generate_project_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_number IS NULL OR NEW.project_number = '' THEN
    NEW.project_number := 'PRJ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('project_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_project_number
  BEFORE INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION generate_project_number();

CREATE INDEX idx_projects_created_by_org ON projects(created_by_org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_homeowner_org ON projects(homeowner_org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_contractor_org ON projects(contractor_org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_supplier_org ON projects(supplier_org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_status ON projects(status) WHERE deleted_at IS NULL;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. PROJECT STAKEHOLDERS
-- ============================================================

CREATE TABLE project_stakeholders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  role            project_stakeholder_role NOT NULL,
  added_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, organization_id)
);

CREATE INDEX idx_project_stakeholders_org ON project_stakeholders(organization_id);
CREATE INDEX idx_project_stakeholders_project ON project_stakeholders(project_id);

-- ============================================================
-- 4. PROJECT SHARES (homeowner sharing with spouse/partner)
-- ============================================================

CREATE TABLE project_shares (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  shared_by           UUID NOT NULL REFERENCES auth.users(id),
  shared_with_email   TEXT NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id),
  permission          TEXT NOT NULL DEFAULT 'view',
  token               TEXT NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  status              TEXT NOT NULL DEFAULT 'pending',
  accepted_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, shared_with_email)
);

CREATE INDEX idx_project_shares_token ON project_shares(token) WHERE status = 'pending';

-- ============================================================
-- 5. SUPPLIER ESTIMATES (supplier-priced BOM)
-- ============================================================

CREATE SEQUENCE supplier_estimate_number_seq START 1;

CREATE TABLE supplier_estimates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID REFERENCES projects(id),
  estimate_id      UUID NOT NULL REFERENCES estimates(id),
  organization_id  UUID NOT NULL REFERENCES organizations(id),
  recipient_org_id UUID REFERENCES organizations(id),
  created_by       UUID NOT NULL REFERENCES auth.users(id),
  status           supplier_estimate_status NOT NULL DEFAULT 'draft',
  estimate_number  TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL DEFAULT '',
  cover_note       TEXT,
  valid_until      DATE,
  subtotal         NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate         NUMERIC(5,4) NOT NULL DEFAULT 0,
  tax_amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  total            NUMERIC(12,2) NOT NULL DEFAULT 0,
  share_token      TEXT UNIQUE DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  sent_at          TIMESTAMPTZ,
  viewed_at        TIMESTAMPTZ,
  accepted_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ
);

-- Auto-generate supplier estimate numbers
CREATE OR REPLACE FUNCTION generate_supplier_estimate_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estimate_number IS NULL OR NEW.estimate_number = '' THEN
    NEW.estimate_number := 'EST-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('supplier_estimate_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_supplier_estimate_number
  BEFORE INSERT ON supplier_estimates
  FOR EACH ROW EXECUTE FUNCTION generate_supplier_estimate_number();

CREATE INDEX idx_supplier_estimates_org ON supplier_estimates(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_supplier_estimates_recipient ON supplier_estimates(recipient_org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_supplier_estimates_project ON supplier_estimates(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_supplier_estimates_estimate ON supplier_estimates(estimate_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON supplier_estimates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 6. SUPPLIER ESTIMATE LINE ITEMS
-- ============================================================

CREATE TABLE supplier_estimate_line_items (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_estimate_id UUID NOT NULL REFERENCES supplier_estimates(id) ON DELETE CASCADE,
  category             TEXT NOT NULL,
  description          TEXT NOT NULL,
  size                 TEXT,
  quantity             NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit                 TEXT NOT NULL DEFAULT 'ea',
  unit_price           NUMERIC(10,2) NOT NULL DEFAULT 0,
  line_total           NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  in_stock             BOOLEAN DEFAULT true,
  lead_time_days       INTEGER,
  notes                TEXT,
  sort_order           INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_supplier_estimate_line_items_parent
  ON supplier_estimate_line_items(supplier_estimate_id);

-- ============================================================
-- 7. ADD project_id FK TO EXISTING TABLES
-- ============================================================

ALTER TABLE estimates ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);

CREATE INDEX IF NOT EXISTS idx_estimates_project ON estimates(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_project ON quotes(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_project ON orders(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id) WHERE project_id IS NOT NULL;

-- ============================================================
-- 8. RLS HELPER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_project_ids()
RETURNS SETOF UUID AS $$
  SELECT ps.project_id FROM project_stakeholders ps
  WHERE ps.organization_id IN (SELECT get_user_org_ids())
  UNION
  SELECT psh.project_id FROM project_shares psh
  WHERE psh.shared_with_user_id = auth.uid() AND psh.status = 'accepted'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 9. RLS POLICIES
-- ============================================================

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stakeholders can view projects"
  ON projects FOR SELECT
  USING (deleted_at IS NULL AND id IN (SELECT get_user_project_ids()));

CREATE POLICY "Creator org can update projects"
  ON projects FOR UPDATE
  USING (created_by_org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Members can create projects"
  ON projects FOR INSERT
  WITH CHECK (created_by_org_id IN (SELECT get_user_org_ids()));

-- Project stakeholders
ALTER TABLE project_stakeholders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stakeholders can view project stakeholders"
  ON project_stakeholders FOR SELECT
  USING (project_id IN (SELECT get_user_project_ids()));

CREATE POLICY "Creator org can manage stakeholders"
  ON project_stakeholders FOR INSERT
  WITH CHECK (project_id IN (
    SELECT id FROM projects WHERE created_by_org_id IN (SELECT get_user_org_ids())
  ));

CREATE POLICY "Creator org can delete stakeholders"
  ON project_stakeholders FOR DELETE
  USING (project_id IN (
    SELECT id FROM projects WHERE created_by_org_id IN (SELECT get_user_org_ids())
  ));

-- Project shares
ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can view shares"
  ON project_shares FOR SELECT
  USING (project_id IN (SELECT get_user_project_ids()));

CREATE POLICY "Sharer can create shares"
  ON project_shares FOR INSERT
  WITH CHECK (shared_by = auth.uid());

CREATE POLICY "Sharer can update shares"
  ON project_shares FOR UPDATE
  USING (shared_by = auth.uid());

CREATE POLICY "Sharer can delete shares"
  ON project_shares FOR DELETE
  USING (shared_by = auth.uid());

-- Supplier estimates
ALTER TABLE supplier_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers manage own estimates"
  ON supplier_estimates FOR ALL
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Recipients can view sent supplier estimates"
  ON supplier_estimates FOR SELECT
  USING (
    status != 'draft'
    AND recipient_org_id IN (SELECT get_user_org_ids())
  );

-- Supplier estimate line items
ALTER TABLE supplier_estimate_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access via supplier estimate"
  ON supplier_estimate_line_items FOR ALL
  USING (supplier_estimate_id IN (
    SELECT id FROM supplier_estimates
    WHERE organization_id IN (SELECT get_user_org_ids())
       OR (status != 'draft' AND recipient_org_id IN (SELECT get_user_org_ids()))
  ));
