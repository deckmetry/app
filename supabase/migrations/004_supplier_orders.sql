-- Deckmetry Phase 4 — Orders, Invoices, Payments & Deliveries

-- ============================================================
-- 1. CUSTOM TYPES
-- ============================================================

CREATE TYPE order_status AS ENUM (
  'draft', 'submitted', 'confirmed', 'processing',
  'shipped', 'delivered', 'cancelled'
);

CREATE TYPE invoice_status AS ENUM (
  'draft', 'sent', 'paid', 'overdue', 'void', 'cancelled'
);

CREATE TYPE payment_status AS ENUM (
  'pending', 'processing', 'succeeded', 'failed', 'refunded'
);

CREATE TYPE delivery_status AS ENUM (
  'pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed'
);

-- ============================================================
-- 2. SEQUENCES — auto-generated document numbers
-- ============================================================

CREATE SEQUENCE order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
  SELECT 'PO-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 5, '0');
$$ LANGUAGE sql;

CREATE SEQUENCE invoice_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
  SELECT 'INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 5, '0');
$$ LANGUAGE sql;

-- ============================================================
-- 3. TABLES
-- ============================================================

-- Orders — contractor → supplier purchase orders
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id),      -- contractor org
  supplier_org_id   UUID REFERENCES organizations(id),               -- supplier org
  quote_id          UUID REFERENCES quotes(id),
  created_by        UUID NOT NULL REFERENCES auth.users(id),
  status            order_status NOT NULL DEFAULT 'draft',
  order_number      TEXT UNIQUE NOT NULL DEFAULT generate_order_number(),
  title             TEXT NOT NULL,
  notes             TEXT,
  shipping_address  TEXT,
  requested_delivery_date DATE,
  subtotal          NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate          NUMERIC(5,4) NOT NULL DEFAULT 0,
  tax_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
  total             NUMERIC(12,2) NOT NULL DEFAULT 0,
  submitted_at      TIMESTAMPTZ,
  confirmed_at      TIMESTAMPTZ,
  shipped_at        TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_orders_org ON orders(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_supplier ON orders(supplier_org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_status ON orders(status) WHERE deleted_at IS NULL;

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Order line items
CREATE TABLE order_line_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  description TEXT NOT NULL,
  size        TEXT,
  quantity    NUMERIC(10,2) NOT NULL,
  unit        TEXT NOT NULL DEFAULT 'ea',
  unit_price  NUMERIC(12,2) NOT NULL DEFAULT 0,
  line_total  NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  notes       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_line_items_order ON order_line_items(order_id);

-- Recalc order totals when line items change
CREATE OR REPLACE FUNCTION recalc_order_totals()
RETURNS TRIGGER AS $$
DECLARE
  _order_id UUID;
  _subtotal NUMERIC(12,2);
BEGIN
  _order_id := COALESCE(NEW.order_id, OLD.order_id);

  SELECT COALESCE(SUM(quantity * unit_price), 0) INTO _subtotal
  FROM order_line_items WHERE order_id = _order_id;

  UPDATE orders SET
    subtotal = _subtotal,
    tax_amount = _subtotal * tax_rate,
    total = _subtotal + (_subtotal * tax_rate) + shipping_amount
  WHERE id = _order_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalc_order_totals
  AFTER INSERT OR UPDATE OR DELETE ON order_line_items
  FOR EACH ROW EXECUTE FUNCTION recalc_order_totals();

-- Invoices — supplier → contractor
CREATE TABLE invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id),      -- supplier org
  contractor_org_id UUID REFERENCES organizations(id),               -- contractor org
  order_id          UUID REFERENCES orders(id),
  created_by        UUID NOT NULL REFERENCES auth.users(id),
  status            invoice_status NOT NULL DEFAULT 'draft',
  invoice_number    TEXT UNIQUE NOT NULL DEFAULT generate_invoice_number(),
  title             TEXT NOT NULL,
  notes             TEXT,
  subtotal          NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate          NUMERIC(5,4) NOT NULL DEFAULT 0,
  tax_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  total             NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date          DATE,
  paid_at           TIMESTAMPTZ,
  stripe_invoice_id TEXT,                                            -- synced from Stripe
  sent_at           TIMESTAMPTZ,
  voided_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_invoices_org ON invoices(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_contractor ON invoices(contractor_org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_order ON invoices(order_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_status ON invoices(status) WHERE deleted_at IS NULL;

CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Payments — linked to invoices and/or Stripe
CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id        UUID REFERENCES invoices(id),
  organization_id   UUID NOT NULL REFERENCES organizations(id),      -- paying org (contractor)
  status            payment_status NOT NULL DEFAULT 'pending',
  amount            NUMERIC(12,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'usd',
  stripe_payment_id TEXT,                                            -- Stripe PaymentIntent ID
  stripe_transfer_id TEXT,                                           -- Stripe Connect transfer
  payment_method    TEXT,                                             -- card, ach, etc.
  notes             TEXT,
  paid_at           TIMESTAMPTZ,
  failed_at         TIMESTAMPTZ,
  refunded_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_org ON payments(organization_id);

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Deliveries — shipment tracking + proof of delivery
CREATE TABLE deliveries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id),
  organization_id   UUID NOT NULL REFERENCES organizations(id),      -- supplier org
  status            delivery_status NOT NULL DEFAULT 'pending',
  carrier           TEXT,
  tracking_number   TEXT,
  tracking_url      TEXT,
  estimated_date    DATE,
  actual_date       DATE,
  pod_photo_url     TEXT,                                            -- proof of delivery photo
  pod_signer_name   TEXT,
  notes             TEXT,
  shipped_at        TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_deliveries_org ON deliveries(organization_id);

CREATE TRIGGER set_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. Stripe Connect — add connect account ID to supplier orgs
-- ============================================================

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT;

CREATE INDEX IF NOT EXISTS idx_organizations_stripe_connect
  ON organizations(stripe_connect_id)
  WHERE stripe_connect_id IS NOT NULL;

-- ============================================================
-- 5. RLS POLICIES
-- ============================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Orders: contractor can see own orders, supplier can see orders directed to them (non-draft only)
CREATE POLICY "Contractors can manage own orders"
  ON orders FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can view assigned orders"
  ON orders FOR SELECT
  USING (
    status != 'draft'
    AND supplier_org_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Order line items: follow parent order access
CREATE POLICY "Order line items follow order access"
  ON order_line_items FOR ALL
  USING (
    order_id IN (
      SELECT id FROM orders WHERE
        organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
        OR (status != 'draft' AND supplier_org_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
    )
  );

-- Invoices: supplier can manage, contractor can view their invoices
CREATE POLICY "Suppliers can manage own invoices"
  ON invoices FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can view their invoices"
  ON invoices FOR SELECT
  USING (
    contractor_org_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Payments: visible to both parties
CREATE POLICY "Org members can view own payments"
  ON payments FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Invoice owners can view payments"
  ON payments FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- Deliveries: supplier manages, contractor views
CREATE POLICY "Suppliers can manage deliveries"
  ON deliveries FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can view deliveries for their orders"
  ON deliveries FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );
