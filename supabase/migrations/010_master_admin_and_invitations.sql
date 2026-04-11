-- Master admin flag + org invitations for team management
-- Supports:
--   1. Master admin (vinicyus@xvertx.com) who can switch between all roles
--   2. Organization invitations for team management
--   3. Org member management (roles, removal)

-- ============================================================
-- 1. MASTER ADMIN FLAG ON PROFILES
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_master_admin BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- 2. INVITATIONS TABLE
-- ============================================================

-- Ensure pgcrypto is available for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | accepted | expired | revoked
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);

CREATE INDEX idx_invitations_token ON invitations(token) WHERE status = 'pending';
CREATE INDEX idx_invitations_org ON invitations(organization_id) WHERE status = 'pending';
CREATE INDEX idx_invitations_email ON invitations(email) WHERE status = 'pending';

CREATE TRIGGER set_updated_at BEFORE UPDATE ON invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. RLS POLICIES FOR INVITATIONS
-- ============================================================

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Org admins/owners can view their org's invitations
CREATE POLICY "Admins can view org invitations"
  ON invitations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Org admins/owners can create invitations
CREATE POLICY "Admins can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Org admins/owners can update invitations (revoke)
CREATE POLICY "Admins can update invitations"
  ON invitations FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Org admins/owners can delete invitations
CREATE POLICY "Admins can delete invitations"
  ON invitations FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- 4. SEED MASTER ADMIN
-- ============================================================
-- This runs after the user has signed up. If the profile exists,
-- mark it as master admin. If not, it will be set via a service
-- role call after signup.

UPDATE profiles
SET is_master_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'vinicyus@xvertx.com' LIMIT 1
);
