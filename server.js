// server.js - Servidor simples para upload de imagens
// Carregar variáveis de ambiente de forma otimizada
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' 
  : process.env.NODE_ENV === 'homol' ? '.env.homol' 
  : '.env';
console.log('DEBUG: Loading dotenv');
require('dotenv').config({ path: envFile });

console.log('DEBUG: Loading express');
const express = require('express');
console.log('DEBUG: Loading multer');
const multer = require('multer');
console.log('DEBUG: Loading path');
const path = require('path');
console.log('DEBUG: Loading fs');
const fs = require('fs');
console.log('DEBUG: Loading cors');
const cors = require('cors');
console.log('DEBUG: cors type:', typeof cors);
try {
  console.log('DEBUG: cors value:', cors);
} catch (e) {
  console.log('DEBUG: error printing cors:', e);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Exibir ambiente atual
console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`📊 Supabase URL: ${process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 30) + '...' : 'NÃO CONFIGURADO'}`);

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos apenas dos diretórios necessários
app.use('/assets', express.static(path.join(__dirname, 'assets'), { maxAge: 0 }));
app.use('/p', express.static(path.join(__dirname, 'p'), { maxAge: 0 }));

// Servir arquivos HTML da raiz
const htmlFiles = ['index.html', 'admin.html', 'confirmacao.html', 'adicionar-exemplo.html', 'exemplo-inscricao-multipla.html', 'test-supabase.html'];
htmlFiles.forEach(file => {
  app.get(`/${file}`, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

// Criar pasta uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configurar multer para upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Manter o nome original do arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato não suportado. Use JPG, PNG, GIF ou WebP.'));
    }
  }
});

// Rota para upload de imagens
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  // Retornar informações do arquivo (sharp removido temporariamente)
  res.json({
    success: true,
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: `/uploads/${req.file.filename}`,
    size: req.file.size,
    width: 0,
    height: 0
  });
});

// Rota para listar imagens
app.get('/api/images', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao listar imagens' });
    }

    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    const images = imageFiles.map(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        path: `/uploads/${file}`,
        size: stats.size,
        uploadedAt: stats.mtime
      };
    });

    res.json({ images });
  });
});

// Rota para deletar imagem
app.delete('/api/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Imagem não encontrada' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar imagem' });
    }
    res.json({ success: true, message: 'Imagem deletada com sucesso' });
  });
});

// Servir arquivos da pasta uploads
app.use('/uploads', express.static(uploadsDir));

// Rota para servir config.js (para desenvolvimento local)
app.get('/config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  const config = `
window.SUPABASE_URL = '${process.env.SUPABASE_URL || ''}';
window.SUPABASE_ANON_KEY = '${process.env.SUPABASE_ANON_KEY || ''}';
window.SUPABASE_SCHEMA = '${process.env.SUPABASE_SCHEMA || 'public'}';
  `.trim();
  res.status(200).send(config);
});

// Rota raiz serve o index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Atalhos sem .html
app.get('/admin', (req, res) => res.redirect('/admin.html'));
app.get('/confirmacao', (req, res) => res.redirect('/confirmacao.html'));

// Exportar app para Vercel (serverless)
module.exports = app;

// Iniciar servidor apenas se executado diretamente (não em serverless)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📁 Pasta de uploads: ${uploadsDir}`);
    console.log(`📸 Admin disponível em: http://localhost:${PORT}/admin.html`);
  });
}
