-- 008_billing_hardening.sql
-- Idempotency table, grace period, estimate source, purchase enrichment

-- Stripe webhook idempotency
CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
-- No user-facing policies — only service role writes/reads

-- Grace period for past_due subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ;

-- Estimate source for supplier referral tracking
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS source TEXT;
CREATE INDEX IF NOT EXISTS idx_estimates_source ON estimates (source) WHERE source IS NOT NULL;

-- Enrich purchases table for refund handling + audit
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS price_id TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
