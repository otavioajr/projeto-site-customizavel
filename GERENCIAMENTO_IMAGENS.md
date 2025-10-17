# 📸 Gerenciamento de Imagens - LGPD Compliant

## 🔒 Por que usar esta funcionalidade?

Se você não quer hospedar suas imagens em sites públicos por questões de **privacidade** ou **LGPD**, pode fazer upload diretamente no admin. As imagens ficam armazenadas localmente no seu navegador.

---

## ✨ Funcionalidades

### 1. **Upload de Imagens**
- ✅ Clique ou arraste imagens para a área de upload
- ✅ Suporta múltiplos arquivos
- ✅ Formatos aceitos: JPG, PNG, GIF, WebP
- ✅ Tamanho máximo: 5MB por imagem
- ✅ Preview automático

### 2. **Visualização**
- 📸 Preview da imagem
- 📝 Nome do arquivo
- 📏 Dimensões (largura x altura)
- 💾 Tamanho em KB

### 3. **Gerenciamento**
- 📋 Copiar nome da imagem (1 clique)
- 🗑️ Excluir imagem individual
- 🗑️ Limpar todas as imagens
- 📥 Exportar backup (JSON)
- 📤 Importar backup (JSON)

---

## 🎯 Como Usar

### Passo 1: Fazer Upload
1. Acesse o **Admin** → Aba **"Imagens"**
2. Clique na área de upload ou arraste suas imagens
3. Aguarde o upload e visualize o preview

### Passo 2: Copiar Nome da Imagem
1. Localize a imagem na grade
2. Clique no botão **"📋 Copiar Nome"**
3. O nome será copiado para sua área de transferência

### Passo 3: Usar na Home
1. Vá para a aba **"Home"**
2. Encontre o campo de imagem que deseja preencher (ex: Hero, Sobre, Galeria)
3. **Cole o nome EXATAMENTE como aparece** (ex: `hero-background.jpg`)
4. Clique em **"Salvar Home"**
5. A imagem será carregada automaticamente!

---

## 📋 Exemplos de Uso

### Exemplo 1: Imagem do Hero
```
1. Upload: hero-montanha.jpg
2. Copiar nome: "hero-montanha.jpg"
3. Colar no campo "URL da Imagem de Fundo"
4. Salvar
```

### Exemplo 2: Imagem Sobre
```
1. Upload: perfil-guia.png
2. Copiar nome: "perfil-guia.png"
3. Colar no campo "URL da Imagem" da seção Sobre
4. Salvar
```

### Exemplo 3: Galeria
```
1. Upload: trilha-1.jpg, trilha-2.jpg, trilha-3.jpg
2. Copiar cada nome e colar nos campos da Galeria
3. Salvar
```

---

## 🔄 Sistema Inteligente

O sistema detecta automaticamente se você está usando:

### URLs Externas
- Se começar com `http://` ou `https://` → Busca da internet
- Exemplo: `https://images.unsplash.com/photo-123.jpg`

### Imagens Locais
- Se for apenas um nome de arquivo → Busca no armazenamento local
- Exemplo: `minha-foto.jpg`

**Você pode misturar!** Use URLs externas em alguns campos e imagens locais em outros.

---

## 💾 Backup e Restauração

### Exportar Backup
1. Clique em **"📥 Exportar Backup"**
2. Um arquivo JSON será baixado
3. Guarde em local seguro

### Importar Backup
1. Clique em **"📤 Importar Backup"**
2. Selecione o arquivo JSON exportado
3. As imagens serão restauradas

**⚠️ Importante:** Faça backup regularmente! As imagens ficam apenas no navegador.

---

## ⚠️ Limitações e Avisos

### Armazenamento Local
- ✅ **Vantagem:** Privacidade total, sem upload para servidores externos
- ⚠️ **Limitação:** Imagens ficam apenas neste navegador
- ⚠️ **Atenção:** Se limpar o cache do navegador, as imagens serão perdidas

### Quando Limpar o Cache
Se você limpar o cache do navegador:
1. As imagens serão perdidas
2. Você precisará fazer upload novamente
3. **Solução:** Sempre mantenha um backup exportado!

