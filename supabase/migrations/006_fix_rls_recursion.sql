-- Fix infinite recursion in organization_members RLS policies
-- The old policies queried organization_members FROM organization_members,
-- causing infinite recursion. Fix: use a SECURITY DEFINER function that
-- bypasses RLS to look up the user's org memberships.

-- Helper: returns all organization_ids the current user belongs to.
-- SECURITY DEFINER runs as the function owner (superuser), bypassing RLS.
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- Drop and recreate organization_members policies
-- ============================================================

DROP POLICY IF EXISTS "Members can view org members" ON organization_members;
DROP POLICY IF EXISTS "Owners can manage org members" ON organization_members;

CREATE POLICY "Members can view org members"
  ON organization_members FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners can manage org members"
  ON organization_members FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- The "manage" policy also self-references, but only applies to
-- INSERT/UPDATE/DELETE (not SELECT), so it won't recurse during reads.
-- However, to be safe, replace it too:
DROP POLICY IF EXISTS "Owners can manage org members" ON organization_members;

CREATE POLICY "Owners can manage org members"
  ON organization_members FOR ALL
  USING (organization_id IN (SELECT get_user_org_ids())
    AND EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    ));

-- ============================================================
-- Also fix organizations policies (same pattern)
-- ============================================================

DROP POLICY IF EXISTS "Members can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Owners can update their organizations" ON organizations;

CREATE POLICY "Members can view their organizations"
  ON organizations FOR SELECT
  USING (id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners can update their organizations"
  ON organizations FOR UPDATE
  USING (id IN (SELECT get_user_org_ids())
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    ));

-- ============================================================
-- Fix estimates policies to use the helper
-- ============================================================

DROP POLICY IF EXISTS "Members can view org estimates" ON estimates;
DROP POLICY IF EXISTS "Members can create estimates" ON estimates;
DROP POLICY IF EXISTS "Members can update own org estimates" ON estimates;
DROP POLICY IF EXISTS "Admins can soft-delete org estimates" ON estimates;

CREATE POLICY "Members can view org estimates"
  ON estimates FOR SELECT
  USING (
    deleted_at IS NULL AND (
      organization_id IN (SELECT get_user_org_ids())
      OR shared_with_org_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "Members can create estimates"
  ON estimates FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Members can update own org estimates"
  ON estimates FOR UPDATE
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins can soft-delete org estimates"
  ON estimates FOR DELETE
  USING (organization_id IN (SELECT get_user_org_ids()));

-- ============================================================
-- Fix estimate_line_items and estimate_stair_sections policies
-- ============================================================

DROP POLICY IF EXISTS "Access via estimate" ON estimate_line_items;
DROP POLICY IF EXISTS "Access via estimate" ON estimate_stair_sections;

CREATE POLICY "Access via estimate"
  ON estimate_line_items FOR ALL
  USING (
    estimate_id IN (
      SELECT id FROM estimates
      WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "Access via estimate"
  ON estimate_stair_sections FOR ALL
  USING (
    estimate_id IN (
      SELECT id FROM estimates
      WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- ============================================================
-- Fix activity_log policy
-- ============================================================

DROP POLICY IF EXISTS "Members can view org activity" ON activity_log;

CREATE POLICY "Members can view org activity"
  ON activity_log FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));
