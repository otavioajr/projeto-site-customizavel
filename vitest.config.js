import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Ambiente para testes de browser (jsdom simula DOM)
    environment: 'jsdom',

    // Diretório de testes
    include: ['tests/**/*.test.js'],

    // Excluir node_modules
    exclude: ['node_modules', 'dist'],

    // Configurações de cobertura
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'assets/js/**/*.js',
        'server.js',
        'api/**/*.js'
      ],
      exclude: [
        'node_modules',
        'tests',
        'uploads'
      ]
    },

    // Globals para não precisar importar describe, it, expect
    globals: true,

    // Setup files executados antes dos testes
    setupFiles: ['./tests/setup.js'],

    // Timeout para testes async
    testTimeout: 10000,

    // Reporter para output legível
    reporters: ['verbose']
  }
});
