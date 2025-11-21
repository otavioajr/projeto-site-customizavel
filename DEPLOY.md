# Guia de Deploy - Landing Page Aventuras

> 📖 **Documentação Principal**: Para visão geral do projeto, instalação e outros tópicos, consulte o [`README.md`](README.md)

## 🚀 Deploy na Vercel (Recomendado)

### Opção 1: Deploy via CLI (Mais Rápido)

```bash
# 1. Instalar Vercel CLI globalmente
npm install -g vercel

# 2. Fazer login (primeira vez)
vercel login

# 3. Deploy de teste
cd projeto-leo
vercel

# 4. Deploy em produção
vercel --prod
```

A Vercel vai gerar uma URL como: `https://seu-projeto.vercel.app`

### Opção 2: Deploy via GitHub (Automático)

1. **Criar repositório no GitHub**
```bash
cd projeto-leo
git init
git add .
git commit -m "Initial commit - Landing page aventuras"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

2. **Conectar na Vercel**
   - Acesse https://vercel.com
   - Clique em "New Project"
   - Importe seu repositório do GitHub
   - Clique em "Deploy"

3. **Deploy Automático**
   - Cada push para `main` faz deploy automático
   - Preview automático para pull requests

---

## 🔧 Configuração Pós-Deploy

### 1. Domínio Customizado (Opcional)

Na Vercel:
1. Settings → Domains
2. Adicione seu domínio (ex: `aventuras.com.br`)
3. Configure DNS conforme instruções

### 2. Variáveis de Ambiente (Para Supabase)

Se integrar com Supabase:
```bash
# Via CLI
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY

# Ou via Dashboard
# Settings → Environment Variables
```

### 3. Senha do Admin em Produção

**IMPORTANTE**: Trocar senha padrão!

Edite `/assets/js/admin.js`:
```javascript
// Linha ~760
if (input === 'admin123') {  // ← TROCAR ESTA SENHA
```

Ou melhor: implemente Supabase Auth.

---

## 🌐 Outros Provedores

### Netlify

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Deploy
netlify deploy --prod
```

### GitHub Pages

```bash
# 1. Criar branch gh-pages
git checkout -b gh-pages

# 2. Push
git push origin gh-pages

# 3. Configurar no GitHub
# Settings → Pages → Source: gh-pages
```

**Nota**: GitHub Pages pode ter problemas com rotas dinâmicas.

### Cloudflare Pages

1. Conecte repositório GitHub
2. Build settings:
   - Build command: (vazio)
   - Output directory: `/`
3. Deploy

---

## 📊 Checklist Pré-Deploy

### Segurança
- [ ] Trocar senha do admin
- [ ] Validar URLs de imagens
- [ ] Testar em modo anônimo
- [ ] Verificar console do navegador (sem erros)

### Performance
- [ ] Imagens otimizadas (WebP quando possível)
- [ ] URLs de CDN para imagens
- [ ] Testar em 3G/4G

### SEO
- [ ] Title e description configurados
- [ ] Open Graph tags (opcional)
- [ ] Sitemap (opcional)
- [ ] robots.txt (opcional)

### Funcionalidades
- [ ] Todas as páginas carregam
- [ ] Admin funciona
- [ ] Preview funciona
- [ ] Mobile responsivo
- [ ] Links externos abrem em nova aba

---

## 🔍 Testes Pós-Deploy

### 1. Teste Básico
```bash
# Verificar se site carrega
curl -I https://seu-site.vercel.app

# Deve retornar: HTTP/2 200
```

### 2. Teste de Páginas
- [ ] Home: `https://seu-site.vercel.app/`
- [ ] Admin: `https://seu-site.vercel.app/admin.html`
- [ ] Página interna: `https://seu-site.vercel.app/p/#roteiros`

### 3. Teste de Funcionalidades
1. Acesse o Admin
2. Adicione uma página de teste
3. Verifique se aparece no menu
4. Clique no link e veja se carrega
5. Edite conteúdo da Home
6. Verifique se salva e persiste

### 4. Teste Mobile
- Abra em dispositivo móvel
- Teste menu hambúrguer
- Verifique responsividade
- Teste formulários do Admin

---

## 🐛 Troubleshooting

### Problema: Admin não carrega

**Causa**: Prompt de senha bloqueando.

**Solução**:
```javascript
// Em admin.js, linha ~754
const isDev = window.location.hostname === 'localhost' || 
              window.location.hostname === '127.0.0.1' ||
              window.location.hostname.includes('vercel.app'); // ← Adicionar
```

### Problema: Páginas internas não carregam

**Causa**: Roteamento incorreto.

**Solução**: Verificar se está usando hash routing (`/p/#slug`).

### Problema: Imagens não carregam

**Causa**: URLs inválidas ou CORS.

**Solução**: 
- Use URLs públicas (Unsplash, Cloudinary)
- Ou hospede no Supabase Storage

### Problema: localStorage não persiste

**Causa**: Modo anônimo ou cookies bloqueados.

**Solução**: Avisar usuário ou migrar para Supabase.

### Problema: Preview não atualiza

**Causa**: Iframe bloqueado por CORS.

**Solução**: Verificar headers no `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" }
      ]
    }
  ]
}
```

---

## 📈 Monitoramento

### Vercel Analytics (Grátis)

1. Dashboard Vercel → Analytics
2. Veja:
   - Pageviews
   - Top pages
   - Devices
   - Locations

### Google Analytics (Opcional)

Adicione no `<head>` de `index.html` e `admin.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🔒 Segurança em Produção

### 1. HTTPS
✅ Automático na Vercel

### 2. Headers de Segurança
✅ Já configurado em `vercel.json`

### 3. Autenticação Admin

**MVP Atual**: Senha simples
**Recomendado**: Supabase Auth

```javascript
// Exemplo com Supabase Auth
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}
```

### 4. Rate Limiting

Para evitar abuso do Admin, considere:
- Cloudflare (rate limiting grátis)
- Vercel Edge Functions com rate limit

---

## 💾 Backup e Recuperação

### Backup Manual
1. Admin → Exportar JSON
2. Salvar arquivo localmente
3. Fazer backup regular

### Backup Automático (com Supabase)
- Dados salvos no servidor
- Backup automático do Supabase
- Point-in-time recovery

### Restaurar Backup
1. Admin → Importar JSON
2. Selecionar arquivo de backup
3. Confirmar importação

---

## 🚀 Performance Otimizada

### Imagens
```
Recomendações:
- Formato: WebP ou AVIF
- Tamanho: 
  - Hero: 1920x1080 (~200KB)
  - Galeria: 800x600 (~100KB)
  - Ícones: 64x64 (~10KB)
