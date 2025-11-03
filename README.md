# 🏔️ Landing Page - Aventuras

Landing page dinâmica e editável para profissionais de esportes de aventura com sistema completo de gerenciamento de imagens e **persistência de dados via Supabase**.

## ✨ Features Principais

- 🎨 Design moderno e responsivo
- 🖼️ **Sistema de upload de imagens** (LGPD compliant)
- 💾 **Persistência real com Supabase** (banco de dados PostgreSQL)
- 📝 Admin editável com sincronização em nuvem
- 📄 Páginas dinâmicas com Canva
- 📋 Formulários de inscrição customizáveis
- 💳 Sistema de pagamento PIX
- 📊 Gerenciamento de inscrições
- 🎨 Temas customizáveis
- ↺ Sistema de undo/redo
- 🔍 SEO otimizado

## 🚀 Início Rápido

### ⚠️ IMPORTANTE: Configure o Supabase primeiro!

**Leia:** `LEIA-ME-PRIMEIRO.md` ou `CONFIGURAR_SUPABASE.md`

Sem o Supabase, os dados não persistem (problema reportado).

### Opção 1: Script Automático

```bash
./start.sh
```

### Opção 2: Manual

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor
npm start

# 3. Acessar
# Admin: http://localhost:3000/admin.html
# Site: http://localhost:3000/
```

### 🌐 Compartilhar Online (ngrok)

Para criar um túnel público e compartilhar seu projeto:

```bash
# Método rápido
./start-ngrok.sh

# Ou manual
ngrok http 3000
```

📖 **Guia completo:** Veja `GUIA_RAPIDO_NGROK.md`

## 🖼️ Sistema de Imagens (NOVO!)

### Como Funciona

1. **Upload** no admin → Salva em `uploads/`
2. **Copiar nome** do arquivo
3. **Colar** no campo de imagem da Home
4. **Salvar** → Imagem aparece automaticamente!

### Vantagens

- 🔒 **Privacidade total** (LGPD)
- 💾 **Permanente** (não some ao limpar cache)
- 🌐 **Flexível** (aceita URLs externas também)
- 📦 **Backup fácil** (copiar pasta uploads/)

## 📁 Estrutura do Projeto

```
projeto-leo/
├── server.js              ← Servidor Node.js
├── uploads/               ← Imagens (auto-criada)
├── assets/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── admin.js       ← Painel admin
│       ├── app.js         ← Renderização
│       └── confirmacao.js
├── admin.html             ← Painel de controle
├── index.html             ← Página principal
├── package.json
└── start.sh               ← Script de inicialização
```

## 📚 Documentação

### 🚀 Documentação Essencial (Comece Aqui!)

- **`LEIA-ME-PRIMEIRO.md`** - ⭐ Guia rápido de início
- **`CONFIGURACAO.md`** - Todas as configurações (Supabase, Vercel, Túneis)
- **`MANUAL_USUARIO.md`** - Manual completo para usuários finais
- **`IMPLEMENTACAO.md`** - Instalação, setup e arquitetura técnica
- **`DEPLOY.md`** - Guia completo de deploy

### 📖 Guias Específicos

- **`GUIA_IMAGENS.md`** - Sistema completo de gerenciamento de imagens
- **`INSCRICAO_MULTIPLA.md`** - Documentação de inscrições em grupo
- **`TROUBLESHOOTING.md`** - Soluções para problemas comuns
- **`COMANDOS_UTEIS.md`** - Referência rápida de comandos
- **`RESUMO_EXECUTIVO.md`** - Overview executivo do projeto

### 📑 Índice Completo

- **`INDICE_DOCUMENTACAO.md`** - Navegação completa da documentação

## 🎯 Como Usar o Admin

### 1. Acessar

```
http://localhost:3000/admin.html
Senha: admin123
```

### 2. Funcionalidades

- **Home**: Editar hero, sobre, serviços, galeria
- **Páginas**: Criar páginas com Canva ou formulários
- **Imagens**: Fazer upload de fotos (LGPD)
- **Inscrições**: Gerenciar inscrições de formulários
- **Tema**: Customizar cores

### 3. Upload de Imagens

1. Aba "Imagens" → Upload
2. Copiar nome do arquivo
3. Colar no campo desejado
4. Salvar

## 📦 Tecnologias

### Frontend

- HTML5, CSS3, JavaScript puro
- LocalStorage para configurações
- Sistema de preview em tempo real

### Backend

- Node.js + Express
- Multer (upload de arquivos)
- Sharp (processamento de imagens)
- CORS habilitado

## 🌐 Deploy em Produção

### VPS (Recomendado)

```bash
# Instalar dependências
npm install --production

# Usar PM2
npm install -g pm2
pm2 start server.js
pm2 save
```

### Heroku

```bash
# Criar Procfile
echo "web: node server.js" > Procfile

# Deploy
git push heroku main
```

### Vercel

⚠️ Vercel é serverless - precisa integrar com Vercel Blob ou Cloudinary para uploads.

## 🔒 Segurança

### Implementado

- ✅ Validação de arquivos (tipo, tamanho)
- ✅ Sanitização de nomes
- ✅ CORS configurado
- ✅ Pasta uploads isolada
- ✅ Limite de 5MB por imagem

### Para Produção

- 🔐 Alterar senha do admin
- 🔐 Configurar HTTPS
- 🔐 Rate limiting
- 🔐 Backup automático

## 💾 Backup

### Imagens

```bash
# Backup
cp -r uploads/ backup-uploads-$(date +%Y%m%d)/

# Restaurar
cp -r backup-uploads-20251008/* uploads/
```

### Configurações

As configurações ficam no localStorage. Use as funções de exportar/importar JSON no admin.

## 🐛 Troubleshooting

### Servidor não inicia

```bash
# Verificar porta
lsof -i :3000

# Instalar dependências
npm install

# Verificar Node.js
node -v  # Deve ser 14+
```

### Imagens não aparecem

1. ✅ Servidor rodando?
2. ✅ Pasta uploads/ existe?
3. ✅ Nome copiado corretamente?
4. ✅ Salvou a Home?

## 📊 Requisitos

- Node.js 14+
- npm ou yarn
- ~50MB de espaço em disco
- Navegador moderno

## 🎉 Changelog

### v2.0 (2025-10-08)

- ✅ Sistema de upload de imagens
- ✅ Servidor Node.js
- ✅ API REST para imagens
- ✅ Armazenamento permanente
- ✅ Documentação completa

### v1.0 (2025-10-07)

- ✅ Landing page inicial
- ✅ Admin editável
- ✅ Sistema de formulários
- ✅ Integração PIX

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ para profissionais de aventura**
