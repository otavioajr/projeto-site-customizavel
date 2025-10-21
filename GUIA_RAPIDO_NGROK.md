# 🚀 Guia Rápido - Túnel Público

## 🎯 Escolha Rápida

### ⭐ Opção 1: Cloudflare Tunnel (MELHOR - Sem Cadastro, Sem Avisos!)
```bash
./start-cloudflare.sh
```

**Vantagens:**
- ✅ Sem cadastro necessário
- ✅ **SEM página de aviso**
- ✅ Super rápido e estável
- ✅ Da Cloudflare (confiável)

**Instalação (uma vez):**
```bash
brew install cloudflare/cloudflare/cloudflared
```

### Opção 2: localtunnel (Sem Cadastro, mas com Aviso)
```bash
./start-localtunnel.sh
```

**Vantagens:**
- ✅ Sem cadastro necessário
- ✅ Funciona imediatamente
- ⚠️ Mostra página de aviso (visitante clica "Continue")

### Opção 3: ngrok (Requer Cadastro)
```bash
./start-ngrok.sh
```

**Vantagens:**
- ✅ Interface web profissional
- ✅ Muito estável
- ❌ Requer cadastro gratuito
- ⚠️ Mostra página de aviso (conta free)

---

## 🚀 Uso Rápido - localtunnel

### Script Automático (Recomendado)
```bash
./start-localtunnel.sh
```

Este script:
- ✅ Inicia o servidor Node.js automaticamente
- ✅ Verifica se a porta está livre
- ✅ Inicia o localtunnel
- ✅ Sem necessidade de cadastro
- ✅ Encerra tudo ao pressionar Ctrl+C

### Manual
```bash
# Terminal 1: Iniciar servidor
npm start

# Terminal 2: Iniciar localtunnel
npx localtunnel --port 3000
```

---

## 🔐 Uso com ngrok (Requer Configuração)

### Primeira vez: Configurar Token
1. Cadastre-se: https://dashboard.ngrok.com/signup
2. Copie seu token
3. Configure:
```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

📖 **Guia completo:** Veja `CONFIGURAR_NGROK.md`

### Depois de configurado:
```bash
./start-ngrok.sh
```

## 📋 Copie a URL

Após iniciar, você verá algo como:
```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:3000
```

**Copie e compartilhe:** `https://abc123.ngrok-free.app`

## 🔍 Ver Requisições

Acesse: **http://localhost:4040**
- Interface web para inspecionar todas as requisições
- Ver headers, body, response
- Replay de requisições

## ⚠️ Importante

- ⏰ A URL muda cada vez que você reinicia o ngrok
- 🔒 Primeira visita mostra aviso de segurança (normal)
- 📱 Funciona em qualquer dispositivo com internet

## 🛑 Parar Tudo

Pressione **Ctrl+C** no terminal do ngrok

## 📞 Compartilhar com Cliente

1. Copie a URL HTTPS
2. Envie para o cliente
3. Informe que pode aparecer um aviso na primeira visita (clicar em "Visit Site")
4. Mantenha seu computador ligado e o ngrok rodando

## 🆘 Problemas?

### Porta 3000 ocupada
```bash
lsof -ti:3000 | xargs kill -9
```

### ngrok não encontrado
```bash
brew install ngrok/ngrok/ngrok
```

### Túnel lento
Use região South America:
```bash
ngrok http 3000 --region=sa
```

---

📖 **Documentação completa:** Veja `NGROK_SETUP.md`
