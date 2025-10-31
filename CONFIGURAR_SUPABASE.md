# 🚀 Guia Rápido: Configurar Supabase para Produção

## ⚠️ PROBLEMA IDENTIFICADO

O projeto estava usando **localStorage** para armazenar dados, o que causa perda de informações quando:
- O cache do navegador é limpo
- Você acessa de outro dispositivo
- Você acessa de outro navegador

**Solução**: Migrar para Supabase (banco de dados real na nuvem)

---

## 📋 Passo 1: Criar Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `aventuras-landing` (ou nome de sua preferência)
   - **Database Password**: Gere uma senha forte (guarde-a!)
   - **Region**: `South America (São Paulo)`
4. Clique em **"Create new project"**
5. Aguarde ~2 minutos para o projeto ser provisionado

---

## 🗄️ Passo 2: Criar Tabelas no Banco de Dados

1. No painel do Supabase, vá em **SQL Editor** (ícone de código no menu lateral)
2. Clique em **"New query"**
3. Cole o SQL abaixo e clique em **"Run"**:

```sql
-- Tabela de páginas
CREATE TABLE pages (
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
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_order ON pages("order");
CREATE INDEX idx_pages_active ON pages(is_active);

-- Tabela de conteúdo da home (apenas 1 registro)
CREATE TABLE home_content (
  id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid PRIMARY KEY,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir registro inicial vazio
INSERT INTO home_content (id, content) VALUES (
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
);

-- Tabela de inscrições (formulários)
CREATE TABLE inscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL,
  form_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inscriptions_page_slug ON inscriptions(page_slug);
CREATE INDEX idx_inscriptions_status ON inscriptions(status);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_home_content_updated_at
  BEFORE UPDATE ON home_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

4. Você deve ver a mensagem **"Success. No rows returned"**

---

## 🔐 Passo 3: Configurar Permissões (RLS)

1. Ainda no **SQL Editor**, crie uma nova query
2. Cole e execute:

```sql
-- Habilitar RLS (Row Level Security)
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscriptions ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública de páginas ativas
CREATE POLICY "Páginas ativas são públicas"
  ON pages FOR SELECT
  USING (is_active = true);

-- Permitir leitura pública do conteúdo da home
CREATE POLICY "Conteúdo da home é público"
  ON home_content FOR SELECT
  USING (true);

-- Permitir todas as operações sem autenticação (temporário para MVP)
-- ATENÇÃO: Em produção, você deve implementar autenticação!
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

CREATE POLICY "Admin pode deletar inscrições"
  ON inscriptions FOR DELETE
  USING (true);
```

**⚠️ IMPORTANTE**: Essas políticas permitem acesso sem autenticação. Para produção real, você deve implementar autenticação (veja `SUPABASE_SETUP.md` para detalhes).

---

## 🔑 Passo 4: Obter Credenciais

1. No painel do Supabase, vá em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** key (chave longa que começa com `eyJ...`)

---

## 💻 Passo 5: Configurar Variáveis de Ambiente

### Localmente (desenvolvimento):

1. Crie um arquivo chamado `config.js` na pasta raiz:

```javascript
// config.js
window.SUPABASE_URL = 'https://seu-projeto.supabase.co';
window.SUPABASE_ANON_KEY = 'sua-chave-publica-aqui';
```

2. Adicione no `index.html` e `admin.html` ANTES do script do app:

```html
<script src="/config.js"></script>
<script type="module" src="/assets/js/app.js"></script>
```

### Na Vercel (produção):

1. Acesse o dashboard da Vercel
2. Vá no seu projeto → **Settings** → **Environment Variables**
3. Adicione:
   - **Name**: `SUPABASE_URL` | **Value**: sua URL do Supabase
   - **Name**: `SUPABASE_ANON_KEY` | **Value**: sua chave pública

4. Crie um arquivo `vercel-config.js` na raiz:

```javascript
// Este arquivo será servido pela Vercel
window.SUPABASE_URL = process.env.SUPABASE_URL;
window.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
```

---

## 📦 Passo 6: Instalar Dependências

Execute no terminal:

```bash
npm install
```

Isso instalará o `@supabase/supabase-js` que foi adicionado ao `package.json`.

---

## 🧪 Passo 7: Testar Localmente

1. Inicie o servidor local:

```bash
npm start
```

2. Acesse `http://localhost:3000/admin.html`
3. Crie uma nova página
4. Verifique se ela aparece no menu
5. Limpe o cache do navegador (Ctrl+Shift+Delete)
6. Recarregue a página - **a página deve continuar lá!** ✅

---

## 🚀 Passo 8: Deploy na Vercel

1. Faça commit das alterações:

```bash
git add .
git commit -m "Integração com Supabase para persistência de dados"
git push
```

2. A Vercel fará deploy automaticamente
3. Adicione as variáveis de ambiente no painel da Vercel (Passo 5)
4. Force um novo deploy ou aguarde o próximo push

---

## ✅ Checklist de Verificação

- [ ] Projeto Supabase criado
- [ ] Tabelas criadas (pages, home_content, inscriptions)
- [ ] Políticas RLS configuradas
- [ ] Credenciais copiadas (URL e anon key)
- [ ] Variáveis de ambiente configuradas localmente
- [ ] `npm install` executado
- [ ] Teste local realizado com sucesso
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Deploy realizado

---

## 🎉 Pronto!

Agora seus dados estão salvos no Supabase e persistem entre sessões, dispositivos e navegadores!

**Próximos passos recomendados:**
1. Implementar autenticação para o admin (veja `SUPABASE_SETUP.md`)
2. Fazer backup regular dos dados
3. Monitorar uso do Supabase (plano gratuito tem limites)

---

## 🆘 Problemas Comuns

### Erro: "Failed to fetch"
- Verifique se as credenciais estão corretas
- Verifique se as políticas RLS estão configuradas
- Abra o console do navegador (F12) para ver detalhes

### Dados não aparecem
- Verifique se as tabelas foram criadas corretamente
- Verifique se o registro inicial foi inserido em `home_content`
- Tente acessar o SQL Editor e fazer `SELECT * FROM home_content;`

### Erro de CORS
- Verifique se a URL do Supabase está correta
- Verifique se você está usando `https://` e não `http://`
