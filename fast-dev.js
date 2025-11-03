#!/usr/bin/env node

// fast-dev.js - Servidor de desenvolvimento rápido sem nodemon
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

let server = null;
let restartTimer = null;
let isRestarting = false;

function startServer() {
  if (isRestarting) return;
  
  isRestarting = true;
  
  if (server) {
    server.kill('SIGTERM');
  }

  // Pequeno delay para garantir que o processo anterior terminou
  setTimeout(() => {
    console.log('\n🚀 Iniciando servidor...');
    
    server = spawn('node', ['dev-server.js'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });

    server.on('error', (err) => {
      console.error('❌ Erro ao iniciar servidor:', err);
    });

    server.on('exit', () => {
      server = null;
    });
    
    isRestarting = false;
  }, 100);
}

function restartServer(filename) {
  // Debouncing: cancela restart anterior e agenda novo
  if (restartTimer) {
    clearTimeout(restartTimer);
  }
  
  restartTimer = setTimeout(() => {
    console.log(`\n📝 Arquivo modificado: ${filename}`);
    console.log('🔄 Reiniciando servidor...');
    startServer();
  }, 300); // 300ms de debounce
}

function watchFiles() {
  const watchFiles = ['./server.js', './dev-server.js'];
  const watchDir = './api';
  
  // Observar arquivos individuais
  watchFiles.forEach(file => {
    fs.watchFile(file, { interval: 500 }, (curr, prev) => {
      // Verificar se realmente mudou
      if (curr.mtime > prev.mtime) {
        restartServer(path.basename(file));
      }
    });
  });
  
  // Observar diretório api
  if (fs.existsSync(watchDir)) {
    fs.watch(watchDir, { recursive: false }, (eventType, filename) => {
      if (eventType === 'change' && filename && filename.endsWith('.js')) {
        restartServer(`api/${filename}`);
      }
    });
  }
  
  console.log('👀 Observando mudanças em:', [...watchFiles, watchDir].join(', '));
}

// Iniciar servidor
startServer();
watchFiles();

// Lidar com encerramento gracioso
process.on('SIGINT', () => {
  console.log('\n👋 Encerrando servidor...');
  if (restartTimer) clearTimeout(restartTimer);
  if (server) server.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (restartTimer) clearTimeout(restartTimer);
  if (server) server.kill('SIGTERM');
  process.exit(0);
});
