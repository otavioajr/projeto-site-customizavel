# 🏔️ Landing Page - Aventuras

Landing page dinâmica e editável para profissionais de esportes de aventura com sistema completo de gerenciamento de imagens e **persistência de dados via Supabase**.

## 📋 Sobre o Projeto

Este projeto é uma landing page completa e customizável para profissionais de esportes de aventura, com painel administrativo que permite editar todo o conteúdo sem conhecimento técnico.

### Status do Projeto

- ✅ **MVP Concluído** - Todas as funcionalidades principais implementadas
- ✅ **Pronto para Produção** - Deploy configurado e testado
- ✅ **Documentação Completa** - Guias detalhados disponíveis

### Objetivo

Criar uma landing page profissional e moderna com:
- Painel admin completo e intuitivo
- Sistema totalmente funcional
- Persistência de dados em nuvem (Supabase)
- Pronto para deploy

## ✨ Features Principais

- 🎨 Design moderno e responsivo
- 🖼️ **Sistema de upload de imagens** (LGPD compliant, Supabase Storage)
- 💾 **Persistência real com Supabase** (banco de dados PostgreSQL)
- 📝 Admin editável com sincronização em nuvem
- 📄 Páginas dinâmicas com Canva
- 📋 Formulários de inscrição customizáveis (suporte a inscrições múltiplas)
- 💳 Sistema de pagamento PIX
- 📊 Gerenciamento de inscrições
- 🎨 Temas customizáveis
- ↺ Sistema de undo/redo
- 🔍 SEO otimizado
- 🔄 Ambientes separados (Produção/Homologação)

## 🚀 Primeiros Passos

### ⚠️ IMPORTANTE: Configure o Supabase primeiro!

**Sem o Supabase, os dados não persistem** - eles ficam apenas no localStorage e podem ser perdidos ao limpar cache.

### O que você precisa fazer

