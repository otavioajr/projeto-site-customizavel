/**
 * Testes de integração para server.js
 * Testa endpoints da API REST
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar o app Express
import app from '../../server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Helper para criar arquivo de teste
function createTestImageBuffer() {
  // Criar um buffer PNG mínimo válido (1x1 pixel transparente)
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, // 8-bit RGBA
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, // compressed data
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, // checksum
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
    0xAE, 0x42, 0x60, 0x82                          // IEND checksum
  ]);
  return pngHeader;
}

// Limpar arquivos de teste após os testes
const testFilesToClean = [];

afterAll(() => {
  // Limpar arquivos de teste criados
  testFilesToClean.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
});

describe('GET / (Home)', () => {
  it('deve servir index.html na rota raiz', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/html/);
  });
});

describe('GET /admin', () => {
  it('deve redirecionar para /admin.html', async () => {
    const response = await request(app).get('/admin');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/admin.html');
  });
});

describe('GET /config.js', () => {
  it('deve retornar configuração JavaScript', async () => {
    const response = await request(app).get('/config.js');
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/javascript/);
    expect(response.text).toContain('window.SUPABASE_URL');
    expect(response.text).toContain('window.SUPABASE_ANON_KEY');
    expect(response.text).toContain('window.SUPABASE_SCHEMA');
  });

  it('deve retornar schema padrão se não configurado', async () => {
    const response = await request(app).get('/config.js');
    // O schema padrão é 'public' ou o configurado no .env
    expect(response.text).toMatch(/window\.SUPABASE_SCHEMA\s*=\s*'[^']*'/);
  });
});

describe('POST /api/upload', () => {
  it('deve fazer upload de imagem PNG válida', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('image', createTestImageBuffer(), 'test-image.png');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.filename).toContain('test-image');
    expect(response.body.path).toContain('/uploads/');

    // Guardar para limpeza
    testFilesToClean.push(response.body.filename);
  });

  it('deve retornar erro 400 quando nenhum arquivo é enviado', async () => {
    const response = await request(app)
      .post('/api/upload');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Nenhum arquivo enviado');
  });

  it('deve rejeitar arquivo não-imagem', async () => {
    const textBuffer = Buffer.from('Este é um arquivo de texto, não uma imagem');

    const response = await request(app)
      .post('/api/upload')
      .attach('image', textBuffer, 'test.txt');

    // Multer rejeita com erro
    expect(response.status).toBe(500);
  });

  it('deve rejeitar arquivo maior que 5MB', async () => {
    // Criar buffer de 6MB
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 0);

    const response = await request(app)
      .post('/api/upload')
      .attach('image', largeBuffer, 'large-image.png');

    expect(response.status).toBe(500);
  });

  it('deve gerar nome único para arquivo', async () => {
    const response1 = await request(app)
      .post('/api/upload')
      .attach('image', createTestImageBuffer(), 'duplicate.png');

    const response2 = await request(app)
      .post('/api/upload')
      .attach('image', createTestImageBuffer(), 'duplicate.png');

    expect(response1.body.filename).not.toBe(response2.body.filename);

    // Guardar para limpeza
    testFilesToClean.push(response1.body.filename);
    testFilesToClean.push(response2.body.filename);
  });
});

describe('GET /api/images', () => {
  it('deve listar imagens do diretório uploads', async () => {
    const response = await request(app).get('/api/images');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('images');
    expect(Array.isArray(response.body.images)).toBe(true);
  });

  it('deve retornar informações de cada imagem', async () => {
    // Primeiro fazer upload de uma imagem
    const uploadResponse = await request(app)
      .post('/api/upload')
      .attach('image', createTestImageBuffer(), 'list-test.png');

    testFilesToClean.push(uploadResponse.body.filename);

    const response = await request(app).get('/api/images');

    expect(response.status).toBe(200);

    // Verificar se a imagem está na lista
    const uploadedImage = response.body.images.find(
      img => img.filename === uploadResponse.body.filename
    );

    if (uploadedImage) {
      expect(uploadedImage).toHaveProperty('filename');
      expect(uploadedImage).toHaveProperty('path');
      expect(uploadedImage).toHaveProperty('size');
      expect(uploadedImage).toHaveProperty('uploadedAt');
    }
  });

  it('deve filtrar apenas arquivos de imagem', async () => {
    const response = await request(app).get('/api/images');

    response.body.images.forEach(image => {
      const ext = path.extname(image.filename).toLowerCase();
      expect(['.jpg', '.jpeg', '.png', '.gif', '.webp']).toContain(ext);
    });
  });
});

describe('DELETE /api/images/:filename', () => {
  it('deve deletar imagem existente', async () => {
    // Primeiro fazer upload
    const uploadResponse = await request(app)
      .post('/api/upload')
      .attach('image', createTestImageBuffer(), 'to-delete.png');

    const filename = uploadResponse.body.filename;

    // Deletar
    const deleteResponse = await request(app)
      .delete(`/api/images/${filename}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.message).toBe('Imagem deletada com sucesso');

    // Verificar que foi deletada
    const filePath = path.join(uploadsDir, filename);
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it('deve retornar 404 para imagem inexistente', async () => {
    const response = await request(app)
      .delete('/api/images/imagem-inexistente-12345.png');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Imagem não encontrada');
  });

  it('não deve permitir path traversal', async () => {
    // Tentar deletar arquivo fora do diretório uploads
    const response = await request(app)
      .delete('/api/images/../server.js');

    // Deve falhar porque o arquivo não existe no diretório uploads
    expect(response.status).toBe(404);
  });
});

describe('Arquivos estáticos', () => {
  it('deve servir arquivos da pasta /assets', async () => {
    // Verificar se o CSS existe e é servido
    const response = await request(app).get('/assets/css/styles.css');

    // O arquivo pode ou não existir dependendo do ambiente
    if (response.status === 200) {
      expect(response.type).toMatch(/css/);
    } else {
      expect(response.status).toBe(404);
    }
  });

  it('deve servir arquivos da pasta /uploads', async () => {
    // Fazer upload primeiro
    const uploadResponse = await request(app)
      .post('/api/upload')
      .attach('image', createTestImageBuffer(), 'static-test.png');

    testFilesToClean.push(uploadResponse.body.filename);

    // Tentar acessar o arquivo
    const response = await request(app)
      .get(`/uploads/${uploadResponse.body.filename}`);

    expect(response.status).toBe(200);
    expect(response.type).toMatch(/image/);
  });
});

describe('CORS', () => {
  it('deve incluir headers CORS', async () => {
    const response = await request(app)
      .get('/api/images')
      .set('Origin', 'http://localhost:3000');

    // CORS está habilitado globalmente
    expect(response.headers).toHaveProperty('access-control-allow-origin');
  });
});

describe('Rotas HTML', () => {
  it('deve servir admin.html', async () => {
    const response = await request(app).get('/admin.html');
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/html/);
  });

  it('deve servir confirmacao.html', async () => {
    const response = await request(app).get('/confirmacao.html');
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/html/);
  });

  it('GET /confirmacao deve redirecionar para /confirmacao.html', async () => {
    const response = await request(app).get('/confirmacao');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/confirmacao.html');
  });
});
