#!/usr/bin/env node
// Script de diagnóstico para identificar lentidão no carregamento

console.log('🔍 Diagnóstico de Lentidão do Servidor\n');
console.log('═'.repeat(60));

const tests = [
  { name: 'dotenv', test: () => require('dotenv') },
  { name: 'express', test: () => require('express') },
  { name: 'multer', test: () => require('multer') },
  { name: 'cors', test: () => require('cors') },
  { name: 'path', test: () => require('path') },
  { name: 'fs', test: () => require('fs') },
];

let totalTime = 0;

tests.forEach(({ name, test }) => {
  const start = Date.now();
  try {
    test();
    const elapsed = Date.now() - start;
    totalTime += elapsed;
    const status = elapsed > 1000 ? '⚠️ ' : '✅';
    console.log(`${status} ${name.padEnd(15)} ${elapsed.toString().padStart(6)} ms`);
  } catch (error) {
    console.log(`❌ ${name.padEnd(15)} ERRO: ${error.message}`);
  }
});

console.log('═'.repeat(60));
console.log(`⏱️  Tempo total: ${totalTime} ms`);

if (totalTime > 5000) {
  console.log('\n⚠️  ATENÇÃO: Tempo de carregamento muito alto!');
  console.log('💡 Sugestões:');
  console.log('   1. Reinstalar dependências: rm -rf node_modules && npm install');
  console.log('   2. Verificar versão do Node.js: node --version');
  console.log('   3. Limpar cache: npm cache clean --force');
}





