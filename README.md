# 🏔️ Landing Page - Aventuras

Landing page dinâmica e editável para profissionais de esportes de aventura com sistema completo de gerenciamento de imagens.

## ✨ Features Principais

- 🎨 Design moderno e responsivo
- 🖼️ **Sistema de upload de imagens** (LGPD compliant)
- 📝 Admin editável sem banco de dados
- 📄 Páginas dinâmicas com Canva
- 📋 Formulários de inscrição customizáveis
- 💳 Sistema de pagamento PIX
- 📊 Gerenciamento de inscrições
- 🎨 Temas customizáveis
- ↺ Sistema de undo/redo
- 🔍 SEO otimizado

## 🚀 Início Rápido

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

### 📖 Guias de Uso

- **`COMO_USAR_IMAGENS.md`** - Guia rápido de imagens
- **`GUIA_RAPIDO_IMAGENS.md`** - Tutorial para leigos
- **`MANUAL_USUARIO.md`** - Manual completo do usuário

### 🔧 Documentação Técnica

- **`INSTALACAO_SERVIDOR.md`** - Setup do servidor
- **`RESUMO_FINAL_IMAGENS.md`** - Detalhes da implementação
- **`IMPLEMENTACAO.md`** - Arquitetura do sistema
- **`MELHORIAS_ADMIN.md`** - Changelog das melhorias

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
