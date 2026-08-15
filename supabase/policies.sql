-- Hospital Delivery Control - Row Level Security Policies
-- Execute este script no Supabase SQL Editor

-- Habilitar RLS nas tabelas
ALTER TABLE hospitais ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Hospitais são visíveis para todos" ON hospitais;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir hospitais" ON hospitais;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar hospitais" ON hospitais;
DROP POLICY IF EXISTS "Usuários autenticados podem excluir hospitais" ON hospitais;
DROP POLICY IF EXISTS "Entregas são visíveis para todos" ON entregas;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir entregas" ON entregas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar entregas" ON entregas;
DROP POLICY IF EXISTS "Usuários autenticados podem excluir entregas" ON entregas;

-- Políticas para hospitais (acesso total público)
CREATE POLICY "Hospitais SELECT" ON hospitais FOR SELECT USING (true);
CREATE POLICY "Hospitais INSERT" ON hospitais FOR INSERT WITH CHECK (true);
CREATE POLICY "Hospitais UPDATE" ON hospitais FOR UPDATE USING (true);
CREATE POLICY "Hospitais DELETE" ON hospitais FOR DELETE USING (true);

-- Políticas para entregas (acesso total público)
CREATE POLICY "Entregas SELECT" ON entregas FOR SELECT USING (true);
CREATE POLICY "Entregas INSERT" ON entregas FOR INSERT WITH CHECK (true);
CREATE POLICY "Entregas UPDATE" ON entregas FOR UPDATE USING (true);
CREATE POLICY "Entregas DELETE" ON entregas FOR DELETE USING (true);
