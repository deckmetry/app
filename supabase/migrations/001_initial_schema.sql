-- Deckmetry Phase 1 — Initial Schema
-- Multi-tenant org model, estimates, BOM, RLS

-- ============================================================
-- 1. CUSTOM TYPES
-- ============================================================

CREATE TYPE org_type AS ENUM ('homeowner', 'contractor', 'supplier');
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE estimate_status AS ENUM ('draft', 'completed', 'shared', 'archived');
CREATE TYPE deck_type AS ENUM ('attached', 'freestanding');
CREATE TYPE railing_material AS ENUM ('vinyl', 'composite', 'aluminum', 'cable');
CREATE TYPE open_side AS ENUM ('left', 'front', 'right', 'rear');
CREATE TYPE stair_location AS ENUM ('left', 'front', 'right');
CREATE TYPE bom_category AS ENUM ('foundation', 'framing', 'decking', 'fascia', 'fasteners', 'railing', 'add-ons');

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Organizations — multi-tenant root
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type org_type NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_organizations_type ON organizations(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_slug ON organizations(slug) WHERE deleted_at IS NULL;

-- Profiles — extends auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  default_organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization members — user ↔ org join with roles
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);

-- Estimates — the wizard output
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  status estimate_status NOT NULL DEFAULT 'draft',

  -- Job Info (snapshot fields for legal documents)
  project_name TEXT NOT NULL DEFAULT '',
  project_address TEXT,
  delivery_address TEXT,
  requested_delivery_date DATE,
  contractor_name TEXT,
  email TEXT,
  phone TEXT,

  -- Geometry
  deck_type deck_type NOT NULL DEFAULT 'attached',
  deck_width_ft NUMERIC(6,2) NOT NULL DEFAULT 16,
  deck_projection_ft NUMERIC(6,2) NOT NULL DEFAULT 12,
  deck_height_in NUMERIC(6,2) NOT NULL DEFAULT 36,
  joist_spacing_in INTEGER NOT NULL DEFAULT 12,

  -- Surface Selection (FK refs + name snapshots)
  decking_brand TEXT,
  decking_collection TEXT,
  decking_color TEXT,
  picture_frame_color TEXT,
  picture_frame_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Railing
  railing_required_override BOOLEAN,
  railing_material railing_material,
  railing_color TEXT,
  open_sides open_side[] NOT NULL DEFAULT '{}',

  -- Add-ons
  lattice_skirt BOOLEAN NOT NULL DEFAULT false,
  horizontal_skirt BOOLEAN NOT NULL DEFAULT false,
  post_cap_lights BOOLEAN NOT NULL DEFAULT false,
  stair_lights BOOLEAN NOT NULL DEFAULT false,
  accent_lights BOOLEAN NOT NULL DEFAULT false,

  -- Computed summary (cached from BOM engine)
  total_area_sf NUMERIC(10,2),
  total_bom_items INTEGER,

  -- Sharing
  share_token TEXT UNIQUE,
  shared_with_org_id UUID REFERENCES organizations(id),

  -- Metadata
  assumptions JSONB DEFAULT '[]',
  warnings JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_estimates_org ON estimates(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_estimates_created_by ON estimates(created_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_estimates_share_token ON estimates(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_estimates_status ON estimates(organization_id, status) WHERE deleted_at IS NULL;

-- Estimate line items — normalized BOM rows
CREATE TABLE estimate_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  category bom_category NOT NULL,
  description TEXT NOT NULL,
  size TEXT,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'ea',
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_manual_override BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_line_items_estimate ON estimate_line_items(estimate_id);

-- Estimate stair sections — normalized stair configs
CREATE TABLE estimate_stair_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  location stair_location NOT NULL DEFAULT 'front',
  width_ft NUMERIC(6,2) NOT NULL DEFAULT 4,
  step_count INTEGER NOT NULL DEFAULT 3,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stair_sections_estimate ON estimate_stair_sections(estimate_id);

-- Activity log — immutable audit trail (NO updated_at, NO deleted_at)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_org ON activity_log(organization_id, created_at DESC);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);

-- ============================================================
-- 3. TRIGGERS — auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON organization_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON estimates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. AUTO-CREATE PROFILE + ORG ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _org_id UUID;
  _org_type org_type;
  _role_text TEXT;
BEGIN
  _role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'homeowner');
  _org_type := _role_text::org_type;

  -- Create profile
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  -- Create default organization
  INSERT INTO organizations (name, type)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Organization',
    _org_type
  )
  RETURNING id INTO _org_id;

  -- Add user as owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (_org_id, NEW.id, 'owner');

  -- Set as default org
  UPDATE profiles SET default_organization_id = _org_id WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 5. HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_default_org_id()
RETURNS UUID AS $$
  SELECT default_organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_stair_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Organizations
CREATE POLICY "Members can view their organizations"
  ON organizations FOR SELECT
  USING (id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));
CREATE POLICY "Owners can update their organizations"
  ON organizations FOR UPDATE
  USING (id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Organization members
CREATE POLICY "Members can view org members"
  ON organization_members FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));
CREATE POLICY "Owners can manage org members"
  ON organization_members FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Estimates
CREATE POLICY "Members can view org estimates"
  ON estimates FOR SELECT
  USING (
    deleted_at IS NULL AND (
      organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
      OR shared_with_org_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );
CREATE POLICY "Members can create estimates"
  ON estimates FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Members can update own org estimates"
  ON estimates FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Admins can soft-delete org estimates"
  ON estimates FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Estimate line items — access follows parent estimate
CREATE POLICY "Access via estimate"
  ON estimate_line_items FOR ALL
  USING (
    estimate_id IN (
      SELECT id FROM estimates
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- Estimate stair sections — access follows parent estimate
CREATE POLICY "Access via estimate"
  ON estimate_stair_sections FOR ALL
  USING (
    estimate_id IN (
      SELECT id FROM estimates
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- Activity log — read-only for members, inserts via service role
CREATE POLICY "Members can view org activity"
  ON activity_log FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );
