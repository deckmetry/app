-- When a user is invited with raw_user_meta_data->>'org_id', skip org creation
-- and join them to the existing org instead.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _org_id UUID;
  _org_type org_type;
  _role_text TEXT;
  _meta_org_id TEXT;
BEGIN
  _role_text     := COALESCE(NEW.raw_user_meta_data->>'role', 'homeowner');
  _meta_org_id   := NEW.raw_user_meta_data->>'org_id';

  BEGIN
    _org_type := _role_text::org_type;
  EXCEPTION WHEN OTHERS THEN
    _org_type := 'homeowner'::org_type;
  END;

  -- Profile
  BEGIN
    INSERT INTO profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Org: join existing if org_id passed, otherwise create new
  BEGIN
    IF _meta_org_id IS NOT NULL THEN
      _org_id := _meta_org_id::UUID;

      INSERT INTO organization_members (organization_id, user_id, role)
      VALUES (_org_id, NEW.id, 'owner')
      ON CONFLICT (organization_id, user_id) DO NOTHING;

      UPDATE profiles SET default_organization_id = _org_id WHERE id = NEW.id;
    ELSE
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
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
