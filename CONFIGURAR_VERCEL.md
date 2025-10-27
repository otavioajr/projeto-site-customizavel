# ⚠️ AÇÃO NECESSÁRIA: Configurar Variáveis de Ambiente na Vercel

## 🚨 IMPORTANTE

O push foi realizado e a Vercel já deve estar fazendo o deploy, MAS o site não vai funcionar completamente sem as variáveis de ambiente configuradas!

---

## 📋 Passos para Configurar

### 1. Acessar o Dashboard da Vercel

Acesse: https://vercel.com/dashboard

### 2. Selecionar o Projeto

Clique no projeto: `projeto-site-customizavel`

### 3. Ir em Settings → Environment Variables

1. No projeto, clique em **"Settings"**
2. No menu lateral, clique em **"Environment Variables"**

### 4. Adicionar as Variáveis

Adicione estas 2 variáveis:

#### Variável 1: SUPABASE_URL
```
Key:   SUPABASE_URL
Value: https://yzsgoxrrhjiiulmnwrfo.supabase.co
Environment: Production, Preview, Development (selecionar todos)
```

#### Variável 2: SUPABASE_ANON_KEY
```
Key:   SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6c2dveHJyaGppaXVsbW53cmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMjQ1NDksImV4cCI6MjA3NjYwMDU0OX0.5F8gLht7b-Ig01Bxr0zTTSPeCfdYvBH81P-Z2afysOo
Environment: Production, Preview, Development (selecionar todos)
```

### 5. Salvar

Clique em **"Save"** em cada variável

### 6. Forçar Novo Deploy (Recomendado)

Após adicionar as variáveis:

1. Vá em **"Deployments"**
2. Clique nos **3 pontinhos (...)** do último deploy
3. Clique em **"Redeploy"**
4. Confirme o redeploy

---

## ✅ Como Verificar se Funcionou

Após o deploy:

1. Acesse seu site na Vercel
2. Abra o Console do navegador (F12)
3. Procure por:
   - ✅ `Supabase conectado com sucesso!`
   - ❌ `Supabase não configurado`

Se aparecer a mensagem de erro, as variáveis não foram configuradas corretamente.

---

## 🔍 Verificação Rápida

Você pode testar acessando:
```
https://seu-dominio.vercel.app/test-supabase.html
```

Esta página vai mostrar se:
- ✅ Variáveis de ambiente estão configuradas
- ✅ Conexão com Supabase funciona
- ✅ Tabelas estão acessíveis
- ✅ Leitura e escrita funcionam

---

## 📸 Screenshots do Processo

### Passo 1: Settings
![Settings](https://vercel.com/_next/image?url=%2Fdocs-proxy%2Fstatic%2Fdocs%2Fconcepts%2Fprojects%2Fenvironment-variables%2Fenv-var-creation.png)

### Passo 2: Environment Variables
- Clique em "Add New"
- Cole o Key e Value
- Selecione todos os environments
- Save

---

## ⚠️ Notas Importantes

1. **NÃO** coloque as credenciais no código (já está em `config.js` para desenvolvimento local)
2. **NÃO** commite o `config.js` (já está no `.gitignore`)
3. As variáveis de ambiente da Vercel são **privadas** e **seguras**
4. Cada mudança nas variáveis requer um **novo deploy**

---

## 🆘 Troubleshooting

### Deploy falhou
- Verifique os logs na aba "Deployments"
- Procure por erros relacionados a módulos não encontrados

### Site carrega mas dados não aparecem
- Variáveis não configuradas → Configure conforme instruções acima
- Tabelas não criadas → Verifique o Supabase

### Erro "Invalid API key"
- Copie novamente a anon key do Supabase
- Verifique se não tem espaços extras
- Reconfigure a variável na Vercel

### Erro "relation does not exist"
- As tabelas não foram criadas
- Execute o SQL do `SETUP_TABELAS.sql` no dashboard do Supabase

---

## 📞 Links Úteis

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard/project/yzsgoxrrhjiiulmnwrfo
- **Documentação Vercel:** https://vercel.com/docs/concepts/projects/environment-variables

---

## ✅ Checklist

- [ ] Acessei o dashboard da Vercel
- [ ] Fui em Settings → Environment Variables
- [ ] Adicionei SUPABASE_URL
- [ ] Adicionei SUPABASE_ANON_KEY
- [ ] Selecionei todos os environments (Production, Preview, Development)
- [ ] Salvei ambas as variáveis
- [ ] Forcei um novo deploy
- [ ] Testei o site e funciona!

---

**Tempo estimado:** 3 minutos

**Após configurar, seu site estará 100% funcional em produção!** 🚀
