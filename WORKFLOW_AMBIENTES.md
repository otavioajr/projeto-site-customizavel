# 🔄 Workflow de Ambientes - Produção e Homologação

## 📋 Visão Geral

Este projeto está configurado com **dois ambientes separados**:

- **Produção (main)**: Ambiente real, com dados de clientes reais
- **Homologação (homol)**: Ambiente de testes, cópia de produção para validação

## 🎯 Regra de Ouro

> ⚠️ **NUNCA faça mudanças diretamente em produção!**
>
> Todas as mudanças devem começar em **homologação** e, após testadas, serem promovidas para **produção**.

---

## 🏗️ Estrutura de Ambientes

### Branch Git
- **`main`** → Produção (protegida)
- **`homol`** → Homologação (desenvolvimento)

### Bancos de Dados Supabase
- **Produção**: Projeto Supabase atual (dados reais)
- **Homologação**: Novo projeto Supabase (dados de teste)

### Configurações
- **`.env.production`** → Credenciais de produção
- **`.env.homol`** → Credenciais de homologação
- **`.env`** → Ambiente ativo (gerado automaticamente, não commitar)

---

## 🚀 Setup Inicial

### 1. Criar Projeto Supabase de Homologação

1. Acesse https://supabase.com
2. Crie um **novo projeto** chamado `aventuras-landing-homol`
3. No SQL Editor, execute o arquivo `SETUP_TABELAS.sql`
4. Copie as credenciais (URL e anon key)

### 2. Configurar Credenciais

Edite o arquivo `.env.homol`:

```bash
NODE_ENV=homol
PORT=3001
SUPABASE_URL=https://seu-projeto-homol.supabase.co
SUPABASE_ANON_KEY=sua-chave-homol-aqui
BASE_URL=http://localhost:3001
```

Verifique o arquivo `.env.production` (já configurado com produção):

```bash
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://yzsgoxrrhjiiulmnwrfo.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
BASE_URL=https://seu-dominio.com
```

### 3. Instalar Dependências

```bash
npm install
```

Isso instalará o `dotenv` necessário para gerenciar ambientes.

---

## 💻 Trabalhando com Ambientes

### Alternar Ambiente (Script Interativo)

```bash
./switch-env.sh
```

Ou com argumentos:

```bash
./switch-env.sh homol        # Alternar para homologação
./switch-env.sh production   # Alternar para produção
./switch-env.sh current      # Mostrar ambiente atual
```

### Iniciar Servidor por Ambiente

#### Homologação (recomendado)
```bash
npm run dev:homol
```

#### Produção (teste local - cuidado!)
```bash
npm run dev:prod
```

#### Usando script de ambiente
```bash
./switch-env.sh homol
npm start
```

---

## 🔄 Workflow de Desenvolvimento

### Fluxo Completo de Mudanças

```
1. Homologação (homol)
   ↓ fazer mudanças
   ↓ testar localmente
   ↓ commit & push
   ↓
2. Pull Request
   ↓ revisar código
   ↓ aprovar
   ↓
3. Merge para Main
   ↓
4. Produção (main)
   ↓ deploy automático
```

### Passo a Passo Detalhado

#### 1. Iniciar Nova Funcionalidade

```bash
# Garantir que está na branch homol
git checkout homol

# Atualizar com a última versão
git pull origin homol

# Alternar para ambiente de homologação
./switch-env.sh homol

# Iniciar servidor
npm run dev:homol
```

#### 2. Fazer Mudanças

- Edite os arquivos necessários
- Teste no navegador: http://localhost:3001
- Verifique o admin: http://localhost:3001/admin.html
- Crie páginas de teste, inscrições, etc.

#### 3. Testar Completamente

**Checklist de Testes:**
- [ ] Página inicial carrega corretamente
- [ ] Admin funciona (login, edição, salvamento)
- [ ] Upload de imagens funciona
- [ ] Páginas criadas aparecem no menu
- [ ] Formulários salvam inscrições no Supabase
- [ ] Inscrições aparecem na aba de gerenciamento
- [ ] Temas customizados funcionam
- [ ] Responsivo (mobile/desktop)

#### 4. Commit e Push

```bash
git add .
git commit -m "feat: descrição da funcionalidade"
git push origin homol
```

#### 5. Criar Pull Request

1. No GitHub, crie PR de `homol` → `main`
2. Descreva as mudanças
3. Revise o código
4. Teste novamente se necessário

#### 6. Merge para Produção

```bash
# Após aprovação do PR
git checkout main
git pull origin main
git merge homol
git push origin main
```

#### 7. Deploy em Produção

- Se estiver usando Vercel: deploy automático ao push em `main`
- Se estiver usando VPS: SSH no servidor e fazer pull

```bash
# No servidor VPS
cd /caminho/projeto
git pull origin main
pm2 restart all
```

