# Guia de Integração Supabase - Fase Produção

## 📋 Visão Geral

Este guia detalha como migrar do MVP (localStorage) para produção com Supabase, incluindo:
- Banco de dados PostgreSQL
- Autenticação segura
- Storage para imagens
- Row Level Security (RLS)

---

## 🚀 Passo 1: Criar Projeto Supabase

1. Acesse https://supabase.com
2. Clique em "New Project"
3. Preencha:
   - Name: `aventuras-landing`
   - Database Password: (gere uma senha forte)
   - Region: South America (São Paulo)
4. Aguarde ~2 minutos para provisionar

---

## 🗄️ Passo 2: Criar Tabelas

### Tabela: `pages`

```sql
-- Criar tabela de páginas
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  "order" INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  canva_embed_url TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_order ON pages("order");
CREATE INDEX idx_pages_active ON pages(is_active);

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
```

### Tabela: `home_content`

```sql
-- Criar tabela de conteúdo da home (apenas 1 registro)
CREATE TABLE home_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)
);

-- Inserir registro inicial
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

-- Trigger para updated_at
CREATE TRIGGER update_home_content_updated_at
  BEFORE UPDATE ON home_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔐 Passo 3: Configurar Row Level Security (RLS)

### Habilitar RLS

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;
```

### Políticas para `pages`

```sql
-- Leitura pública (apenas páginas ativas)
CREATE POLICY "Páginas ativas são públicas"
  ON pages FOR SELECT
  USING (is_active = true);

-- Admin pode fazer tudo (requer autenticação)
CREATE POLICY "Admin pode gerenciar páginas"
  ON pages FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

### Políticas para `home_content`

```sql
-- Leitura pública
CREATE POLICY "Conteúdo da home é público"
  ON home_content FOR SELECT
  USING (true);

-- Admin pode editar (requer autenticação)
CREATE POLICY "Admin pode editar home"
  ON home_content FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

---

## 👤 Passo 4: Configurar Autenticação

### Opção 1: Email/Senha

1. Supabase Dashboard → Authentication → Providers
2. Habilite "Email"
3. Configure:
   - Enable email confirmations: ✅
   - Secure email change: ✅

### Opção 2: Magic Link (Recomendado)

1. Supabase Dashboard → Authentication → Providers
2. Habilite "Email" com Magic Link
3. Desabilite senha se preferir apenas Magic Link

### Criar Usuário Admin

```sql
-- Via SQL Editor (temporário para primeiro acesso)
-- Depois criar via interface de autenticação
```

Ou via Dashboard:
1. Authentication → Users
2. "Add user"
3. Email: seu-email@exemplo.com
4. Password: (senha forte)
5. Confirmar email automaticamente

---

## 📦 Passo 5: Storage para Imagens (Opcional)

### Criar Bucket

```sql
-- Via SQL
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);
```

Ou via Dashboard:
1. Storage → New bucket
2. Name: `images`
3. Public: ✅

### Políticas de Storage

```sql
-- Upload apenas para autenticados
CREATE POLICY "Admin pode fazer upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'images' AND
    auth.role() = 'authenticated'
  );

-- Leitura pública
CREATE POLICY "Imagens são públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

-- Delete apenas para autenticados
CREATE POLICY "Admin pode deletar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'images' AND
    auth.role() = 'authenticated'
  );
```

---

## 💻 Passo 6: Integrar no Código

### Instalar Supabase Client

```bash
npm install @supabase/supabase-js
```

### Criar `assets/js/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://seu-projeto.supabase.co'
const supabaseAnonKey = 'sua-chave-publica'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções auxiliares
export async function getPages() {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('is_active', true)
    .order('order')
  
  if (error) throw error
  return data
}

export async function getHomeContent() {
  const { data, error } = await supabase
    .from('home_content')
    .select('content')
    .single()
  
  if (error) throw error
  return data.content
}

export async function updateHomeContent(content) {
  const { error } = await supabase
    .from('home_content')
    .update({ content })
    .eq('id', '00000000-0000-0000-0000-000000000001')
  
  if (error) throw error
}

export async function savePage(page) {
  if (page.id) {
    // Update
    const { error } = await supabase
      .from('pages')
      .update(page)
      .eq('id', page.id)
    
    if (error) throw error
  } else {
    // Insert
    const { error } = await supabase
      .from('pages')
      .insert([page])
    
    if (error) throw error
  }
}

export async function deletePage(id) {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Autenticação
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signInWithMagicLink(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + '/admin.html'
    }
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export function getCurrentUser() {
  return supabase.auth.getUser()
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}

// Upload de imagem
export async function uploadImage(file, path) {
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) throw error
  
  // Retornar URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(data.path)
  
  return publicUrl
}
```

### Atualizar `app.js`

```javascript
import { getPages, getHomeContent } from './supabase.js'

// Substituir loadPages()
async function loadPages() {
  try {
    return await getPages()
  } catch (error) {
    console.error('Erro ao carregar páginas:', error)
    // Fallback para localStorage
    return JSON.parse(localStorage.getItem('pages') || '[]')
  }
}

// Substituir loadHomeContent()
async function loadHomeContent() {
  try {
    return await getHomeContent()
  } catch (error) {
    console.error('Erro ao carregar home:', error)
    // Fallback para localStorage
    const raw = localStorage.getItem('home_content')
    return raw ? JSON.parse(raw) : getDefaultHomeContent()
  }
}

// Atualizar renderMenu para ser async
async function renderMenu() {
  const nav = document.getElementById('main-nav')
  if (!nav) return
  
  const pages = await loadPages()
  
  pages.forEach(page => {
    const link = document.createElement('a')
    link.href = `/p/#${page.slug}`
    link.textContent = page.label
    nav.appendChild(link)
  })
}

// Atualizar renderHome para ser async
async function renderHome() {
  const data = await loadHomeContent()
  // ... resto do código
}

// Atualizar inicialização
document.addEventListener('DOMContentLoaded', async () => {
  await renderMenu()
  await renderHome()
  initMobileMenu()
  handlePreviewMode()
})
```

### Atualizar `admin.js`

```javascript
import { 
  getCurrentUser, 
  signIn, 
  signOut,
  getHomeContent,
  updateHomeContent,
  getPages,
  savePage,
  deletePage 
} from './supabase.js'

// Substituir checkAuth()
async function checkAuth() {
  const { data: { user } } = await getCurrentUser()
  
  if (!user) {
    // Mostrar tela de login
    showLoginScreen()
    return false
  }
  
  return true
}

function showLoginScreen() {
  // Criar UI de login
  const loginHtml = `
    <div class="login-screen">
      <h2>Login Admin</h2>
      <form id="login-form">
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="password" placeholder="Senha" required>
        <button type="submit">Entrar</button>
      </form>
    </div>
  `
  
  document.body.innerHTML = loginHtml
  
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    
    const { error } = await signIn(email, password)
    
    if (error) {
      alert('Erro ao fazer login: ' + error.message)
    } else {
      window.location.reload()
    }
  })
}

// Atualizar saveHome()
async function saveHome() {
  const data = collectHomeData()
  
  try {
    await updateHomeContent(data)
    // Também salvar no localStorage como cache
    localStorage.setItem('home_content', JSON.stringify(data))
    showAlert('Home salva com sucesso!')
  } catch (error) {
    showAlert('Erro ao salvar: ' + error.message, 'error')
  }
}

// Atualizar savePage()
async function savePage() {
  // ... validações ...
  
  try {
    await savePage(pageData)
    await loadPagesEditor()
    hidePageForm()
    showAlert('Página salva com sucesso!')
  } catch (error) {
    showAlert('Erro ao salvar: ' + error.message, 'error')
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  if (!await checkAuth()) return
  
  initTabs()
  await loadHomeEditor()
  await loadPagesEditor()
  initPreview()
  initEventListeners()
  
  applyThemeToAdmin(state.homeContent.theme)
})
```

---

## 🔧 Passo 7: Variáveis de Ambiente

### Criar `.env.local`

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

### Adicionar no `.gitignore`

```
.env.local
.env
```

### Configurar na Vercel

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

---

## 📊 Passo 8: Migrar Dados Existentes

### Script de Migração

```javascript
// migrate-to-supabase.js
import { supabase } from './assets/js/supabase.js'

async function migrate() {
  // Migrar home_content
  const homeContent = JSON.parse(localStorage.getItem('home_content'))
  if (homeContent) {
    await supabase
      .from('home_content')
      .update({ content: homeContent })
      .eq('id', '00000000-0000-0000-0000-000000000001')
    
    console.log('✅ Home content migrado')
  }
  
  // Migrar pages
  const pages = JSON.parse(localStorage.getItem('pages') || '[]')
  for (const page of pages) {
    delete page.id // Deixar Supabase gerar novo UUID
    await supabase.from('pages').insert([page])
    console.log(`✅ Página "${page.label}" migrada`)
  }
  
  console.log('🎉 Migração completa!')
}

migrate()
```

---

## ✅ Checklist de Migração

### Preparação
- [ ] Projeto Supabase criado
- [ ] Tabelas criadas
- [ ] RLS configurado
- [ ] Usuário admin criado
- [ ] Storage configurado (opcional)

### Código
- [ ] Supabase client instalado
- [ ] `supabase.js` criado
- [ ] `app.js` atualizado
- [ ] `admin.js` atualizado
- [ ] Variáveis de ambiente configuradas

### Testes
- [ ] Login funciona
- [ ] Home carrega do Supabase
- [ ] Páginas carregam do Supabase
- [ ] Salvar funciona
- [ ] Editar funciona
- [ ] Deletar funciona
- [ ] Fallback para localStorage funciona

### Deploy
- [ ] Variáveis de ambiente na Vercel
- [ ] Deploy realizado
- [ ] Testes em produção
- [ ] Dados migrados

---

## 🎉 Conclusão

Após seguir este guia, você terá:
- ✅ Banco de dados PostgreSQL na nuvem
- ✅ Autenticação segura
- ✅ Storage para imagens
- ✅ Backup automático
- ✅ Escalabilidade
- ✅ Segurança com RLS

**Benefícios**:
- Dados persistem entre dispositivos
- Múltiplos admins possíveis
- Backup automático
- Melhor performance
- Mais seguro