### Trocar de Navegador
Se você acessar o admin de outro navegador ou computador:
1. As imagens não estarão disponíveis
2. Você precisará importar o backup
3. Ou fazer upload novamente

---

## 📊 Limites Técnicos

| Item | Limite |
|------|--------|
| Tamanho por imagem | 5MB |
| Formatos | JPG, PNG, GIF, WebP |
| Quantidade | Ilimitada* |
| Armazenamento total | ~5-10MB** |

\* *Limitado pelo espaço do localStorage do navegador*  
\** *Varia por navegador, geralmente 5-10MB*

---

## 🎨 Tamanhos Recomendados

Para melhor performance, otimize suas imagens antes do upload:

| Uso | Tamanho Recomendado | Proporção |
|-----|---------------------|-----------|
| Hero (Fundo) | 1920x1080px | 16:9 |
| Sobre | 600x600px | 1:1 (quadrada) |
| Galeria | 400x400px | 1:1 (quadrada) |
| Ícones | 64x64px | 1:1 (SVG preferível) |

**Dica:** Use [TinyPNG.com](https://tinypng.com) para comprimir imagens antes do upload.

---

## 🔧 Solução de Problemas

### Imagem não aparece na Home
1. ✅ Verifique se o nome está **exatamente igual** (maiúsculas/minúsculas importam)
2. ✅ Confirme que a imagem está na aba "Imagens"
3. ✅ Tente copiar o nome novamente e colar
4. ✅ Recarregue a página

### Erro ao fazer upload
1. ✅ Verifique o tamanho (máx. 5MB)
2. ✅ Confirme o formato (JPG, PNG, GIF, WebP)
3. ✅ Tente com outra imagem
4. ✅ Limpe o cache e tente novamente

### Imagens desapareceram
1. ✅ Verifique se não limpou o cache do navegador
2. ✅ Importe o último backup
3. ✅ Faça upload novamente

---

## 🆚 Comparação: Local vs Externa

### Imagens Locais (Upload no Admin)
✅ **Vantagens:**
- Privacidade total (LGPD compliant)
- Sem dependência de serviços externos
- Controle total sobre as imagens
- Sem necessidade de conta em sites externos

⚠️ **Desvantagens:**
- Limitado ao navegador atual
- Requer backup manual
- Limite de armazenamento (~5-10MB)

### Imagens Externas (URLs)
✅ **Vantagens:**
- Acessível de qualquer navegador
- Sem limite de armazenamento
- Backup automático no serviço externo
- Melhor para muitas imagens

⚠️ **Desvantagens:**
- Imagens públicas na internet
- Dependência de serviços externos
- Possíveis questões de LGPD
- Requer conta em sites de hospedagem

---

## 💡 Boas Práticas

1. **📥 Faça backup regularmente**
   - Exporte suas imagens semanalmente
   - Guarde o arquivo JSON em local seguro

2. **🎨 Otimize antes de fazer upload**
   - Redimensione para o tamanho recomendado
   - Comprima para reduzir o tamanho
   - Use formatos adequados (JPG para fotos, PNG para logos)

3. **📝 Use nomes descritivos**
   - ✅ Bom: `hero-trilha-montanha.jpg`
   - ❌ Ruim: `IMG_1234.jpg`

4. **🔄 Mantenha organizado**
   - Delete imagens não utilizadas
   - Use nomes consistentes
   - Documente quais imagens estão em uso

5. **⚖️ Escolha a melhor opção**
   - Imagens sensíveis → Upload local
   - Imagens públicas → URLs externas
   - Misture conforme necessário

---

## 🚀 Fluxo Completo

```
1. Admin → Aba "Imagens"
2. Upload da imagem
3. Copiar nome (ex: "foto.jpg")
4. Admin → Aba "Home"
5. Colar nome no campo desejado
6. Salvar Home
7. Preview atualiza automaticamente
8. ✅ Imagem aparece no site!
```

---

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Consulte a seção "Solução de Problemas"
2. Verifique se seguiu todos os passos
3. Tente exportar/importar backup
4. Em último caso, faça upload novamente

---

**Data de Implementação:** 2025-10-08  
**Versão:** 1.0  
**Compatibilidade:** Todos os navegadores modernos
