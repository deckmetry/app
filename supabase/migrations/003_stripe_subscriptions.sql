-- Deckmetry Phase 3 — Stripe Products, Prices & Subscriptions

-- ============================================================
-- 1. CUSTOM TYPES
-- ============================================================

CREATE TYPE subscription_status AS ENUM (
  'trialing', 'active', 'canceled', 'incomplete',
  'incomplete_expired', 'past_due', 'unpaid', 'paused'
);

CREATE TYPE pricing_type AS ENUM ('one_time', 'recurring');
CREATE TYPE pricing_interval AS ENUM ('day', 'week', 'month', 'year');

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Synced from Stripe via webhook
CREATE TABLE products (
  id              TEXT PRIMARY KEY,  -- Stripe product ID (prod_xxx)
  active          BOOLEAN NOT NULL DEFAULT true,
  name            TEXT NOT NULL,
  description     TEXT,
  image           TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Synced from Stripe via webhook
CREATE TABLE prices (
  id              TEXT PRIMARY KEY,  -- Stripe price ID (price_xxx)
  product_id      TEXT REFERENCES products(id) ON DELETE CASCADE,
  active          BOOLEAN NOT NULL DEFAULT true,
  description     TEXT,
  unit_amount     BIGINT NOT NULL,        -- in cents
  currency        TEXT NOT NULL DEFAULT 'usd',
  type            pricing_type NOT NULL DEFAULT 'recurring',
  interval        pricing_interval DEFAULT 'month',
  interval_count  INTEGER DEFAULT 1,
  trial_period_days INTEGER,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_prices_updated_at
  BEFORE UPDATE ON prices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- One subscription per organization
CREATE TABLE subscriptions (
  id                  TEXT PRIMARY KEY,  -- Stripe subscription ID (sub_xxx)
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status              subscription_status NOT NULL,
  price_id            TEXT REFERENCES prices(id),
  quantity            INTEGER DEFAULT 1,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancel_at           TIMESTAMPTZ,
  canceled_at         TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end  TIMESTAMPTZ NOT NULL,
  trial_start         TIMESTAMPTZ,
  trial_end           TIMESTAMPTZ,
  ended_at            TIMESTAMPTZ,
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. RLS POLICIES
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Products and prices are public read (catalog data)
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read prices"
  ON prices FOR SELECT
  USING (true);

-- Subscriptions: org members can read their own
CREATE POLICY "Org members can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Service role handles all writes via webhook (no user-facing insert/update policies needed)

-- ============================================================
-- 4. ADD stripe_customer_id TO organizations (if not present)
-- ============================================================

-- The column already exists from 001 migration, but ensure it's indexed
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer
  ON organizations(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
