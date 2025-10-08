# Landing Page Dinâmica - Aventuras

Landing page responsiva para profissional de esportes de aventura com painel admin completo para edição de conteúdo.

## 🚀 Características

- **Home Editável**: Hero, Sobre, Serviços, Depoimentos, Galeria, Contato
- **Páginas Dinâmicas**: Links no header que abrem páginas com iframes do Canva
- **Admin Completo**: Interface intuitiva com preview ao vivo
- **Tema Customizável**: Cores editáveis via CSS variables
- **100% Estático**: Deploy direto na Vercel sem SSR
- **MVP com localStorage**: Funciona completamente offline

## 📁 Estrutura

```
/
├── index.html              # Home
├── admin.html              # Painel Admin (senha: admin123)
├── p/
│   └── index.html          # Página interna (Canva iframe)
├── assets/
│   ├── css/
│   │   └── styles.css      # Estilos + CSS Variables
│   └── js/
│       ├── app.js          # Renderização da Home
│       ├── page.js         # Renderização páginas internas
│       └── admin.js        # CRUD Admin + Preview
├── package.json
└── README.md
```

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js instalado

### Instalação e Execução

```bash
# Instalar dependências
npm install

# Rodar servidor local
npm run dev
```

Acesse:
- Home: http://localhost:3000
- Admin: http://localhost:3000/admin.html (senha: `admin123`)

## 🎨 Admin

### Acesso
- URL: `/admin.html`
- Senha padrão: `admin123`
- **Não aparece no menu** (oculto)

### Funcionalidades

#### 1. Home (Conteúdo Editável)
- **Hero**: título, subtítulo, CTA, imagem de fundo
- **Sobre**: título, texto, imagem
- **Serviços**: até 3 cards com título, texto e ícone
- **Depoimentos**: lista de depoimentos
- **Galeria**: até 6 imagens
- **Contato**: WhatsApp, email, Instagram, localização
- **SEO**: title e description

#### 2. Páginas do Menu
- Adicionar/editar/remover páginas
- Cada página tem:
  - Label (nome no menu)
  - Slug (URL)
  - URL do Canva (embed)
  - Ordem de exibição
  - Status (ativo/inativo)
  - SEO (title e description)

#### 3. Tema
- 4 cores customizáveis:
  - Primária
  - Secundária
  - Texto
  - Fundo
- Preview em tempo real

### Preview Ao Vivo
- Coluna direita mostra preview da Home
- Atualização automática ao editar campos
- Destaque visual da seção sendo editada

### Ações Disponíveis
- **Salvar**: grava no localStorage
- **Reverter**: desfaz alterações não salvas
- **Exportar JSON**: backup do conteúdo
- **Importar JSON**: restaurar de backup

## 🌐 Deploy na Vercel

### Opção 1: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Opção 2: Via GitHub

1. Push para repositório GitHub
2. Importar projeto na Vercel
3. Deploy automático

### Configuração (opcional)

Criar `vercel.json` para headers customizados:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

## 📊 Dados

### Persistência MVP
- **localStorage**: `home_content` e `pages`
- Funciona completamente offline
- Dados persistem no navegador

### Estrutura de Dados

#### home_content
```json
{
  "hero": { "title": "...", "subtitle": "...", ... },
  "about": { "title": "...", "text": "...", ... },
  "services": [...],
  "testimonials": [...],
  "gallery": { "image_urls": [...] },
  "theme": { "primary": "#0E7C7B", ... },
  "seo": { "title": "...", "description": "..." },
  "contact": { "whatsapp": "...", ... }
}
```

#### pages
```json
[
  {
    "id": "uuid",
    "label": "Roteiros",
    "slug": "roteiros",
    "order": 1,
    "is_active": true,
    "canva_embed_url": "https://www.canva.com/design/...",
    "seo_title": "...",
    "seo_description": "..."
  }
]
```

## 🔐 Segurança

### MVP
- Senha simples via `prompt()`
- Armazenada no localStorage
- Senha padrão: `admin123`

### Produção (Supabase - Fase 2)
- Autenticação via Supabase Auth
- Magic link ou email/senha
- RLS (Row Level Security)
- Leitura pública, escrita restrita

## 🎯 Rotas

- `/` → Home
- `/admin.html` → Admin (oculto)
- `/p/index.html?slug={slug}` → Página interna (Canva)

## 🔄 Próximos Passos (Fase Produção)

1. **Integração Supabase**
   - Criar projeto no Supabase
   - Configurar tabelas `pages` e `home_content`
   - Implementar Auth
   - Configurar RLS

2. **Melhorias**
   - Upload de imagens via Supabase Storage
   - Versionamento de conteúdo
   - Múltiplos usuários admin
   - Analytics

## 📝 Notas

- Imagens devem ser URLs públicas (Unsplash, Canva, Cloudinary, etc.)
- URLs do Canva devem começar com `https://www.canva.com/`
- Slugs são únicos e auto-gerados a partir do label
- Máximo de 3 serviços e 6 imagens na galeria

## 🐛 Troubleshooting

### Preview não atualiza
- Verifique se o iframe carrega corretamente
- Limpe o cache do navegador
- Recarregue a página do admin

### Dados não salvam
- Verifique se localStorage está habilitado
- Limpe o localStorage e tente novamente
- Use modo anônimo para testar

### Página interna não carrega
- Verifique se a URL do Canva é válida
- Confirme que a página está ativa
- Teste a URL do Canva diretamente

## 📚 Documentação Completa

Este projeto possui documentação extensa e organizada:

- **[INDICE_DOCUMENTACAO.md](INDICE_DOCUMENTACAO.md)** - Índice de toda documentação
- **[IMPLEMENTACAO.md](IMPLEMENTACAO.md)** - Detalhes técnicos da implementação
- **[DEPLOY.md](DEPLOY.md)** - Guia completo de deploy
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Integração com Supabase
- **[MANUAL_USUARIO.md](MANUAL_USUARIO.md)** - Manual para o cliente
- **[RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md)** - Overview do projeto
- **[COMANDOS_UTEIS.md](COMANDOS_UTEIS.md)** - Referência rápida de comandos

**Não sabe por onde começar?** Leia o [INDICE_DOCUMENTACAO.md](INDICE_DOCUMENTACAO.md)

## 📄 Licença

MIT
