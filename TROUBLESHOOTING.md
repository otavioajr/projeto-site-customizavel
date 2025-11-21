# 🔧 Guia de Troubleshooting

> 📖 **Documentação Principal**: Para visão geral do projeto, instalação e outros tópicos, consulte o [`README.md`](README.md)

Este documento consolida soluções para todos os problemas comuns do projeto.

## Índice

1. [Problemas de Persistência de Dados](#problemas-de-persistência-de-dados)
2. [Problemas com Supabase](#problemas-com-supabase)
3. [Problemas com Imagens](#problemas-com-imagens)
4. [Problemas com Inscrições](#problemas-com-inscrições)
5. [Problemas com Servidor](#problemas-com-servidor)
6. [Problemas com Deploy](#problemas-com-deploy)
7. [Problemas com Pagamento](#problemas-com-pagamento)

---

# Problemas de Persistência de Dados

## Páginas/Dados Somem ao Limpar Cache

### Sintoma
- Crio páginas no admin
- Elas aparecem no menu
- Limpo o cache do navegador
- ❌ Tudo desaparece

### Causa
Dados estão sendo salvos apenas no localStorage (navegador), não no Supabase.

### Solução
1. **Configure o Supabase** seguindo `CONFIGURACAO.md`
2. **Execute a migration** SQL no Supabase Dashboard
3. **Configure as credenciais** em `config.js` (local) e na Vercel (produção)
4. **Teste** fazendo uma nova página e verificando no Supabase

### Verificação
```javascript
// No console do navegador
localStorage.getItem('pages'); // Se retornar algo, está usando localStorage
```

Após configurar Supabase:
- Vá no Supabase Dashboard → Table Editor → `pages`
- Suas páginas devem aparecer lá

---

# Problemas com Supabase

## Erro: "Invalid API key"

### Sintomas
- Console mostra erro de API key inválida
- Dados não são salvos
- Erro 401 nas requisições

### Causas e Soluções

**1. Chave incorreta**
```javascript
// Verifique em config.js
window.SUPABASE_ANON_KEY = 'sua-chave-aqui'; // Deve começar com eyJ...
```

Obtenha a chave correta:
- Supabase Dashboard → Settings → API → anon public key

**2. Projeto pausado**
- Projetos gratuitos pausam após 7 dias de inatividade
- Solução: Dashboard → Resume project

**3. URL incorreta**
```javascript
// Formato correto
window.SUPABASE_URL = 'https://xxxxx.supabase.co';
// Não http, deve ser https
```

## Erro: "relation does not exist" (42P01)

### Sintoma
```
ERROR: relation "pages" does not exist
```

### Causa
Tabelas não foram criadas no banco de dados.

### Solução
1. Acesse Supabase Dashboard → SQL Editor
2. Abra o arquivo `SETUP_TABELAS.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Execute (RUN)
6. Verifique mensagens de sucesso

### Verificação
```sql
-- Execute no SQL Editor
SELECT * FROM pages LIMIT 1;
SELECT * FROM home_content LIMIT 1;
SELECT * FROM inscriptions LIMIT 1;
```

Se retornar sem erro, tabelas existem.

## Inscrições Não São Salvas (RLS)

### Sintoma
- Usuário preenche formulário
- Clica em enviar
- Mensagem de sucesso aparece
- ❌ Inscrição NÃO aparece no Supabase

### Causa
Row Level Security (RLS) bloqueando inserções.

### Verificação
Console do navegador mostra:
```
❌ Erro do Supabase: código 42501
Mensagem: new row violates row-level security policy
```

### Solução

**1. Verificar políticas existentes:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'inscriptions';
```

**2. Criar política para permitir INSERT:**
```sql
-- Permitir inserções anônimas
CREATE POLICY "Allow anonymous inscriptions" 
ON inscriptions 
FOR INSERT 
TO anon 
WITH CHECK (true);
```

**3. Habilitar RLS se necessário:**
```sql
ALTER TABLE inscriptions ENABLE ROW LEVEL SECURITY;
```

**4. Testar inserção manual:**
```sql
INSERT INTO inscriptions (
    page_slug, group_id, is_responsible,
    participant_number, total_participants,
    form_data, status
) VALUES (
    'teste', gen_random_uuid(), true,
    1, 1, '{"nome": "Teste"}', 'pending'
);
```

Se funcionar, problema está resolvido.

---

# Problemas com Imagens

## Imagem Não Aparece no Site

### Sintomas
- Upload funciona
- Imagem aparece na lista do admin
- ❌ Não aparece no site

### Soluções

**1. Nome incorreto**
```
❌ ERRADO: Digitei o nome manualmente
✅ CORRETO: Usar botão "📋 Copiar Nome"
```

**2. Home não foi salva**
- Depois de colar o nome
- ✅ Clique em "💾 Salvar Home"

**3. Cache do navegador**
```
Ctrl+Shift+Del → Limpar cache → Recarregar (Ctrl+F5)
```

**4. Verificar console (F12)**
```javascript
// Procure por erros tipo:
404 Not Found: /uploads/imagem.jpg
// Ou
Failed to load resource
```

### Verificação Completa

**Passo 1**: Copie o nome da imagem do admin

**Passo 2**: Abra console e execute:
```javascript
// Se for Supabase Storage
fetch('https://yzsgoxrrhjiiulmnwrfo.supabase.co/storage/v1/object/public/images/NOME-DA-IMAGEM.jpg')
  .then(r => console.log('Status:', r.status))
  .catch(e => console.error('Erro:', e));
```

Se retornar `Status: 200`, imagem existe e é acessível.

## Erro ao Fazer Upload

### Sintomas
- Clico para fazer upload
- ❌ "Erro ao fazer upload de [nome]"

### Causas e Soluções

**1. Arquivo muito grande (> 5MB)**
```
Solução: Comprimir em https://tinypng.com
```

**2. Formato não suportado**
```
Aceitos: JPG, PNG, GIF, WebP
Solução: Converter formato
```

**3. Servidor não rodando (dev local)**
```bash
# Verificar
curl http://localhost:3000/api/images

# Se der erro, iniciar
npm start
```

**4. Supabase não configurado (produção)**
```
Verifique:
- Variáveis de ambiente na Vercel
- Bucket 'images' existe no Supabase
- Políticas RLS permitem upload
```

**5. Limite de armazenamento**
```
Dashboard Supabase → Storage → Ver espaço usado
Se > 1GB (plano free), delete imagens antigas ou upgrade
```

## Imagens Desapareceram Após Deploy

### Causa
Usando filesystem local (efêmero) em vez de Supabase Storage.

### Solução
1. **Migrar para Supabase Storage** (veja `GUIA_IMAGENS.md`)
2. **Re-upload** as imagens via admin
3. **Verificar** que URLs começam com `supabase.co/storage/`

### Prevenção
- ✅ SEMPRE use Supabase Storage em produção
- ❌ NUNCA use pasta `/uploads` em serverless (Vercel/Netlify)

---

# Problemas com Inscrições

## Campos de Participantes Não Aparecem

### Sintoma
- Marque "Permitir inscrição em grupo"
- Salvo o formulário
- ❌ Campos não se repetem no site

### Soluções

**1. Verificar checkbox**
```
Admin → Editar Formulário → ☑ Permitir inscrição em grupo
Salvar (botão no final da página)
```

**2. Palavras-chave nos labels**
```
Campos repetíveis devem ter keywords:
✅ "Nome do Participante"
✅ "CPF"
✅ "Data de Nascimento"
✅ "Idade"

Campos únicos (responsável):
✅ "Email"
✅ "Telefone"
✅ "Endereço"
```

**3. Limpar cache**
```
Ctrl+Shift+Del → Limpar tudo → Recarregar
```

**4. Verificar console**
```javascript
// Deve mostrar:
console.log('Modo grupo ativado');
console.log('Renderizando N participantes');
```

## Validação de Vagas Não Funciona

### Sintoma
- Configurei limite de 50 vagas
- ❌ Sistema aceita mais inscrições

### Verificação
```javascript
// No console ao tentar se inscrever
console.log('Vagas disponíveis:', available);
```

### Solução

**1. Verificar função SQL:**
```sql
-- Execute no Supabase SQL Editor
SELECT * FROM check_available_slots('slug-do-evento', 5, 50);
```

Deve retornar:
```
available | slots_available | slots_requested
true      | 45              | 5
```

**2. Re-executar migration:**
- Se função não existe, execute `MIGRATION_INSCRICAO_MULTIPLA.sql`

**3. Verificar no código:**
```javascript
// Em page.js, deve ter:
const availability = await checkAvailableSlots(pageSlug, count, maxParticipants);
if (!availability.available) {
  showError(`Apenas ${availability.slotsAvailable} vagas disponíveis`);
}
```

---

# Problemas com Servidor

## Servidor Não Inicia

### Sintoma
```bash
npm start
# Erro: EADDRINUSE :::3000
```

### Causa
Porta 3000 já está em uso.

### Solução

**Opção 1: Matar processo**
```bash
# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Opção 2: Usar outra porta**
```bash
PORT=3001 npm start
```

**Opção 3: Script automático**
```bash
./parar-servidor.sh
./iniciar-servidor.sh
```

## "Cannot POST /api/upload"

### Sintoma
- Tento fazer upload
- ❌ Erro 404: Cannot POST /api/upload

### Causa
Servidor não está rodando.

### Solução
```bash
# Verificar se servidor está rodando
curl http://localhost:3000/api/images

# Se retornar erro, iniciar
cd ~/Desktop/projeto-site-customizavel
npm start
```

### Verificação
```bash
# Deve retornar JSON
curl http://localhost:3000/api/images
{"images":[...]}
```

## Erro: "Module not found"

### Sintoma
```
Error: Cannot find module '@supabase/supabase-js'
```

### Solução
```bash
# Instalar dependências
npm install

# Se persistir
rm -rf node_modules package-lock.json
npm install
```

---

# Problemas com Deploy

## Build Falha na Vercel

### Sintomas Comuns

**1. "Module not found"**
```
Solução: Verificar package.json tem todas as dependências
npm install
```

**2. "Variável de ambiente não definida"**
```
Solução: 
Vercel Dashboard → Settings → Environment Variables
Adicionar: SUPABASE_URL e SUPABASE_ANON_KEY
```

**3. "Build exceeded time limit"**
```
Solução: Otimizar build ou upgrade plano Vercel
```

### Logs de Build

```bash
# Ver logs
vercel logs

# Build local para testar
vercel build
```

## Site Funciona Localmente, Não em Produção

### Checklist

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Supabase aceita origem do domínio Vercel
- [ ] URLs não estão hardcoded para localhost
- [ ] Credenciais corretas (não as de desenvolvimento)

### Verificação
```javascript
// Adicione logs temporários
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('Ambiente:', process.env.NODE_ENV);
```

Veja logs:
```bash
vercel logs --follow
```

## Imagens Não Persistem Após Deploy

### Causa
Filesystem efêmero em funções serverless.

### Solução
**OBRIGATÓRIO**: Usar Supabase Storage (veja `GUIA_IMAGENS.md`)

```javascript
// server.js deve usar
const storage = multer.memoryStorage(); // Não disk storage

// Upload para Supabase
await supabase.storage.from('images').upload(...);
```

---

# Problemas com Pagamento

## PIX/WhatsApp Não Aparecem

### Sintomas
- Configurei pagamento no admin
- ❌ Botões não aparecem na página de confirmação

### Debug

**1. Abrir console (F12)**

**2. Procurar logs:**
```javascript
// Deve mostrar:
🔍 setupPaymentSection chamada: {
  requires_payment: true,
  has_payment_config: true,
  payment_config: {...}
}
✅ Pagamento configurado!
```

Se mostrar:
```javascript
❌ Pagamento não configurado, escondendo seções
```

Problema está na configuração.

### Soluções

**1. Verificar salvamento**
```
Admin → Editar Formulário
Role até o final → Seção "Pagamento"
☑ Marque "Requer Pagamento (PIX)"
Preencha TODOS os campos:
  - Valor da Inscrição
  - Chave PIX
  - WhatsApp
Salvar (botão no final)
```

**2. Verificar dados salvos**
```javascript
// No console do admin
const pages = JSON.parse(localStorage.getItem('pages'));
const page = pages.find(p => p.slug === 'seu-slug');
console.log('Pagamento:', page.form_config.payment_config);
```

Deve mostrar:
```javascript
{
  value: 100,
  pix_key: "sua-chave",
  whatsapp: "11999999999"
}
```

**3. Re-salvar configuração**
- Edite o formulário
- Preencha novamente
- **Importante**: Role até o FINAL e clique em SALVAR

## Valor do Grupo Calculado Errado

### Sintoma
- 3 participantes × R$ 100 = R$ 300
- ❌ Mostra R$ 100

### Solução
```javascript
// Verificar em confirmacao.js
const totalValue = groupSize * paymentConfig.value;
```

Deve multiplicar pelo número de participantes.

---

# Comandos Úteis de Diagnóstico

## Verificar Status Geral

```bash
# Servidor rodando?
curl http://localhost:3000/api/images

# Supabase configurado?
node verificar-supabase.js

# Dependências instaladas?
npm list --depth=0
```

## Logs do Sistema

```javascript
// Console do navegador
localStorage.getItem('pages');           // Ver páginas
localStorage.getItem('home_content');    // Ver conteúdo
localStorage.getItem('inscriptions');    // Ver inscrições
```

## Reset Completo (última opção)

```bash
# Parar tudo
./parar-servidor.sh

# Limpar node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Iniciar
npm start
```

---

# Checklist de Diagnóstico

Quando algo não funciona, siga esta ordem:

## 1. Verificações Básicas
- [ ] Servidor está rodando (dev local)
- [ ] Console do navegador aberto (F12)
- [ ] Sem erros vermelhos no console
- [ ] Cache do navegador limpo

## 2. Verificações de Configuração
- [ ] Supabase configurado (URL e KEY)
- [ ] Tabelas criadas no Supabase
- [ ] Políticas RLS configuradas
- [ ] Variáveis de ambiente (produção)

## 3. Verificações de Código
- [ ] Dependências instaladas (`npm install`)
- [ ] Versão do Node >= 14
- [ ] Scripts no `package.json` corretos
- [ ] Imports corretos nos arquivos

## 4. Verificações de Dados
- [ ] Dados existem no Supabase/localStorage
- [ ] Formato dos dados está correto
- [ ] IDs e referências válidas
- [ ] JSON válido (sem erros de sintaxe)

---

# Problemas com Performance

## Servidor Demora para Iniciar (npm run dev)

### Sintoma
O servidor demora ~5 minutos para iniciar ou trava completamente.

### Causas Identificadas

1. **Dotenv lento**: Carregando todos os arquivos `.env*` desnecessariamente
2. **Express travando**: Módulo não carrega (timeout)
3. **Porta ocupada**: Processos duplicados causando conflitos

### Soluções Implementadas

#### ✅ 1. Otimização do Dotenv
- Agora carrega apenas o arquivo `.env` necessário baseado em `NODE_ENV`
- Redução de **3.3 segundos → 4ms** (800x mais rápido)

#### ✅ 2. Verificação de Porta
- Verifica se a porta está ocupada ANTES de tentar iniciar
- Mensagem de erro clara com instruções de solução
- Evita loops infinitos de tentativas

#### ✅ 3. Script de Parada Melhorado
- Limpa processos na porta 3001
- Para nodemon e processos relacionados

### Solução Rápida

Se o problema persistir:

```bash
# 1. Parar todos os processos
./parar-servidor.sh

# 2. Limpar cache e reinstalar dependências
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 3. Testar carregamento
node diagnostico-lentidao.js

# 4. Iniciar servidor
npm run dev
```

### Solução Alternativa

Se precisar iniciar rapidamente AGORA:

```bash
# 1. Parar processos
./parar-servidor.sh

# 2. Usar fast-dev (sem nodemon)
npm run fast-dev
```

### Verificação de Porta

Sempre verifique se a porta está livre antes de iniciar:

```bash
# Ver processos na porta 3001
lsof -ti:3001

# Matar processo específico
kill -9 <PID>

# Ou usar o script
./parar-servidor.sh
```

### Diagnóstico

Execute o script de diagnóstico para identificar qual módulo está causando lentidão:

```bash
node diagnostico-lentidao.js
```

---

# Como Pedir Ajuda

Se após seguir este guia o problema persistir:

**1. Reúna informações:**
- Console do navegador (F12 → Console → Screenshot)
- Logs do servidor (terminal)
- Logs do Supabase (Dashboard → Logs)
- Passos exatos para reproduzir

**2. Inclua:**
- O que você estava tentando fazer
- O que esperava acontecer
- O que aconteceu de fato
- Mensagens de erro completas
- Screenshots relevantes

**3. Verifique antes:**
- [ ] Li a seção relevante deste guia
- [ ] Tentei as soluções sugeridas
- [ ] Verifiquei o console por erros
- [ ] Limpei o cache e tentei novamente

---

**Data de Criação**: 03/11/2025  
**Status**: ✅ COMPLETO E ATUALIZADO

