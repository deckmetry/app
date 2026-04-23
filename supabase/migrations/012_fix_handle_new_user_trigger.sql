-- Fix handle_new_user trigger to handle errors gracefully
-- The original trigger had no exception handling, causing "Database error creating new user"
-- when any step (profile insert, org insert, membership insert) failed.
-- This version wraps each step in its own BEGIN/EXCEPTION block so the auth
-- user is always created even if the profile/org setup encounters an issue.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _org_id UUID;
  _org_type org_type;
  _role_text TEXT;
BEGIN
  _role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'homeowner');

  BEGIN
    _org_type := _role_text::org_type;
  EXCEPTION WHEN OTHERS THEN
    _org_type := 'homeowner'::org_type;
  END;

  BEGIN
    INSERT INTO profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  BEGIN
    INSERT INTO organizations (name, type)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Organization',
      _org_type
    )
    RETURNING id INTO _org_id;

    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (_org_id, NEW.id, 'owner')
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    UPDATE profiles SET default_organization_id = _org_id WHERE id = NEW.id;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
