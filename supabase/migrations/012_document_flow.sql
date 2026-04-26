-- Migration 012: Fix document flow
-- Adds missing number sequences, closes the document chain,
-- fixes project_id propagation, and creates a unified document view.

-- ─────────────────────────────────────────────────────────────
-- 1a. BOM number sequence for estimates
-- ─────────────────────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS bom_number_seq START 1;

ALTER TABLE estimates ADD COLUMN IF NOT EXISTS bom_number TEXT UNIQUE;

CREATE OR REPLACE FUNCTION generate_bom_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bom_number IS NULL OR NEW.bom_number = '' THEN
    NEW.bom_number := 'BOM-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('bom_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_bom_number ON estimates;
CREATE TRIGGER set_bom_number
  BEFORE INSERT ON estimates
  FOR EACH ROW EXECUTE FUNCTION generate_bom_number();

-- Backfill existing estimates
UPDATE estimates
SET bom_number = 'BOM-' || to_char(created_at, 'YYYY') || '-' || lpad(nextval('bom_number_seq')::text, 5, '0')
WHERE bom_number IS NULL;

ALTER TABLE estimates ALTER COLUMN bom_number SET NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 1b. Delivery number sequence
-- ─────────────────────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS delivery_number_seq START 1;

ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_number TEXT UNIQUE;

CREATE OR REPLACE FUNCTION generate_delivery_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.delivery_number IS NULL OR NEW.delivery_number = '' THEN
    NEW.delivery_number := 'DEL-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('delivery_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_delivery_number ON deliveries;
CREATE TRIGGER set_delivery_number
  BEFORE INSERT ON deliveries
  FOR EACH ROW EXECUTE FUNCTION generate_delivery_number();

-- Backfill existing deliveries
UPDATE deliveries
SET delivery_number = 'DEL-' || to_char(created_at, 'YYYY') || '-' || lpad(nextval('delivery_number_seq')::text, 5, '0')
WHERE delivery_number IS NULL;

ALTER TABLE deliveries ALTER COLUMN delivery_number SET NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 1c. Add project_id to deliveries
-- ─────────────────────────────────────────────────────────────

ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
CREATE INDEX IF NOT EXISTS idx_deliveries_project ON deliveries(project_id) WHERE project_id IS NOT NULL;

-- Backfill from orders
UPDATE deliveries
SET project_id = orders.project_id
FROM orders
WHERE deliveries.order_id = orders.id
  AND deliveries.project_id IS NULL
  AND orders.project_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 1d. Close document chain: orders.supplier_estimate_id
-- ─────────────────────────────────────────────────────────────

