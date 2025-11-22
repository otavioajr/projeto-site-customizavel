/**
 * Testes unitários para helpers de page.js
 * Funções de normalização e categorização de campos de formulário
 */

import { describe, it, expect } from 'vitest';
import {
  slugify,
  normalizeSession,
  normalizeField,
  formatSessionTime,
  buildSessionDisplay,
  isParticipantField,
  categorizeFields,
  normalizeLabelKey,
  extractFieldBase
} from '../../assets/js/utils/helpers.js';

// ========== TESTES ==========

describe('slugify', () => {
  it('deve converter texto para slug', () => {
    expect(slugify('Olá Mundo')).toBe('ola-mundo');
  });

  it('deve remover acentos', () => {
    expect(slugify('Ação Mágica')).toBe('acao-magica');
  });

  it('deve remover caracteres especiais', () => {
    expect(slugify('Test@123!#$%')).toBe('test-123');
  });

  it('deve converter para minúsculas', () => {
    expect(slugify('MAIÚSCULAS')).toBe('maiusculas');
  });

  it('deve remover hífens extras no início e fim', () => {
    expect(slugify('---teste---')).toBe('teste');
  });

  it('deve retornar string vazia para input vazio', () => {
    expect(slugify('')).toBe('');
    // Nota: slugify não trata null/undefined - usa valor padrão '' do parâmetro
    expect(slugify()).toBe(''); // sem argumento usa ''
  });

  it('deve lidar com números', () => {
    expect(slugify('Item 123')).toBe('item-123');
  });
});

describe('normalizeSession', () => {
  it('deve normalizar sessão completa', () => {
    const session = {
      id: 'session-1',
      title: 'Manhã',
      start: '08:00',
      end: '12:00',
      capacity: 10,
      notes: 'Lanche incluído'
    };

    const result = normalizeSession(session, 'fallback');

    expect(result).toEqual({
      id: 'session-1',
      title: 'Manhã',
      start: '08:00',
      end: '12:00',
      capacity: 10,
      notes: 'Lanche incluído'
    });
  });

  it('deve usar fallback id quando não fornecido', () => {
    const session = { title: 'Tarde' };
    const result = normalizeSession(session, 'my-fallback-id');
    expect(result.id).toBe('my-fallback-id');
  });

  it('deve converter capacity string para número', () => {
    const session = { capacity: '15' };
    const result = normalizeSession(session, 'test');
    expect(result.capacity).toBe(15);
  });

  it('deve usar 0 para capacity inválida', () => {
    const session = { capacity: 'invalid' };
    const result = normalizeSession(session, 'test');
    expect(result.capacity).toBe(0);
  });

  it('deve lidar com sessão undefined', () => {
    const result = normalizeSession(undefined, 'fallback');
    expect(result.id).toBe('fallback');
    expect(result.capacity).toBe(0);
  });
});

describe('normalizeField', () => {
  it('deve normalizar campo de texto simples', () => {
    const field = {
      label: 'Nome',
      required: true
    };

    const result = normalizeField(field, 0);

    expect(result.label).toBe('Nome');
    expect(result.type).toBe('text');
    expect(result.required).toBe(true);
    expect(result.id).toBe('field_0_nome');
  });

  it('deve preservar id existente', () => {
    const field = {
      id: 'custom-id',
      label: 'Email'
    };

    const result = normalizeField(field, 0);
    expect(result.id).toBe('custom-id');
  });

  it('deve normalizar campo de sessions', () => {
    const field = {
      type: 'sessions',
      label: 'Bateria',
      sessions: [
        { id: 's1', title: 'Manhã', capacity: '10' },
        { title: 'Tarde', capacity: 5 }
      ]
    };

    const result = normalizeField(field, 0);

    expect(result.type).toBe('sessions');
    expect(result.sessions).toHaveLength(2);
    expect(result.sessions[0].id).toBe('s1');
    expect(result.sessions[0].capacity).toBe(10);
    expect(result.sessions[1].capacity).toBe(5);
  });

  it('deve inicializar options como array vazio se não fornecido', () => {
    const field = { label: 'Campo' };
    const result = normalizeField(field, 0);
    expect(result.options).toEqual([]);
  });

  it('deve converter required para boolean', () => {
    expect(normalizeField({ required: 1 }, 0).required).toBe(true);
    expect(normalizeField({ required: 0 }, 0).required).toBe(false);
    expect(normalizeField({ required: 'yes' }, 0).required).toBe(true);
    expect(normalizeField({ required: '' }, 0).required).toBe(false);
  });
});

describe('formatSessionTime', () => {
  it('deve formatar hora com minutos', () => {
    expect(formatSessionTime('8:30')).toBe('08:30');
    expect(formatSessionTime('14:5')).toBe('14:05');
  });

  it('deve formatar hora sem minutos', () => {
    expect(formatSessionTime('9:')).toBe('09:00');
  });

  it('deve retornar string vazia para input inválido', () => {
    expect(formatSessionTime('')).toBe('');
    expect(formatSessionTime(null)).toBe('');
    expect(formatSessionTime(undefined)).toBe('');
  });

  it('deve retornar input se não contiver :', () => {
    expect(formatSessionTime('1430')).toBe('1430');
  });
});

