CREATE TABLE IF NOT EXISTS plugins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version text DEFAULT '1.0.0',
  author text DEFAULT '',
  api_version text DEFAULT '1.20',
  main_class text DEFAULT '',
  tagline text DEFAULT '',
  tags text[] DEFAULT '{}',
  description text DEFAULT '',
  commands jsonb DEFAULT '[]',
  permissions jsonb DEFAULT '[]',
  items jsonb DEFAULT '[]',
  recipes jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;

-- Public read (everyone can see all plugins)
CREATE POLICY "public_read" ON plugins FOR SELECT USING (true);

-- Public insert (everyone can create plugins)
CREATE POLICY "public_insert" ON plugins FOR INSERT WITH CHECK (true);

-- Public update (everyone can edit plugins)
CREATE POLICY "public_update" ON plugins FOR UPDATE USING (true);

-- Public delete (everyone can delete plugins)
CREATE POLICY "public_delete" ON plugins FOR DELETE USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_plugins_updated_at
  BEFORE UPDATE ON plugins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();