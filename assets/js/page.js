// page.js - Renderização de páginas internas (Canva e Formulários)
import { 
  getAllPages, 
  saveInscription as saveInscriptionSupabase, 
  saveMultipleInscriptions,
  getHomeContent, 
  getInscriptions 
} from './supabase.js';

// ==================== HELPERS ====================
function showErrorModal(message, title = 'Atenção') {
  const overlay = document.getElementById('error-modal-overlay');
  const messageEl = document.getElementById('error-modal-message');
  const titleEl = document.getElementById('error-modal-title');
  const closeBtn = document.getElementById('error-modal-close');

  if (!overlay || !messageEl || !closeBtn) {
    alert(message);
    return;
  }

  // Detectar tipo de erro para definir título e ícone apropriados
  let errorTitle = title;
  let iconEmoji = '⚠️';
  
  if (message.includes('Vagas esgotadas') || message.includes('esgotaram') || message.includes('lotadas')) {
    errorTitle = 'Vagas Esgotadas';
    iconEmoji = '🚫';
  } else if (message.includes('erro') || message.includes('Erro') || message.includes('não foi salva')) {
    errorTitle = 'Erro';
    iconEmoji = '❌';
  } else if (message.includes('conexão') || message.includes('internet') || message.includes('rede')) {
    errorTitle = 'Erro de Conexão';
    iconEmoji = '📡';
  } else if (message.includes('permissão')) {
    errorTitle = 'Erro de Permissão';
    iconEmoji = '🔒';
  }

  // Atualizar título
  if (titleEl) {
    titleEl.textContent = errorTitle;
  }

  // Atualizar ícone
  const iconEl = overlay.querySelector('.error-modal-icon');
  if (iconEl) {
    iconEl.textContent = iconEmoji;
  }

  // Atualizar mensagem
  messageEl.textContent = message;
  
  // Mostrar modal
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');

  // Focar no botão para acessibilidade
  setTimeout(() => {
    closeBtn.focus();
  }, 100);

  const close = () => {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', handleEscape);
  };

  closeBtn.onclick = close;
  overlay.onclick = (e) => {
    if (e.target === overlay) close();
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      close();
    }
  };
  document.addEventListener('keydown', handleEscape);
}

