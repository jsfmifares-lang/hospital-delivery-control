-- EXECUTE ESTE SQL NO SUPABASE SQL EDITOR
-- Corrige notificações realtime para todos os usuários

-- 1. REPLICA IDENTITY FULL (necessario para detectar UPDATE)
ALTER TABLE entregas REPLICA IDENTITY FULL;
ALTER TABLE hospitais REPLICA IDENTITY FULL;

-- 2. Garantir que as tabelas estao na publicacao realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'hospitais'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE hospitais;
  END IF;
END $$;

-- 3. Adicionar coluna created_by se nao existir (para rastrear quem fez)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'entregas' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE entregas ADD COLUMN created_by TEXT;
  END IF;
END $$;

-- 4. Adicionar coluna nome_paciente se nao existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'entregas' 
    AND column_name = 'nome_paciente'
  ) THEN
    ALTER TABLE entregas ADD COLUMN nome_paciente TEXT;
  END IF;
END $$;
