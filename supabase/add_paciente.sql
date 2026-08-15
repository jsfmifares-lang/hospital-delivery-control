-- Execute este SQL no Supabase SQL Editor

-- Adicionar coluna nome_paciente na tabela entregas
ALTER TABLE entregas ADD COLUMN IF NOT EXISTS nome_paciente TEXT;

-- Atualizar as políticas para permitir acesso público (caso não tenha rodado antes)
ALTER TABLE hospitais ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hospitais SELECT" ON hospitais;
DROP POLICY IF EXISTS "Hospitais INSERT" ON hospitais;
DROP POLICY IF EXISTS "Hospitais UPDATE" ON hospitais;
DROP POLICY IF EXISTS "Hospitais DELETE" ON hospitais;
DROP POLICY IF EXISTS "Entregas SELECT" ON entregas;
DROP POLICY IF EXISTS "Entregas INSERT" ON entregas;
DROP POLICY IF EXISTS "Entregas UPDATE" ON entregas;
DROP POLICY IF EXISTS "Entregas DELETE" ON entregas;

CREATE POLICY "Hospitais SELECT" ON hospitais FOR SELECT USING (true);
CREATE POLICY "Hospitais INSERT" ON hospitais FOR INSERT WITH CHECK (true);
CREATE POLICY "Hospitais UPDATE" ON hospitais FOR UPDATE USING (true);
CREATE POLICY "Hospitais DELETE" ON hospitais FOR DELETE USING (true);

CREATE POLICY "Entregas SELECT" ON entregas FOR SELECT USING (true);
CREATE POLICY "Entregas INSERT" ON entregas FOR INSERT WITH CHECK (true);
CREATE POLICY "Entregas UPDATE" ON entregas FOR UPDATE USING (true);
CREATE POLICY "Entregas DELETE" ON entregas FOR DELETE USING (true);
