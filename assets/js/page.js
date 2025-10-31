// page.js - Renderização de páginas internas (Canva e Formulários)
import { getAllPages, saveInscription as saveInscriptionSupabase, getHomeContent, getInscriptions } from './supabase.js';

// ==================== HELPERS ====================
function showErrorModal(message) {
  const overlay = document.getElementById('error-modal-overlay');
  const messageEl = document.getElementById('error-modal-message');
  const closeBtn = document.getElementById('error-modal-close');

  if (!overlay || !messageEl || !closeBtn) {
    alert(message);
    return;
  }

  messageEl.textContent = message;
  overlay.classList.add('active');

  const close = () => overlay.classList.remove('active');
  closeBtn.onclick = close;
  overlay.onclick = (e) => {
    if (e.target === overlay) close();
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      close();
      document.removeEventListener('keydown', handleEscape);
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
    return hash;
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
      console.warn('Não foi possível carregar inscrições do Supabase:', error);
    }

    if (!Array.isArray(inscriptions) || inscriptions.length === 0) {
      try {
        const fallbackKey = `inscriptions_${page.slug}`;
        const fallbackRaw = localStorage.getItem(fallbackKey);
        if (fallbackRaw) {
          const fallbackParsed = JSON.parse(fallbackRaw);
          if (Array.isArray(fallbackParsed)) {
            inscriptions = fallbackParsed;
          }
        }
      } catch (fallbackError) {
        console.warn('Não foi possível carregar inscrições do fallback local:', fallbackError);
      }
    }
  }

  if (sessionFields.length > 0) {
    sessionFields.forEach(field => {
      sessionUsage[field.id] = {};
    });

    inscriptions.forEach(inscription => {
      const formData = inscription?.form_data || inscription?.data || {};
      sessionFields.forEach(field => {
        const storageKey = `_session_${field.id}`;
        const selectedSessionId = formData?.[storageKey];
        if (selectedSessionId) {
          if (!sessionUsage[field.id][selectedSessionId]) {
            sessionUsage[field.id][selectedSessionId] = 0;
          }
          sessionUsage[field.id][selectedSessionId] += 1;
        }
      });
    });
  }

  const totalInscriptions = Array.isArray(inscriptions) ? inscriptions.length : 0;
  const remainingTotal = maxParticipants > 0 ? Math.max(maxParticipants - totalInscriptions, 0) : null;
  const sportFull = maxParticipants > 0 && remainingTotal === 0;

  const blockedSessionFields = [];
  const requiredSessionFieldIds = sessionFields.filter(field => field.required).map(field => field.id);

  let fieldsHtml = '';
  normalizedFields.forEach((field, index) => {
    const fieldId = `field-${index}`;
    const requiredLabel = field.required ? '<span style="color: red;">*</span>' : '';
    let inputHtml = '';

    switch (field.type) {
      case 'textarea':
        inputHtml = `<textarea id="${fieldId}" name="${field.id}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}></textarea>`;
        break;

      case 'select': {
        const options = field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        inputHtml = `
          <select id="${fieldId}" name="${field.id}" ${field.required ? 'required' : ''}>
            <option value="">Selecione...</option>
            ${options}
          </select>
        `;
        break;
      }

      case 'radio':
        inputHtml = field.options.map((opt, i) => `
          <label class="radio-label">
            <input type="radio" name="${field.id}" value="${opt}" ${field.required && i === 0 ? 'required' : ''}> ${opt}
          </label>
        `).join('');
        break;

      case 'checkbox':
        inputHtml = `
          <label class="checkbox-label">
            <input type="checkbox" id="${fieldId}" name="${field.id}" ${field.required ? 'required' : ''}> ${field.placeholder || 'Aceito'}
          </label>
        `;
        break;

      case 'checkbox-group':
        inputHtml = field.options.map(opt => `
          <label class="checkbox-label">
            <input type="checkbox" name="${field.id}[]" value="${opt}"> ${opt}
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
        inputHtml = `<input type="${field.type}" id="${fieldId}" name="${field.id}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`;
    }
    
    fieldsHtml += `
      <div class="form-field">
        <label ${field.type !== 'radio' && field.type !== 'checkbox-group' && field.type !== 'sessions' ? `for="${fieldId}"` : ''}>${field.label} ${requiredLabel}</label>
        ${inputHtml}
      </div>
    `;
  });

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
    submitBtn.textContent = 'Enviando...';

    const formData = new FormData(form);
    const data = {};
    const sessionSelections = [];

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

    data['_página'] = page.label;
    data['_data_envio'] = new Date().toLocaleString('pt-BR');
    data['Autorização de uso de imagem'] = 'Sim';
    data['_autorizacao_imagem'] = 'Sim';

    const result = await saveInscriptionSupabase(page.slug, data, {
      sessionSelections,
      maxParticipants: Number(config.max_participants) || 0
    });

    if (result && result.id) {
      window.location.href = `/confirmacao?id=${result.id}&page=${page.slug}`;
    } else {
      form.style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
    }
  } catch (error) {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;

    if (error.message && error.message.startsWith('LIMIT_REACHED:')) {
      const message = error.message.replace('LIMIT_REACHED:', '');
      showErrorModal(message);
    } else if (error.message && error.message.startsWith('SESSION_FULL:')) {
      const message = error.message.replace('SESSION_FULL:', '');
      showErrorModal(message);
      const container = document.getElementById('page-content');
      if (container) {
        await renderForm(container, page);
      }
    } else {
      console.error('Erro ao enviar inscrição:', error);
      showErrorModal('Erro ao enviar inscrição. Por favor, tente novamente.');
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

    const siteName = homeContent?.seo?.site_name || 'Aventuras';
    const logoElement = document.getElementById('site-logo');
    if (logoElement) {
      logoElement.textContent = siteName;
    }
  } catch (e) {
    console.error('Erro ao carregar nome do site:', e);
    const logoElement = document.getElementById('site-logo');
    if (logoElement) {
      logoElement.textContent = 'Aventuras';
    }
  }
}

// Inicialização
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderPage);
} else {
  renderPage();
}