- CDN: Cloudinary, Imgix, ou Supabase Storage
```

### Exemplo URL Cloudinary
```
https://res.cloudinary.com/seu-cloud/image/upload/
  w_1920,h_1080,c_fill,f_auto,q_auto/
  sua-imagem.jpg
```

### Cache
✅ Já configurado em `vercel.json`:
- Assets: 1 ano
- HTML: sem cache (sempre atualizado)

---

## 📱 PWA (Opcional)

Para transformar em Progressive Web App:

1. **Criar `manifest.json`**
```json
{
  "name": "Aventuras",
  "short_name": "Aventuras",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0E7C7B",
  "theme_color": "#0E7C7B",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. **Adicionar no `<head>`**
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0E7C7B">
```

3. **Service Worker** (opcional)
```javascript
// sw.js
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('aventuras-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/assets/css/styles.css',
        '/assets/js/app.js'
      ]);
    })
  );
});
```

---

## ✅ Checklist Final

### Pré-Deploy
- [ ] Código testado localmente
- [ ] Senha do admin trocada
- [ ] README.md atualizado
- [ ] .gitignore configurado
- [ ] Imagens otimizadas

### Deploy
- [ ] Deploy realizado com sucesso
- [ ] URL funcionando
- [ ] HTTPS ativo
- [ ] Domínio customizado (se aplicável)

### Pós-Deploy
- [ ] Todos os links funcionam
- [ ] Admin acessível e funcional
- [ ] Mobile responsivo
- [ ] Performance OK (Lighthouse > 90)
- [ ] SEO configurado
- [ ] Analytics instalado (opcional)

### Manutenção
- [ ] Backup inicial criado
- [ ] Documentação entregue ao cliente
- [ ] Treinamento do admin realizado
- [ ] Suporte definido

---

## 📞 Suporte

### Documentação
- README.md: Visão geral e documentação consolidada
- CONFIGURACAO.md: Configurações detalhadas
- DEPLOY.md: Este arquivo

### Recursos
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- MDN Web Docs: https://developer.mozilla.org

---

## 🎉 Pronto!

Seu site está no ar! 🚀

Próximos passos:
1. Compartilhe a URL
2. Configure Analytics
3. Faça backup regular
4. Considere migrar para Supabase (fase produção)
