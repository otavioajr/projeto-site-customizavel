// page.js - Renderização de páginas internas (Canva e Formulários)
import { getAllPages, saveInscription as saveInscriptionSupabase } from './supabase.js';

// Carregar páginas
async function loadPages() {
  try {
    const pages = await getAllPages();
    return pages || [];
  } catch (e) {
    console.error('Erro ao carregar páginas:', e);
    // Fallback para localStorage
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

// Obter slug da URL (hash)
function getSlugFromUrl() {
  // Tenta primeiro hash, depois query string
  let hash = window.location.hash.replace('#', '');
  
  // Remover query string do hash se existir (ex: #roteiros?preview=1 -> roteiros)
  if (hash) {
    hash = hash.split('?')[0];
    return hash;
  }
  
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

// Renderizar página
async function renderPage() {
  const slug = getSlugFromUrl();
  const content = document.getElementById('page-content');

  // Carregar nome do site
  loadSiteName();

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
  
  // Atualizar SEO
  document.title = page.seo_title || page.label;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && page.seo_description) {
    metaDesc.setAttribute('content', page.seo_description);
  }
  
  // Verificar se é formulário ou Canva
  if (page.is_form && page.form_config) {
    renderForm(content, page);
  } else {
    // Renderizar iframe do Canva
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

// Renderizar formulário de inscrição
function renderForm(container, page) {
  const config = page.form_config;
  
  let fieldsHtml = '';
  config.fields.forEach((field, index) => {
    const fieldId = `field-${index}`;
    const required = field.required ? 'required' : '';
    const requiredLabel = field.required ? '<span style="color: red;">*</span>' : '';
    
    let inputHtml = '';
    
    switch (field.type) {
      case 'textarea':
        inputHtml = `<textarea id="${fieldId}" name="${fieldId}" placeholder="${field.placeholder || ''}" ${required}></textarea>`;
        break;
      
      case 'select':
        const options = field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        inputHtml = `
          <select id="${fieldId}" name="${fieldId}" ${required}>
            <option value="">Selecione...</option>
            ${options}
          </select>
        `;
        break;
      
      case 'radio':
        inputHtml = field.options.map((opt, i) => `
          <label class="radio-label">
            <input type="radio" name="${fieldId}" value="${opt}" ${i === 0 && required ? 'required' : ''}> ${opt}
          </label>
        `).join('');
        break;
      
      case 'checkbox':
        inputHtml = `
          <label class="checkbox-label">
            <input type="checkbox" id="${fieldId}" name="${fieldId}" ${required}> ${field.placeholder || 'Aceito'}
          </label>
        `;
        break;
      
      case 'checkbox-group':
        inputHtml = field.options.map(opt => `
          <label class="checkbox-label">
            <input type="checkbox" name="${fieldId}[]" value="${opt}"> ${opt}
          </label>
        `).join('');
        break;
      
      default:
        inputHtml = `<input type="${field.type}" id="${fieldId}" name="${fieldId}" placeholder="${field.placeholder || ''}" ${required}>`;
    }
    
    fieldsHtml += `
      <div class="form-field">
        <label for="${fieldId}">${field.label} ${requiredLabel}</label>
        ${inputHtml}
      </div>
    `;
  });
  
  container.innerHTML = `
    <div class="form-container">
      <div class="form-header">
        <h1>${config.title}</h1>
        ${config.description ? `<p class="form-description">${config.description}</p>` : ''}
      </div>
      
      <form id="inscription-form" class="inscription-form">
        ${fieldsHtml}
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Enviar Inscrição</button>
        </div>
      </form>
      
      <div id="form-success" class="form-success" style="display: none;">
        <h2>✅ Inscrição enviada com sucesso!</h2>
        <p>Você receberá uma confirmação em breve.</p>
        <a href="/" class="btn btn-secondary">Voltar à Home</a>
      </div>
    </div>
  `;
  
  // Adicionar event listener para submit
  const form = document.getElementById('inscription-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(form, config, page);
  });
}

// Processar envio do formulário
async function handleFormSubmit(form, config, page) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;

  try {
    // Desabilitar botão durante envio
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    const formData = new FormData(form);
    const data = {};

    // Coletar dados do formulário
    config.fields.forEach((field, index) => {
      const fieldId = `field-${index}`;

      if (field.type === 'checkbox-group') {
        const checkboxes = form.querySelectorAll(`input[name="${fieldId}[]"]:checked`);
        data[field.label] = Array.from(checkboxes).map(cb => cb.value);
      } else if (field.type === 'checkbox') {
        data[field.label] = form.querySelector(`#${fieldId}`).checked ? 'Sim' : 'Não';
      } else {
        data[field.label] = formData.get(fieldId) || '';
      }
    });

    // Adicionar informações extras
    data['_página'] = page.label;
    data['_data_envio'] = new Date().toLocaleString('pt-BR');

    // Obter limite de participantes
    const maxParticipants = config.max_participants || 0;

    // Salvar no Supabase (com validação de limite)
    const result = await saveInscriptionSupabase(page.slug, data, maxParticipants);

    // Redirecionar para página de confirmação
    if (result && result.id) {
      window.location.href = `/confirmacao?id=${result.id}&page=${page.slug}`;
    } else {
      // Fallback: mostrar mensagem de sucesso
      form.style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
    }
  } catch (error) {
    // Reabilitar botão
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;

    // Verificar se é erro de limite atingido
    if (error.message && error.message.startsWith('LIMIT_REACHED:')) {
      const message = error.message.replace('LIMIT_REACHED:', '');
      alert('❌ ' + message);
    } else {
      console.error('Erro ao enviar inscrição:', error);
      alert('❌ Erro ao enviar inscrição. Por favor, tente novamente.');
    }
  }
}

// Salvar inscrição no localStorage
function saveInscription(pageSlug, data) {
  const inscriptions = JSON.parse(localStorage.getItem('inscriptions') || '{}');
  
  if (!inscriptions[pageSlug]) {
    inscriptions[pageSlug] = [];
  }
  
  const inscriptionId = Date.now();
  
  inscriptions[pageSlug].push({
    id: inscriptionId,
    data: data,
    timestamp: new Date().toISOString(),
    status: 'pending' // pending ou confirmed
  });
  
  localStorage.setItem('inscriptions', JSON.stringify(inscriptions));
  
  console.log('✅ Inscrição salva:', data);
  console.log('📊 Gerencie em: /admin.html → Aba Inscrições');
  
  return inscriptionId;
}

// Mostrar página não encontrada
function showNotFound(container) {
  container.innerHTML = `
    <div class="page-not-found">
      <h1>404</h1>
      <p>Página não encontrada</p>
      <a href="/" class="btn btn-primary">Voltar à Home</a>
    </div>
  `;
}

// Carregar nome do site
function loadSiteName() {
  try {
    const homeContent = JSON.parse(localStorage.getItem('home_content') || '{}');
    const siteName = homeContent.seo?.site_name || 'Aventuras';
    const logoElement = document.getElementById('site-logo');
    if (logoElement) {
      logoElement.textContent = siteName;
    }
  } catch (e) {
    console.error('Erro ao carregar nome do site:', e);
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', renderPage);