---

## 🔄 Sincronizar Homologação com Produção

### Quando Sincronizar?

Sincronize homologação quando quiser testar com dados similares aos de produção.

### Como Sincronizar Código

```bash
# Na branch homol
git checkout homol
git merge main
git push origin homol
```

### Como Copiar Dados (Supabase)

**Opção 1: SQL Dump (Recomendado)**

No Supabase de **Produção**:
1. Vá em Database → Backups
2. Faça backup das tabelas
3. Baixe o SQL

No Supabase de **Homologação**:
1. SQL Editor → Execute o backup
2. Isso cria uma cópia dos dados

**Opção 2: Script Customizado**

Criar script para copiar dados específicos (não incluído neste projeto).

⚠️ **NUNCA copie de homologação para produção** - apenas produção → homologação!

---

## 📊 Comparação de Ambientes

| Aspecto | Homologação | Produção |
|---------|-------------|----------|
| Branch Git | `homol` | `main` |
| Supabase | Projeto separado | Projeto atual |
| Dados | Teste (fake) | Reais (clientes) |
| URL Local | localhost:3001 | - |
| Deploy | Opcional (Vercel preview) | Vercel/VPS |
| Mudanças | Livre | Apenas via merge |

---

## ⚙️ Comandos Úteis

### Git

```bash
# Ver branch atual
git branch

# Listar todas as branches
git branch -a

# Alternar para homol
git checkout homol

# Alternar para produção
git checkout main

# Ver diferenças entre branches
git diff main..homol
```

### Ambiente

```bash
# Ver ambiente atual
./switch-env.sh current

# Alternar para homol
./switch-env.sh homol

# Ver variáveis de ambiente
cat .env

# Rodar com ambiente específico
npm run dev:homol
npm run dev:prod
```

### Supabase

```bash
# Testar conexão (no navegador console)
# Admin → Console do navegador
await supabase.from('home_content').select('*')
```

---

## 🛡️ Segurança e Boas Práticas

### ✅ FAZER

- ✅ Sempre trabalhar na branch `homol`
- ✅ Testar completamente antes de fazer merge
- ✅ Usar `.env.homol` para desenvolvimento local
- ✅ Fazer backup antes de mudanças grandes
- ✅ Documentar mudanças no commit
- ✅ Revisar PRs antes de aprovar
- ✅ Manter homologação atualizada com produção

### ❌ NÃO FAZER

- ❌ Commitar arquivos `.env.*` com credenciais
- ❌ Fazer mudanças diretamente na branch `main`
- ❌ Usar dados de produção em homologação sem sanitizar
- ❌ Copiar dados de homologação para produção
- ❌ Fazer deploy sem testar em homologação
- ❌ Compartilhar credenciais do `.env.production`

---

## 🆘 Troubleshooting

### Problema: "Supabase não conectado"

**Solução:**
```bash
# Verificar ambiente ativo
./switch-env.sh current

# Verificar se .env existe
cat .env

# Alternar para ambiente correto
./switch-env.sh homol
```

### Problema: "Dados não aparecem"

**Solução:**
- Verifique se está usando o banco correto
- Confirme que `SUPABASE_URL` no `.env` está correto
- Verifique console do navegador para erros

### Problema: "Mudanças em homol afetando produção"

**Impossível!** Se isso estiver acontecendo:
1. Verifique o arquivo `.env` ativo
2. Confirme que não está usando credenciais de produção
3. Verifique a URL do Supabase no console do navegador

### Problema: "Merge conflicts entre homol e main"

**Solução:**
```bash
git checkout homol
git fetch origin
git merge origin/main
# Resolver conflitos manualmente
git add .
git commit -m "fix: resolve merge conflicts"
git push origin homol
```

---

## 📚 Arquivos de Referência

- **`.env.example`** - Template de configuração
- **`.env.production`** - Credenciais de produção (não commitar)
- **`.env.homol`** - Credenciais de homologação (não commitar)
- **`switch-env.sh`** - Script para alternar ambientes
- **`SETUP_TABELAS.sql`** - SQL para criar banco em novo ambiente

---

## 🎓 Resumo Rápido

```bash
# 1. Começar a trabalhar
git checkout homol
./switch-env.sh homol
npm run dev:homol

# 2. Fazer mudanças e testar
# ... editar arquivos ...
# ... testar no navegador ...

# 3. Commitar
git add .
git commit -m "feat: nova funcionalidade"
git push origin homol

# 4. Criar PR e fazer merge
# ... via GitHub ...

# 5. Deploy em produção
git checkout main
git pull origin main
# Deploy automático (Vercel) ou manual (VPS)
```

---

**Dúvidas?** Consulte `CLAUDE.md` ou `TROUBLESHOOTING.md`