function slugify(text = '') {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeSession(session, fallbackId) {
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

function normalizeField(field, index) {
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

function formatSessionTime(timeString) {
  if (!timeString || typeof timeString !== 'string') return '';
  if (!timeString.includes(':')) return timeString;
  const [hour, minute] = timeString.split(':');
  return `${hour.padStart(2, '0')}:${(minute || '00').padStart(2, '0')}`;
}

function buildSessionDisplay(session) {
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

// Verifica se um campo é "por participante" (repete para cada pessoa)
// Baseado em palavras-chave EXPLÍCITAS no label do campo
function isParticipantField(field) {
  const label = (field.label || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Palavras-chave que indicam campo ÚNICO (do responsável/organizador)
  // Devem ser específicas para evitar falsos positivos
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

  // Se tem palavra de responsável, é campo único
  if (responsibleKeywords.some(keyword => label.includes(keyword))) {
    return false;
  }

  // Default: campos sem palavra-chave específica do responsável são de participante (repetíveis)
  // Isso inclui campos comuns como "Nome", "Idade", "CPF", "Email", etc.
  return true;
}

// Separa campos em dois grupos: campos do grupo vs. campos por participante
function categorizeFields(fields) {
  const groupFields = [];
  const participantFields = [];

  fields.forEach(field => {
    // Sessions sempre são do grupo (FASE 1: todos na mesma bateria)
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

function normalizeLabelKey(label = '') {
  return label
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extrai a "base semântica" de um campo para comparação
// Remove sufixos como "do responsável" e aplica sinônimos
function extractFieldBase(label) {
  const normalized = normalizeLabelKey(label);

  // Remove sufixos comuns que indicam contexto (responsável, participante, etc.)
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
    // Remove o sufixo da string, com espaços opcionais ao redor
    base = base.replace(new RegExp(`\\s*${suffix}\\s*$`, 'g'), '');
    base = base.replace(new RegExp(`\\s*${suffix}\\s+`, 'g'), ' ');
  });

  base = base.trim();

  // Mapeamento de sinônimos para normalizar variações
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

// Renderiza um único campo de formulário
function renderSingleField(field, index, options = {}) {
  const { prefix = '', sessionUsage = {}, maxParticipants = 0, remainingTotal = null, blockedSessionFields = [], requiredSessionFieldIds = [] } = options;
  const fieldId = prefix ? `${prefix}-field-${index}` : `field-${index}`;
  const fieldName = prefix ? `${prefix}_${field.id}` : field.id;
  const requiredLabel = field.required ? '<span style="color: red;">*</span>' : '';
  let inputHtml = '';

  switch (field.type) {
    case 'textarea':
      inputHtml = `<textarea id="${fieldId}" name="${fieldName}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}></textarea>`;
      break;

    case 'select': {
      const options = field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
      inputHtml = `
        <select id="${fieldId}" name="${fieldName}" ${field.required ? 'required' : ''}>
          <option value="">Selecione...</option>
          ${options}
        </select>
      `;
      break;
    }

    case 'radio':
      inputHtml = field.options.map((opt, i) => `
        <label class="radio-label">
          <input type="radio" name="${fieldName}" value="${opt}" ${field.required && i === 0 ? 'required' : ''}> ${opt}
        </label>
      `).join('');
      break;

    case 'checkbox':
      inputHtml = `
        <label class="checkbox-label">
          <input type="checkbox" id="${fieldId}" name="${fieldName}" ${field.required ? 'required' : ''}> ${field.placeholder || 'Aceito'}
        </label>
      `;
      break;

    case 'checkbox-group':
      inputHtml = field.options.map(opt => `
        <label class="checkbox-label">
          <input type="checkbox" name="${fieldName}[]" value="${opt}"> ${opt}
        </label>
      `).join('');
      break;

    case 'sessions': {
      const sessions = field.sessions || [];
      const usageForField = sessionUsage[field.id] || {};
      let requiredAssigned = false;
      let hasAvailableSessions = false;
      const globalRemaining = maxParticipants > 0 ? remainingTotal : null;

      const sessionOptionsHtml = sessions.map(session => {
        const used = usageForField[session.id] || 0;
        const remainingCapacity = Math.max(session.capacity - used, 0);
        const availableSlots = globalRemaining !== null
          ? Math.min(remainingCapacity, globalRemaining)
          : remainingCapacity;
        const isFull = availableSlots <= 0;
        const availabilityText = isFull
          ? 'Esgotado'
          : `${availableSlots} ${availableSlots === 1 ? 'vaga' : 'vagas'}`;
        let requiredAttr = '';

        if (!isFull && field.required && !requiredAssigned) {
          requiredAttr = 'required';
          requiredAssigned = true;
        }

        if (!isFull) {
          hasAvailableSessions = true;
        }

        const timeStart = formatSessionTime(session.start);
        const timeEnd = formatSessionTime(session.end);
        const timeLabel = timeStart && timeEnd ? `${timeStart} - ${timeEnd}` : '';

        return `
          <label class="session-option ${isFull ? 'session-option--full' : ''}">
            <input type="radio" name="session-${field.id}" value="${session.id}" ${requiredAttr} ${isFull ? 'disabled' : ''}>
            <div class="session-option-content">
              <span class="session-option-title">${session.title || 'Bateria'}</span>
              ${timeLabel ? `<span class="session-option-time">${timeLabel}</span>` : ''}
              <span class="session-option-capacity ${isFull ? 'session-option-capacity--full' : ''}">${availabilityText}</span>
              ${session.notes ? `<span class="session-option-notes">${session.notes}</span>` : ''}
            </div>
          </label>
        `;
      }).join('');

      if (!hasAvailableSessions) {
        blockedSessionFields.push({ id: field.id, label: field.label || 'Seleção de baterias' });
      }

      const emptyState = sessions.length === 0
        ? '<p class="session-group-warning">Nenhuma bateria foi configurada para este campo.</p>'
        : '';

      const warningState = !hasAvailableSessions
        ? '<p class="session-group-warning">Todas as vagas para esta seleção estão esgotadas.</p>'
        : '';

      inputHtml = `
        <div class="sessions-group" data-field-id="${field.id}">
          ${sessionOptionsHtml || emptyState}
          ${warningState}
        </div>
      `;
      break;
    }

    default:
      inputHtml = `<input type="${field.type}" id="${fieldId}" name="${fieldName}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`;
  }

  return `
    <div class="form-field">
      <label ${field.type !== 'radio' && field.type !== 'checkbox-group' && field.type !== 'sessions' ? `for="${fieldId}"` : ''}>${field.label} ${requiredLabel}</label>
      ${inputHtml}
    </div>
  `;
}

// ==================== CARREGAMENTO ====================
async function loadPages() {
  try {
    const pages = await getAllPages();
    return pages || [];
  } catch (e) {
    console.error('Erro ao carregar páginas:', e);
    return loadPagesFromLocal();
  }
}

function loadPagesFromLocal() {
  const raw = localStorage.getItem('pages');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao carregar pages:', e);
    return [];
  }
}

function getSlugFromUrl() {
  let hash = window.location.hash.replace('#', '');
  if (hash) {
    hash = hash.split('?')[0];
    // Decode URI component para slugs com espaços, acentos e caracteres especiais
    return decodeURIComponent(hash);
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

// ==================== RENDER ====================
async function renderPage() {
  const slug = getSlugFromUrl();
  const content = document.getElementById('page-content');

  await loadSiteName();

  if (!slug) {
    showNotFound(content);
    return;
  }

  const pages = await loadPages();
  const page = pages.find(p => p.slug === slug && p.is_active);

  if (!page) {
    showNotFound(content);
    return;
  }
  
  document.title = page.seo_title || page.label;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && page.seo_description) {
    metaDesc.setAttribute('content', page.seo_description);
  }
  
  if (page.is_form && page.form_config) {
    await renderForm(content, page);
  } else {
    content.innerHTML = `
      <div class="canva-container">
        <iframe 
          id="canva-frame" 
          src="${page.canva_embed_url}" 
          allowfullscreen="allowfullscreen" 
          allow="fullscreen"
          loading="lazy">
        </iframe>
      </div>
    `;
  }
}

async function renderForm(container, page) {
  const config = page.form_config || {};
  const rawFields = Array.isArray(config.fields) ? config.fields : [];
  const normalizedFields = rawFields.map((field, index) => normalizeField(field, index));
  const sessionFields = normalizedFields.filter(field => field.type === 'sessions');
  const sessionUsage = {};
  let inscriptions = [];

  const sessionTotalCapacity = sessionFields.reduce((total, field) => {
    if (!Array.isArray(field.sessions)) return total;
    const fieldCapacity = field.sessions.reduce((fieldTotal, session) => {
      const capacity = parseInt(session?.capacity, 10);
      return fieldTotal + (Number.isFinite(capacity) && capacity > 0 ? capacity : 0);
    }, 0);
    return total + fieldCapacity;
  }, 0);

  const maxParticipants = sessionTotalCapacity > 0
    ? sessionTotalCapacity
    : Number(config.max_participants) || 0;

  if (sessionFields.length > 0 || maxParticipants > 0) {
    try {
      const fetchedInscriptions = await getInscriptions(page.slug);
      if (Array.isArray(fetchedInscriptions)) {
        inscriptions = fetchedInscriptions;
      }
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error);
      inscriptions = [];
    }
  }

  if (sessionFields.length > 0) {
    sessionFields.forEach(field => {
      sessionUsage[field.id] = {};
    });

    inscriptions.forEach(inscription => {
      const formData = inscription?.form_data || inscription?.data || {};
      const groupSize = parseInt(formData?._group_size, 10) || 1; // Considerar _group_size para contagem
      sessionFields.forEach(field => {
        const storageKey = `_session_${field.id}`;
        const selectedSessionId = formData?.[storageKey];
        if (selectedSessionId) {
          if (!sessionUsage[field.id][selectedSessionId]) {
            sessionUsage[field.id][selectedSessionId] = 0;
          }
          sessionUsage[field.id][selectedSessionId] += groupSize; // Somar group_size em vez de 1
        }
      });
    });
  }

  // Calcular total de participantes (não de inscrições) para capacidade correta
  const totalInscriptions = Array.isArray(inscriptions)
    ? inscriptions.reduce((sum, inscription) => {
        const formData = inscription?.form_data || inscription?.data || {};
        const groupSize = parseInt(formData?._group_size, 10) || 1;
        return sum + groupSize;
      }, 0)
    : 0;
  const remainingTotal = maxParticipants > 0 ? Math.max(maxParticipants - totalInscriptions, 0) : null;
  const sportFull = maxParticipants > 0 && remainingTotal === 0;

  const blockedSessionFields = [];
  const requiredSessionFieldIds = sessionFields.filter(field => field.required).map(field => field.id);

  // Detectar se permite inscrição em grupo
  const allowMultipleParticipants = config.allow_multiple_participants || false;
  const groupConfig = config.group_config || {};
  const minParticipants = groupConfig.min_participants || 1;
  const maxParticipantsPerGroup = groupConfig.max_participants || 10;

  let fieldsHtml = '';

  if (allowMultipleParticipants) {
    // MODO GRUPO: Renderizar campos separados em grupo e participantes
    const { groupFields, participantFields } = categorizeFields(normalizedFields);
    const responsibleFields = groupFields;

    // Usa comparação semântica para evitar duplicação de campos
    // Ex: "Nome do responsável" e "Nome" têm a mesma base semântica
    const responsibleBaseSet = new Set(responsibleFields.map(field => extractFieldBase(field.label)));
    const responsibleExtraFields = participantFields.filter(field => {
      const participantBase = extractFieldBase(field.label);
      return !responsibleBaseSet.has(participantBase);
    });

    const hasResponsibleFields = responsibleFields.length > 0;
    const hasParticipantFields = participantFields.length > 0;

    // Campo de quantidade
    const quantityOptions = [];
    for (let i = minParticipants; i <= maxParticipantsPerGroup; i++) {
      quantityOptions.push(`<option value="${i}">${i} ${i === 1 ? 'pessoa' : 'pessoas'}</option>`);
    }

    fieldsHtml += `
      <div class="form-field form-field--quantity">
        <label for="participant-quantity">Quantas pessoas vai inscrever? <span style="color: red;">*</span></label>
        <select id="participant-quantity" name="_group_size" required>
          <option value="">Selecione...</option>
          ${quantityOptions.join('')}
        </select>
        <span class="form-hint">👥 Selecione o número de pessoas que participarão da atividade</span>
      </div>

      <div id="post-quantity-sections" style="display: none;">
        <div id="responsible-participates-wrapper" class="form-field form-field--checkbox" style="margin-top: 15px; display: none;">
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="responsible-participates" name="_responsible_participates" checked>
            <span>Eu também vou participar</span>
          </label>
          <span class="form-hint">✅ Marque se você (responsável) também participará. Se desmarcado, você só fornece os dados de contato.</span>
        </div>
    `;

    // Campos do grupo (renderizados uma vez)
    if (hasResponsibleFields) {
      fieldsHtml += '<div id="responsible-contact-fields" class="form-section form-section--group" style="display: none;"><h3 class="form-section-title">Dados do Responsável</h3>';
      responsibleFields.forEach((field, index) => {
        fieldsHtml += renderSingleField(field, index, {
          prefix: 'group',
          sessionUsage,
          maxParticipants,
          remainingTotal,
          blockedSessionFields,
          requiredSessionFieldIds
        });
      });

      // Campos do participante para o próprio responsável (quando ele participa)
      if (responsibleExtraFields.length > 0) {
        fieldsHtml += '<div id="responsible-participant-fields" class="form-section form-section--participant" style="display: none; margin-top: 16px;"><h3 class="form-section-title">Dados do Responsável como Participante</h3>';
        responsibleExtraFields.forEach((field, index) => {
          fieldsHtml += renderSingleField(field, index, { prefix: 'responsible' });
        });
        fieldsHtml += '</div>';
      }

      fieldsHtml += '</div>';
    }

    // Container para campos de participantes (será preenchido dinamicamente via JS)
    if (participantFields.length > 0) {
      fieldsHtml += '<div id="participants-container" class="participants-container"></div>';
    }

    // Fecha o wrapper que só aparece após a escolha de quantidade
    fieldsHtml += '</div>';
  } else {
    // MODO INDIVIDUAL: Renderização original
    normalizedFields.forEach((field, index) => {
      fieldsHtml += renderSingleField(field, index, {
        sessionUsage,
        maxParticipants,
        remainingTotal,
        blockedSessionFields,
        requiredSessionFieldIds
      });
    });
  }

  const blockedRequiredSessionFields = blockedSessionFields.filter(field => requiredSessionFieldIds.includes(field.id));

  let disableSubmission = sportFull;
  if (!disableSubmission) {
    disableSubmission = requiredSessionFieldIds.length > 0 && blockedRequiredSessionFields.length === requiredSessionFieldIds.length;
  }

  const alerts = [];

  if (maxParticipants > 0) {
    if (remainingTotal === 0) {
      alerts.push({ type: 'warning', title: 'Vagas esgotadas', text: `Todas as ${maxParticipants} vagas desta atividade foram preenchidas.` });
    } else {
      alerts.push({ type: 'info', title: 'Vagas disponíveis', text: `${remainingTotal} ${remainingTotal === 1 ? 'vaga disponível' : 'vagas disponíveis'} de ${maxParticipants}.` });
    }
  }

  if (blockedSessionFields.length > 0) {
    alerts.push({
      type: 'warning',
      title: 'Vagas esgotadas',
      text: blockedSessionFields.length === 1
        ? `A seleção "${blockedSessionFields[0].label}" está com todas as baterias lotadas.`
        : `As seleções ${blockedSessionFields.map(field => `"${field.label}"`).join(', ')} estão com todas as baterias lotadas.`
    });
  }

  const availabilityAlert = alerts.length > 0
    ? alerts.map(message => `
      <div class="form-alert form-alert-${message.type}">
        <strong>${message.title}</strong>
        <p>${message.text}</p>
      </div>
    `).join('')
    : '';

  const imageConsentFieldHtml = `
    <div class="form-field form-field--consent">
      <label class="checkbox-label">
        <input type="checkbox" id="image-consent" name="image_consent" required>
        Autorizo o uso da minha imagem e voz em materiais de divulgação desta atividade.
      </label>
      <span class="form-hint">Necessário para participar da atividade.</span>
    </div>
  `;

  container.innerHTML = `
    <div class="form-container">
      <div class="form-header">
        <h1>${config.title}</h1>
        ${config.description ? `<p class="form-description">${config.description}</p>` : ''}
      </div>
      
      <form id="inscription-form" class="inscription-form">
        ${fieldsHtml}
        ${imageConsentFieldHtml}
        ${availabilityAlert}
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" ${disableSubmission ? 'disabled' : ''}>${disableSubmission ? 'Vagas esgotadas' : 'Enviar Inscrição'}</button>
        </div>
      </form>
      
      <div id="form-success" class="form-success" style="display: none;">
        <h2>✅ Inscrição enviada com sucesso!</h2>
        <p>Você receberá uma confirmação em breve.</p>
        <a href="/" class="btn btn-secondary">Voltar à Home</a>
      </div>
    </div>
  `;
  
  const form = document.getElementById('inscription-form');
  const consentCheckbox = form.querySelector('#image-consent');
  const submitButton = form.querySelector('button[type="submit"]');

  if (!disableSubmission && consentCheckbox && submitButton) {
    const updateSubmitState = () => {
      const shouldDisable = !consentCheckbox.checked;
      submitButton.disabled = shouldDisable;
      if (shouldDisable) {
        submitButton.setAttribute('disabled', 'disabled');
      } else {
        submitButton.removeAttribute('disabled');
      }
    };
    updateSubmitState();
    consentCheckbox.addEventListener('change', updateSubmitState);
  }

  // Se modo grupo, adicionar lógica de renderização dinâmica de participantes
  if (allowMultipleParticipants) {
    const quantitySelect = form.querySelector('#participant-quantity');
    const participantsContainer = form.querySelector('#participants-container');
    const responsibleParticipatesCheckbox = form.querySelector('#responsible-participates');
    const responsibleParticipatesWrapper = form.querySelector('#responsible-participates-wrapper');
    const responsibleParticipantSection = form.querySelector('#responsible-participant-fields');
    const responsibleContactSection = form.querySelector('#responsible-contact-fields');
    const postQuantitySections = form.querySelector('#post-quantity-sections');
    const { participantFields, groupFields } = categorizeFields(normalizedFields);
    const responsibleFields = groupFields;

    // Usa comparação semântica para evitar duplicação de campos
    // Ex: "Nome do responsável" e "Nome" têm a mesma base semântica
    const responsibleBaseSet = new Set(responsibleFields.map(field => extractFieldBase(field.label)));
    const responsibleExtraFields = participantFields.filter(field => {
      const participantBase = extractFieldBase(field.label);
      return !responsibleBaseSet.has(participantBase);
    });

    const hasParticipantFields = participantFields.length > 0;
    const hasResponsibleFields = responsibleFields.length > 0;

    // Debug: Log categorização de campos
    console.log('📊 [renderForm] Categorização de campos:');
    console.log('  Total de campos:', normalizedFields.length);
    console.log('  Campos de participante:', participantFields.length, participantFields.map(f => f.label));
    console.log('  Campos de responsável:', responsibleFields.length, responsibleFields.map(f => f.label));
    console.log('  Campos extras do responsável como participante:', responsibleExtraFields.length, responsibleExtraFields.map(f => f.label));

    // Debug: Mostrar mapeamento de bases semânticas
    const filteredFields = participantFields.filter(field => {
      const participantBase = extractFieldBase(field.label);
      return responsibleBaseSet.has(participantBase);
    });
    if (filteredFields.length > 0) {
      console.log('  ❌ Campos filtrados (duplicados):', filteredFields.map(f => {
        return `"${f.label}" (base: "${extractFieldBase(f.label)}")`;
      }));
    }

    console.log('  hasParticipantFields:', hasParticipantFields);
    console.log('  hasResponsibleFields:', hasResponsibleFields);

    const setSectionRequired = (section, enabled) => {
      if (!section) return;
      const inputs = section.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        const wasRequired = input.dataset.originalRequired === 'true';
        if (enabled) {
          if (wasRequired || input.required) {
            input.required = true;
            input.dataset.originalRequired = 'true';
          }
        } else {
          if (input.required) input.dataset.originalRequired = 'true';
          input.required = false;
        }
      });
    };

    const renderParticipantFields = (quantity, responsibleParticipates) => {
      if (!participantsContainer || participantFields.length === 0) return;
      participantsContainer.innerHTML = '';

      if (!Number.isFinite(quantity) || quantity <= 0) return;

      const numFieldsToCreate = responsibleParticipates ? quantity - 1 : quantity;
      const startNumber = responsibleParticipates ? 2 : 1;

      if (numFieldsToCreate <= 0) return;

      for (let i = 0; i < numFieldsToCreate; i++) {
        const participantSection = document.createElement('div');
        participantSection.className = 'form-section form-section--participant';
        participantSection.innerHTML = `
          <h3 class="form-section-title">Participante ${startNumber + i}</h3>
        `;

        participantFields.forEach((field, fieldIndex) => {
          const fieldHtml = renderSingleField(field, fieldIndex, {
            prefix: `participant_${i}`
          });
          participantSection.innerHTML += fieldHtml;
        });

        participantsContainer.appendChild(participantSection);
      }
    };

    const updateSectionsByQuantity = () => {
      const quantity = parseInt(quantitySelect.value, 10);
      const hasQuantity = Number.isFinite(quantity) && quantity > 0;

      if (postQuantitySections) {
        postQuantitySections.style.display = hasQuantity ? 'block' : 'none';
      }

      // Caso sem quantidade, limpa tudo
      if (!hasQuantity) {
        if (responsibleParticipantSection) {
          responsibleParticipantSection.style.display = 'none';
          setSectionRequired(responsibleParticipantSection, false);
        }
        if (responsibleContactSection) {
          responsibleContactSection.style.display = 'none';
          setSectionRequired(responsibleContactSection, false);
        }
        if (responsibleParticipatesWrapper) {
          responsibleParticipatesWrapper.style.display = 'none';
        }
        if (participantsContainer) {
          participantsContainer.innerHTML = '';
        }
        return;
      }

      // Quantidade == 1: só participante, sem responsável
      if (quantity === 1) {
        if (responsibleParticipatesWrapper) {
          responsibleParticipatesWrapper.style.display = 'none';
        }
        if (responsibleParticipantSection) {
          responsibleParticipantSection.style.display = 'none';
          setSectionRequired(responsibleParticipantSection, false);
        }

        // Se há campos de participante, esconde campos do responsável
        // Se NÃO há campos de participante, mostra campos do responsável (pois ele é o único)
        if (responsibleContactSection) {
          if (hasParticipantFields) {
            responsibleContactSection.style.display = 'none';
            setSectionRequired(responsibleContactSection, false);
          } else {
            responsibleContactSection.style.display = 'block';
            setSectionRequired(responsibleContactSection, true);
          }
        }

        renderParticipantFields(quantity, false);
        return;
      }

      // Quantidade >= 2: mostra responsável e opcionalmente como participante
      const showCheckbox = hasParticipantFields && quantity >= 2;
      if (responsibleParticipatesWrapper) {
        responsibleParticipatesWrapper.style.display = showCheckbox ? 'block' : 'none';
      }
      if (showCheckbox && responsibleParticipatesCheckbox && responsibleParticipatesCheckbox.dataset.forced !== 'true') {
        responsibleParticipatesCheckbox.checked = true;
      }
      if (!showCheckbox && responsibleParticipatesCheckbox) {
        responsibleParticipatesCheckbox.checked = false;
      }

      if (responsibleContactSection) {
        responsibleContactSection.style.display = hasResponsibleFields ? 'block' : 'none';
        setSectionRequired(responsibleContactSection, hasResponsibleFields);
      }

      const responsibleParticipates = showCheckbox
        ? (responsibleParticipatesCheckbox ? responsibleParticipatesCheckbox.checked : false)
        : false;

      if (responsibleParticipantSection) {
        const shouldShowResponsibleFields = responsibleParticipates && responsibleExtraFields.length > 0;
        responsibleParticipantSection.style.display = shouldShowResponsibleFields ? 'block' : 'none';
        setSectionRequired(responsibleParticipantSection, shouldShowResponsibleFields);
      }

      renderParticipantFields(quantity, responsibleParticipates);
    };

    if (quantitySelect) {
      quantitySelect.addEventListener('change', updateSectionsByQuantity);

      // Reagir a mudanças no checkbox do responsável
      if (responsibleParticipatesCheckbox) {
        responsibleParticipatesCheckbox.addEventListener('change', updateSectionsByQuantity);
        // Permite manter estado quando o usuário mexer
        responsibleParticipatesCheckbox.addEventListener('change', () => {
          responsibleParticipatesCheckbox.dataset.forced = 'true';
        });
      }

      // Inicializar estado do bloco do responsável participante (visibilidade + required)
      setSectionRequired(responsibleParticipantSection, false);

      // Renderizar campos inicialmente se já houver um valor selecionado
      if (quantitySelect.value) {
        updateSectionsByQuantity();
      }
    } else {
      console.error('❌ [Form] Elementos necessários não encontrados:', {
        quantitySelect: !!quantitySelect,
        participantsContainer: !!participantsContainer
      });
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(form, { ...config, fields: normalizedFields, max_participants: maxParticipants }, page);
  });
}

async function handleFormSubmit(form, config, page) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  const imageConsentInput = form.querySelector('#image-consent');

  if (!imageConsentInput || !imageConsentInput.checked) {
    showErrorModal('Para enviar a inscrição, é necessário autorizar o uso da sua imagem.');
    imageConsentInput?.focus();
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Validando conexão...';
    
    // VALIDAÇÃO DE CONEXÃO COM SUPABASE
    console.log('🔍 [handleFormSubmit] Verificando conexão com Supabase...');
    const { checkSupabaseConnection } = await import('./supabase.js');
    const isConnected = await checkSupabaseConnection();
    
    if (!isConnected) {
      console.error('❌ [handleFormSubmit] Sem conexão com Supabase!');
      throw new Error('ERRO CRÍTICO: Não foi possível conectar ao servidor. A inscrição NÃO pode ser enviada.\n\nVerifique sua conexão com a internet e tente novamente.');
    }
    
    console.log('✅ [handleFormSubmit] Conexão com Supabase confirmada!');
    submitBtn.textContent = 'Enviando...';

    const formData = new FormData(form);
    const data = {};
    const sessionSelections = [];
    const allowMultipleParticipants = config.allow_multiple_participants || false;
    let responsibleParticipates = false;

    // Helper para coletar valor de um campo
    const collectFieldValue = (field, prefix = '') => {
      const fieldName = prefix ? `${prefix}_${field.id}` : field.id;

      if (field.type === 'checkbox-group') {
        return formData.getAll(`${fieldName}[]`);
      }

      if (field.type === 'checkbox') {
        const input = form.querySelector(`input[name="${fieldName}"]`);
        return input && input.checked ? 'Sim' : 'Não';
      }

      if (field.type === 'radio') {
        return formData.get(fieldName) || '';
      }

      return formData.get(fieldName) || '';
    };

    if (allowMultipleParticipants) {
      // MODO GRUPO: Coletar dados separadamente
      const groupSize = parseInt(formData.get('_group_size'), 10) || 1;
      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const { groupFields, participantFields } = categorizeFields(config.fields);
      const responsibleFields = groupFields;
      const responsibleLabelSet = new Set(responsibleFields.map(field => normalizeLabelKey(field.label)));
      const responsibleParticipatesCheckbox = form.querySelector('#responsible-participates');

      data._group_size = groupSize;
      data._group_id = groupId;

      responsibleParticipates = groupSize >= 2
        ? (responsibleParticipatesCheckbox ? responsibleParticipatesCheckbox.checked : false)
        : false;

      // Coletar dados do grupo/responsável (apenas se houve campos)
      const groupData = {};
      if (groupSize >= 2 && responsibleFields.length > 0) {
        responsibleFields.forEach(field => {
          if (field.type === 'sessions') {
            // Sessions ficam no nível raiz, não em group_data
            const selected = form.querySelector(`input[name="session-${field.id}"]:checked`);
            if (selected) {
              const sessionId = selected.value;
              const session = (field.sessions || []).find(item => item.id === sessionId);
              if (session) {
                const display = buildSessionDisplay(session);
                const storageKey = `_session_${field.id}`;
                data[field.label] = display || sessionId;
                data[storageKey] = sessionId;
                sessionSelections.push({
                  fieldId: field.id,
                  storageKey,
                  sessionId,
                  capacity: session.capacity,
                  fieldLabel: field.label,
                  sessionTitle: session.title,
                  sessionDisplay: display
                });
              }
            }
          } else {
            groupData[field.label] = collectFieldValue(field, 'group');
          }
        });
      }

      data.group_data = groupData;

      // Coletar dados dos participantes
      const participants = [];

      if (participantFields.length > 0) {
        if (responsibleParticipates) {
          const responsibleParticipant = {};
          participantFields.forEach(field => {
            const normalizedLabel = normalizeLabelKey(field.label);
            // Se o campo já existe no responsável, reaproveita o valor do responsável
            if (responsibleLabelSet.has(normalizedLabel)) {
              responsibleParticipant[field.label] = groupData[field.label] || '';
            } else {
              responsibleParticipant[field.label] = collectFieldValue(field, 'responsible');
            }
          });
          participants.push(responsibleParticipant);
        }

        const numOtherParticipants = Math.max(responsibleParticipates ? groupSize - 1 : groupSize, 0);
        for (let i = 0; i < numOtherParticipants; i++) {
          const participant = {};
          participantFields.forEach(field => {
            participant[field.label] = collectFieldValue(field, `participant_${i}`);
          });
          participants.push(participant);
        }
      }

      data.participants = participants;
    } else {
      // MODO INDIVIDUAL: Lógica original
      config.fields.forEach((field) => {
        if (field.type === 'checkbox-group') {
          const values = formData.getAll(`${field.id}[]`);
          data[field.label] = values;
          return;
        }

        if (field.type === 'checkbox') {
          const input = form.querySelector(`input[name="${field.id}"]`);
          data[field.label] = input && input.checked ? 'Sim' : 'Não';
          return;
        }

        if (field.type === 'sessions') {
          const selected = form.querySelector(`input[name="session-${field.id}"]:checked`);
          if (selected) {
            const sessionId = selected.value;
            const session = (field.sessions || []).find(item => item.id === sessionId);
            if (session) {
              const display = buildSessionDisplay(session);
              const storageKey = `_session_${field.id}`;
              data[field.label] = display || sessionId;
              data[storageKey] = sessionId;
              sessionSelections.push({
                fieldId: field.id,
                storageKey,
                sessionId,
                capacity: session.capacity,
                fieldLabel: field.label,
                sessionTitle: session.title,
                sessionDisplay: display
              });
            }
          } else {
            data[field.label] = '';
          }
          return;
        }

        if (field.type === 'radio') {
          data[field.label] = formData.get(field.id) || '';
          return;
        }

        data[field.label] = formData.get(field.id) || '';
      });
    }

    data['_página'] = page.label;
    data['_data_envio'] = new Date().toLocaleString('pt-BR');
    data['Autorização de uso de imagem'] = 'Sim';
    data['_autorizacao_imagem'] = 'Sim';

    console.log('🔵 [handleFormSubmit] Preparando envio da inscrição');
    console.log('  Modo:', allowMultipleParticipants ? 'GRUPO' : 'INDIVIDUAL');
    console.log('  Page slug:', page.slug);
    console.log('  Page label:', page.label);

    let result;
    
    if (allowMultipleParticipants && data._group_size > 1) {
      // MODO GRUPO: Usar saveMultipleInscriptions
      const responsibleData = {
        ...data.group_data,
        '_página': page.label,
        '_data_envio': new Date().toLocaleString('pt-BR'),
        'Autorização de uso de imagem': 'Sim',
        '_autorizacao_imagem': 'Sim'
      };
      
      // Adicionar seleções de sessão ao responsável
      if (sessionSelections.length > 0) {
        sessionSelections.forEach(selection => {
          responsibleData[selection.fieldLabel] = selection.sessionDisplay;
          responsibleData[selection.storageKey] = selection.sessionId;
        });
      }
      
      // Preparar dados dos participantes
      const participantsData = data.participants.map((participant, index) => ({
        ...participant,
        _participant_number: index + 1
      }));
      
      result = await saveMultipleInscriptions(
        page.slug,
        responsibleData,
        participantsData,
        {
          sessionSelections,
          maxParticipants: Number(config.max_participants) || 0,
          responsibleParticipates
        }
      );
      
      console.log('✅ [handleFormSubmit] Inscrição múltipla retornou:', result);
      
      // VALIDAÇÃO CRÍTICA: Nunca prosseguir sem dados válidos
      if (!result) {
        throw new Error('ERRO CRÍTICO: Nenhum resultado retornado do servidor. A inscrição NÃO foi salva.');
      }
      
      if (!result.success) {
        throw new Error('ERRO CRÍTICO: Servidor indicou falha. A inscrição NÃO foi salva.');
      }
      
      if (!result.groupId) {
        throw new Error('ERRO CRÍTICO: ID do grupo não retornado. A inscrição pode não ter sido salva corretamente.');
      }
      
      if (!page.slug) {
        throw new Error('ERRO CRÍTICO: Página sem slug. Não é possível confirmar a inscrição.');
      }
      
      // Tudo OK, redirecionar
      const redirectUrl = `/confirmacao.html?group=${result.groupId}&page=${page.slug}`;
      console.log('✅ [handleFormSubmit] Redirecionando para:', redirectUrl);
      window.location.href = redirectUrl;
      return;
    } else {
      // MODO INDIVIDUAL: Lógica original
      result = await saveInscriptionSupabase(page.slug, data, {
        sessionSelections,
        maxParticipants: Number(config.max_participants) || 0
      });
      
      console.log('✅ [handleFormSubmit] Inscrição individual retornou:', result);
      
      // VALIDAÇÃO CRÍTICA: Nunca prosseguir sem dados válidos
      if (!result) {
        throw new Error('ERRO CRÍTICO: Nenhum resultado retornado do servidor. A inscrição NÃO foi salva.');
      }
      
      if (!result.id) {
        throw new Error('ERRO CRÍTICO: ID da inscrição não retornado. A inscrição pode não ter sido salva corretamente.');
      }
      
      if (!page.slug) {
        throw new Error('ERRO CRÍTICO: Página sem slug. Não é possível confirmar a inscrição.');
      }
      
      // Tudo OK, redirecionar
      const redirectUrl = `/confirmacao.html?id=${result.id}&page=${page.slug}`;
      console.log('✅ [handleFormSubmit] Redirecionando para:', redirectUrl);
      window.location.href = redirectUrl;
      return;
    }
    
    // ESTE CÓDIGO NÃO DEVE SER ALCANÇADO
    // Se chegarmos aqui, significa que não entramos em nenhum dos blocos acima
    console.error('❌ [handleFormSubmit] ERRO: Código alcançou ponto inesperado');
    throw new Error('ERRO INESPERADO: Falha no fluxo de inscrição. Por favor, tente novamente.');
  } catch (error) {
    console.error('❌ [handleFormSubmit] ERRO CAPTURADO:', error);
    console.error('  Tipo:', error.constructor.name);
    console.error('  Mensagem:', error.message);
    console.error('  Stack:', error.stack);
    
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;

    // Tratamento específico por tipo de erro
    if (error.message && error.message.startsWith('LIMIT_REACHED:')) {
      const message = error.message.replace('LIMIT_REACHED:', '');
      console.warn('⚠️ [handleFormSubmit] Limite de vagas atingido:', message);
      showErrorModal(message);
    } else if (error.message && error.message.startsWith('SESSION_FULL:')) {
      const message = error.message.replace('SESSION_FULL:', '');
      console.warn('⚠️ [handleFormSubmit] Sessão lotada:', message);
      showErrorModal(message);
      const container = document.getElementById('page-content');
      if (container) {
        await renderForm(container, page);
      }
    } else if (error.message && error.message.startsWith('ERRO CRÍTICO:')) {
      // Erros críticos de validação
      console.error('🚨 [handleFormSubmit] ERRO CRÍTICO detectado!');
      showErrorModal(error.message + '\n\nPor favor, entre em contato com o suporte se o problema persistir.');
    } else if (error.code === 'PGRST301' || error.code === '42501') {
      // Erros de permissão do Supabase (RLS)
      console.error('🚨 [handleFormSubmit] ERRO DE PERMISSÃO no banco de dados!');
      console.error('  Código:', error.code);
      console.error('  Este erro indica que as políticas RLS estão bloqueando a inserção.');
      showErrorModal('Erro de permissão no servidor. A inscrição NÃO foi salva.\n\nPor favor, entre em contato com o administrador do sistema.');
    } else if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      // Erros de rede
      console.error('🌐 [handleFormSubmit] ERRO DE REDE detectado!');
      showErrorModal('Erro de conexão com o servidor. Verifique sua internet e tente novamente.\n\nA inscrição NÃO foi salva.');
    } else {
      // Erro genérico
      console.error('❓ [handleFormSubmit] Erro não categorizado:', error);
      showErrorModal('Erro ao enviar inscrição: ' + (error.message || 'Erro desconhecido') + '\n\nA inscrição pode NÃO ter sido salva. Por favor, tente novamente.');
    }
  }
}

function showNotFound(container) {
  container.innerHTML = `
    <div class="page-not-found">
      <h1>404</h1>
      <p>Página não encontrada</p>
      <a href="/" class="btn btn-primary">Voltar à Home</a>
    </div>
  `;
}

async function loadSiteName() {
  try {
    let homeContent = await getHomeContent();
    if (!homeContent) {
      const raw = localStorage.getItem('home_content');
      if (raw) {
        homeContent = JSON.parse(raw);
      }
    }

    const siteName = homeContent?.seo?.site_name || 'Chaves Adventure';
    const logoElement = document.getElementById('site-logo');
    if (logoElement) {
      logoElement.textContent = siteName;
    }
  } catch (e) {
    console.error('Erro ao carregar nome do site:', e);
    const logoElement = document.getElementById('site-logo');
    if (logoElement) {
      logoElement.textContent = 'Chaves Adventure';
    }
  }
}

// Inicialização
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderPage);
} else {
  renderPage();
}
