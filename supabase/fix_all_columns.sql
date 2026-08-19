-- EXECUTE ESTE SQL COMPLETO NO SUPABASE SQL EDITOR

-- Adiciona coluna nome_paciente se nao existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entregas' AND column_name = 'nome_paciente') THEN
    ALTER TABLE entregas ADD COLUMN nome_paciente TEXT;
  END IF;
END $$;

-- Adiciona coluna observacao se nao existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entregas' AND column_name = 'observacao') THEN
    ALTER TABLE entregas ADD COLUMN observacao TEXT;
  END IF;
END $$;

-- Adiciona coluna updated_by se nao existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entregas' AND column_name = 'updated_by') THEN
    ALTER TABLE entregas ADD COLUMN updated_by TEXT;
  END IF;
END $$;

-- Atualiza constraint de status para aceitar 'Autorizado'
ALTER TABLE entregas DROP CONSTRAINT IF EXISTS entregas_status_check;
ALTER TABLE entregas ADD CONSTRAINT entregas_status_check 
  CHECK (status IN ('Pendente', 'Autorizado', 'Saiu para entrega'));
