# 📸 Como Usar o Sistema de Imagens

## 🚀 Início Rápido

### 1️⃣ Iniciar o Servidor
```bash
cd projeto-leo
npm install
npm start
```

Acesse: **http://localhost:3000/admin.html**

---

### 2️⃣ Fazer Upload de Imagem

1. Vá na aba **"Imagens"**
2. Clique ou arraste sua foto
3. Aguarde o upload
4. ✅ Imagem aparece na lista!

---

### 3️⃣ Usar na Home

1. Clique em **"📋 Copiar Nome"** da imagem
2. Vá na aba **"Home"**
3. Cole o nome no campo de imagem
4. Clique em **"💾 Salvar Home"**
5. ✅ Pronto! Imagem aparece no site!

---

## 💡 Exemplo Prático

**Quero colocar minha foto no Hero:**

```
1. Upload: minha-foto-hero.jpg
2. Copiar nome: "minha-foto-hero-1696800000-123456789.jpg"
3. Home → Hero → "URL da Imagem de Fundo"
4. Colar: minha-foto-hero-1696800000-123456789.jpg
5. Salvar Home
6. ✅ Foto aparece!
```

---

## 📁 Onde as Imagens Ficam?

```
projeto-leo/
└── uploads/
    ├── hero-1696800000-123.jpg
    ├── perfil-1696800001-456.jpg
    └── galeria-1696800002-789.jpg
```

**✅ Permanente!** Não some se fechar o navegador.

---

## 🔄 Diferença: Antes vs Agora

### ❌ Antes (localStorage)
- Imagens sumiam ao limpar cache
- Limitado a ~5-10MB
- Só funcionava no mesmo navegador

### ✅ Agora (Pasta uploads/)
- **Imagens permanentes** no projeto
- Sem limite (depende do disco)
- Funciona em qualquer navegador
- **Pode fazer backup** copiando a pasta

---

## 💾 Backup

### Fazer Backup:
```bash
cp -r uploads/ backup-uploads/
```

### Restaurar Backup:
```bash
cp -r backup-uploads/* uploads/
```

---

## ⚠️ Importante

### Nome do Arquivo
O sistema adiciona um timestamp ao nome:
- Você faz upload: `foto.jpg`
- Sistema salva como: `foto-1696800000-123456789.jpg`
- **Use o botão "Copiar Nome"** para pegar o nome correto!

### Formatos Aceitos
- ✅ JPG / JPEG
- ✅ PNG
- ✅ GIF
- ✅ WebP
- ❌ PDF, SVG, outros

### Tamanho Máximo
- 5MB por imagem
- Comprima antes se necessário: [TinyPNG.com](https://tinypng.com)

---

## 🆚 URLs Externas vs Uploads

### Pode Misturar!

```
Hero: minha-foto.jpg (upload local)
Sobre: https://unsplash.com/photo-123.jpg (URL externa)
Galeria 1: foto-1.jpg (upload local)
Galeria 2: https://imgur.com/abc.jpg (URL externa)
```

**O sistema detecta automaticamente!**

---

## 🐛 Problemas Comuns

### Imagem não aparece
1. ✅ Servidor está rodando?
2. ✅ Nome copiado corretamente?
3. ✅ Salvou a Home?
4. ✅ Recarregou a página?

### Erro ao fazer upload
1. ✅ Arquivo é imagem?
2. ✅ Menor que 5MB?
3. ✅ Servidor está rodando?

### "Cannot POST /api/upload"
- ❌ Servidor não está rodando
- ✅ Execute: `npm start`

---

## 📊 Ver Suas Imagens

### No Admin:
- Aba "Imagens" mostra todas

### No Servidor:
```bash
ls -lh uploads/
```

### No Navegador:
- Acesse: http://localhost:3000/uploads/

---

## 🎯 Dicas

1. **Use nomes descritivos** ao fazer upload
   - ✅ `hero-montanha.jpg`
   - ❌ `IMG_1234.jpg`

2. **Otimize antes de fazer upload**
   - Redimensione para o tamanho recomendado
   - Comprima com TinyPNG

3. **Faça backup regularmente**
   - Copie a pasta `uploads/` semanalmente

4. **Delete imagens não usadas**
   - Economiza espaço em disco

---

## ✅ Checklist

- [ ] Servidor rodando (`npm start`)
- [ ] Upload da imagem feito
- [ ] Nome copiado (botão "Copiar Nome")
- [ ] Nome colado no campo correto
- [ ] Home salva
- [ ] Preview verificado

---

**🎉 Pronto! Agora suas imagens ficam salvas permanentemente no projeto!**

---

**Dúvidas?** Leia: `INSTALACAO_SERVIDOR.md`
