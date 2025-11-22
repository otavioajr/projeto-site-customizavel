/**
 * Setup global para testes
 * Executado antes de cada arquivo de teste
 */

import { vi } from 'vitest';

// Mock do localStorage
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => {
    localStorageMock.store[key] = String(value);
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
  get length() {
    return Object.keys(localStorageMock.store).length;
  },
  key: vi.fn((index) => Object.keys(localStorageMock.store)[index] || null)
};

// Aplicar mock do localStorage globalmente
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock de window para variáveis globais do Supabase
global.window = {
  ...global.window,
  SUPABASE_URL: 'https://test-project.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SCHEMA: 'public',
  location: {
    origin: 'http://localhost:3001',
    href: 'http://localhost:3001',
    hash: '',
    search: ''
  }
};

// Limpar mocks e localStorage antes de cada teste
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// Exportar para uso nos testes
export { localStorageMock };
