-- Deckmetry Phase 2 — Quotes, Proposals & Approvals

-- Enable pgcrypto for gen_random_bytes()
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ============================================================
-- 1. CUSTOM TYPES
-- ============================================================

CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'viewed', 'approved', 'rejected', 'expired');

-- ============================================================
-- 2. SEQUENCES — auto-generated document numbers
-- ============================================================

CREATE SEQUENCE quote_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
  SELECT 'Q-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('quote_number_seq')::text, 5, '0');
$$ LANGUAGE sql;

-- ============================================================
-- 3. TABLES
-- ============================================================

-- Quotes — contractor → homeowner proposals
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  estimate_id UUID NOT NULL REFERENCES estimates(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  status quote_status NOT NULL DEFAULT 'draft',

  -- Auto-generated document number
  quote_number TEXT NOT NULL UNIQUE DEFAULT generate_quote_number(),

  -- Proposal details
  title TEXT NOT NULL DEFAULT '',
  cover_note TEXT,
  valid_until DATE,
  payment_terms TEXT,

  -- Pricing summary (computed from line items)
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Sharing
  share_token TEXT UNIQUE DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),

  -- Tracking
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_quotes_org ON quotes(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_quotes_estimate ON quotes(estimate_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_quotes_status ON quotes(organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_quotes_share_token ON quotes(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_quotes_number ON quotes(quote_number);

-- Quote line items — with markup over BOM
CREATE TABLE quote_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,

  -- From BOM
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  size TEXT,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'ea',

  -- Pricing
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  markup_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  unit_price NUMERIC(10,2) GENERATED ALWAYS AS (
    unit_cost * (1 + markup_pct / 100)
  ) STORED,
  line_total NUMERIC(12,2) GENERATED ALWAYS AS (
    quantity * unit_cost * (1 + markup_pct / 100)
  ) STORED,

  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible_to_customer BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quote_line_items_quote ON quote_line_items(quote_id);

-- Approvals — homeowner e-signature records
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),

  -- Signer info (may not be a registered user)
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signer_ip TEXT,

  -- Signature
  signature_data TEXT NOT NULL,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Snapshot of what was approved
  approved_total NUMERIC(12,2) NOT NULL,
  approved_quote_number TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_approvals_quote ON approvals(quote_id);
CREATE INDEX idx_approvals_org ON approvals(organization_id);

-- ============================================================
-- 4. TRIGGERS
-- ============================================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update quote totals when line items change
CREATE OR REPLACE FUNCTION update_quote_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE quotes SET
    subtotal = (
      SELECT COALESCE(SUM(line_total), 0)
      FROM quote_line_items WHERE quote_id = COALESCE(NEW.quote_id, OLD.quote_id)
    )
  WHERE id = COALESCE(NEW.quote_id, OLD.quote_id);

  -- Recompute total = subtotal + tax - discount
  UPDATE quotes SET
    tax_amount = subtotal * tax_rate,
    total = subtotal * (1 + tax_rate) - discount_amount
  WHERE id = COALESCE(NEW.quote_id, OLD.quote_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalc_quote_totals
  AFTER INSERT OR UPDATE OR DELETE ON quote_line_items
  FOR EACH ROW EXECUTE FUNCTION update_quote_totals();

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Quotes: org members can manage their own quotes
CREATE POLICY "Members can view org quotes"
  ON quotes FOR SELECT
  USING (
    deleted_at IS NULL AND (
      organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );
CREATE POLICY "Members can create quotes"
  ON quotes FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Members can update org quotes"
  ON quotes FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Quote line items: access follows parent quote
CREATE POLICY "Access via quote"
  ON quote_line_items FOR ALL
  USING (
    quote_id IN (
      SELECT id FROM quotes
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- Approvals: org members can view, inserts happen via share token (service role)
CREATE POLICY "Members can view org approvals"
  ON approvals FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );
