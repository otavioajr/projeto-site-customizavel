# 🔧 Guia de Configuração - Projeto Site Customizável

> 📖 **Documentação Principal**: Para visão geral do projeto, instalação e outros tópicos, consulte o [`README.md`](README.md)

Este documento consolida todas as configurações necessárias para o projeto.

## Índice

1. [Configuração do Supabase](#configuração-do-supabase)
2. [Configuração da Vercel](#configuração-da-vercel)
3. [Compartilhamento Online (Túneis)](#compartilhamento-online)

---

# Configuração do Supabase

## 📋 Visão Geral

O Supabase é o banco de dados PostgreSQL na nuvem que garante a persistência dos dados. Sem ele, os dados são salvos apenas no localStorage e podem ser perdidos.

## 🚀 Passo 1: Criar Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `aventuras-landing` (ou nome de sua preferência)
   - **Database Password**: Gere uma senha forte (guarde-a!)
   - **Region**: `South America (São Paulo)`
4. Clique em **"Create new project"**
5. Aguarde ~2 minutos para o projeto ser provisionado

## 🗄️ Passo 2: Criar Tabelas no Banco de Dados

1. No painel do Supabase, vá em **SQL Editor** (ícone de código no menu lateral)
2. Clique em **"New query"**
3. Abra o arquivo **`SETUP_TABELAS.sql`** deste projeto
4. **Copie TODO o conteúdo** do arquivo
5. Cole no editor SQL do Supabase
6. Clique em **"Run"** (ou Ctrl/Cmd + Enter)
7. Aguarde a mensagem: **"Success. No rows returned"**

### Estrutura das Tabelas

O script cria 3 tabelas principais:

- **`pages`** - Páginas do menu
- **`home_content`** - Conteúdo da página inicial
- **`inscriptions`** - Inscrições de formulários

## 🔐 Passo 3: Configurar Permissões (RLS)

As políticas RLS (Row Level Security) já estão incluídas no arquivo `SETUP_TABELAS.sql`.

**Políticas configuradas:**
- ✅ Leitura pública de páginas ativas e conteúdo da home
- ✅ Inserção de inscrições sem autenticação
- ✅ Admin pode gerenciar tudo (temporário para MVP)

⚠️ **IMPORTANTE**: Para produção real, implemente autenticação adequada (veja seção de autenticação avançada abaixo).

## 🔑 Passo 4: Obter Credenciais

1. No painel do Supabase, vá em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** key (chave longa que começa com `eyJ...`)

## 💻 Passo 5: Configurar Credenciais Localmente

### Desenvolvimento Local

1. Crie (ou edite) o arquivo `config.js` na pasta raiz:

```javascript
// config.js
window.SUPABASE_URL = 'https://seu-projeto.supabase.co';
window.SUPABASE_ANON_KEY = 'sua-chave-publica-aqui';
```

2. O arquivo já está referenciado no `index.html` e `admin.html`

⚠️ **NÃO** faça commit deste arquivo (já está no `.gitignore`)

## 📦 Passo 6: Instalar Dependências

Execute no terminal:

```bash
npm install
```

Isso instalará o `@supabase/supabase-js` que já está configurado no `package.json`.

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

### Verificar Conexão

Execute o script de verificação:

```bash
node verificar-supabase.js
```

Você deve ver:
```
✅ Tabela "pages" existe
✅ Tabela "home_content" existe
✅ Tabela "inscriptions" existe
```

## ✅ Checklist de Configuração do Supabase

- [ ] Projeto Supabase criado
- [ ] Tabelas criadas (via SETUP_TABELAS.sql)
- [ ] Credenciais copiadas (URL e anon key)
- [ ] Arquivo `config.js` criado localmente
- [ ] `npm install` executado
- [ ] Teste local realizado com sucesso
- [ ] Verificação com `verificar-supabase.js` passou

## 🆘 Problemas Comuns - Supabase

### Erro: "Invalid API key"
- Confirme que copiou a **anon public key** (não a service_role)
- Verifique se não há espaços extras
- Verifique se o projeto não está pausado (projetos gratuitos pausam após 7 dias)

### Erro: "relation does not exist" ou "42P01"
- As tabelas não foram criadas ainda
- Execute o SQL do `SETUP_TABELAS.sql` no dashboard

### Dados não aparecem
- Verifique se as tabelas foram criadas corretamente
- Tente acessar o SQL Editor e fazer `SELECT * FROM home_content;`

### Erro de CORS
- Verifique se a URL do Supabase está correta
- Verifique se você está usando `https://` e não `http://`

### Inscrições não são salvas
- Verifique as políticas RLS no Supabase
- Consulte o arquivo `VERIFICAR_POLITICAS_RLS.md` para diagnóstico detalhado

## 👤 Autenticação Avançada (Opcional)

Para produção, considere implementar autenticação real:

### Opção 1: Email/Senha

```javascript
import { supabase } from './supabase.js'

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}
```

### Opção 2: Magic Link

```javascript
async function signInWithMagicLink(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + '/admin.html'
    }
  })
  return { data, error }
}
```

## 📦 Storage para Imagens (Opcional)

Para armazenar imagens no Supabase em vez de localmente:

1. **Criar Bucket:**
   - Vá em Storage no dashboard
   - Clique em "New bucket"
   - Name: `images`
   - Public: ✅

2. **Configurar políticas:**

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
```

3. **Usar no código:**

```javascript
import { supabase } from './supabase.js'

async function uploadImage(file) {
  const fileName = `${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file)
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(fileName)
  
  return publicUrl
}
```

---

# Configuração da Vercel

## 📋 Visão Geral

A Vercel é a plataforma de deploy recomendada para este projeto. Ela oferece:
- ✅ Deploy automático via Git
- ✅ HTTPS gratuito
- ✅ CDN global
- ✅ Funções serverless

## 🚀 Opção 1: Deploy via GitHub (Recomendado)

### Passo 1: Criar Repositório no GitHub

```bash
cd projeto-site-customizavel
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

### Passo 2: Conectar na Vercel

1. Acesse https://vercel.com
2. Clique em "New Project"
3. Importe seu repositório do GitHub
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (deixe vazio ou `npm install`)
   - **Output Directory**: ./
5. Clique em "Deploy"

### Passo 3: Deploy Automático

- ✅ Cada push para `main` faz deploy automático
- ✅ Preview automático para pull requests

## 🚀 Opção 2: Deploy via CLI

```bash
# 1. Instalar Vercel CLI globalmente
npm install -g vercel

# 2. Fazer login (primeira vez)
vercel login

# 3. Deploy de teste
vercel

# 4. Deploy em produção
vercel --prod
```

## 🔧 Passo 3: Configurar Variáveis de Ambiente

**CRÍTICO**: O site não funcionará sem as variáveis de ambiente!

### Via Interface Web (Recomendado)

1. Acesse o dashboard da Vercel
2. Vá no seu projeto → **Settings** → **Environment Variables**
3. Adicione as variáveis:

**SUPABASE_URL**
```
Key: SUPABASE_URL
Value: https://seu-projeto.supabase.co
Environment: Production, Preview, Development (marcar todos)
```

**SUPABASE_ANON_KEY**
```
Key: SUPABASE_ANON_KEY
Value: sua-chave-publica-aqui
Environment: Production, Preview, Development (marcar todos)
```

4. Clique em "Save" para cada variável

### Via CLI

```bash
# Adicionar variáveis
vercel env add SUPABASE_URL production
# Cole o valor quando solicitado

vercel env add SUPABASE_ANON_KEY production
# Cole o valor quando solicitado
```

### Passo 4: Forçar Novo Deploy

Após adicionar as variáveis:

1. Vá em **Deployments**
2. Clique nos **3 pontinhos (...)** do último deploy
3. Clique em **"Redeploy"**
4. Confirme o redeploy

Ou simplesmente faça um novo push no GitHub.

## 🌐 Passo 5: Domínio Customizado (Opcional)

1. Na Vercel: Settings → Domains
2. Adicione seu domínio (ex: `seusite.com.br`)
3. Configure DNS conforme instruções
4. Aguarde propagação (até 48h)

## ⚠️ IMPORTANTE: Limitação de Upload de Arquivos

A Vercel usa funções serverless com filesystem efêmero:

- ❌ Uploads salvos em `/uploads` serão **perdidos** após cada deploy
- ❌ O filesystem não é persistente

### Soluções para Upload de Imagens

**Opção 1: Supabase Storage (Recomendado)**
- ✅ 1GB grátis
- ✅ CDN integrado
- ✅ Fácil integração

**Opção 2: Cloudinary**
- ✅ 25GB grátis
- ✅ Otimização automática

**Opção 3: Vercel Blob**
- ✅ Integração nativa
- 💰 Pago após limite

**Opção 4: AWS S3**
- ✅ Escalável
- 💰 Pago

Veja a seção "Storage para Imagens" na configuração do Supabase.

## ✅ Checklist de Deploy na Vercel

- [ ] Repositório Git criado e código commitado
- [ ] Projeto conectado na Vercel
- [ ] Deploy inicial realizado com sucesso
- [ ] Variáveis de ambiente configuradas (SUPABASE_URL e SUPABASE_ANON_KEY)
- [ ] Redeploy realizado após configurar variáveis
- [ ] Site funcionando em produção
- [ ] Domínio customizado configurado (opcional)

## 🧪 Testes Pós-Deploy

### 1. Verificar Site

- [ ] Home: `https://seu-site.vercel.app/`
- [ ] Admin: `https://seu-site.vercel.app/admin.html`
- [ ] Página interna: `https://seu-site.vercel.app/p/#slug`

### 2. Verificar Console

1. Abra o site
2. Pressione F12
3. Vá na aba "Console"
4. Procure por erros
5. Deve aparecer mensagens de conexão com Supabase

### 3. Testar Funcionalidades

1. Acesse o Admin
2. Crie uma página de teste
3. Verifique se aparece no menu
4. Edite conteúdo da Home
5. Verifique se salva e persiste

## 🆘 Problemas Comuns - Vercel

### Build falha

- Verifique `package.json` dependencies
- Confirme que `node_modules` está no `.gitignore`
- Teste `npm install` localmente

### Site carrega mas dados não aparecem

- Variáveis não configuradas → Configure conforme instruções acima
- Tabelas não criadas no Supabase → Execute SETUP_TABELAS.sql

### Erro "Invalid API key" em produção

- Copie novamente a anon key do Supabase
- Verifique se não tem espaços extras
- Reconfigure a variável na Vercel
- Force um redeploy

### Erro 500 nas rotas API

- Verifique logs: `vercel logs`
- Confirme que não está tentando escrever em disco local
- Verifique variáveis de ambiente

### Imagens não carregam

- Se usando pasta `/uploads`, migre para Supabase Storage
- Verifique URLs das imagens no código

## 📊 Monitoramento

### Vercel Analytics (Gratuito)

1. Dashboard Vercel → Analytics
2. Veja:
   - Pageviews
   - Top pages
   - Devices
   - Locations

### Logs em Tempo Real

```bash
vercel logs --follow
```

---

# Compartilhamento Online

## 📋 Visão Geral

Durante o desenvolvimento, você pode querer compartilhar seu projeto local (localhost:3000) com outras pessoas pela internet. Existem três soluções principais.

## ⭐ Opção 1: Cloudflare Tunnel (Melhor)

### Por que é a melhor opção?

- ✅ **Sem cadastro** necessário
- ✅ **Sem página de aviso** (visitante acessa direto)
- ✅ Super rápido e estável
- ✅ Da Cloudflare (empresa confiável)
- ✅ 100% gratuito

### Instalação (uma vez apenas)

```bash
brew install cloudflare/cloudflare/cloudflared
```

### Uso

**Método 1: Script automático**
```bash
./start-cloudflare.sh
```

**Método 2: Manual**
```bash
# Terminal 1: Iniciar servidor
npm start

# Terminal 2: Iniciar túnel
cloudflared tunnel --url http://localhost:3000
```

### Resultado

Você verá algo como:
```
https://abc-123.trycloudflare.com
```

Copie e compartilhe esta URL!

## Opção 2: localtunnel (Alternativa Simples)

### Características

- ✅ Sem cadastro necessário
- ✅ Funciona imediatamente
- ⚠️ Mostra página de aviso (visitante clica "Continue")

### Uso

**Método 1: Script automático**
```bash
./start-localtunnel.sh
```

**Método 2: Manual**
```bash
# Terminal 1: Iniciar servidor
npm start

# Terminal 2: Iniciar túnel
npx localtunnel --port 3000
```

### Página de Aviso

Quando alguém acessa sua URL pela primeira vez, aparece uma página pedindo para clicar em "Continue". Isso é normal!

**O que dizer ao visitante:**
> "Quando você acessar o link, vai aparecer uma página de aviso. É só clicar em 'Click to Continue' que você verá o site."

### Usar Subdomínio Fixo (menos avisos)

```bash
npx localtunnel --port 3000 --subdomain projeto-leo
```

URL sempre a mesma: `https://projeto-leo.loca.lt`

## Opção 3: ngrok (Profissional)

### Características

- ✅ Interface web profissional
- ✅ Muito estável
- ❌ Requer cadastro gratuito
- ⚠️ Mostra página de aviso (conta free)

### Configuração Inicial

1. **Cadastre-se** em: https://dashboard.ngrok.com/signup
2. **Copie seu token** do dashboard
3. **Configure o token:**

```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

### Uso

**Método 1: Script automático**
```bash
./start-ngrok.sh
```

**Método 2: Manual**
```bash
# Terminal 1: Iniciar servidor
npm start

# Terminal 2: Iniciar ngrok
ngrok http 3000
```

### Interface Web

Acesse `http://localhost:4040` para:
- Ver todas as requisições HTTP
- Inspecionar headers, body, response
- Replay de requisições

### Comandos Avançados

**Região específica:**
```bash
ngrok http 3000 --region=sa  # South America
```

**Com autenticação:**
```bash
ngrok http 3000 --basic-auth="usuario:senha"
```

## 📊 Comparação das Opções

| Característica | Cloudflare | localtunnel | ngrok |
|----------------|------------|-------------|-------|
| **Cadastro** | ❌ Não | ❌ Não | ✅ Sim |
| **Página de Aviso** | ❌ Não | ✅ Sim* | ✅ Sim* |
| **Velocidade** | ⚡⚡⚡ | ⚡⚡ | ⚡⚡⚡ |
| **Estabilidade** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Interface Web** | ❌ | ❌ | ✅ |
| **Configuração** | 🟢 Fácil | 🟢 Fácil | 🟡 Média |

\* Visitante precisa clicar em "Continue" antes de ver o site

## 💡 Quando Usar Cada Um

### Use Cloudflare se:
- ✅ Quer a melhor experiência (sem avisos)
- ✅ Vai mostrar para clientes
- ✅ Quer algo profissional
- ✅ Não quer criar conta

### Use localtunnel se:
- ✅ Cloudflare não funcionar
- ✅ Teste rápido entre amigos
- ✅ Não se importa com aviso

### Use ngrok se:
- ✅ Precisa de interface web para debug
- ✅ Uso profissional frequente
- ✅ Já tem conta configurada

## 🔧 Solução de Problemas

### Erro: "Porta 3000 já em uso"

```bash
# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Erro: "cloudflared not found"

```bash
brew install cloudflare/cloudflare/cloudflared
```

### Erro: "ngrok authentication failed"

1. Cadastre-se em https://dashboard.ngrok.com/signup
2. Copie seu authtoken
3. Execute: `ngrok config add-authtoken SEU_TOKEN`

### localtunnel pede senha

Não é senha! É só clicar em "Click to Continue" ou "Continue"

### Túnel muito lento

```bash
# ngrok - mudar região
ngrok http 3000 --region=sa

# Verificar conexão de internet
```

## 📝 Como Compartilhar com Cliente

**Mensagem sugerida:**

> Olá! Aqui está o link para visualizar o projeto:
> 
> 🔗 https://sua-url-aqui.trycloudflare.com
> 
> O site está rodando no meu computador, então preciso estar online.
> Qualquer dúvida, me avise!

## ✅ Checklist de Compartilhamento

- [ ] Instalei o Cloudflare Tunnel: `brew install cloudflare/cloudflare/cloudflared`
- [ ] Executei: `./start-cloudflare.sh`
- [ ] Copiei a URL que apareceu
- [ ] Testei abrindo em navegador anônimo
- [ ] Compartilhei com cliente/amigo
- [ ] Mantenho computador ligado e script rodando

## 🎯 Fluxo de Trabalho Recomendado

1. **Desenvolvimento local** → Use `npm start`
2. **Mostrar para cliente** → Use Cloudflare Tunnel
3. **Deploy em produção** → Use Vercel

---

## 📚 Recursos Adicionais

### Documentação Oficial

- **Supabase**: https://supabase.com/docs
- **Vercel**: https://vercel.com/docs
- **ngrok**: https://ngrok.com/docs
- **Cloudflare Tunnel**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

### Arquivos de Suporte

- `SETUP_TABELAS.sql` - Script de criação das tabelas
- `verificar-supabase.js` - Script de verificação da conexão
- `config.example.js` - Exemplo de configuração local
- `vercel.json` - Configuração da Vercel
- `start-cloudflare.sh` - Script para Cloudflare Tunnel
- `start-localtunnel.sh` - Script para localtunnel
- `start-ngrok.sh` - Script para ngrok

---

**Tempo estimado para configuração completa:** 20-30 minutos

**Após seguir este guia, você terá:**
- ✅ Banco de dados na nuvem (Supabase)
- ✅ Site em produção (Vercel)
- ✅ Capacidade de compartilhar localmente (Túneis)

