# 🔑 Como Configurar o ngrok (Autenticação)

O ngrok agora exige uma conta gratuita. Siga estes passos:

## Passo 1: Criar Conta (2 minutos)

1. Acesse: https://dashboard.ngrok.com/signup
2. Cadastre-se (pode usar Google/GitHub)
3. É **100% gratuito**

## Passo 2: Copiar o Token

1. Após login, você verá seu **authtoken**
2. Ou acesse: https://dashboard.ngrok.com/get-started/your-authtoken
3. Copie o token (algo como: `2abc123def456ghi789jkl`)

## Passo 3: Configurar o Token

No terminal, execute:

```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

**Exemplo:**
```bash
ngrok config add-authtoken 2abc123def456ghi789jkl
```

## Passo 4: Usar o ngrok

Agora você pode usar:

```bash
./start-ngrok.sh
```

Ou manualmente:

```bash
ngrok http 3000
```

## ✅ Pronto!

O token fica salvo no seu computador e você não precisa configurar novamente.

---

## 🆚 ngrok vs localtunnel

### ngrok (Requer cadastro)
- ✅ Mais estável
- ✅ Interface web melhor (localhost:4040)
- ✅ Mais opções de configuração
- ❌ Requer cadastro

### localtunnel (Sem cadastro)
- ✅ Sem cadastro necessário
- ✅ Funciona imediatamente
- ✅ Simples e rápido
- ⚠️ URLs menos amigáveis

## 💡 Recomendação

**Use localtunnel** se:
- Precisa de algo rápido
- Não quer criar conta
- Uso esporádico

**Use ngrok** se:
- Vai usar frequentemente
- Quer interface web profissional
- Precisa de recursos avançados
