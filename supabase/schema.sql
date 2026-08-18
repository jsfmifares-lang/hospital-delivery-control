-- Hospital Delivery Control - Schema
-- Execute este script no Supabase SQL Editor

-- Tabela de hospitais
CREATE TABLE IF NOT EXISTS hospitais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cidade TEXT,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabela de entregas
CREATE TABLE IF NOT EXISTS entregas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES hospitais(id) ON DELETE CASCADE,
  nome_hospital TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Saiu para entrega')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_entregas_hospital_id ON entregas(hospital_id);
CREATE INDEX IF NOT EXISTS idx_entregas_status ON entregas(status);
CREATE INDEX IF NOT EXISTS idx_entregas_created_at ON entregas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hospitais_nome ON hospitais(nome);

-- Habilitar Realtime na tabela entregas
ALTER PUBLICATION supabase_realtime ADD TABLE entregas;

-- Habilitar Realtime na tabela hospitais
ALTER PUBLICATION supabase_realtime ADD TABLE hospitais;

-- REPLICA IDENTITY FULL para capturar dados antigos no UPDATE
ALTER TABLE entregas REPLICA IDENTITY FULL;
ALTER TABLE hospitais REPLICA IDENTITY FULL;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_entregas_updated_at
  BEFORE UPDATE ON entregas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
