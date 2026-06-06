-- Drop old functions if they exist to avoid conflicts
DROP FUNCTION IF EXISTS upsert_plugin(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], JSONB, JSONB, JSONB, JSONB, TEXT);
DROP FUNCTION IF EXISTS get_plugins();
DROP FUNCTION IF EXISTS delete_plugin(UUID);

-- Function to upsert a plugin (insert or update)
CREATE OR REPLACE FUNCTION upsert_plugin(
  p_id UUID,
  p_name TEXT,
  p_version TEXT DEFAULT '1.0.0',
  p_description TEXT DEFAULT '',
  p_author TEXT DEFAULT '',
  p_main_class TEXT DEFAULT '',
  p_api_version TEXT DEFAULT '1.20',
  p_tagline TEXT DEFAULT '',
  p_tags TEXT[] DEFAULT '{}',
  p_commands JSONB DEFAULT '[]',
  p_permissions JSONB DEFAULT '[]',
  p_items JSONB DEFAULT '[]',
  p_recipes JSONB DEFAULT '[]',
  p_notes TEXT DEFAULT ''
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  INSERT INTO plugins (
    id, name, version, description, author, main_class, api_version, 
    tagline, tags, commands, permissions, items, recipes, notes,
    created_at, updated_at
  ) VALUES (
    p_id, p_name, p_version, p_description, p_author, p_main_class, p_api_version,
    p_tagline, p_tags, p_commands, p_permissions, p_items, p_recipes, p_notes,
    NOW(), NOW()
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
  RETURNING to_jsonb(plugins.*) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get all plugins
CREATE OR REPLACE FUNCTION get_plugins()
RETURNS TABLE (
  id UUID, name TEXT, version TEXT, description TEXT, author TEXT,
  main_class TEXT, api_version TEXT, tagline TEXT, tags TEXT[],
  commands JSONB, permissions JSONB, items JSONB, recipes JSONB,
  notes TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY 
  SELECT p.id, p.name, p.version, p.description, p.author, p.main_class, p.api_version,
    p.tagline, p.tags, p.commands, p.permissions, p.items, p.recipes, p.notes,
    p.created_at, p.updated_at
  FROM plugins p
  ORDER BY p.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to delete a plugin
CREATE OR REPLACE FUNCTION delete_plugin(p_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM plugins WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;