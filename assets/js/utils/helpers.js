/**
 * helpers.js - Funções utilitárias compartilhadas
 * Este módulo contém funções puras que podem ser testadas isoladamente
 */

// ============= HELPERS DE STRING/SLUG =============

/**
 * Converte texto para slug (URL-friendly)
 * @param {string} text - Texto a ser convertido
 * @returns {string} - Slug gerado
 */
export function slugify(text = '') {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normaliza label para comparação (lowercase, sem acentos, trim)
 * @param {string} label - Label a normalizar
 * @returns {string} - Label normalizado
 */
export function normalizeLabelKey(label = '') {
  return label
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============= HELPERS DE SESSÃO/BATERIA =============

/**
 * Normaliza dados de uma sessão
 * @param {object} session - Dados da sessão
 * @param {string} fallbackId - ID fallback se não fornecido
 * @returns {object} - Sessão normalizada
 */
export function normalizeSession(session, fallbackId) {
  const capacity = typeof session?.capacity === 'number'
    ? session.capacity
    : parseInt(session?.capacity || '0', 10) || 0;

  return {
    id: session?.id || `${fallbackId}`,
    title: session?.title || '',
    start: session?.start || '',
    end: session?.end || '',
    capacity,
    notes: session?.notes || ''
  };
}

/**
 * Formata horário de sessão (HH:MM)
 * @param {string} timeString - String de horário
 * @returns {string} - Horário formatado
 */
export function formatSessionTime(timeString) {
  if (!timeString || typeof timeString !== 'string') return '';
  if (!timeString.includes(':')) return timeString;
  const [hour, minute] = timeString.split(':');
  return `${hour.padStart(2, '0')}:${(minute || '00').padStart(2, '0')}`;
}

/**
 * Constrói string de exibição para sessão
 * @param {object} session - Dados da sessão
 * @returns {string} - String formatada para exibição
 */
export function buildSessionDisplay(session) {
  const timeStart = formatSessionTime(session.start);
  const timeEnd = formatSessionTime(session.end);
  const timeRange = timeStart && timeEnd ? `${timeStart} - ${timeEnd}` : '';
  let display = session.title || '';
  if (timeRange) {
    display += display ? ` (${timeRange})` : timeRange;
  }
  if (session.notes) {
    display += display ? ` – ${session.notes}` : session.notes;
  }
  return display;
}

// ============= HELPERS DE CAMPO DE FORMULÁRIO =============

/**
 * Normaliza campo de formulário
 * @param {object} field - Dados do campo
 * @param {number} index - Índice do campo
 * @returns {object} - Campo normalizado
 */
export function normalizeField(field, index) {
  const fallbackId = `field_${index}_${slugify(field?.label || 'campo')}`;
  const normalized = {
    ...field,
    id: field?.id || fallbackId,
    type: field?.type || 'text',
    label: field?.label || '',
    placeholder: field?.placeholder || '',
    required: Boolean(field?.required),
    options: Array.isArray(field?.options) ? field.options : [],
    sessions: []
  };

  if (normalized.type === 'sessions') {
    const sessions = Array.isArray(field?.sessions) ? field.sessions : [];
    normalized.sessions = sessions.map((session, sessionIndex) => {
      const sessionFallbackId = `${normalized.id}_session_${sessionIndex}`;
      return normalizeSession(session, sessionFallbackId);
    });
  }

  return normalized;
}

/**
 * Verifica se um campo é do participante (vs responsável)
 * @param {object} field - Campo de formulário
 * @returns {boolean} - True se é campo de participante
 */
export function isParticipantField(field) {
  const label = (field.label || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const responsibleKeywords = [
    'responsavel',
    'organizador',
    'contato principal',
    'contato do responsavel',
    'whatsapp do responsavel',
    'telefone do responsavel',
    'email do responsavel',
    'dados do responsavel'
  ];

  if (responsibleKeywords.some(keyword => label.includes(keyword))) {
    return false;
  }

  return true;
}

/**
 * Categoriza campos em grupo (responsável) e participante
 * @param {array} fields - Lista de campos
 * @returns {object} - { groupFields, participantFields }
 */
export function categorizeFields(fields) {
  const groupFields = [];
  const participantFields = [];

  fields.forEach(field => {
    if (field.type === 'sessions') {
      groupFields.push(field);
    } else if (isParticipantField(field)) {
      participantFields.push(field);
    } else {
      groupFields.push(field);
    }
  });

  return { groupFields, participantFields };
}

/**
 * Extrai base semântica de um label (remove sufixos como "do responsável")
 * @param {string} label - Label do campo
 * @returns {string} - Base semântica
 */
export function extractFieldBase(label) {
  const normalized = normalizeLabelKey(label);

  const suffixesToRemove = [
    'do responsavel',
    'da responsavel',
    'dos responsaveis',
    'das responsaveis',
    'do organizador',
    'da organizador',
    'do participante',
    'da participante',
    'dos participantes',
    'das participantes',
    'principal',
    'de contato',
    'para contato'
  ];

  let base = normalized;
  suffixesToRemove.forEach(suffix => {
    base = base.replace(new RegExp(`\\s*${suffix}\\s*$`, 'g'), '');
    base = base.replace(new RegExp(`\\s*${suffix}\\s+`, 'g'), ' ');
  });

  base = base.trim();

  const synonymMap = {
    'telefone/whatsapp': 'telefone',
    'whatsapp/telefone': 'telefone',
    'whatsapp': 'telefone',
    'celular': 'telefone',
    'fone': 'telefone',
    'e-mail': 'email',
    'correio eletronico': 'email',
    'cpf/rg': 'cpf',
    'rg/cpf': 'cpf',
    'documento': 'cpf',
    'doc': 'cpf'
  };

  return synonymMap[base] || base;
}

// ============= HELPERS DE URL/IMAGEM =============

/**
 * Resolve URL de imagem (externa, data URI, local ou filename)
 * @param {string} urlOrName - URL ou nome do arquivo
 * @returns {string|null} - URL resolvida
 */
export function resolveImageUrl(urlOrName) {
  if (!urlOrName) return null;

  // Se começar com http:// ou https://, é uma URL externa
  if (urlOrName.startsWith('http://') || urlOrName.startsWith('https://')) {
    return urlOrName;
  }

  // Se começar com data:, já é base64
  if (urlOrName.startsWith('data:')) {
    return urlOrName;
  }

  // Se começar com /, é um caminho absoluto
  if (urlOrName.startsWith('/')) {
    return urlOrName;
  }

  // Caso contrário, assumir que é um nome de arquivo na pasta uploads
  return `/uploads/${urlOrName}`;
}

/**
 * Valida se é uma URL de imagem válida
 * @param {string} url - URL a validar
 * @returns {boolean} - True se válida
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;

  // URLs externas
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }

  // Data URIs de imagem
  if (url.startsWith('data:image/')) {
    return true;
  }

  // Caminhos locais
  if (url.startsWith('/')) {
    return true;
  }

  // Nomes de arquivo com extensão de imagem
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const hasImageExtension = imageExtensions.some(ext =>
    url.toLowerCase().endsWith(ext)
  );

  return hasImageExtension;
}

// ============= HELPERS DE VALIDAÇÃO =============

/**
 * Valida arquivo de imagem (tipo e tamanho)
 * @param {object} file - Objeto file com type e size
 * @returns {object} - { valid, error? }
 */
export function validateImageFile(file) {
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

/**
 * Parseia valor de sequência
 * @param {*} value - Valor a parsear
 * @returns {number|null} - Número válido ou null
 */
export function parseSequenceValue(value) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

// ============= HELPERS DE CAPACIDADE =============

/**
 * Verifica limite de capacidade global
 * @param {number} currentCount - Contagem atual
 * @param {number} maxParticipants - Máximo permitido
 * @returns {object} - { available, remaining?, error? }
 */
export function checkCapacityLimit(currentCount, maxParticipants) {
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

/**
 * Verifica capacidade de sessão específica
 * @param {array} sessionInscriptions - Inscrições existentes na sessão
 * @param {number} capacity - Capacidade da sessão
 * @param {number} groupSize - Tamanho do grupo a adicionar
 * @returns {object} - { totalParticipants, availableSlots, canAccommodate }
 */
export function checkSessionCapacity(sessionInscriptions, capacity, groupSize = 1) {
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

// ============= HELPERS DE UUID =============

/**
 * Gera UUID v4
 * @returns {string} - UUID gerado
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============= HELPERS DE DADOS DE INSCRIÇÃO =============

/**
 * Prepara dados de inscrição para salvar
 * @param {string} pageSlug - Slug da página
 * @param {object} formData - Dados do formulário
 * @param {number} sequence - Número de sequência
 * @param {string} groupId - ID do grupo (opcional)
 * @returns {object} - Dados formatados para inscrição
 */
export function prepareInscriptionData(pageSlug, formData, sequence, groupId = null) {
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

// ============= HELPERS DE LOCALSTORAGE =============

/**
 * Obtém dados do localStorage com fallback
 * @param {string} key - Chave do localStorage
 * @param {*} defaultValue - Valor padrão se não encontrado
 * @returns {*} - Dados ou valor padrão
 */
export function getFromLocalStorageWithFallback(key, defaultValue = []) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored);
  } catch (error) {
    console.error(`Erro ao ler ${key} do localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Salva dados no localStorage
 * @param {string} key - Chave do localStorage
 * @param {*} data - Dados a salvar
 * @returns {boolean} - True se salvou com sucesso
 */
export function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Erro ao salvar ${key} no localStorage:`, error);
    return false;
  }
}

// ============= HELPERS DE TEMA =============

/**
 * Aplica variáveis CSS de tema
 * @param {object} theme - Objeto com cores do tema
 * @param {object} styleObject - Objeto de estilo existente (opcional)
 * @returns {object} - Objeto com variáveis CSS
 */
export function applyThemeVars(theme, styleObject = {}) {
  if (!theme) return styleObject;

  if (theme.primary) styleObject['--color-primary'] = theme.primary;
  if (theme.secondary) styleObject['--color-secondary'] = theme.secondary;
  if (theme.text) styleObject['--color-text'] = theme.text;
  if (theme.background) styleObject['--color-bg'] = theme.background;

  return styleObject;
}

/**
 * Aplica tema diretamente no document.documentElement
 * @param {object} theme - Objeto com cores do tema
 */
export function applyThemeToDocument(theme) {
  if (!theme) return;
  const r = document.documentElement.style;
  if (theme.primary) r.setProperty('--color-primary', theme.primary);
  if (theme.secondary) r.setProperty('--color-secondary', theme.secondary);
  if (theme.text) r.setProperty('--color-text', theme.text);
  if (theme.background) r.setProperty('--color-bg', theme.background);
}
