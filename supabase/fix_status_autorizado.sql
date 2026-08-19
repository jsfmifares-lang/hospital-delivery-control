-- EXECUTE ESTE SQL NO SUPABASE SQL EDITOR
-- Atualiza status para incluir 'Autorizado'

-- Atualiza constraint de status
ALTER TABLE entregas DROP CONSTRAINT IF EXISTS entregas_status_check;
ALTER TABLE entregas ADD CONSTRAINT entregas_status_check 
  CHECK (status IN ('Pendente', 'Autorizado', 'Saiu para entrega'));

-- Adiciona coluna updated_by se nao existir
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
