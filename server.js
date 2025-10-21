// server.js - Servidor simples para upload de imagens
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Servir arquivos estáticos do projeto

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

  // Obter dimensões da imagem
  const sharp = require('sharp');
  sharp(req.file.path)
    .metadata()
    .then(metadata => {
      res.json({
        success: true,
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
        width: metadata.width,
        height: metadata.height
      });
    })
    .catch(err => {
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

// Rota para admin (redireciona /admin para /admin.html)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Rota para confirmação (redireciona /confirmacao para /confirmacao.html)
app.get('/confirmacao', (req, res) => {
  res.sendFile(path.join(__dirname, 'confirmacao.html'));
});

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
