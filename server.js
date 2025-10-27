// server.js - Servidor simples para upload de imagens (usando Supabase Storage)
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://yzsgoxrrhjiiulmnwrfo.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6c2dveHJyaGppaXVsbW53cmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMjQ1NDksImV4cCI6MjA3NjYwMDU0OX0.5F8gLht7b-Ig01Bxr0zTTSPeCfdYvBH81P-Z2afysOo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Servir arquivos estáticos do projeto

// Configurar multer para upload em memória (não salva em disco)
const upload = multer({
  storage: multer.memoryStorage(),
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

// Rota para upload de imagens (usando Supabase Storage)
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const ext = path.extname(req.file.originalname);
    const filename = `${timestamp}-${random}${ext}`;

    // Upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload do Supabase:', error);
      return res.status(500).json({ 
        error: 'Erro ao fazer upload da imagem',
        details: error.message 
      });
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filename);

    // Tentar obter dimensões da imagem
    let metadata = { width: 0, height: 0 };
    try {
      const sharp = require('sharp');
      const imageMetadata = await sharp(req.file.buffer).metadata();
      metadata.width = imageMetadata.width;
      metadata.height = imageMetadata.height;
    } catch (err) {
      console.warn('Não foi possível obter dimensões da imagem:', err.message);
    }

    res.json({
      success: true,
      filename: filename,
      originalName: req.file.originalname,
      path: publicUrl,
      url: publicUrl,
      size: req.file.size,
      width: metadata.width,
      height: metadata.height
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ 
      error: 'Erro ao fazer upload da imagem',
      details: error.message 
    });
  }
});

// Rota para listar imagens (usando Supabase Storage)
app.get('/api/images', async (req, res) => {
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Erro ao listar imagens do Supabase:', error);
      return res.status(500).json({ 
        error: 'Erro ao listar imagens',
        details: error.message 
      });
    }

    // Adicionar URL pública para cada imagem
    const images = data
      .filter(file => file.name && !file.name.startsWith('.')) // Filtrar arquivos ocultos
      .map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(file.name);

        return {
          filename: file.name,
          path: publicUrl,
          url: publicUrl,
          size: file.metadata?.size || 0,
          uploadedAt: file.created_at
        };
      });

    res.json({ images });
  } catch (error) {
    console.error('Erro ao listar imagens:', error);
    res.status(500).json({ 
      error: 'Erro ao listar imagens',
      details: error.message 
    });
  }
});

// Rota para deletar imagem (usando Supabase Storage)
app.delete('/api/images/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;

    const { error } = await supabase.storage
      .from('images')
      .remove([filename]);

    if (error) {
      console.error('Erro ao deletar imagem do Supabase:', error);
      return res.status(500).json({ 
        error: 'Erro ao deletar imagem',
        details: error.message 
      });
    }

    res.json({ success: true, message: 'Imagem deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    res.status(500).json({ 
      error: 'Erro ao deletar imagem',
      details: error.message 
    });
  }
});

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
    console.log(`☁️  Usando Supabase Storage para imagens`);
    console.log(`📸 Admin disponível em: http://localhost:${PORT}/admin.html`);
  });
}
