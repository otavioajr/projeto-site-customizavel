# 🚀 Como Iniciar o Projeto Localmente

## ⚠️ IMPORTANTE: Sempre inicie o servidor antes de usar!

O upload de imagens **REQUER** que o servidor Node.js esteja rodando.

---

## 📋 Passo a Passo

### 1. Abrir Terminal

Abra o Terminal (ou iTerm) no Mac

### 2. Navegar até a pasta do projeto

```bash
cd ~/Desktop/projeto-site-customizavel
```

### 3. Iniciar o servidor

```bash
npm start
```

Você verá esta mensagem:
```
🚀 Servidor rodando em http://localhost:3000
📁 Pasta de uploads: /Users/otavioajr/Desktop/projeto-site-customizavel/uploads
📸 Admin disponível em: http://localhost:3000/admin.html
```

### 4. Acessar o Admin

**NUNCA** abra o arquivo `admin.html` diretamente pelo Finder!

**SEMPRE** acesse pelo navegador:
```
http://localhost:3000/admin.html
```

Senha: `admin123`

---

## ✅ Checklist

Antes de fazer upload de imagens, verifique:

- [ ] Terminal aberto com `npm start` rodando
- [ ] Mensagem "Servidor rodando em http://localhost:3000" apareceu
- [ ] Acessou via `http://localhost:3000/admin.html` (NÃO `file://...`)
- [ ] Console do navegador (F12) não mostra erros de conexão

---

## 🔧 Comandos Úteis

### Parar o servidor
```bash
Ctrl + C
```
(no Terminal onde o servidor está rodando)

### Verificar se o servidor está rodando
```bash
curl http://localhost:3000/api/images
```

Deve retornar: `{"images":[]}`

### Matar servidor travado
```bash
pkill -f "node server.js"
```

### Verificar porta 3000
```bash
lsof -ti:3000
```

Se retornar um número, o servidor está rodando

---

## 🚨 Problemas Comuns

### Erro: "Erro ao fazer upload"

**Causa:** Servidor não está rodando ou você abriu o arquivo diretamente

**Solução:**
1. Feche o navegador
2. No terminal: `npm start`
3. Acesse: `http://localhost:3000/admin.html`

### Erro: "EADDRINUSE :::3000"

**Causa:** Já tem um servidor rodando na porta 3000

**Solução:**
```bash
pkill -f "node server.js"
npm start
```

### Erro: "Cannot GET /admin.html"

**Causa:** Servidor não está rodando

**Solução:**
```bash
npm start
```

### Página em branco ou carrega mas não funciona

**Causa:** Abriu o arquivo diretamente (file://)

**Solução:**
1. Verifique a URL no navegador
2. Se começar com `file://`, está errado!
3. Acesse: `http://localhost:3000/admin.html`

---

## 📖 URLs Corretas

| ❌ ERRADO | ✅ CORRETO |
|-----------|-----------|
| `file:///Users/.../admin.html` | `http://localhost:3000/admin.html` |
| Clicar no arquivo no Finder | Digitar URL no navegador |
| Abrir sem servidor | Iniciar com `npm start` |

---

## 💡 Dicas

1. **Deixe o Terminal aberto** enquanto usa o admin
2. **Não feche a aba** do Terminal onde o servidor está rodando
3. Se precisar rodar outros comandos, abra **outro Terminal**
4. O servidor precisa estar rodando **toda vez** que for editar o site

---

## 🎯 Fluxo de Trabalho Ideal

```
1. Abrir Terminal
2. cd ~/Desktop/projeto-site-customizavel
3. npm start
4. Abrir navegador
5. http://localhost:3000/admin.html
6. Trabalhar normalmente
7. Quando terminar: Ctrl+C no Terminal
```

---

## 🆘 Ainda com Problemas?

Execute este comando para diagnóstico:
```bash
node verificar-supabase.js
```

Deve mostrar:
```
✅ Tabela "pages" existe
✅ Tabela "home_content" existe
✅ Tabela "inscriptions" existe
```

---

**Tempo para iniciar:** 30 segundos

**Lembre-se:** Servidor rodando = Upload funcionando! 🚀
