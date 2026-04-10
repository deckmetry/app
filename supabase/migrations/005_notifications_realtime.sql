-- Deckmetry Phase 5 — Notifications & Realtime

-- ============================================================
-- 1. CUSTOM TYPES
-- ============================================================

CREATE TYPE notification_type AS ENUM (
  'quote_sent', 'quote_viewed', 'quote_approved', 'quote_rejected',
  'order_submitted', 'order_confirmed', 'order_shipped', 'order_delivered', 'order_cancelled',
  'invoice_sent', 'invoice_paid',
  'delivery_shipped', 'delivery_delivered',
  'estimate_shared', 'review_requested',
  'system'
);

-- ============================================================
-- 2. TABLES
-- ============================================================

CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- null = org-wide
  type              notification_type NOT NULL,
  title             TEXT NOT NULL,
  body              TEXT,
  href              TEXT,                    -- link to relevant page
  entity_type       TEXT,                    -- 'quote', 'order', 'invoice', 'delivery'
  entity_id         UUID,                    -- FK to the relevant entity
  read_at           TIMESTAMPTZ,
  dismissed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications are immutable — no updated_at, no deleted_at
CREATE INDEX idx_notifications_org ON notifications(organization_id);
CREATE INDEX idx_notifications_user ON notifications(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_notifications_unread ON notifications(organization_id, user_id)
  WHERE read_at IS NULL AND dismissed_at IS NULL;

-- ============================================================
-- 3. RLS POLICIES
-- ============================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read notifications for their org or specifically for them
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- Users can update (mark read/dismissed) their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    AND (user_id IS NULL OR user_id = auth.uid())
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- Only service role inserts (from server actions)

-- ============================================================
-- 4. ENABLE REALTIME PUBLICATION
-- ============================================================

-- Enable realtime for key tables
-- These must be run with appropriate permissions
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
