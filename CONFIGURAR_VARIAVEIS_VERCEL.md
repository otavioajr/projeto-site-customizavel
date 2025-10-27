# Configurar Variáveis de Ambiente na Vercel

## 🔑 Credenciais do Supabase

Aqui estão as credenciais do seu projeto Supabase que precisam ser configuradas na Vercel:

```
SUPABASE_URL=https://yzsgoxrrhjiiulmnwrfo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6c2dveHJyaGppaXVsbW53cmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMjQ1NDksImV4cCI6MjA3NjYwMDU0OX0.5F8gLht7b-Ig01Bxr0zTTSPeCfdYvBH81P-Z2afysOo
```

## 📝 Opção 1: Via Interface Web (Recomendado)

1. **Acesse o painel de configurações:**
   - URL: https://vercel.com/otavioajrs-projects/climbing-project/settings/environment-variables

2. **Adicione cada variável:**
   - Clique em "Add New"
   - **Nome**: `SUPABASE_URL`
   - **Valor**: `https://yzsgoxrrhjiiulmnwrfo.supabase.co`
   - **Ambientes**: Marque `Production`, `Preview` e `Development`
   - Clique em "Save"

3. **Repita para a segunda variável:**
   - **Nome**: `SUPABASE_ANON_KEY`
   - **Valor**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6c2dveHJyaGppaXVsbW53cmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMjQ1NDksImV4cCI6MjA3NjYwMDU0OX0.5F8gLht7b-Ig01Bxr0zTTSPeCfdYvBH81P-Z2afysOo`
   - **Ambientes**: Marque `Production`, `Preview` e `Development`
   - Clique em "Save"

4. **Fazer redeploy:**
   - Após adicionar as variáveis, faça um novo deploy:
     - Vá em "Deployments"
     - Clique nos 3 pontinhos do último deployment
     - Clique em "Redeploy"
   - OU simplesmente faça um novo push no GitHub (deploy automático)

## 🖥️ Opção 2: Via CLI

Se preferir usar o terminal:

```bash
# 1. Fazer login na Vercel
vercel login

# 2. Linkar o projeto (se ainda não estiver linkado)
vercel link

# 3. Adicionar variáveis
vercel env add SUPABASE_URL production
# Cole o valor: https://yzsgoxrrhjiiulmnwrfo.supabase.co

vercel env add SUPABASE_ANON_KEY production
# Cole o valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6c2dveHJyaGppaXVsbW53cmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMjQ1NDksImV4cCI6MjA3NjYwMDU0OX0.5F8gLht7b-Ig01Bxr0zTTSPeCfdYvBH81P-Z2afysOo

# 4. Fazer redeploy
vercel --prod
```

## ✅ Verificar Configuração

Após configurar as variáveis:

1. Acesse: https://chavesadventure.com.br
2. Abra o console do navegador (F12)
3. Verifique se não há erros de conexão com Supabase
4. Teste o painel admin: https://chavesadventure.com.br/admin.html

## 🔍 Troubleshooting

### Variáveis não funcionam após adicionar
- Faça um redeploy manual ou um novo push no GitHub
- As variáveis só são aplicadas em novos deploys

### Erro de conexão com Supabase
- Verifique se copiou os valores completos (sem espaços extras)
- Confirme que marcou os 3 ambientes (Production, Preview, Development)

### Como verificar se as variáveis estão configuradas
- Acesse: https://vercel.com/otavioajrs-projects/climbing-project/settings/environment-variables
- Você deve ver as duas variáveis listadas

## 📚 Documentação

- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Supabase with Vercel](https://supabase.com/docs/guides/getting-started/quickstarts/vercel)
