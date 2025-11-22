/**
 * Testes unitários para helpers e lógica de supabase.js
 * Estas funções são extraídas para teste isolado
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ========== FUNÇÕES EXTRAÍDAS DE supabase.js PARA TESTE ==========

function parseSequenceValue(value) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Validação de imagem (extraída de uploadImage)
function validateImageFile(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato não suportado. Use JPG, PNG, GIF ou WebP.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 5MB.'
    };
  }

  return { valid: true };
}

// Cálculo de capacidade (lógica extraída de saveInscription)
function checkCapacityLimit(currentCount, maxParticipants) {
  if (maxParticipants <= 0) {
    return { available: true };
  }

  if (currentCount >= maxParticipants) {
    return {
      available: false,
      error: `LIMIT_REACHED:As vagas esgotaram! Esta atividade tinha limite de ${maxParticipants} ${maxParticipants === 1 ? 'vaga' : 'vagas'}.`
    };
  }

  return {
    available: true,
    remaining: maxParticipants - currentCount
  };
}

// Cálculo de vagas de sessão (lógica extraída)
function checkSessionCapacity(sessionInscriptions, capacity, groupSize = 1) {
  let totalParticipants = 0;

  if (Array.isArray(sessionInscriptions)) {
    totalParticipants = sessionInscriptions.reduce((sum, inscription) => {
      const inscriptionGroupSize = inscription?.form_data?._group_size || 1;
      return sum + parseInt(inscriptionGroupSize, 10);
    }, 0);
  }

  const availableSlots = Math.max(capacity - totalParticipants, 0);

  return {
    totalParticipants,
    availableSlots,
    canAccommodate: availableSlots >= groupSize
  };
}

// Preparação de dados de inscrição (lógica extraída)
function prepareInscriptionData(pageSlug, formData, sequence, groupId = null) {
  return {
    page_slug: pageSlug,
    group_id: groupId || generateUUID(),
    is_responsible: true,
    responsible_id: null,
    participant_number: 1,
    total_participants: formData._group_size || 1,
    form_data: {
      ...formData,
      _sequence: sequence,
      _group_size: formData._group_size || 1
    },
    status: 'pending',
    created_at: new Date().toISOString()
  };
}

// Fallback para localStorage (lógica extraída de getPages)
function getFromLocalStorageWithFallback(key, defaultValue = []) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored);
  } catch (error) {
    console.error(`Erro ao ler ${key} do localStorage:`, error);
    return defaultValue;
  }
}

// Salvar no localStorage (lógica extraída)
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Erro ao salvar ${key} no localStorage:`, error);
    return false;
  }
}

// ========== TESTES ==========

describe('parseSequenceValue', () => {
  it('deve parsear número válido', () => {
    expect(parseSequenceValue('5')).toBe(5);
    expect(parseSequenceValue('100')).toBe(100);
    expect(parseSequenceValue(42)).toBe(42);
  });

  it('deve retornar null para valores inválidos', () => {
    expect(parseSequenceValue('abc')).toBe(null);
    expect(parseSequenceValue('')).toBe(null);
    expect(parseSequenceValue(null)).toBe(null);
    expect(parseSequenceValue(undefined)).toBe(null);
  });

  it('deve retornar null para zero e negativos', () => {
    expect(parseSequenceValue('0')).toBe(null);
    expect(parseSequenceValue('-5')).toBe(null);
    expect(parseSequenceValue(0)).toBe(null);
    expect(parseSequenceValue(-1)).toBe(null);
  });

  it('deve lidar com floats', () => {
    expect(parseSequenceValue('3.7')).toBe(3);
    expect(parseSequenceValue(3.9)).toBe(3);
  });
});

describe('generateUUID', () => {
  it('deve gerar UUID no formato correto', () => {
    const uuid = generateUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    expect(uuid).toMatch(uuidRegex);
  });

  it('deve gerar UUIDs únicos', () => {
    const uuids = new Set();
    for (let i = 0; i < 100; i++) {
      uuids.add(generateUUID());
    }
    expect(uuids.size).toBe(100);
  });

  it('deve ter versão 4 (posição correta)', () => {
    const uuid = generateUUID();
    expect(uuid[14]).toBe('4');
  });

  it('deve ter variante correta (8, 9, a ou b)', () => {
    const uuid = generateUUID();
    expect(['8', '9', 'a', 'b']).toContain(uuid[19]);
  });
});

describe('validateImageFile', () => {
  it('deve aceitar JPEG', () => {
    const file = { type: 'image/jpeg', size: 1024 };
    expect(validateImageFile(file).valid).toBe(true);
  });

  it('deve aceitar PNG', () => {
    const file = { type: 'image/png', size: 1024 };
    expect(validateImageFile(file).valid).toBe(true);
  });

  it('deve aceitar GIF', () => {
    const file = { type: 'image/gif', size: 1024 };
    expect(validateImageFile(file).valid).toBe(true);
  });

  it('deve aceitar WebP', () => {
    const file = { type: 'image/webp', size: 1024 };
    expect(validateImageFile(file).valid).toBe(true);
  });

  it('deve rejeitar PDF', () => {
    const file = { type: 'application/pdf', size: 1024 };
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Formato não suportado');
  });

  it('deve rejeitar arquivo maior que 5MB', () => {
    const file = { type: 'image/jpeg', size: 6 * 1024 * 1024 };
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('muito grande');
  });

  it('deve aceitar arquivo de exatamente 5MB', () => {
    const file = { type: 'image/jpeg', size: 5 * 1024 * 1024 };
    expect(validateImageFile(file).valid).toBe(true);
  });
});

describe('checkCapacityLimit', () => {
  it('deve permitir quando não há limite', () => {
    const result = checkCapacityLimit(50, 0);
    expect(result.available).toBe(true);
  });

  it('deve permitir quando há vagas', () => {
    const result = checkCapacityLimit(5, 10);
    expect(result.available).toBe(true);
    expect(result.remaining).toBe(5);
  });

  it('deve bloquear quando limite atingido', () => {
    const result = checkCapacityLimit(10, 10);
    expect(result.available).toBe(false);
    expect(result.error).toContain('LIMIT_REACHED');
  });

  it('deve bloquear quando excede limite', () => {
    const result = checkCapacityLimit(15, 10);
    expect(result.available).toBe(false);
  });

  it('deve usar singular para 1 vaga', () => {
    const result = checkCapacityLimit(1, 1);
    // A mensagem é "tinha limite de 1 vaga." (singular no final)
    expect(result.error).toMatch(/limite de 1 vaga\./);
  });

  it('deve usar plural para múltiplas vagas', () => {
    const result = checkCapacityLimit(5, 5);
    expect(result.error).toContain('5 vagas');
  });
});

describe('checkSessionCapacity', () => {
  it('deve calcular capacidade corretamente para inscrições individuais', () => {
    const inscriptions = [
      { form_data: { _group_size: 1 } },
      { form_data: { _group_size: 1 } },
      { form_data: { _group_size: 1 } }
    ];

    const result = checkSessionCapacity(inscriptions, 10);

    expect(result.totalParticipants).toBe(3);
    expect(result.availableSlots).toBe(7);
    expect(result.canAccommodate).toBe(true);
  });

  it('deve calcular capacidade corretamente para grupos', () => {
    const inscriptions = [
      { form_data: { _group_size: 3 } },
      { form_data: { _group_size: 2 } }
    ];

    const result = checkSessionCapacity(inscriptions, 10);

    expect(result.totalParticipants).toBe(5);
    expect(result.availableSlots).toBe(5);
  });

  it('deve usar 1 como padrão quando _group_size não existe', () => {
    const inscriptions = [
      { form_data: {} },
      { form_data: { nome: 'Teste' } }
    ];

    const result = checkSessionCapacity(inscriptions, 10);

    expect(result.totalParticipants).toBe(2);
  });

  it('deve verificar se pode acomodar grupo específico', () => {
    const inscriptions = [
      { form_data: { _group_size: 8 } }
    ];

    // 8 ocupados, 2 disponíveis, tentar acomodar 3
    const result = checkSessionCapacity(inscriptions, 10, 3);

    expect(result.canAccommodate).toBe(false);
  });

  it('deve retornar 0 vagas quando lotado', () => {
    const inscriptions = [
      { form_data: { _group_size: 10 } }
    ];

    const result = checkSessionCapacity(inscriptions, 10);

    expect(result.availableSlots).toBe(0);
    expect(result.canAccommodate).toBe(false);
  });

  it('deve lidar com array vazio', () => {
    const result = checkSessionCapacity([], 10);

    expect(result.totalParticipants).toBe(0);
    expect(result.availableSlots).toBe(10);
  });

  it('deve lidar com null/undefined', () => {
    expect(checkSessionCapacity(null, 10).totalParticipants).toBe(0);
    expect(checkSessionCapacity(undefined, 10).totalParticipants).toBe(0);
  });
});

describe('prepareInscriptionData', () => {
  it('deve preparar dados básicos de inscrição', () => {
    const formData = { nome: 'João', email: 'joao@test.com' };
    const result = prepareInscriptionData('teste-page', formData, 1);

    expect(result.page_slug).toBe('teste-page');
    expect(result.form_data.nome).toBe('João');
    expect(result.form_data._sequence).toBe(1);
    expect(result.form_data._group_size).toBe(1);
    expect(result.is_responsible).toBe(true);
    expect(result.status).toBe('pending');
  });

  it('deve usar group_id fornecido', () => {
    const groupId = 'custom-group-id';
    const result = prepareInscriptionData('page', {}, 1, groupId);

    expect(result.group_id).toBe(groupId);
  });

  it('deve gerar group_id quando não fornecido', () => {
    const result = prepareInscriptionData('page', {}, 1);

    expect(result.group_id).toBeTruthy();
    expect(result.group_id.length).toBe(36); // UUID length
  });

  it('deve preservar _group_size do formData', () => {
    const formData = { nome: 'Maria', _group_size: 5 };
    const result = prepareInscriptionData('page', formData, 1);

    expect(result.form_data._group_size).toBe(5);
    expect(result.total_participants).toBe(5);
  });

  it('deve incluir created_at', () => {
    const before = new Date().toISOString();
    const result = prepareInscriptionData('page', {}, 1);
    const after = new Date().toISOString();

    expect(result.created_at >= before).toBe(true);
    expect(result.created_at <= after).toBe(true);
  });
});

describe('getFromLocalStorageWithFallback', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve retornar dados armazenados', () => {
    const data = [{ id: 1, name: 'Test' }];
    localStorage.setItem('test_key', JSON.stringify(data));

    const result = getFromLocalStorageWithFallback('test_key');

    expect(result).toEqual(data);
  });

  it('deve retornar valor padrão quando chave não existe', () => {
    const result = getFromLocalStorageWithFallback('nonexistent');
    expect(result).toEqual([]);
  });

  it('deve usar valor padrão customizado', () => {
    const defaultValue = { empty: true };
    const result = getFromLocalStorageWithFallback('nonexistent', defaultValue);
    expect(result).toEqual(defaultValue);
  });

  it('deve retornar valor padrão para JSON inválido', () => {
    localStorage.setItem('invalid_json', 'not valid json {{{');

    const result = getFromLocalStorageWithFallback('invalid_json', []);

    expect(result).toEqual([]);
  });
});

describe('saveToLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve salvar dados corretamente', () => {
    const data = { name: 'Test', value: 123 };
    const result = saveToLocalStorage('test_key', data);

    expect(result).toBe(true);
    expect(JSON.parse(localStorage.getItem('test_key'))).toEqual(data);
  });

  it('deve salvar arrays', () => {
    const data = [1, 2, 3, 4, 5];
    saveToLocalStorage('array_key', data);

    expect(JSON.parse(localStorage.getItem('array_key'))).toEqual(data);
  });
});

describe('Integração: Fluxo de capacidade de sessão', () => {
  it('deve calcular corretamente cenário de lotação gradual', () => {
    const capacity = 10;
    let inscriptions = [];

    // Primeira inscrição: grupo de 4
    inscriptions.push({ form_data: { _group_size: 4 } });
    let result = checkSessionCapacity(inscriptions, capacity);
    expect(result.availableSlots).toBe(6);

    // Segunda inscrição: grupo de 3
    inscriptions.push({ form_data: { _group_size: 3 } });
    result = checkSessionCapacity(inscriptions, capacity);
    expect(result.availableSlots).toBe(3);

    // Terceira inscrição: tentar grupo de 4 (deve falhar)
    result = checkSessionCapacity(inscriptions, capacity, 4);
    expect(result.canAccommodate).toBe(false);

    // Terceira inscrição: grupo de 3 (deve passar)
    result = checkSessionCapacity(inscriptions, capacity, 3);
    expect(result.canAccommodate).toBe(true);

    // Após adicionar o terceiro grupo
    inscriptions.push({ form_data: { _group_size: 3 } });
    result = checkSessionCapacity(inscriptions, capacity);
    expect(result.availableSlots).toBe(0);
    expect(result.canAccommodate).toBe(false);
  });
});

describe('Integração: Validação de inscrição completa', () => {
  it('deve validar fluxo completo de inscrição individual', () => {
    // 1. Verificar capacidade
    const capacityCheck = checkCapacityLimit(5, 10);
    expect(capacityCheck.available).toBe(true);

    // 2. Verificar sessão
    const sessionCheck = checkSessionCapacity([], 10, 1);
    expect(sessionCheck.canAccommodate).toBe(true);

    // 3. Preparar dados
    const formData = { nome: 'Teste', email: 'teste@test.com' };
    const inscriptionData = prepareInscriptionData('page-slug', formData, 6);

    expect(inscriptionData.form_data._sequence).toBe(6);
    expect(inscriptionData.status).toBe('pending');
  });

  it('deve validar fluxo de inscrição em grupo', () => {
    // 1. Verificar capacidade para grupo de 5
    const capacityCheck = checkCapacityLimit(3, 10);
    expect(capacityCheck.available).toBe(true);
    expect(capacityCheck.remaining).toBe(7);

    // 2. Verificar sessão para grupo de 5
    const existingInscriptions = [
      { form_data: { _group_size: 3 } }
    ];
    const sessionCheck = checkSessionCapacity(existingInscriptions, 10, 5);
    expect(sessionCheck.availableSlots).toBe(7);
    expect(sessionCheck.canAccommodate).toBe(true);

    // 3. Preparar dados com _group_size
    const formData = {
      nome: 'Responsável',
      _group_size: 5
    };
    const inscriptionData = prepareInscriptionData('page-slug', formData, 4);

    expect(inscriptionData.form_data._group_size).toBe(5);
    expect(inscriptionData.total_participants).toBe(5);
  });
});
