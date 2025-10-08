# Comandos Úteis - Landing Page Aventuras

## 🚀 Desenvolvimento

### Iniciar servidor local
```bash
npm run dev
```
Acessa em: http://localhost:3000

### Instalar dependências
```bash
npm install
```

### Limpar node_modules
```bash
rm -rf node_modules
npm install
```

---

## 📦 Deploy

### Vercel - Primeira vez
```bash
# Instalar CLI
npm install -g vercel

# Login
vercel login

# Deploy de teste
vercel

# Deploy produção
vercel --prod
```

### Vercel - Deploys subsequentes
```bash
# Deploy produção direto
vercel --prod

# Ver logs
vercel logs

# Ver domínios
vercel domains ls

# Adicionar domínio
vercel domains add seu-dominio.com
```

### Netlify
```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

## 🗂️ Git

### Inicializar repositório
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

### Conectar ao GitHub
```bash
git remote add origin https://github.com/usuario/repo.git
git push -u origin main
```

### Commits comuns
```bash
# Adicionar alterações
git add .

# Commit
git commit -m "Descrição das mudanças"

# Push
git push

# Ver status
git status

# Ver histórico
git log --oneline

# Desfazer último commit (mantém alterações)
git reset --soft HEAD~1

# Desfazer alterações não commitadas
git checkout .
```

---

## 🔧 Manutenção

### Verificar se site está no ar
```bash
curl -I https://seu-site.vercel.app
```

### Testar performance
```bash
# Lighthouse (Chrome DevTools)
# F12 → Lighthouse → Analyze page load

# Ou via CLI
npm install -g lighthouse
lighthouse https://seu-site.vercel.app
```

### Verificar tamanho dos arquivos
```bash
# Tamanho total
du -sh .

# Por diretório
du -sh *

# Arquivos maiores que 100KB
find . -type f -size +100k -exec ls -lh {} \;
```

### Limpar cache do navegador
```bash
# Chrome (Mac)
Cmd + Shift + Delete

# Chrome (Windows)
Ctrl + Shift + Delete

# Ou modo anônimo
Cmd/Ctrl + Shift + N
```

---

## 📊 Backup

### Exportar dados (via browser console)
```javascript
// No console do navegador (F12)

// Exportar home_content
const home = localStorage.getItem('home_content');
console.log(home);

// Exportar pages
const pages = localStorage.getItem('pages');
console.log(pages);

// Baixar como arquivo
const data = {
  home_content: JSON.parse(localStorage.getItem('home_content')),
  pages: JSON.parse(localStorage.getItem('pages'))
};
const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'backup.json';
a.click();
```

### Importar dados
```javascript
// No console do navegador
const data = {/* cole o JSON aqui */};
localStorage.setItem('home_content', JSON.stringify(data.home_content));
localStorage.setItem('pages', JSON.stringify(data.pages));
location.reload();
```

### Backup via arquivo
```bash
# Fazer backup de todo o projeto
tar -czf backup-$(date +%Y%m%d).tar.gz projeto-leo/

# Restaurar backup
tar -xzf backup-20251008.tar.gz
```

---

## 🐛 Debug

### Ver console do navegador
```
F12 → Console
```

### Ver erros JavaScript
```javascript
// No console
console.log('Debug:', variavel);
console.error('Erro:', erro);
console.table(array);
```

### Ver localStorage
```javascript
// Ver tudo
console.log(localStorage);

// Ver item específico
console.log(localStorage.getItem('home_content'));

// Limpar tudo
localStorage.clear();
```

### Recarregar sem cache
```bash
# Mac
Cmd + Shift + R

# Windows
Ctrl + Shift + R

# Ou
Ctrl + F5
```

---

## 🔍 Inspeção

### Ver estrutura do site
```bash
tree -L 3 -I 'node_modules'
```

### Contar linhas de código
```bash
# Total
find . -name '*.js' -o -name '*.html' -o -name '*.css' | xargs wc -l

