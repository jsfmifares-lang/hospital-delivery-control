-- EXECUTE ESTE SQL NO SUPABASE SQL EDITOR

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'entregas' 
    AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE entregas ADD COLUMN updated_by TEXT;
  END IF;
END $$;
