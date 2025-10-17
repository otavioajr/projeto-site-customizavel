# 🚀 Instalação e Configuração do Servidor

## 📋 Pré-requisitos

- Node.js instalado (versão 14 ou superior)
- npm ou yarn

## 🔧 Instalação

### 1. Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

Isso instalará:
- `express` - Servidor web
- `multer` - Upload de arquivos
- `cors` - Permitir requisições cross-origin
- `sharp` - Processamento de imagens
- `nodemon` - Reiniciar servidor automaticamente (dev)

### 2. Iniciar o Servidor

#### Modo Produção:
```bash
npm start
```

#### Modo Desenvolvimento (com auto-reload):
```bash
npm run dev
```

O servidor iniciará em: **http://localhost:3000**

## 📁 Estrutura de Pastas

```
projeto-leo/
├── uploads/              ← Imagens ficam aqui (criada automaticamente)
├── assets/
│   ├── css/
│   └── js/
├── server.js             ← Servidor Node.js
├── admin.html            ← Painel admin
├── index.html            ← Página principal
└── package.json
```

## 🖼️ Como Funciona o Upload de Imagens

### 1. Upload
- Usuário faz upload no admin
- Arquivo é salvo em `uploads/`
- Nome do arquivo é retornado

### 2. Uso
- Usuário copia o nome do arquivo
- Cola no campo de imagem da Home
- Sistema busca em `/uploads/nome-arquivo.jpg`

### 3. Armazenamento
- Imagens ficam em `uploads/`
- **Permanentes** - não dependem do navegador
- Faça backup copiando a pasta `uploads/`

## 🔒 Segurança

### Validações Implementadas:
- ✅ Apenas imagens (JPG, PNG, GIF, WebP)
- ✅ Tamanho máximo: 5MB
- ✅ Nomes de arquivo sanitizados
- ✅ Pasta uploads isolada

### Backup:
```bash
# Copiar pasta uploads para backup
cp -r uploads/ backup-uploads-$(date +%Y%m%d)/
```

## 🌐 Deploy em Produção

### Vercel (Recomendado)

⚠️ **IMPORTANTE:** Vercel é serverless e não suporta upload de arquivos persistentes.

**Opções:**

#### Opção 1: Usar Vercel Blob Storage
```bash
npm install @vercel/blob
```

#### Opção 2: Usar Cloudinary
```bash
npm install cloudinary
```

#### Opção 3: Usar AWS S3
```bash
npm install aws-sdk
```

### Heroku

1. Criar `Procfile`:
```
web: node server.js
```

2. Deploy:
```bash
git push heroku main
```

⚠️ **Nota:** Heroku também tem filesystem efêmero. Use add-on de storage.

### VPS (DigitalOcean, AWS EC2, etc.)

1. Instalar Node.js no servidor
2. Clonar repositório
3. Instalar dependências: `npm install`
4. Usar PM2 para manter rodando:
```bash
npm install -g pm2
pm2 start server.js
pm2 save
pm2 startup
```

## 🔄 Migração de localStorage para Servidor

Se você já tinha imagens no localStorage:

1. Exporte as imagens antigas (se possível)
2. Faça upload manual de cada imagem
3. Atualize os nomes nos campos da Home

## 📝 Variáveis de Ambiente (Opcional)

Crie um arquivo `.env`:

```env
PORT=3000
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

Atualize `server.js` para usar:
```javascript
require('dotenv').config();
const PORT = process.env.PORT || 3000;
```

## 🐛 Troubleshooting

### Erro: "Cannot find module 'express'"
```bash
npm install
```

### Erro: "EACCES: permission denied"
```bash
sudo chmod -R 755 uploads/
```

### Porta 3000 já em uso
Altere a porta no `server.js`:
```javascript
const PORT = 3001; // ou outra porta
```

### Imagens não aparecem
1. Verifique se o servidor está rodando
2. Abra http://localhost:3000/uploads/ no navegador
3. Verifique se as imagens estão lá
4. Confirme que o nome está correto

## 📊 Monitoramento

### Ver logs do servidor:
```bash
# Se usando PM2
pm2 logs

# Se rodando direto
# Os logs aparecem no terminal
```

### Ver imagens uploadadas:
```bash
ls -lh uploads/
```

### Espaço usado:
```bash
du -sh uploads/
```

## 🔐 Produção - Checklist

- [ ] Alterar senha do admin
- [ ] Configurar HTTPS
- [ ] Configurar CORS adequadamente
- [ ] Limitar taxa de upload (rate limiting)
- [ ] Configurar backup automático
- [ ] Monitorar espaço em disco
- [ ] Configurar logs
- [ ] Testar recuperação de desastres

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do servidor
2. Confirme que todas as dependências estão instaladas
3. Teste localmente primeiro
4. Verifique permissões de pasta

---

**Versão:** 1.0  
**Data:** 2025-10-08
