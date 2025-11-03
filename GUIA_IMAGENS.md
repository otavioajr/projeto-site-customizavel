# 📸 Guia Completo de Imagens

Este documento consolida toda a documentação sobre o sistema de gerenciamento de imagens do projeto.

## Índice

1. [Visão Geral](#visão-geral)
2. [Início Rápido](#início-rápido)
3. [Sistema de Armazenamento](#sistema-de-armazenamento)
4. [Como Usar](#como-usar)
5. [Migração para Supabase Storage](#migração-para-supabase-storage)
6. [Troubleshooting](#troubleshooting)

---

# Visão Geral

## 📊 Evolução do Sistema

O projeto teve 3 fases de armazenamento de imagens:

### Fase 1: localStorage (Inicial)
- ❌ Imagens em Base64 no localStorage
- ❌ Limite de ~5-10MB
- ❌ Perdidas ao limpar cache
- ❌ Apenas no mesmo navegador

### Fase 2: Servidor Local (Intermediária)
- ✅ Imagens em pasta `/uploads`
- ✅ Permanentes localmente
- ❌ Perdidas ao fazer deploy na Vercel
- ❌ Filesystem efêmero em serverless

### Fase 3: Supabase Storage (Atual) ✅
- ✅ Armazenamento em nuvem
- ✅ Totalmente persistente
- ✅ CDN integrado
- ✅ 1GB grátis
- ✅ Funciona perfeitamente com Vercel
- ✅ Backup automático

## ✨ Funcionalidades Atuais

- 📤 Upload de imagens para Supabase Storage
- 📋 Listagem de todas as imagens
- 🗑️ Exclusão de imagens
- 🔗 URLs públicas automáticas via CDN
- 📏 Validação de formato e tamanho
- 🎨 Preview automático
- 📋 Copiar nome/URL com um clique

## 📦 Formatos e Limites

| Item | Especificação |
|------|---------------|
| **Formatos Aceitos** | JPG, JPEG, PNG, GIF, WebP |
| **Tamanho Máximo** | 5MB por imagem |
| **Armazenamento Total** | 1GB (plano gratuito Supabase) |
| **Quantidade** | Ilimitada (dentro do espaço) |

---

# Início Rápido

## 🚀 Em 3 Passos Simples

### 1️⃣ FAZER UPLOAD

1. Acesse `http://localhost:3000/admin.html` (ou seu domínio em produção)
2. Vá na aba **"Imagens"**
3. Clique ou arraste suas fotos para a área de upload
4. Aguarde o upload (barra de progresso aparece)
5. ✅ Imagem salva no Supabase Storage!

### 2️⃣ COPIAR NOME

1. Localize a imagem na grade
2. Clique no botão **"📋 Copiar Nome"**
3. ✅ O nome é copiado automaticamente

Exemplo: `1730000000000-abc123.jpg`

### 3️⃣ USAR NA HOME

1. Vá na aba **"Home"**
2. Encontre o campo de imagem desejado (Hero, Sobre, Galeria, etc.)
3. Cole o nome copiado
4. Clique em **"💾 Salvar Home"**
5. ✅ A imagem aparece automaticamente!

## 💡 Exemplo Completo

**Cenário**: Quero colocar uma foto de montanha no Hero (topo da página)

```
1. Admin → Aba "Imagens"
2. Upload: montanha-aventura.jpg
3. Sistema salva como: 1730123456789-montanha.jpg
4. Clico em "📋 Copiar Nome"
5. Admin → Aba "Home" → Seção Hero
6. Campo "URL da Imagem de Fundo"
7. Colo: 1730123456789-montanha.jpg
8. Clico em "💾 Salvar Home"
9. ✅ Foto aparece no Hero!
```

## ⚠️ Importante

### ✅ SEMPRE faça o seguinte:

1. **Use o botão "Copiar Nome"** - Não digite manualmente
2. **Salve a Home após colar** - As mudanças só aparecem após salvar
3. **Use o nome exato** - Maiúsculas/minúsculas importam
4. **Aguarde o upload completar** - Não feche a aba durante upload

---

# Sistema de Armazenamento

## 🏗️ Arquitetura Atual

### Supabase Storage

O sistema usa o Supabase Storage, que oferece:

- **Bucket**: `images` (público)
- **CDN**: Entrega rápida global
- **URLs**: Públicas e permanentes
- **Backup**: Automático pelo Supabase
- **Escalabilidade**: Até 1GB grátis, expansível

### Estrutura de URLs

As imagens têm URLs no formato:

```
https://yzsgoxrrhjiiulmnwrfo.supabase.co/storage/v1/object/public/images/1730000000000-nome.jpg
```

**Componentes**:
- `yzsgoxrrhjiiulmnwrfo` - ID do projeto Supabase
- `images` - Nome do bucket
- `1730000000000-nome.jpg` - Nome único do arquivo

### Nomenclatura de Arquivos

Quando você faz upload de `foto.jpg`, o sistema salva como:

```
1730123456789-foto.jpg
```

**Formato**: `timestamp-nome-original.extensão`

**Por quê?**
- ✅ Garante nomes únicos
- ✅ Evita conflitos
- ✅ Permite múltiplos uploads do mesmo arquivo
- ✅ Organização cronológica

## 🔄 Fluxo de Dados

### Upload

```
1. Usuário seleciona imagem no admin
   ↓
2. Frontend envia para /api/upload
   ↓
3. Server.js recebe arquivo em memória (buffer)
   ↓
4. Upload direto para Supabase Storage
   ↓
5. Supabase retorna URL pública
   ↓
6. Frontend exibe imagem com preview
```

### Listagem

```
1. Admin carrega aba "Imagens"
   ↓
2. Frontend solicita /api/images
   ↓
3. Server.js consulta Supabase Storage
   ↓
4. Supabase retorna lista de arquivos
   ↓
5. Server.js gera URLs públicas
   ↓
6. Frontend renderiza grade de imagens
```

### Exclusão

```
1. Usuário clica em deletar
   ↓
2. Frontend envia DELETE /api/images/:filename
   ↓
3. Server.js deleta do Supabase Storage
   ↓
4. Supabase confirma deleção
   ↓
5. Frontend atualiza lista
```

---

# Como Usar

## 📝 Uso Básico

### Upload de Imagem

**Método 1: Clique**
1. Clique na área de upload
2. Selecione arquivo(s)
3. Aguarde upload

**Método 2: Arrastar**
1. Arraste arquivo(s) para área de upload
2. Solte
3. Aguarde upload

**Suporta**: Upload múltiplo (várias imagens de uma vez)

### Gerenciamento

**Visualizar imagens:**
- Vá na aba "Imagens" no admin
- Todas as imagens aparecem em grade
- Mostra: preview, nome, dimensões, tamanho

**Copiar nome:**
- Clique em "📋 Copiar Nome"
- Nome completo é copiado
- Use em qualquer campo de imagem

**Excluir imagem:**
- Clique em "🗑️ Excluir"
- Confirme a exclusão
- Imagem é removida do Supabase Storage

## 🎨 Onde Usar as Imagens

### Hero (Topo da Página)

**Campo**: URL da Imagem de Fundo

**Tamanho recomendado**: 1920x1080px (16:9)

**Exemplo**:
```
Admin → Home → Hero → "URL da Imagem de Fundo"
Cole: 1730000000000-hero.jpg
```

### Sobre

**Campo**: URL da Imagem

**Tamanho recomendado**: 600x600px (quadrada)

**Exemplo**:
```
Admin → Home → Sobre → "URL da Imagem"
Cole: 1730000000001-perfil.jpg
```

### Serviços

**Campo**: URL do Ícone (para cada serviço)

**Tamanho recomendado**: 64x64px ou use SVG

**Exemplo**:
```
Admin → Home → Serviços → Serviço 1 → "URL do Ícone"
Cole: 1730000000002-icone-trilha.png
```

### Galeria

**Campos**: URLs das imagens (vários)

**Tamanho recomendado**: 400x400px (quadradas)

**Exemplo**:
```
Admin → Home → Galeria → "URL Imagem 1"
Cole: 1730000000003-foto1.jpg
```

## 🆚 URLs Externas vs Uploads

### Pode Misturar!

O sistema detecta automaticamente o tipo de URL:

**Upload local (Supabase Storage)**:
```
1730000000000-foto.jpg
```

**URL externa completa**:
```
https://images.unsplash.com/photo-123.jpg
https://i.imgur.com/abc123.jpg
```

**Exemplo de uso misto**:
```
Hero: 1730000000000-hero.jpg (upload)
Sobre: https://unsplash.com/photo-123 (externa)
Galeria 1: 1730000000001-foto1.jpg (upload)
Galeria 2: https://imgur.com/abc.jpg (externa)
```

### Quando Usar Cada Um

**Use Uploads (Supabase Storage) quando:**
- 🔒 Fotos pessoais/privadas
- 📸 Fotos de clientes (LGPD)
- 🚫 Não quer publicar em sites externos
- 💾 Quer controle total

**Use URLs Externas quando:**
- 🌐 Fotos públicas/genéricas
- 📱 Quer usar de múltiplos lugares
- 🎨 Imagens de stock (Unsplash, Pexels)
- 🔗 Já tem hospedadas em outro lugar

## 📏 Tamanhos Recomendados

Para melhor performance:

| Uso | Dimensões | Proporção | Peso Ideal |
|-----|-----------|-----------|------------|
| **Hero** | 1920x1080px | 16:9 | < 300KB |
| **Sobre** | 600x600px | 1:1 | < 100KB |
| **Galeria** | 400x400px | 1:1 | < 80KB |
| **Ícones** | 64x64px | 1:1 | < 10KB |
| **Logo** | 200x60px | variável | < 20KB |

### Ferramentas de Otimização

- **TinyPNG**: https://tinypng.com (compressão)
- **Squoosh**: https://squoosh.app (redimensionar e comprimir)
- **Remove.bg**: https://remove.bg (remover fundo)
- **Canva**: https://canva.com (edição geral)

## 🔒 Segurança e Privacidade

### LGPD Compliance

- ✅ Imagens armazenadas no Supabase (projeto próprio)
- ✅ Não compartilhadas com terceiros
- ✅ Controle total sobre os dados
- ✅ Pode deletar a qualquer momento
- ✅ Backup controlado por você

### Validações

**No Frontend**:
- Formato de arquivo (JPG, PNG, GIF, WebP)
- Tamanho máximo (5MB)

**No Backend**:
- Validação de MIME type
- Sanitização de nomes
- Limite de tamanho reforçado
- Upload para bucket isolado

### Políticas do Supabase

**Configuradas automaticamente**:
- ✅ Leitura pública (qualquer pessoa pode ver)
- ✅ Upload público (para facilitar uso)
- ✅ Delete público (apenas via API)

**Para produção** (opcional):
- Restringir uploads apenas para autenticados
- Implementar autenticação no admin
- Configurar RLS (Row Level Security)

---

# Migração para Supabase Storage

## 📋 Visão Geral da Migração

**Data da migração**: 27 de outubro de 2025

**Motivo**: Garantir persistência em ambiente serverless (Vercel)

## 🔄 Como Foi Feito

### 1. Criação do Bucket

No Supabase Dashboard:

```sql
-- Bucket 'images' criado com:
- ID: images
- Público: true
- Limite: 5MB por arquivo
- Tipos: JPEG, PNG, GIF, WebP
```

### 2. Políticas de Acesso

```sql
-- Leitura pública
CREATE POLICY "Imagens públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

-- Upload público
CREATE POLICY "Upload público"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images');

-- Delete público
CREATE POLICY "Delete público"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'images');
```

### 3. Código Atualizado

**Antes** (filesystem local):
```javascript
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
```

**Depois** (Supabase Storage):
```javascript
const storage = multer.memoryStorage(); // Não salva em disco

// Upload direto para Supabase
const { data, error } = await supabase.storage
  .from('images')
  .upload(filename, req.file.buffer, {
    contentType: req.file.mimetype,
    cacheControl: '3600'
  });
```

### 4. Funções Adicionadas

Em `assets/js/supabase.js`:

```javascript
// Upload de imagem
export async function uploadImage(file, folder = '') {
  const filename = `${folder}${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filename, file);
  
  if (error) throw error;
  return supabase.storage.from('images').getPublicUrl(filename).data.publicUrl;
}

// Listar imagens
export async function listImages(folder = '') {
  const { data, error } = await supabase.storage
    .from('images')
    .list(folder);
  
  if (error) throw error;
  return data;
}

// Deletar imagem
export async function deleteImage(path) {
  const { error } = await supabase.storage
    .from('images')
    .remove([path]);
  
  if (error) throw error;
}
```

## 🎯 Benefícios da Migração

### Antes (Filesystem Local)

| Aspecto | Status |
|---------|--------|
| Permanência | ❌ Perdidas em deploy |
| Escalabilidade | ❌ Limitado ao servidor |
| Backup | ❌ Manual |
| CDN | ❌ Não |
| Serverless | ❌ Incompatível |

### Depois (Supabase Storage)

| Aspecto | Status |
|---------|--------|
| Permanência | ✅ Totalmente persistente |
| Escalabilidade | ✅ 1GB grátis, expansível |
| Backup | ✅ Automático |
| CDN | ✅ Integrado |
| Serverless | ✅ Perfeitamente compatível |

## 📦 Deploy

### Variáveis de Ambiente

**Na Vercel**:
```bash
SUPABASE_URL=https://yzsgoxrrhjiiulmnwrfo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Localmente** (config.js):
```javascript
window.SUPABASE_URL = 'https://yzsgoxrrhjiiulmnwrfo.supabase.co';
window.SUPABASE_ANON_KEY = 'sua-chave-aqui';
```

### Processo de Deploy

1. **Commit alterações**:
```bash
git add .
git commit -m "feat: migrar imagens para Supabase Storage"
git push origin main
```

2. **Deploy automático na Vercel**:
- Detecta push
- Faz build
- Deploy com novas configurações
- ✅ Imagens agora persistem!

### Migrar Imagens Existentes

Se tinha imagens locais em `/uploads`:

**Opção 1: Upload manual no admin**
- Mais simples
- Recomendado para poucas imagens

**Opção 2: Script de migração**
```javascript
// migrate-images.js
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function migrateImages() {
  const uploadsDir = './uploads';
  const files = fs.readdirSync(uploadsDir);
  
  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(file, fileBuffer);
    
    if (error) {
      console.error(`Erro ao migrar ${file}:`, error);
    } else {
      console.log(`✅ ${file} migrado`);
    }
  }
}

migrateImages();
```

---

# Troubleshooting

## 🐛 Problemas Comuns

### Imagem não aparece no site

**Sintomas**:
- Upload funciona
- Imagem aparece na lista
- Mas não aparece no site

**Soluções**:
1. ✅ Verifique se copiou o nome exato (case-sensitive)
2. ✅ Confirme que salvou a Home após colar
3. ✅ Limpe o cache do navegador (Ctrl+Shift+Del)
4. ✅ Recarregue a página (Ctrl+F5)
5. ✅ Verifique o console do navegador (F12) por erros

**Como verificar**:
```javascript
// No console do navegador
console.log(document.querySelector('[data-section="hero"]').style.backgroundImage);
```

### Erro ao fazer upload

**Sintoma**: "Erro ao fazer upload de [nome]"

**Causas possíveis**:

**1. Arquivo muito grande (> 5MB)**
```
Solução: Comprima a imagem em https://tinypng.com
```

**2. Formato não suportado**
```
Solução: Converta para JPG, PNG, GIF ou WebP
```

**3. Servidor não está rodando (dev local)**
```
Solução: 
cd ~/Desktop/projeto-site-customizavel
npm start
```

**4. Credenciais do Supabase incorretas**
```
Solução: Verifique config.js ou variáveis de ambiente
```

**5. Limite de armazenamento atingido**
```
Solução: Delete imagens antigas ou upgrade no Supabase
```

### Servidor não inicia (desenvolvimento local)

**Sintoma**: `EADDRINUSE :::3000`

**Solução**:
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou usar outra porta
PORT=3001 npm start
```

### "Cannot POST /api/upload"

**Causa**: Servidor não está rodando ou URL errada

**Solução**:
```bash
# Verificar se servidor está rodando
curl http://localhost:3000/api/images

# Se não responder, iniciar:
npm start
```

### Imagens desapareceram após deploy

**Causa**: Usando filesystem local em vez de Supabase Storage

**Solução**: 
- Se em produção, as imagens devem estar no Supabase Storage
- Verifique se a migração foi feita
- Re-upload as imagens via admin

### URLs de imagens não funcionam

**Sintoma**: Erro 404 ou imagem não carrega

**Verificações**:

**1. Formato da URL**:
```
❌ ERRADO: http://localhost:3000/uploads/foto.jpg
✅ CORRETO: https://...supabase.co/storage/v1/object/public/images/foto.jpg
```

**2. Bucket existe?**:
```
Acesse: Supabase Dashboard → Storage → "images"
```

**3. Políticas RLS**:
```sql
-- Verificar políticas
SELECT * FROM storage.policies WHERE bucket_id = 'images';
```

### Erro de CORS

**Sintoma**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solução**: Já configurado em `server.js`:
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
```

Se persistir:
- Verifique se está acessando via `http://localhost:3000` e não `file://`
- Limpe cache do navegador

### Imagens lentas para carregar

**Causas**:
- Imagens muito grandes
- Sem otimização
- Sem CDN (se usando storage local antigo)

**Soluções**:
1. **Otimizar imagens** antes do upload
2. **Usar Supabase Storage** (CDN integrado)
3. **Comprimir** com TinyPNG
4. **Redimensionar** para tamanhos recomendados

## 🔍 Diagnóstico

### Verificar status do sistema

**No console do navegador**:
```javascript
// Verificar se Supabase está conectado
fetch('/api/images')
  .then(r => r.json())
  .then(data => console.log('Imagens:', data))
  .catch(err => console.error('Erro:', err));
```

**No terminal** (dev local):
```bash
# Verificar servidor
curl http://localhost:3000/api/images

# Verificar porta
lsof -i :3000

# Ver logs
npm start
```

### Logs úteis

**Server.js**:
```javascript
// Adicione logs para debug
console.log('Upload recebido:', req.file);
console.log('Salvando em Supabase...', filename);
console.log('URL gerada:', publicUrl);
```

**Supabase Dashboard**:
- Logs → Logs API
- Storage → images → Ver arquivos
- Policies → Verificar permissões

## 📞 Suporte Adicional

### Documentação Oficial

- **Supabase Storage**: https://supabase.com/docs/guides/storage
- **Multer**: https://github.com/expressjs/multer
- **Vercel**: https://vercel.com/docs/functions/serverless-functions

### Checklist de Verificação

Antes de solicitar ajuda, verifique:

- [ ] Servidor está rodando (se dev local)
- [ ] Credenciais do Supabase estão corretas
- [ ] Bucket 'images' existe no Supabase
- [ ] Políticas RLS estão configuradas
- [ ] Formato do arquivo é suportado
- [ ] Tamanho do arquivo < 5MB
- [ ] Nome do arquivo foi copiado corretamente
- [ ] Home foi salva após colar o nome
- [ ] Cache do navegador foi limpo
- [ ] Console do navegador não mostra erros

---

## 💡 Dicas e Boas Práticas

### 1. Nomenclatura

**Use nomes descritivos**:
```
✅ BOM: hero-montanha-aventura.jpg
❌ RUIM: IMG_1234.jpg
```

### 2. Organização

**Mantenha organizado**:
- Delete imagens não usadas
- Use nomes consistentes
- Documente quais imagens estão em uso

### 3. Otimização

**Antes do upload**:
1. Redimensione para tamanho apropriado
2. Comprima com TinyPNG
3. Use formato adequado (JPG para fotos, PNG para gráficos)
4. Remova metadados desnecessários

### 4. Performance

**Para melhor desempenho**:
- Hero: Max 300KB
- Galeria: Max 100KB por imagem
- Use WebP quando possível (menor tamanho)
- Aproveite o CDN do Supabase

### 5. Backup

**Embora o Supabase faça backup automático**:
- Mantenha cópias locais das imagens originais
- Documente quais imagens estão em uso
- Faça backup do projeto completo regularmente

---

## ✅ Checklist Rápido

**Antes de usar**:
- [ ] Servidor rodando (dev) ou deployed (prod)
- [ ] Supabase configurado
- [ ] Bucket 'images' criado

**Para cada imagem**:
- [ ] Upload realizado com sucesso
- [ ] Nome copiado corretamente
- [ ] Nome colado no campo correto
- [ ] Home salva
- [ ] Preview verificado
- [ ] Imagem aparece no site

**Manutenção**:
- [ ] Delete imagens não usadas
- [ ] Monitore espaço usado (Dashboard Supabase)
- [ ] Mantenha imagens otimizadas

---

**Data de Criação desta Documentação**: 03/11/2025  
**Status**: ✅ COMPLETO E ATUALIZADO  
**Sistema**: Supabase Storage + CDN