ALTER TABLE orders ADD COLUMN IF NOT EXISTS supplier_estimate_id UUID REFERENCES supplier_estimates(id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_estimate ON orders(supplier_estimate_id) WHERE supplier_estimate_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 1e. Propagation triggers for project_id
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION propagate_project_id_to_invoice()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_id IS NULL AND NEW.order_id IS NOT NULL THEN
    SELECT project_id INTO NEW.project_id FROM orders WHERE id = NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invoice_project_id ON invoices;
CREATE TRIGGER set_invoice_project_id
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION propagate_project_id_to_invoice();

CREATE OR REPLACE FUNCTION propagate_project_id_to_delivery()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_id IS NULL AND NEW.order_id IS NOT NULL THEN
    SELECT project_id INTO NEW.project_id FROM orders WHERE id = NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_delivery_project_id ON deliveries;
CREATE TRIGGER set_delivery_project_id
  BEFORE INSERT ON deliveries
  FOR EACH ROW EXECUTE FUNCTION propagate_project_id_to_delivery();

-- ─────────────────────────────────────────────────────────────
-- 1f. Backfill orphaned project_id values
-- ─────────────────────────────────────────────────────────────

-- Invoices: inherit from order
UPDATE invoices
SET project_id = orders.project_id
FROM orders
WHERE invoices.order_id = orders.id
  AND invoices.project_id IS NULL
  AND orders.project_id IS NOT NULL;

-- Quotes: inherit from estimate
UPDATE quotes
SET project_id = estimates.project_id
FROM estimates
WHERE quotes.estimate_id = estimates.id
  AND quotes.project_id IS NULL
  AND estimates.project_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 1g. Fix orphaned estimates (no project_id)
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  est RECORD;
  new_project_id UUID;
  org_type TEXT;
BEGIN
  FOR est IN
    SELECT id, organization_id, created_by, project_name, project_address
    FROM estimates
    WHERE project_id IS NULL AND deleted_at IS NULL
  LOOP
    SELECT type INTO org_type FROM organizations WHERE id = est.organization_id;

    INSERT INTO projects (created_by_org_id, created_by, name, address)
    VALUES (
      est.organization_id,
      est.created_by,
      COALESCE(NULLIF(est.project_name, ''), 'Untitled Project'),
      est.project_address
    )
    RETURNING id INTO new_project_id;

    -- Set the role-specific org_id
    IF org_type = 'homeowner' THEN
      UPDATE projects SET homeowner_org_id = est.organization_id WHERE id = new_project_id;
    ELSIF org_type = 'contractor' THEN
      UPDATE projects SET contractor_org_id = est.organization_id WHERE id = new_project_id;
    ELSIF org_type = 'supplier' THEN
      UPDATE projects SET supplier_org_id = est.organization_id WHERE id = new_project_id;
    END IF;

    UPDATE estimates SET project_id = new_project_id WHERE id = est.id;

    INSERT INTO project_stakeholders (project_id, organization_id, role)
    VALUES (new_project_id, est.organization_id, COALESCE(org_type, 'homeowner')::project_stakeholder_role);
  END LOOP;
END $$;

-- Now enforce NOT NULL
ALTER TABLE estimates ALTER COLUMN project_id SET NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 1h. Document flow view
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW project_document_flow AS

-- BOMs (estimates)
SELECT
  e.project_id,
  'bom'::text AS doc_type,
  e.id AS doc_id,
  e.bom_number AS doc_number,
  COALESCE(NULLIF(e.project_name, ''), 'Untitled BOM') AS title,
  e.status::text AS status,
  NULL::numeric(12,2) AS amount,
  e.organization_id AS owner_org_id,
  NULL::uuid AS counterparty_org_id,
  NULL::text AS direction,
  e.created_at,
  NULL::uuid AS parent_doc_id,
  NULL::text AS parent_doc_type
FROM estimates e
WHERE e.deleted_at IS NULL

UNION ALL

-- Supplier estimates
SELECT
  se.project_id,
  'supplier_estimate',
  se.id,
  se.estimate_number,
  COALESCE(NULLIF(se.title, ''), 'Material Estimate'),
  se.status::text,
  se.total,
  se.organization_id,
  se.recipient_org_id,
  'sell',
  se.created_at,
  se.estimate_id,
  'bom'
FROM supplier_estimates se
WHERE se.deleted_at IS NULL

UNION ALL

-- Proposals (quotes)
SELECT
  q.project_id,
  'proposal',
  q.id,
  q.quote_number,
  COALESCE(NULLIF(q.title, ''), 'Untitled Proposal'),
  q.status::text,
  q.total,
  q.organization_id,
  NULL,
  'sell',
  q.created_at,
  q.estimate_id,
  'bom'
FROM quotes q
WHERE q.deleted_at IS NULL

UNION ALL

-- Purchase orders
SELECT
  o.project_id,
  'order',
  o.id,
  o.order_number,
  o.title,
  o.status::text,
  o.total,
  o.organization_id,
  o.supplier_org_id,
  'buy',
  o.created_at,
  COALESCE(o.supplier_estimate_id, o.quote_id),
  CASE
    WHEN o.supplier_estimate_id IS NOT NULL THEN 'supplier_estimate'
    WHEN o.quote_id IS NOT NULL THEN 'proposal'
    ELSE NULL
  END
FROM orders o
WHERE o.deleted_at IS NULL

UNION ALL

-- Invoices
SELECT
  i.project_id,
  'invoice',
  i.id,
  i.invoice_number,
  COALESCE(NULLIF(i.title, ''), 'Invoice'),
  i.status::text,
  i.total,
  i.organization_id,
  i.contractor_org_id,
  'sell',
  i.created_at,
  i.order_id,
  'order'
FROM invoices i
WHERE i.deleted_at IS NULL

UNION ALL

-- Deliveries
SELECT
  d.project_id,
  'delivery',
  d.id,
  d.delivery_number,
  COALESCE(d.carrier, 'Shipment'),
  d.status::text,
  NULL,
  d.organization_id,
  NULL,
  NULL,
  d.created_at,
  d.order_id,
  'order'
FROM deliveries d;