# Por tipo
wc -l assets/js/*.js
wc -l *.html
wc -l assets/css/*.css
```

### Ver dependências
```bash
npm list --depth=0
```

---

## 🌐 Testes

### Testar responsividade
```bash
# Chrome DevTools
F12 → Toggle device toolbar (Cmd/Ctrl + Shift + M)
```

### Testar em diferentes navegadores
```bash
# Mac
open -a "Google Chrome" http://localhost:3000
open -a "Safari" http://localhost:3000
open -a "Firefox" http://localhost:3000

# Windows
start chrome http://localhost:3000
start firefox http://localhost:3000
```

### Testar velocidade
```bash
# Google PageSpeed Insights
# https://pagespeed.web.dev/

# GTmetrix
# https://gtmetrix.com/

# WebPageTest
# https://www.webpagetest.org/
```

---

## 🔐 Segurança

### Trocar senha do admin
```bash
# Editar arquivo
code assets/js/admin.js

# Procurar linha ~761
# Trocar 'admin123' por nova senha
```

### Verificar vulnerabilidades
```bash
npm audit

# Corrigir automaticamente
npm audit fix
```

### Headers de segurança
```bash
# Verificar headers
curl -I https://seu-site.vercel.app
```

---

## 📈 Analytics

### Google Analytics
```html
<!-- Adicionar no <head> de index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Vercel Analytics
```bash
# Já incluído automaticamente no Vercel
# Ver em: Dashboard → Analytics
```

---

## 🎨 Otimização de Imagens

### Comprimir imagens
```bash
# TinyPNG (online)
# https://tinypng.com/

# ImageOptim (Mac)
# https://imageoptim.com/

# Squoosh (online)
# https://squoosh.app/
```

### Converter para WebP
```bash
# Instalar cwebp
brew install webp  # Mac
apt install webp   # Linux

# Converter
cwebp imagem.jpg -q 80 -o imagem.webp
```

---

## 🔄 Supabase

### Instalar cliente
```bash
npm install @supabase/supabase-js
```

### Variáveis de ambiente
```bash
# Criar arquivo .env.local
echo "VITE_SUPABASE_URL=https://seu-projeto.supabase.co" > .env.local
echo "VITE_SUPABASE_ANON_KEY=sua-chave" >> .env.local

# Adicionar no Vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

---

## 📝 Úteis

### Abrir projeto no VS Code
```bash
code .
```

### Abrir no navegador
```bash
# Mac
open http://localhost:3000

# Windows
start http://localhost:3000

# Linux
xdg-open http://localhost:3000
```

### Ver porta em uso
```bash
# Mac/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

### Matar processo na porta
```bash
# Mac/Linux
kill -9 $(lsof -t -i:3000)

# Windows
taskkill /PID <PID> /F
```

---

## 🆘 Troubleshooting Rápido

### Site não carrega
```bash
# 1. Verificar se servidor está rodando
ps aux | grep serve

# 2. Reiniciar servidor
npm run dev

# 3. Limpar cache
Cmd/Ctrl + Shift + R
```

### Admin não abre
```bash
# 1. Verificar console (F12)
# 2. Limpar localStorage
localStorage.clear()

# 3. Tentar modo anônimo
```

### Alterações não aparecem
```bash
# 1. Verificar se salvou
# 2. Recarregar página
# 3. Limpar cache
# 4. Verificar localStorage
console.log(localStorage.getItem('home_content'))
```

### Erro ao fazer deploy
```bash
# 1. Verificar se commitou tudo
git status

# 2. Verificar vercel.json
cat vercel.json

# 3. Ver logs
vercel logs

# 4. Tentar novamente
vercel --prod --force
```

---

## 📚 Referências Rápidas

### Documentação
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- MDN: https://developer.mozilla.org

### Ferramentas Online
- TinyPNG: https://tinypng.com
- Unsplash: https://unsplash.com
- Iconify: https://iconify.design
- Google Fonts: https://fonts.google.com
- Color Picker: https://htmlcolorcodes.com

### Testes
- PageSpeed: https://pagespeed.web.dev
- GTmetrix: https://gtmetrix.com
- Lighthouse: Chrome DevTools
- Can I Use: https://caniuse.com

---

## 💡 Dicas Rápidas

### Atalhos úteis
```
F12 - DevTools
Cmd/Ctrl + S - Salvar
Cmd/Ctrl + F - Buscar
Cmd/Ctrl + Shift + F - Buscar em arquivos
Cmd/Ctrl + / - Comentar linha
```

### VS Code útil
```bash
# Formatar código
Shift + Alt + F

# Múltiplos cursores
Alt + Click

# Duplicar linha
Shift + Alt + Down/Up

# Mover linha
Alt + Down/Up
```

### Chrome DevTools
```
Cmd/Ctrl + Shift + C - Inspecionar elemento
Cmd/Ctrl + Shift + M - Toggle device toolbar
Cmd/Ctrl + Shift + P - Command palette
```

---

## ✅ Checklist Diário

```bash
# Manhã
[ ] git pull                    # Pegar atualizações
[ ] npm run dev                 # Iniciar servidor
[ ] Abrir http://localhost:3000 # Testar site

# Durante desenvolvimento
[ ] git add .                   # Adicionar mudanças
[ ] git commit -m "..."         # Commitar
[ ] Testar no navegador         # Verificar

# Fim do dia
[ ] git push                    # Enviar para GitHub
[ ] Fazer backup (se mudanças importantes)
[ ] Fechar servidor (Ctrl + C)
```

---

**Mantenha este arquivo aberto para referência rápida!** 📌
