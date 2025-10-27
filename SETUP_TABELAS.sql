-- ============================================
-- SCRIPT SQL - CONFIGURAÇÃO DO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Passo 1: Criar as tabelas
-- ============================================

-- Tabela de páginas
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  "order" INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  is_form BOOLEAN DEFAULT false,
  canva_embed_url TEXT,
  form_config JSONB,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_order ON pages("order");
CREATE INDEX IF NOT EXISTS idx_pages_active ON pages(is_active);

-- Tabela de conteúdo da home (apenas 1 registro)
CREATE TABLE IF NOT EXISTS home_content (
  id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid PRIMARY KEY,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir registro inicial vazio (apenas se não existir)
INSERT INTO home_content (id, content)
SELECT
  '00000000-0000-0000-0000-000000000001',
  '{
    "hero": {
      "title": "Viva a aventura com segurança",
      "subtitle": "Guias certificados, roteiros exclusivos e experiências inesquecíveis.",
      "primary_cta_label": "Agendar Agora",
      "primary_cta_link": "#contato",
      "background_image_url": "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600"
    },
    "about": {
      "title": "Sobre mim",
      "text": "Sou guia de montanha com 10+ anos de experiência.",
      "image_url": "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600"
    },
    "services": [],
    "testimonials": [],
    "gallery": {"title": "Galeria", "image_urls": []},
    "theme": {
      "primary": "#0E7C7B",
      "secondary": "#F4A261",
      "text": "#1B1B1B",
      "background": "#FAFAFA"
    },
    "seo": {
      "site_name": "Aventuras",
      "title": "Aventuras Guiadas com Segurança",
      "description": "Trilhas, escalada e mergulho com guia certificado."
    },
    "contact": {
      "whatsapp": "https://wa.me/5511999999999",
      "email": "contato@aventura.com",
      "instagram": "https://instagram.com/aventuras",
      "location": "São Paulo, Brasil"
    }
  }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM home_content WHERE id = '00000000-0000-0000-0000-000000000001');

-- Tabela de inscrições (formulários)
CREATE TABLE IF NOT EXISTS inscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL,
  form_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inscriptions_page_slug ON inscriptions(page_slug);
CREATE INDEX IF NOT EXISTS idx_inscriptions_status ON inscriptions(status);

-- Passo 2: Trigger para updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_home_content_updated_at ON home_content;
CREATE TRIGGER update_home_content_updated_at
  BEFORE UPDATE ON home_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Passo 3: Configurar RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscriptions ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Páginas ativas são públicas" ON pages;
DROP POLICY IF EXISTS "Conteúdo da home é público" ON home_content;
DROP POLICY IF EXISTS "Admin pode gerenciar páginas" ON pages;
DROP POLICY IF EXISTS "Admin pode editar home" ON home_content;
DROP POLICY IF EXISTS "Permitir inserção de inscrições" ON inscriptions;
DROP POLICY IF EXISTS "Admin pode ver inscrições" ON inscriptions;
DROP POLICY IF EXISTS "Admin pode atualizar inscrições" ON inscriptions;

-- Permitir leitura pública de páginas ativas
CREATE POLICY "Páginas ativas são públicas"
  ON pages FOR SELECT
  USING (is_active = true);

-- Permitir leitura pública do conteúdo da home
CREATE POLICY "Conteúdo da home é público"
  ON home_content FOR SELECT
  USING (true);

-- Permitir todas as operações sem autenticação (temporário para MVP)
-- ⚠️ ATENÇÃO: Em produção, você deve implementar autenticação!
CREATE POLICY "Admin pode gerenciar páginas"
  ON pages FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin pode editar home"
  ON home_content FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir inserção de inscrições"
  ON inscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin pode ver inscrições"
  ON inscriptions FOR SELECT
  USING (true);

CREATE POLICY "Admin pode atualizar inscrições"
  ON inscriptions FOR UPDATE
  USING (true);

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- ✅ Sucesso! Suas tabelas foram criadas.
--
-- Próximos passos:
-- 1. Volte para o projeto e execute: npm install
-- 2. Execute: npm start
-- 3. Acesse: http://localhost:3000/admin.html
-- 4. Teste criando uma página e verifique se persiste!
