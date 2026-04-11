-- Purchases table for homeowner one-time payments + seat management
-- Supports the new pricing model:
--   Homeowners: pay-per-use ($27 BOM, $197 permit design, $1,597 3D design, $97 pro review)
--   Contractors: Free (3/mo), Solo $79/mo (50/mo), Teams $79 + $20/seat/mo
--   Suppliers: $497/mo + $20/seat/mo

-- ============================================================
-- 1. PURCHASE PRODUCT TYPE ENUM
-- ============================================================

CREATE TYPE purchase_product_type AS ENUM (
  'bom',
  'permit_design',
  '3d_design',
  'pro_review'
);

-- ============================================================
-- 2. PURCHASES TABLE
-- ============================================================

CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_session_id TEXT NOT NULL UNIQUE,
  product_type purchase_product_type NOT NULL,
  entity_id UUID,  -- the estimate/review ID this purchase is for
  amount INTEGER NOT NULL,  -- cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'completed',  -- completed, refunded
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_purchases_org ON purchases(organization_id, created_at DESC);
CREATE INDEX idx_purchases_entity ON purchases(product_type, entity_id)
  WHERE entity_id IS NOT NULL;
CREATE INDEX idx_purchases_session ON purchases(stripe_session_id);

-- ============================================================
-- 3. ADD seat_count TO organizations
-- ============================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS seat_count INTEGER NOT NULL DEFAULT 1;

-- ============================================================
-- 4. RLS POLICIES
-- ============================================================

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Org members can view their own org's purchases
CREATE POLICY "Members can view org purchases"
  ON purchases FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

-- Only service role inserts (via webhook)
-- No INSERT/UPDATE/DELETE policy for regular users
-- Service role bypasses RLS automatically

-- ============================================================
-- 5. UPDATE get_user_org_ids() — no change needed, already exists
-- ============================================================
-- The SECURITY DEFINER function from migration 006 handles
-- all RLS lookups for purchases as well.