describe('buildSessionDisplay', () => {
  it('deve construir display completo', () => {
    const session = {
      title: 'Manhã',
      start: '08:00',
      end: '12:00',
      notes: 'Lanche incluído'
    };

    const result = buildSessionDisplay(session);
    expect(result).toBe('Manhã (08:00 - 12:00) – Lanche incluído');
  });

  it('deve construir display sem notes', () => {
    const session = {
      title: 'Tarde',
      start: '14:00',
      end: '18:00'
    };

    const result = buildSessionDisplay(session);
    expect(result).toBe('Tarde (14:00 - 18:00)');
  });

  it('deve construir display apenas com título', () => {
    const session = { title: 'Bateria 1' };
    expect(buildSessionDisplay(session)).toBe('Bateria 1');
  });

  it('deve construir display sem título mas com horário', () => {
    const session = { start: '10:00', end: '11:00' };
    expect(buildSessionDisplay(session)).toBe('10:00 - 11:00');
  });
});

describe('isParticipantField', () => {
  it('deve identificar campos de participante (padrão)', () => {
    expect(isParticipantField({ label: 'Nome' })).toBe(true);
    expect(isParticipantField({ label: 'Email' })).toBe(true);
    expect(isParticipantField({ label: 'Idade' })).toBe(true);
    expect(isParticipantField({ label: 'CPF' })).toBe(true);
  });

  it('deve identificar campos do responsável', () => {
    expect(isParticipantField({ label: 'Nome do Responsável' })).toBe(false);
    expect(isParticipantField({ label: 'Telefone do Responsável' })).toBe(false);
    expect(isParticipantField({ label: 'Email do Responsável' })).toBe(false);
    expect(isParticipantField({ label: 'Contato Principal' })).toBe(false);
  });

  it('deve ser case-insensitive', () => {
    expect(isParticipantField({ label: 'NOME DO RESPONSÁVEL' })).toBe(false);
    expect(isParticipantField({ label: 'nome do responsavel' })).toBe(false);
  });

  it('deve lidar com acentos', () => {
    expect(isParticipantField({ label: 'Organizador' })).toBe(false);
  });
});

describe('categorizeFields', () => {
  it('deve separar campos de sessão como groupFields', () => {
    const fields = [
      { type: 'text', label: 'Nome' },
      { type: 'sessions', label: 'Bateria' },
      { type: 'email', label: 'Email' }
    ];

    const { groupFields, participantFields } = categorizeFields(fields);

    expect(groupFields).toHaveLength(1);
    expect(groupFields[0].type).toBe('sessions');
    expect(participantFields).toHaveLength(2);
  });

  it('deve colocar campos do responsável em groupFields', () => {
    const fields = [
      { type: 'text', label: 'Nome do Responsável' },
      { type: 'text', label: 'Nome' },
      { type: 'tel', label: 'Telefone do Responsável' }
    ];

    const { groupFields, participantFields } = categorizeFields(fields);

    expect(groupFields).toHaveLength(2);
    expect(participantFields).toHaveLength(1);
    expect(participantFields[0].label).toBe('Nome');
  });

  it('deve retornar arrays vazios para lista vazia', () => {
    const { groupFields, participantFields } = categorizeFields([]);
    expect(groupFields).toEqual([]);
    expect(participantFields).toEqual([]);
  });
});

describe('normalizeLabelKey', () => {
  it('deve normalizar para minúsculas', () => {
    expect(normalizeLabelKey('NOME')).toBe('nome');
  });

  it('deve remover acentos', () => {
    expect(normalizeLabelKey('Ação')).toBe('acao');
    expect(normalizeLabelKey('Telefônico')).toBe('telefonico');
  });

  it('deve normalizar espaços múltiplos', () => {
    expect(normalizeLabelKey('Nome   Completo')).toBe('nome completo');
  });

  it('deve fazer trim', () => {
    expect(normalizeLabelKey('  teste  ')).toBe('teste');
  });
});

describe('extractFieldBase', () => {
  it('deve remover sufixo "do responsável"', () => {
    expect(extractFieldBase('Nome do Responsável')).toBe('nome');
    expect(extractFieldBase('Telefone do Responsável')).toBe('telefone');
  });

  it('deve remover sufixo "do participante"', () => {
    expect(extractFieldBase('Email do Participante')).toBe('email');
  });

  it('deve mapear sinônimos', () => {
    expect(extractFieldBase('WhatsApp')).toBe('telefone');
    expect(extractFieldBase('Celular')).toBe('telefone');
    expect(extractFieldBase('E-mail')).toBe('email');
    expect(extractFieldBase('Documento')).toBe('cpf');
  });

  it('deve preservar labels sem sufixo', () => {
    expect(extractFieldBase('Nome')).toBe('nome');
    expect(extractFieldBase('Idade')).toBe('idade');
  });

  it('deve lidar com múltiplos sufixos', () => {
    expect(extractFieldBase('Telefone de Contato do Responsável')).toBe('telefone');
  });
});

describe('Integração: Detecção de campos duplicados', () => {
  it('deve identificar "Nome" e "Nome do Responsável" como semanticamente iguais', () => {
    const base1 = extractFieldBase('Nome');
    const base2 = extractFieldBase('Nome do Responsável');
    expect(base1).toBe(base2);
  });

  it('deve identificar "WhatsApp" e "Telefone" como semanticamente iguais', () => {
    const base1 = extractFieldBase('WhatsApp');
    const base2 = extractFieldBase('Telefone');
    expect(base1).toBe(base2);
  });

  it('deve diferenciar campos realmente distintos', () => {
    const base1 = extractFieldBase('Nome');
    const base2 = extractFieldBase('Idade');
    expect(base1).not.toBe(base2);
  });
});
