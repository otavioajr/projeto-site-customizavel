# Configuração do ngrok para Projeto Leo

## 📋 O que é o ngrok?
O ngrok cria um túnel seguro que expõe seu servidor local (localhost:3000) para a internet pública, permitindo que outras pessoas acessem seu projeto.

## 🚀 Instalação do ngrok

### Opção 1: Instalação via Homebrew (Recomendado para Mac)
```bash
brew install ngrok/ngrok/ngrok
```

### Opção 2: Download Manual
1. Acesse: https://ngrok.com/download
2. Baixe a versão para macOS
3. Descompacte o arquivo
4. Mova para uma pasta no PATH (opcional):
```bash
sudo mv ngrok /usr/local/bin/
```

## 🔑 Configuração da Conta (Opcional mas Recomendado)

1. Crie uma conta gratuita em: https://dashboard.ngrok.com/signup
2. Copie seu authtoken do dashboard
3. Configure o authtoken:
```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

**Benefícios da conta gratuita:**
- URLs mais estáveis
- Mais tempo de sessão
- Estatísticas de uso
- Múltiplos túneis simultâneos

## 🎯 Como Usar

### Passo 1: Iniciar o Servidor Local
Primeiro, inicie seu servidor Node.js:
```bash
npm start
# ou
node server.js
```

O servidor estará rodando em `http://localhost:3000`

### Passo 2: Iniciar o ngrok
Em um **novo terminal**, execute:
```bash
ngrok http 3000
```

### Passo 3: Acessar a URL Pública
O ngrok mostrará algo como:
```
ngrok                                                                    

Session Status                online
Account                       seu-email@example.com (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Sua URL pública será:** `https://abc123.ngrok-free.app`

## 🔧 Comandos Úteis

### Túnel HTTP básico
```bash
ngrok http 3000
```

### Túnel com subdomínio personalizado (requer plano pago)
```bash
ngrok http 3000 --subdomain=projeto-leo
```

### Túnel com região específica
```bash
ngrok http 3000 --region=sa  # South America (Brasil)
```

### Ver logs e requisições
Acesse: `http://localhost:4040`
- Interface web para inspecionar todas as requisições HTTP
- Ver headers, body, response
- Replay de requisições

## 📱 Testando o Túnel

Depois de iniciar o ngrok, teste:

1. **Página Principal:** `https://sua-url.ngrok-free.app/`
2. **Admin:** `https://sua-url.ngrok-free.app/admin.html`
3. **Confirmação:** `https://sua-url.ngrok-free.app/confirmacao.html`

## ⚠️ Avisos Importantes

### Aviso de Segurança do ngrok
Na primeira vez que alguém acessar sua URL, o ngrok pode mostrar uma tela de aviso. Basta clicar em "Visit Site" para continuar.

### Limitações da Conta Gratuita
- URL muda a cada vez que você reinicia o ngrok
- Limite de 40 conexões/minuto
- Sessão expira após 2 horas de inatividade

### Segurança
- **NÃO compartilhe** URLs ngrok com dados sensíveis
- Use autenticação básica se necessário:
```bash
ngrok http 3000 --basic-auth="usuario:senha"
```

## 🎨 Script de Inicialização Rápida

Crie um arquivo `start-ngrok.sh`:
```bash
#!/bin/bash

echo "🚀 Iniciando servidor Node.js..."
npm start &
SERVER_PID=$!

echo "⏳ Aguardando servidor iniciar..."
sleep 3

echo "🌐 Iniciando túnel ngrok..."
ngrok http 3000

# Cleanup ao sair
kill $SERVER_PID
```

Torne executável:
```bash
chmod +x start-ngrok.sh
```

Execute:
```bash
./start-ngrok.sh
```

## 🔄 Alternativas ao ngrok

Se precisar de outras opções:
- **localtunnel:** `npx localtunnel --port 3000`
- **serveo:** `ssh -R 80:localhost:3000 serveo.net`
- **Cloudflare Tunnel:** Gratuito e sem limites

## 📞 Compartilhando com Clientes

Quando compartilhar a URL:
1. Copie a URL HTTPS (mais segura)
2. Informe que pode haver um aviso de segurança na primeira visita
3. Explique que a URL é temporária
4. Se precisar de URL permanente, considere deploy no Vercel/Netlify

## 🐛 Solução de Problemas

### Erro: "command not found: ngrok"
```bash
# Verifique se está no PATH
which ngrok

# Se não estiver, adicione ao PATH ou use caminho completo
./ngrok http 3000
```

### Erro: "Failed to listen on port"
- Verifique se a porta 3000 está livre
- Mate processos usando a porta: `lsof -ti:3000 | xargs kill`

### Túnel muito lento
- Tente mudar a região: `--region=sa` (South America)
- Verifique sua conexão de internet

### Erro 502 Bad Gateway
- Certifique-se que seu servidor local está rodando
- Verifique se está usando a porta correta

## 📚 Recursos Adicionais

- Documentação oficial: https://ngrok.com/docs
- Dashboard: https://dashboard.ngrok.com/
- Status: https://status.ngrok.com/
