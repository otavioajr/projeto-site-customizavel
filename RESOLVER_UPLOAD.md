# 🔧 Como Resolver o Problema de Upload de Imagens

## 🚨 Problema
Ao tentar fazer upload de imagens, você recebe o erro:
```
Erro ao fazer upload de "logo-nome-leo.jpg"
```

## ✅ Solução Rápida (3 passos)

### 1. Abrir Terminal
Pressione `Cmd + Espaço` e digite "Terminal"

### 2. Executar estes comandos
```bash
cd ~/Desktop/projeto-site-customizavel
pkill -9 -f "node server"
npm start
```

### 3. Abrir o navegador
```
http://localhost:3000/admin.html
```

**NÃO** abra o arquivo diretamente pelo Finder!

---

## 🎯 Verificar se está funcionando

Execute no Terminal:
```bash
curl http://localhost:3000/api/images
```

Deve retornar:
```
{"images":[]}
```

---

## 📖 Por que acontece?

O sistema de upload precisa de um **servidor rodando** para funcionar.

Quando você:
- Clica no `admin.html` pelo Finder ❌
- O navegador abre como `file:///...` ❌
- As APIs não funcionam ❌

Quando você:
- Inicia o servidor com `npm start` ✅
- Acessa `http://localhost:3000/admin.html` ✅
- As APIs funcionam perfeitamente ✅

---

## 🔄 Sempre que for usar:

1. **Abra o Terminal**
2. **Execute:** `cd ~/Desktop/projeto-site-customizavel && npm start`
3. **Mantenha o Terminal aberto**
4. **Acesse:** `http://localhost:3000/admin.html`

---

## 🆘 Ainda não funciona?

Execute este diagnóstico:
```bash
cd ~/Desktop/projeto-site-customizavel
./parar-servidor.sh
./iniciar-servidor.sh
```

Ele vai iniciar o servidor e mostrar todos os detalhes.

---

**Tempo para resolver:** 30 segundos 🚀
