DROP FUNCTION IF EXISTS upsert_plugin CASCADE;
DROP FUNCTION IF EXISTS delete_plugin CASCADE;
DROP FUNCTION IF EXISTS list_plugins CASCADE;

CREATE OR REPLACE FUNCTION upsert_plugin(p_json JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_result JSONB;
BEGIN
  v_id := (p_json->>'id')::UUID;
  
  INSERT INTO plugins (
    id, name, version, description, author, main_class,
    api_version, tagline, tags, commands, permissions,
    items, recipes, notes, created_at, updated_at
  ) VALUES (
    v_id,
    COALESCE(p_json->>'name', ''),
    COALESCE(p_json->>'version', '1.0.0'),
    COALESCE(p_json->>'description', ''),
    COALESCE(p_json->>'author', ''),
    COALESCE(p_json->>'main', ''),
    COALESCE(p_json->>'apiVersion', '1.20'),
    COALESCE(p_json->>'tagline', ''),
    COALESCE((p_json->'tags')::JSONB, '[]'::JSONB),
    COALESCE((p_json->'commands')::JSONB, '[]'::JSONB),
    COALESCE((p_json->'permissions')::JSONB, '[]'::JSONB),
    COALESCE((p_json->'items')::JSONB, '[]'::JSONB),
    COALESCE((p_json->'recipes')::JSONB, '[]'::JSONB),
    COALESCE(p_json->>'notes', ''),
    COALESCE((p_json->>'createdAt')::TIMESTAMPTZ, NOW()),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    version = EXCLUDED.version,
    description = EXCLUDED.description,
    author = EXCLUDED.author,
    main_class = EXCLUDED.main_class,
    api_version = EXCLUDED.api_version,
    tagline = EXCLUDED.tagline,
    tags = EXCLUDED.tags,
    commands = EXCLUDED.commands,
    permissions = EXCLUDED.permissions,
    items = EXCLUDED.items,
    recipes = EXCLUDED.recipes,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING to_jsonb(plugins.*) INTO v_result;
  
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION delete_plugin(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM plugins WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION list_plugins()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE(
    (SELECT jsonb_agg(to_jsonb(plugins.*) ORDER BY updated_at DESC)
     FROM plugins),
    '[]'::JSONB
  );
END;
$$;