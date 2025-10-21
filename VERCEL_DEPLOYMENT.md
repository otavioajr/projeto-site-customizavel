# Deploy na Vercel - Guia Completo

## ✅ Alterações Realizadas

O projeto foi adaptado para rodar como função serverless na Vercel:

### Arquivos Criados/Modificados:
- ✅ **`api/index.js`** - Handler serverless para Vercel
- ✅ **`dev-server.js`** - Servidor local para desenvolvimento
- ✅ **`server.js`** - Modificado para exportar app (compatível com serverless)
- ✅ **`vercel.json`** - Configurado com rewrites para API routes
- ✅ **`package.json`** - Scripts atualizados

## 🚀 Como Fazer Deploy

### 1. Conectar Repositório Git ao Projeto Vercel Existente

Como você já tem um projeto na Vercel, basta:

1. **Faça commit das alterações:**
   ```bash
   git add .
   git commit -m "Adaptar projeto para Vercel serverless"
   ```

2. **Conecte ao repositório remoto:**
   ```bash
   git remote add origin <URL_DO_SEU_REPOSITORIO>
   git push -u origin main
   ```

3. **Na Vercel Dashboard:**
   - Acesse seu projeto existente
   - Vá em **Settings → Git**
   - Conecte ao novo repositório
   - O deploy será automático após o push

### 2. Deploy Manual (Alternativa)

Se preferir fazer deploy manual:

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## ⚠️ IMPORTANTE: Limitação de Upload de Arquivos

### Problema
A Vercel usa **funções serverless** que têm filesystem **efêmero**. Isso significa:
- ❌ Uploads salvos em `/uploads` serão **perdidos** após cada deploy
- ❌ O filesystem não é persistente entre requisições
- ❌ Não é possível armazenar arquivos localmente

### Solução Necessária
Você precisa migrar o armazenamento de imagens para um serviço externo:

#### Opções Recomendadas:

**1. Supabase Storage (Recomendado - Grátis)**
- ✅ 1GB de storage grátis
- ✅ CDN integrado
- ✅ Fácil integração
- 📚 [Documentação](https://supabase.com/docs/guides/storage)

**2. Cloudinary (Grátis até 25GB)**
- ✅ Otimização automática de imagens
- ✅ Transformações on-the-fly
- 📚 [Documentação](https://cloudinary.com/documentation)

**3. AWS S3**
- ✅ Altamente escalável
- 💰 Pago (mas barato)
- 📚 [Documentação](https://aws.amazon.com/s3/)

**4. Vercel Blob (Nativo)**
- ✅ Integração nativa com Vercel
- 💰 Pago após limite grátis
- 📚 [Documentação](https://vercel.com/docs/storage/vercel-blob)

### Como Adaptar o Código

Após escolher um provedor, você precisará:

1. **Modificar `server.js`:**
   - Substituir `multer` disk storage por upload direto ao provedor
   - Atualizar rotas `/api/upload`, `/api/images`, `/api/images/:filename`

2. **Adicionar variáveis de ambiente:**
   ```bash
   vercel env add STORAGE_KEY
   vercel env add STORAGE_SECRET
   ```

3. **Atualizar referências:**
   - URLs de imagens devem apontar para o CDN do provedor
   - Remover dependência da pasta `/uploads`

## 🧪 Testar Localmente

### Desenvolvimento Normal:
```bash
npm run dev
# Acesse: http://localhost:3000
```

### Simular Ambiente Vercel:
```bash
npm run vercel-dev
# Acesse: http://localhost:3000
```

## 📋 Checklist Pré-Deploy

- [x] Código adaptado para serverless
- [x] `vercel.json` configurado
- [x] Scripts do `package.json` atualizados
- [ ] **Migrar uploads para storage externo** ⚠️
- [ ] Configurar variáveis de ambiente na Vercel
- [ ] Testar localmente com `vercel dev`
- [ ] Fazer commit e push para repositório Git
- [ ] Verificar deploy na Vercel Dashboard

## 🔍 Verificação Pós-Deploy

Após o deploy, teste:

1. **Páginas estáticas:**
   - ✅ `https://seu-dominio.vercel.app/`
   - ✅ `https://seu-dominio.vercel.app/admin`
   - ✅ `https://seu-dominio.vercel.app/confirmacao`

2. **API Routes (após migrar storage):**
   - ✅ `POST /api/upload`
   - ✅ `GET /api/images`
   - ✅ `DELETE /api/images/:filename`

3. **Logs:**
   ```bash
   vercel logs <deployment-url>
   ```

## 🐛 Troubleshooting

### Erro 500 nas rotas API
- Verifique logs: `vercel logs`
- Confirme que não está tentando escrever em disco local
- Verifique variáveis de ambiente

### Imagens não carregam
- Confirme que migrou para storage externo
- Verifique URLs das imagens no código
- Teste URLs diretamente no navegador

### Build falha
- Verifique `package.json` dependencies
- Confirme que `node_modules` está no `.gitignore`
- Teste `npm install` localmente

## 📚 Recursos

- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Vercel Storage Options](https://vercel.com/docs/storage)
- [Vercel CLI](https://vercel.com/docs/cli)

## 🎯 Próximos Passos

1. **Escolher provedor de storage** (Supabase recomendado)
2. **Adaptar código de upload** em `server.js`
3. **Configurar variáveis de ambiente**
4. **Testar localmente**
5. **Deploy para produção**