1. **Criar conta no Supabase** (https://supabase.com)
2. **Criar novo projeto** no Supabase
3. **Executar SQL** do arquivo `SETUP_TABELAS.sql` no SQL Editor
4. **Configurar credenciais** em `config.js` (copiar de `config.example.js`)
5. **Instalar dependências**: `npm install`
6. **Iniciar servidor**: `npm start`

### Checklist Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar Supabase (veja CONFIGURACAO.md)
# - Criar projeto
# - Executar SETUP_TABELAS.sql
# - Configurar config.js

# 3. Iniciar servidor
npm start

# 4. Acessar
# Admin: http://localhost:3001/admin.html
# Site: http://localhost:3001/
```

📖 **Guia completo de configuração**: Veja [`CONFIGURACAO.md`](CONFIGURACAO.md)

## 📦 Instalação e Setup

### Pré-requisitos

- **Node.js** versão 14 ou superior
- **npm** ou **yarn**
- **Git** (para controle de versão)
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Instalação Rápida

```bash
# 1. Clonar ou baixar o projeto
cd projeto-site-customizavel

# 2. Instalar dependências
npm install

# 3. Configurar Supabase (obrigatório)
# Veja CONFIGURACAO.md para instruções detalhadas

# 4. Iniciar servidor
npm start

# 5. Acessar
# Admin: http://localhost:3001/admin.html
# Site: http://localhost:3001/
```

### Scripts Disponíveis

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start

# Desenvolvimento rápido (sem nodemon)
npm run fast-dev

# Preview estático
npm run preview

# Verificar Supabase
node verificar-supabase.js
```

### Configuração Inicial

#### 1. Configurar Supabase (Obrigatório)

O projeto requer Supabase para persistência de dados. Veja [`CONFIGURACAO.md`](CONFIGURACAO.md) para instruções completas.

**Passos rápidos**:
1. Crie conta em https://supabase.com
2. Crie novo projeto
3. Execute SQL em `SETUP_TABELAS.sql`
4. Configure credenciais em `config.js`

#### 2. Configurar Variáveis de Ambiente

**Desenvolvimento Local** (`config.js`):
```javascript
window.SUPABASE_URL = 'https://seu-projeto.supabase.co';
window.SUPABASE_ANON_KEY = 'sua-chave-aqui';
```

**Produção (Vercel)**:
- Dashboard → Settings → Environment Variables
- Adicionar: `SUPABASE_URL` e `SUPABASE_ANON_KEY`

## 📁 Estrutura do Projeto

```
projeto-site-customizavel/
├── index.html              # Página principal
├── admin.html              # Painel administrativo
├── confirmacao.html        # Página de confirmação
├── assets/
│   ├── css/
│   │   └── styles.css     # Estilos + CSS Variables
│   └── js/
│       ├── admin.js       # Lógica do admin
│       ├── app.js         # Renderização da home
│       ├── page.js        # Páginas internas
│       ├── confirmacao.js # Página de confirmação
│       └── supabase.js    # Conexão com Supabase
├── p/
│   └── index.html         # Template páginas internas
├── api/
│   ├── config.js          # Configurações da API
│   └── index.js           # Endpoints serverless
├── uploads/               # Imagens (criado automaticamente)
├── server.js              # Servidor Node.js (dev local)
├── dev-server.js          # Servidor de desenvolvimento
├── package.json           # Dependências
├── vercel.json            # Configuração Vercel
├── config.example.js      # Exemplo de configuração
└── *.md                   # Documentação
```

## 🖼️ Sistema de Imagens

### Como Funciona

O sistema usa **Supabase Storage** para armazenamento permanente de imagens:

1. **Upload** no admin → Salva no Supabase Storage
2. **Copiar nome** do arquivo (botão no admin)
3. **Colar** no campo de imagem da Home
4. **Salvar** → Imagem aparece automaticamente!

### Formatos e Limites

- **Formatos Aceitos**: JPG, JPEG, PNG, GIF, WebP
- **Tamanho Máximo**: 5MB por imagem
- **Armazenamento Total**: 1GB (plano gratuito Supabase)
- **Quantidade**: Ilimitada (dentro do espaço)

### Vantagens

- 🔒 **Privacidade total** (LGPD compliant)
- 💾 **Permanente** (não some ao limpar cache ou fazer deploy)
- 🌐 **CDN integrado** (entrega rápida global)
- 📦 **Backup automático** pelo Supabase
- ✅ **Funciona perfeitamente com Vercel** (serverless)

### Uso Básico

1. Acesse `http://localhost:3001/admin.html`
2. Vá na aba **"Imagens"**
3. Faça upload de imagens (clique ou arraste)
4. Clique em **"📋 Copiar Nome"** na imagem desejada
5. Vá na aba **"Home"** e cole o nome no campo de imagem
6. Clique em **"💾 Salvar Home"**

### URLs Externas

Você também pode usar URLs externas (Unsplash, Imgur, etc.) diretamente nos campos de imagem. O sistema detecta automaticamente o tipo de URL.

📖 **Guia completo**: Veja [`CONFIGURACAO.md`](CONFIGURACAO.md) → Seção "Storage para Imagens"

## 📋 Sistema de Inscrições Múltiplas

O sistema permite inscrever várias pessoas (até 10) em uma única submissão de formulário.

### Funcionalidades

- ✅ Inscrever de 1 a 10 pessoas por vez
- ✅ Dados do responsável separados dos participantes
- ✅ Todos os registros vinculados por grupo
- ✅ Validação de vagas disponíveis
- ✅ Validação de capacidade por sessão/bateria
- ✅ Compatibilidade com sistema antigo (inscrições únicas)

### Como Usar

1. **No Admin**: Crie uma página do tipo "Formulário"
2. **Marque**: "Permitir inscrição em grupo"
3. **Configure**: Mínimo e máximo de participantes
4. **No Site**: Usuário seleciona quantidade e preenche dados

### Campos Automáticos

O sistema detecta automaticamente quais campos são do responsável (únicos) e quais são dos participantes (repetidos) baseado em palavras-chave nos labels:

- **Responsável**: "email", "telefone", "endereço", "pagamento"
- **Participantes**: "nome", "cpf", "data de nascimento", "idade"

### Casos de Uso

- **Famílias**: Mãe/pai inscrevendo filhos
- **Grupos de amigos**: Organizador inscrevendo o grupo
- **Empresas**: RH inscrevendo equipe
- **Individual**: Compatível com inscrições únicas

📖 **Documentação completa**: Veja [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) → Seção "Inscrições"

## 🔄 Ambientes (Produção e Homologação)

O projeto está configurado com **dois ambientes separados**:

- **Produção (main branch)**: Ambiente real, com dados de clientes reais
- **Homologação (homol branch)**: Ambiente de testes, cópia de produção para validação

### Regra de Ouro

> ⚠️ **NUNCA faça mudanças diretamente em produção!**
>
> Todas as mudanças devem começar em **homologação** e, após testadas, serem promovidas para **produção**.

### Estrutura de Ambientes

- **Branch Git**: `main` (produção) e `homol` (homologação)
- **Bancos de Dados**: Mesmo projeto Supabase, mas com **schemas PostgreSQL separados**
  - Schema `public` → Produção
  - Schema `homol` → Homologação

### Trabalhando com Ambientes

```bash
# Alternar ambiente (script interativo)
./switch-env.sh homol        # Homologação
./switch-env.sh production   # Produção
./switch-env.sh current      # Ver ambiente atual

# Iniciar servidor por ambiente
npm run dev:homol           # Homologação
npm run dev:prod            # Produção (cuidado!)
```

### Workflow de Desenvolvimento

1. **Trabalhar em homologação** (`homol` branch)
2. **Testar localmente** com ambiente de homologação
3. **Commit e push** para branch `homol`
4. **Criar Pull Request** de `homol` → `main`
5. **Após aprovação**: Merge para `main`
6. **Deploy automático** em produção

📖 **Guia completo**: Veja [`CONFIGURACAO.md`](CONFIGURACAO.md) → Seção "Ambientes"

## 🎯 Como Usar o Admin

### 1. Acessar

```
http://localhost:3001/admin.html
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
2. Copiar nome do arquivo (botão "📋 Copiar Nome")
3. Colar no campo desejado na Home
4. Salvar

📖 **Manual completo**: Veja [`MANUAL_USUARIO.md`](MANUAL_USUARIO.md)

## 💻 Comandos Úteis

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor (produção)
npm start

# Desenvolvimento com auto-reload
npm run dev

# Desenvolvimento rápido (sem nodemon)
npm run fast-dev

# Parar servidor
./parar-servidor.sh

# Verificar Supabase
node verificar-supabase.js
```

### Deploy

```bash
# Vercel - Primeira vez
npm install -g vercel
vercel login
vercel

# Vercel - Deploy produção
vercel --prod

# Ver logs
vercel logs
```

### Git

```bash
# Ver branch atual
git branch

# Alternar para homol
git checkout homol

# Alternar para produção
git checkout main

# Ver diferenças
git diff main..homol
```

### Ambiente

```bash
# Ver ambiente atual
./switch-env.sh current

# Alternar ambiente
./switch-env.sh homol
./switch-env.sh production

# Ver variáveis
cat .env
```

### Troubleshooting

```bash
# Verificar porta em uso
lsof -i :3001

# Matar processo na porta
lsof -ti:3001 | xargs kill -9

# Limpar node_modules
rm -rf node_modules package-lock.json
npm install

# Verificar dependências
npm list --depth=0
```

## 📦 Tecnologias

### Frontend

- **HTML5**: Semântico e acessível
- **CSS3**: Variables, Grid, Flexbox, responsivo
- **JavaScript ES6+**: Vanilla (sem frameworks)
- **LocalStorage**: Fallback para configurações

### Backend

- **Node.js + Express**: Servidor de desenvolvimento
- **Multer**: Upload de arquivos
- **CORS**: Habilitado para desenvolvimento
- **dotenv**: Gerenciamento de ambientes

### Persistência

- **Supabase**: Banco de dados PostgreSQL na nuvem
- **Supabase Storage**: Armazenamento de imagens
- **localStorage**: Fallback quando Supabase não disponível

### Hospedagem

- **Vercel**: Recomendado (serverless)
- **Alternativas**: Netlify, Cloudflare Pages, VPS

## 🌐 Deploy em Produção

### Vercel (Recomendado)

```bash
# Via CLI
npm install -g vercel
vercel login
vercel --prod

# Ou via GitHub
# Conecte repositório na Vercel → Deploy automático
```

⚠️ **Importante**: Configure variáveis de ambiente na Vercel (`SUPABASE_URL` e `SUPABASE_ANON_KEY`)

📖 **Guia completo**: Veja [`DEPLOY.md`](DEPLOY.md)

## 🔒 Segurança

### Implementado

- ✅ Validação de arquivos (tipo, tamanho)
- ✅ Sanitização de nomes
- ✅ CORS configurado
- ✅ Limite de 5MB por imagem
- ✅ Row Level Security (RLS) no Supabase

### Para Produção

- 🔐 Alterar senha do admin
- 🔐 Configurar HTTPS
- 🔐 Rate limiting
- 🔐 Backup automático
- 🔐 Restringir políticas RLS

## 💾 Backup

### Dados do Supabase

O Supabase faz backup automático. Para backup manual:

1. **Exportar via Admin**: Aba Home → "📥 Exportar JSON"
2. **Backup do Supabase**: Dashboard → Backups

### Imagens

As imagens ficam no Supabase Storage e são automaticamente copiadas. Para backup manual:

```bash
# Listar imagens via API
curl http://localhost:3001/api/images
```

## 🐛 Troubleshooting

### Problemas Comuns

**Servidor não inicia**:
```bash
# Verificar porta
lsof -i :3001

# Matar processo
lsof -ti:3001 | xargs kill -9

# Verificar Node.js
node -v  # Deve ser 14+
```

**Dados não persistem**:
- Verifique se Supabase está configurado (`config.js`)
- Execute `SETUP_TABELAS.sql` no Supabase
- Verifique console do navegador (F12)

**Imagens não aparecem**:
- Servidor rodando?
- Nome copiado corretamente?
- Home foi salva após colar o nome?
- Limpe cache do navegador (Ctrl+Shift+Del)

📖 **Soluções completas**: Veja [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)

## 📚 Documentação Adicional

### Documentos Essenciais

- **[`MANUAL_USUARIO.md`](MANUAL_USUARIO.md)** - Manual completo para usuários finais
- **[`CONFIGURACAO.md`](CONFIGURACAO.md)** - Todas as configurações (Supabase, Vercel, Túneis)
- **[`DEPLOY.md`](DEPLOY.md)** - Guia completo de deploy
- **[`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)** - Soluções para problemas comuns

### Documentos Técnicos

- **[`CLAUDE.md`](CLAUDE.md)** - Guia para Claude Code (ferramenta de IA)
- **[`AGENTS.md`](AGENTS.md)** - Repository guidelines

## 📊 Requisitos

- Node.js 14+
- npm ou yarn
- ~50MB de espaço em disco
- Navegador moderno
- Conta no Supabase (gratuita)

## 🎉 Changelog

### v2.0 (2025-10-08)

- ✅ Sistema de upload de imagens (Supabase Storage)
- ✅ Servidor Node.js
- ✅ API REST para imagens
- ✅ Armazenamento permanente
- ✅ Documentação completa
- ✅ Sistema de inscrições múltiplas
- ✅ Ambientes separados (Produção/Homologação)

### v1.0 (2025-10-07)

- ✅ Landing page inicial
- ✅ Admin editável
- ✅ Sistema de formulários
- ✅ Integração PIX

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ para profissionais de aventura**
