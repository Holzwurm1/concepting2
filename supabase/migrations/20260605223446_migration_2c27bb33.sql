DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'plugins'::regclass 
    AND contype = 'p'
  ) THEN
    ALTER TABLE plugins ADD PRIMARY KEY (id);
  END IF;
END $$;