// admin.js - CRUD completo e preview ao vivo
import {
  getHomeContent,
  updateHomeContent,
  getAllPages,
  savePage as savePageSupabase,
  deletePage as deletePageSupabase,
  getInscriptions,
  updateInscriptionStatus,
  uploadImage as uploadImageSupabase,
  listImages as listImagesSupabase,
  deleteImage as deleteImageSupabase
} from './supabase.js';

// Estado global
const state = {
  homeContent: null,
  pages: [],
  editingPageId: null,
  previewFrame: null,
  formFields: [],
  inscriptions: {},
  filteredInscriptions: [],
  undoStack: [] // Histórico para desfazer
};

// ============= HELPERS =============

function showSavingFeedback(button, originalText = 'Salvar') {
  const originalContent = button.innerHTML;
  button.innerHTML = '⏳ Salvando...';
  button.disabled = true;
  button.style.opacity = '0.7';
  
  return () => {
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.disabled = false;
      button.style.opacity = '1';
    }, 500);
  };
}

function showAlert(message, type = 'success') {
  const container = document.getElementById('alert-container');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  
  // Adicionar ícone baseado no tipo
  const icon = document.createElement('span');
  icon.className = 'alert-icon';
  switch(type) {
    case 'success':
      icon.innerHTML = '✓';
      break;
    case 'error':
      icon.innerHTML = '✗';
      break;
    case 'warning':
      icon.innerHTML = '⚠';
      break;
    case 'info':
      icon.innerHTML = 'ℹ';
      break;
    default:
      icon.innerHTML = '✓';
  }
  
  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  
  alert.appendChild(icon);
  alert.appendChild(messageSpan);
  
  // Animação de entrada
  alert.style.opacity = '0';
  alert.style.transform = 'translateY(-20px)';
  container.appendChild(alert);
  
  // Trigger da animação
  requestAnimationFrame(() => {
    alert.style.transition = 'all 0.3s ease-out';
    alert.style.opacity = '1';
    alert.style.transform = 'translateY(0)';
  });
  
  // Remover com animação
  setTimeout(() => {
    alert.style.transition = 'all 0.3s ease-in';
    alert.style.opacity = '0';
    alert.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 300);
  }, 3000);
}

function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function validateCanvaUrl(url) {
  return url.startsWith('https://www.canva.com/');
}

function sanitizeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============= STORAGE =============

async function loadHomeContent() {
  try {
    const content = await getHomeContent();
    if (content) return content;
    return getDefaultHomeContent();
  } catch (e) {
    console.error('Erro ao carregar home_content:', e);
    // Fallback para localStorage
    const raw = localStorage.getItem('home_content');
    if (!raw) return getDefaultHomeContent();
    try {
      return JSON.parse(raw);
    } catch (e2) {
      return getDefaultHomeContent();
    }
  }
}

async function saveHomeContentToDb(content) {
  try {
    await updateHomeContent(content);
    // Também salvar no localStorage como cache
    localStorage.setItem('home_content', JSON.stringify(content));
  } catch (e) {
    console.error('Erro ao salvar home_content:', e);
    // Fallback para localStorage apenas
    localStorage.setItem('home_content', JSON.stringify(content));
    throw e;
  }
}

async function loadPages() {
  try {
    const pages = await getAllPages();
    return pages || [];
  } catch (e) {
    console.error('Erro ao carregar pages:', e);
    // Fallback para localStorage
    const raw = localStorage.getItem('pages');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e2) {
      return [];
    }
  }
}

async function savePages(pages) {
  // Esta função agora é apenas para compatibilidade
  // As páginas individuais são salvas via savePage()
  localStorage.setItem('pages', JSON.stringify(pages));
}

function getDefaultHomeContent() {
  return {
    hero: {
      title: "Viva a aventura com segurança",
      subtitle: "Guias certificados, roteiros exclusivos e experiências inesquecíveis.",
      primary_cta_label: "Agendar Agora",
      primary_cta_link: "#contato",
      background_image_url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600"
    },
    about: {
      title: "Sobre mim",
      text: "Sou guia de montanha com 10+ anos de experiência em trilhas, escalada e expedições. Minha missão é proporcionar aventuras seguras e memoráveis para todos os níveis de experiência.",
      image_url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600"
    },
    services: [
      {
        title: "Trilhas guiadas",
        text: "Do básico ao avançado. Roteiros personalizados para todos os níveis.",
        icon_url: "https://api.iconify.design/mdi/hiking.svg?color=%230E7C7B&width=64"
      },
      {
        title: "Escalada",
        text: "Aulas e expedições com equipamentos de segurança certificados.",
        icon_url: "https://api.iconify.design/mdi/climbing.svg?color=%230E7C7B&width=64"
      },
      {
        title: "Mergulho",
        text: "Batismo e certificações com instrutores credenciados.",
        icon_url: "https://api.iconify.design/mdi/diving-scuba.svg?color=%230E7C7B&width=64"
      }
    ],
    testimonials: [
      {
        name: "Ana P.",
        text: "Experiência incrível e segura! O guia foi extremamente profissional e atencioso."
      },
      {
        name: "Carlos M.",
        text: "Profissionalismo do início ao fim. Recomendo para todos que buscam aventura."
      }
    ],
    gallery: {
      title: "Galeria",
      image_urls: [
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400",
        "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=400",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
      ]
    },
    theme: {
      primary: "#0E7C7B",
      secondary: "#F4A261",
      text: "#1B1B1B",
      background: "#FAFAFA"
    },
    seo: {
      site_name: "Aventuras",
      title: "Aventuras Guiadas com Segurança",
      description: "Trilhas, escalada e mergulho com guia certificado. Experiências inesquecíveis em contato com a natureza."
    },
    contact: {
      whatsapp: "https://wa.me/5511999999999",
      email: "contato@aventura.com",
      instagram: "https://instagram.com/aventuras",
      location: "São Paulo, Brasil"
    }
  };
}

// ============= TABS =============

function initTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  const sections = document.querySelectorAll('.admin-section');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(`section-${targetTab}`).classList.add('active');
    });
  });
}

// ============= HOME EDITOR =============

async function loadHomeEditor() {
  state.homeContent = await loadHomeContent();
  const data = state.homeContent;
  
  // Hero
  document.getElementById('hero-title').value = data.hero?.title || '';
  document.getElementById('hero-subtitle').value = data.hero?.subtitle || '';
  document.getElementById('hero-cta-label').value = data.hero?.primary_cta_label || '';
  document.getElementById('hero-cta-link').value = data.hero?.primary_cta_link || '';
  document.getElementById('hero-bg').value = data.hero?.background_image_url || '';
  
  // About
  document.getElementById('about-title').value = data.about?.title || '';
  document.getElementById('about-text').value = data.about?.text || '';
  document.getElementById('about-image').value = data.about?.image_url || '';
  
  // Services
  renderServicesList(data.services || []);
  
  // Testimonials
  renderTestimonialsList(data.testimonials || []);
  
  // Gallery
  renderGalleryList((data.gallery && data.gallery.image_urls) || []);
  
  // Contact
  document.getElementById('contact-whatsapp').value = data.contact?.whatsapp || '';
  document.getElementById('contact-email').value = data.contact?.email || '';
  document.getElementById('contact-instagram').value = data.contact?.instagram || '';
  document.getElementById('contact-location').value = data.contact?.location || '';
  
  // SEO
  document.getElementById('site-name').value = data.seo?.site_name || 'Aventuras';
  document.getElementById('seo-title').value = data.seo?.title || '';
  document.getElementById('seo-description').value = data.seo?.description || '';
  
  // Theme
  document.getElementById('theme-primary').value = data.theme?.primary || '#0E7C7B';
  document.getElementById('theme-secondary').value = data.theme?.secondary || '#F4A261';
  document.getElementById('theme-text').value = data.theme?.text || '#1B1B1B';
  document.getElementById('theme-bg').value = data.theme?.background || '#FAFAFA';
}

function renderServicesList(services) {
  const container = document.getElementById('services-list');
  container.innerHTML = '';
  
  services.forEach((service, index) => {
    const item = document.createElement('div');
    item.className = 'array-item';
    item.innerHTML = `
      <button class="array-item-remove" data-index="${index}">×</button>
      <div class="form-group">
        <label>Título <span style="color: red;">*</span></label>
        <input type="text" class="service-title" value="${service.title || ''}" data-index="${index}">
        <span class="form-hint">📝 Nome do serviço (obrigatório)</span>
      </div>
      <div class="form-group">
        <label>Texto <span style="color: red;">*</span></label>
        <textarea class="service-text" data-index="${index}">${service.text || ''}</textarea>
        <span class="form-hint">📝 Descrição do serviço (obrigatório)</span>
      </div>
      <div class="form-group">
        <label>URL do Ícone</label>
        <input type="url" class="service-icon" value="${service.icon_url || ''}" data-index="${index}" placeholder="https://... ou nome-icone.svg">
        <span class="form-hint">🎨 <strong>Opção 1:</strong> Use <a href="https://iconify.design" target="_blank">Iconify</a> para gerar ícones SVG | <strong>Opção 2:</strong> Faça upload na aba "Imagens" e cole o nome aqui (opcional)</span>
      </div>
    `;
    container.appendChild(item);
  });
  
  // Event listeners
  container.querySelectorAll('.array-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      state.homeContent.services.splice(index, 1);
      renderServicesList(state.homeContent.services);
      updatePreview();
    });
  });
  
  container.querySelectorAll('.service-title, .service-text, .service-icon').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      const field = e.target.classList.contains('service-title') ? 'title' :
                    e.target.classList.contains('service-text') ? 'text' : 'icon_url';
      state.homeContent.services[index][field] = e.target.value;
      updatePreview();
    });
  });
}

function renderTestimonialsList(testimonials) {
  const container = document.getElementById('testimonials-list');
  container.innerHTML = '';
  
  testimonials.forEach((testimonial, index) => {
    const item = document.createElement('div');
    item.className = 'array-item';
    item.innerHTML = `
      <button class="array-item-remove" data-index="${index}">×</button>
      <div class="form-group">
        <label>Nome <span style="color: red;">*</span></label>
        <input type="text" class="testimonial-name" value="${testimonial.name || ''}" data-index="${index}">
        <span class="form-hint">📝 Nome da pessoa (obrigatório)</span>
      </div>
      <div class="form-group">
        <label>Depoimento <span style="color: red;">*</span></label>
        <textarea class="testimonial-text" data-index="${index}">${testimonial.text || ''}</textarea>
        <span class="form-hint">📝 Texto do depoimento (obrigatório)</span>
      </div>
    `;
    container.appendChild(item);
  });
  
  // Event listeners
  container.querySelectorAll('.array-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      state.homeContent.testimonials.splice(index, 1);
      renderTestimonialsList(state.homeContent.testimonials);
      updatePreview();
    });
  });
  
  container.querySelectorAll('.testimonial-name, .testimonial-text').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      const field = e.target.classList.contains('testimonial-name') ? 'name' : 'text';
      state.homeContent.testimonials[index][field] = e.target.value;
      updatePreview();
    });
  });
}

function renderGalleryList(imageUrls) {
  const container = document.getElementById('gallery-list');
  container.innerHTML = '';
  
  imageUrls.forEach((url, index) => {
    const item = document.createElement('div');
    item.className = 'array-item';
    item.innerHTML = `
      <button class="array-item-remove" data-index="${index}">×</button>
      <div class="form-group">
        <label>URL da Imagem ${index + 1} <span style="color: red;">*</span></label>
        <input type="url" class="gallery-url" value="${url || ''}" data-index="${index}" placeholder="https://... ou nome-imagem.jpg">
        <span class="form-hint">🖼️ <strong>Tamanho recomendado: 400x400px</strong> | <strong>Opção 1:</strong> Cole URL de <a href="https://unsplash.com" target="_blank">Unsplash</a>, <a href="https://imgur.com" target="_blank">Imgur</a> ou <a href="https://postimages.org" target="_blank">PostImages</a> | <strong>Opção 2 (LGPD):</strong> Faça upload na aba "Imagens" e cole o nome exato aqui (obrigatório)</span>
      </div>
    `;
    container.appendChild(item);
  });
  
  // Event listeners
  container.querySelectorAll('.array-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      state.homeContent.gallery.image_urls.splice(index, 1);
      renderGalleryList(state.homeContent.gallery.image_urls);
      updatePreview();
    });
  });
  
  container.querySelectorAll('.gallery-url').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      state.homeContent.gallery.image_urls[index] = e.target.value;
      updatePreview();
    });
  });
}

function collectHomeData() {
  return {
    hero: {
      title: document.getElementById('hero-title').value,
      subtitle: document.getElementById('hero-subtitle').value,
      primary_cta_label: document.getElementById('hero-cta-label').value,
      primary_cta_link: document.getElementById('hero-cta-link').value,
      background_image_url: document.getElementById('hero-bg').value
    },
    about: {
      title: document.getElementById('about-title').value,
      text: document.getElementById('about-text').value,
      image_url: document.getElementById('about-image').value
    },
    services: state.homeContent.services || [],
    testimonials: state.homeContent.testimonials || [],
    gallery: {
      title: "Galeria",
      image_urls: state.homeContent.gallery?.image_urls || []
    },
    theme: {
      primary: document.getElementById('theme-primary').value,
      secondary: document.getElementById('theme-secondary').value,
      text: document.getElementById('theme-text').value,
      background: document.getElementById('theme-bg').value
    },
    seo: {
      site_name: document.getElementById('site-name').value,
      title: document.getElementById('seo-title').value,
      description: document.getElementById('seo-description').value
    },
    contact: {
      whatsapp: document.getElementById('contact-whatsapp').value,
      email: document.getElementById('contact-email').value,
      instagram: document.getElementById('contact-instagram').value,
      location: document.getElementById('contact-location').value
    }
  };
}

async function saveHome() {
  const saveButton = event?.target || document.querySelector('[onclick="saveHome()"]');
  const resetFeedback = saveButton ? showSavingFeedback(saveButton) : null;
  
  // Salvar estado atual no histórico antes de salvar
  saveToUndoStack();
  
  const data = collectHomeData();
  
  try {
    await saveHomeContentToDb(data);
    state.homeContent = data;
    
    setTimeout(() => {
      showAlert('Home salva com sucesso!');
      if (resetFeedback) resetFeedback();
      
      // Recarregar o preview completamente
      refreshPreview();
    }, 300);
  } catch (error) {
    showAlert('Erro ao salvar: ' + error.message, 'error');
    if (resetFeedback) resetFeedback();
  }
}

function revertHome() {
  // Desfazer última ação do histórico
  if (state.undoStack.length === 0) {
    showAlert('Nenhuma ação para desfazer.', 'error');
    return;
  }
  
  if (confirm('Deseja desfazer a última alteração salva?')) {
    const previousState = state.undoStack.pop();
    state.homeContent = previousState;
    saveHomeContent(previousState);
    loadHomeEditor();
    showAlert('Última alteração desfeita.');
    refreshPreview();
  }
}

function restoreDefaultHome() {
  if (confirm('Deseja restaurar todas as configurações padrão do site? Esta ação não pode ser desfeita.')) {
    // Salvar estado atual no histórico antes de restaurar
    saveToUndoStack();
    
    // Restaurar conteúdo padrão
    const defaultContent = getDefaultHomeContent();
    state.homeContent = defaultContent;
    saveHomeContent(defaultContent);
    loadHomeEditor();
    showAlert('Configurações padrão restauradas com sucesso!');
    refreshPreview();
  }
}

// Salvar estado atual no histórico
function saveToUndoStack() {
  const currentState = JSON.parse(JSON.stringify(state.homeContent));
  state.undoStack.push(currentState);
  
  // Manter apenas as últimas 10 ações
  if (state.undoStack.length > 10) {
    state.undoStack.shift();
  }
}

// Recarregar preview completamente
function refreshPreview() {
  if (!state.previewFrame) return;
  
  const currentSrc = state.previewFrame.src;
  // Adicionar timestamp para forçar reload
  const separator = currentSrc.includes('?') ? '&' : '?';
  state.previewFrame.src = currentSrc.split('?')[0] + '?preview=1&t=' + Date.now();
}

function exportHome() {
  const data = collectHomeData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'home_content.json';
  a.click();
  URL.revokeObjectURL(url);
  showAlert('JSON exportado com sucesso!');
}

function importHome() {
  const input = document.getElementById('import-file-input');
  input.click();
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        state.homeContent = data;
        saveHomeContent(data);
        loadHomeEditor();
        showAlert('JSON importado com sucesso!');
        updatePreview();
      } catch (error) {
        showAlert('Erro ao importar JSON: ' + error.message, 'error');
      }
    };
    reader.readAsText(file);
  };
}

// ============= PAGES EDITOR =============

async function loadPagesEditor() {
  const pages = await loadPages();
  state.pages = Array.isArray(pages) ? pages : [];
  renderPagesList();
  updatePreviewSelector();
}

function renderPagesList() {
  const container = document.getElementById('pages-list');
  container.innerHTML = '';
  
  if (!Array.isArray(state.pages)) {
    state.pages = [];
  }
  
  const sortedPages = [...state.pages].sort((a, b) => a.order - b.order);
  
  sortedPages.forEach(page => {
    const item = document.createElement('div');
    item.className = 'page-item';
    item.innerHTML = `
      <div class="page-item-header">
        <span class="page-item-title">${page.label}</span>
        <label class="toggle-switch">
          <input type="checkbox" ${page.is_active ? 'checked' : ''} data-id="${page.id}">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="page-item-meta">
        Slug: /${page.slug} | Ordem: ${page.order}
      </div>
      <div class="btn-group">
        <button class="btn btn-secondary btn-small edit-page" data-id="${page.id}">✏️ Editar</button>
        <button class="btn btn-secondary btn-small preview-page" data-slug="${page.slug}">👁️ Preview</button>
        <button class="btn btn-danger btn-small delete-page" data-id="${page.id}">🗑️ Excluir</button>
      </div>
    `;
    container.appendChild(item);
  });
  
  // Event listeners
  container.querySelectorAll('.toggle-switch input').forEach(toggle => {
    toggle.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const page = state.pages.find(p => p.id === id);
      if (page) {
        page.is_active = e.target.checked;
        savePages(state.pages);
        showAlert(`Página ${page.is_active ? 'ativada' : 'desativada'}.`);
      }
    });
  });
  
  container.querySelectorAll('.edit-page').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      editPage(id);
    });
  });
  
  container.querySelectorAll('.preview-page').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const slug = e.target.dataset.slug;
      window.open(`/p/#${slug}`, '_blank');
    });
  });
  
  container.querySelectorAll('.delete-page').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      deletePage(id);
    });
  });
}

function showPageForm(page = null) {
  const form = document.getElementById('page-form');
  const title = document.getElementById('page-form-title');
  
  if (page) {
    title.textContent = 'Editar Página';
    state.editingPageId = page.id;
    document.getElementById('page-label').value = page.label;
    const slugField = document.getElementById('page-slug');
    slugField.value = page.slug;
    slugField.dataset.autoGenerated = 'false'; // Não auto-gerar para páginas existentes
    
    // Verificar se é formulário
    const isForm = page.is_form || false;
    document.getElementById('page-is-form').checked = isForm;
    toggleFormFields(isForm);
    
    if (isForm) {
      // Preencher campos do formulário
      document.getElementById('form-title').value = page.form_config?.title || '';
      document.getElementById('form-description').value = page.form_config?.description || '';

      // Campos de pagamento
      const requiresPayment = page.form_config?.requires_payment || false;
      document.getElementById('form-requires-payment').checked = requiresPayment;
      togglePaymentFields(requiresPayment);

      if (requiresPayment && page.form_config?.payment) {
        document.getElementById('payment-value').value = page.form_config.payment.value || '';
        document.getElementById('payment-pix-key').value = page.form_config.payment.pix_key || '';
        document.getElementById('payment-whatsapp').value = page.form_config.payment.whatsapp || '';
      }

      // Limite de pessoas
      document.getElementById('form-max-participants').value = page.form_config?.max_participants || 0;

      state.formFields = page.form_config?.fields || [];
      renderFormFieldsList();
    } else {
      // Preencher URL do Canva
      document.getElementById('page-canva-url').value = page.canva_embed_url || '';
    }
    
    document.getElementById('page-order').value = page.order;
    document.getElementById('page-seo-title').value = page.seo_title || '';
    document.getElementById('page-seo-desc').value = page.seo_description || '';
    document.getElementById('page-active').checked = page.is_active;
  } else {
    title.textContent = 'Nova Página';
    state.editingPageId = null;
    document.getElementById('page-label').value = '';
    const slugField = document.getElementById('page-slug');
    slugField.value = '';
    slugField.dataset.autoGenerated = 'true'; // Marcar para auto-geração
    document.getElementById('page-is-form').checked = false;
    document.getElementById('page-canva-url').value = '';
    document.getElementById('form-title').value = '';
    document.getElementById('form-description').value = '';
    document.getElementById('form-requires-payment').checked = false;
    document.getElementById('payment-value').value = '';
    document.getElementById('payment-pix-key').value = '';
    document.getElementById('payment-whatsapp').value = '';
    document.getElementById('form-max-participants').value = 0;
    document.getElementById('page-order').value = state.pages.length + 1;
    document.getElementById('page-seo-title').value = '';
    document.getElementById('page-seo-desc').value = '';
    document.getElementById('page-active').checked = true;
    state.formFields = [];
    toggleFormFields(false);
    togglePaymentFields(false);
    renderFormFieldsList();
  }
  
  form.style.display = 'block';
  form.scrollIntoView({ behavior: 'smooth' });
}

// Toggle entre Canva e Formulário
function toggleFormFields(isForm) {
  const canvaFields = document.getElementById('canva-fields');
  const formFields = document.getElementById('form-fields');
  
  if (isForm) {
    canvaFields.style.display = 'none';
    formFields.style.display = 'block';
  } else {
    canvaFields.style.display = 'block';
    formFields.style.display = 'none';
  }
}

// Toggle campos de pagamento
function togglePaymentFields(requiresPayment) {
  const paymentFields = document.getElementById('payment-fields');
  paymentFields.style.display = requiresPayment ? 'block' : 'none';
}

// Renderizar lista de campos do formulário
function renderFormFieldsList() {
  const container = document.getElementById('form-fields-list');
  container.innerHTML = '';
  
  state.formFields.forEach((field, index) => {
    const item = document.createElement('div');
    item.className = 'form-field-item';
    
    let optionsHtml = '';
    if (field.type === 'select' || field.type === 'radio' || field.type === 'checkbox-group') {
      optionsHtml = `
        <div class="form-group">
          <label>Opções (uma por linha)</label>
          <textarea class="field-options" data-index="${index}" rows="3">${(field.options || []).join('\n')}</textarea>
        </div>
      `;
    }
    
    item.innerHTML = `
      <div class="form-field-item-header">
        <span class="form-field-item-title">Campo ${index + 1}</span>
        <div class="form-field-actions">
          <button class="btn-reorder" data-index="${index}" data-action="move-up" ${index === 0 ? 'disabled' : ''} title="Mover para cima">↑</button>
          <button class="btn-reorder" data-index="${index}" data-action="move-down" ${index === state.formFields.length - 1 ? 'disabled' : ''} title="Mover para baixo">↓</button>
          <button class="array-item-remove" data-index="${index}">×</button>
        </div>
      </div>
      <div class="form-group">
        <label>Tipo de Campo</label>
        <select class="field-type" data-index="${index}">
          <option value="text" ${field.type === 'text' ? 'selected' : ''}>Texto (uma linha)</option>
          <option value="textarea" ${field.type === 'textarea' ? 'selected' : ''}>Texto (múltiplas linhas)</option>
          <option value="email" ${field.type === 'email' ? 'selected' : ''}>Email</option>
          <option value="tel" ${field.type === 'tel' ? 'selected' : ''}>Telefone</option>
          <option value="number" ${field.type === 'number' ? 'selected' : ''}>Número</option>
          <option value="date" ${field.type === 'date' ? 'selected' : ''}>Data</option>
          <option value="select" ${field.type === 'select' ? 'selected' : ''}>Lista suspensa (select)</option>
          <option value="radio" ${field.type === 'radio' ? 'selected' : ''}>Múltipla escolha (radio)</option>
          <option value="checkbox" ${field.type === 'checkbox' ? 'selected' : ''}>Checkbox único</option>
          <option value="checkbox-group" ${field.type === 'checkbox-group' ? 'selected' : ''}>Grupo de checkboxes</option>
        </select>
      </div>
      <div class="form-group">
        <label>Label do Campo</label>
        <input type="text" class="field-label" data-index="${index}" value="${field.label || ''}" placeholder="Ex: Nome completo">
      </div>
      <div class="form-group">
        <label>Placeholder (opcional)</label>
        <input type="text" class="field-placeholder" data-index="${index}" value="${field.placeholder || ''}" placeholder="Ex: Digite seu nome">
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" class="field-required" data-index="${index}" ${field.required ? 'checked' : ''}> Campo obrigatório
        </label>
      </div>
      ${optionsHtml}
    `;
    
    container.appendChild(item);
  });
  
  // Event listeners
  container.querySelectorAll('.array-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      state.formFields.splice(index, 1);
      renderFormFieldsList();
    });
  });
  
  container.querySelectorAll('.field-type').forEach(select => {
    select.addEventListener('change', (e) => {
      const index = parseInt(e.target.dataset.index);
      state.formFields[index].type = e.target.value;
      renderFormFieldsList();
    });
  });
  
  container.querySelectorAll('.field-label').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      state.formFields[index].label = e.target.value;
    });
  });
  
  container.querySelectorAll('.field-placeholder').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      state.formFields[index].placeholder = e.target.value;
    });
  });
  
  container.querySelectorAll('.field-required').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const index = parseInt(e.target.dataset.index);
      state.formFields[index].required = e.target.checked;
    });
  });
  
  container.querySelectorAll('.field-options').forEach(textarea => {
    textarea.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      state.formFields[index].options = e.target.value.split('\n').filter(o => o.trim());
    });
  });

  // Event listeners para mover campos
  container.querySelectorAll('[data-action="move-up"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      moveFieldUp(index);
    });
  });

  container.querySelectorAll('[data-action="move-down"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      moveFieldDown(index);
    });
  });
}

// Adicionar novo campo ao formulário
function addFormField() {
  state.formFields.push({
    type: 'text',
    label: '',
    placeholder: '',
    required: false,
    options: []
  });
  renderFormFieldsList();
}

// Mover campo para cima
function moveFieldUp(index) {
  if (index > 0) {
    const temp = state.formFields[index];
    state.formFields[index] = state.formFields[index - 1];
    state.formFields[index - 1] = temp;
    renderFormFieldsList();
  }
}

// Mover campo para baixo
function moveFieldDown(index) {
  if (index < state.formFields.length - 1) {
    const temp = state.formFields[index];
    state.formFields[index] = state.formFields[index + 1];
    state.formFields[index + 1] = temp;
    renderFormFieldsList();
  }
}

function hidePageForm() {
  document.getElementById('page-form').style.display = 'none';
  state.editingPageId = null;
}

function editPage(id) {
  const page = state.pages.find(p => p.id === id);
  if (page) {
    showPageForm(page);
  }
}

async function deletePage(id) {
  const page = state.pages.find(p => p.id === id);
  if (!page) return;
  
  if (confirm(`Deseja realmente excluir a página "${page.label}"?`)) {
    try {
      await deletePageSupabase(id);
      state.pages = state.pages.filter(p => p.id !== id);
      await savePages(state.pages);
      renderPagesList();
      updatePreviewSelector();
      showAlert('Página excluída com sucesso!');
    } catch (error) {
      showAlert('Erro ao excluir página: ' + error.message, 'error');
    }
  }
}

async function savePage() {
  const saveButton = event?.target || document.querySelector('[onclick="savePage()"]');
  const resetFeedback = saveButton ? showSavingFeedback(saveButton) : null;
  
  // Função helper para resetar feedback e retornar
  const returnWithReset = () => {
    if (resetFeedback) resetFeedback();
    return;
  };
  
  const label = document.getElementById('page-label').value.trim();
  const slug = document.getElementById('page-slug').value.trim() || slugify(label);
  const order = parseInt(document.getElementById('page-order').value);
  const seoTitle = document.getElementById('page-seo-title').value.trim();
  const seoDesc = document.getElementById('page-seo-desc').value.trim();
  const isActive = document.getElementById('page-active').checked;
  const isForm = document.getElementById('page-is-form').checked;
  
  // Validações
  if (!label) {
    showAlert('O label é obrigatório.', 'error');
    return returnWithReset();
  }
  
  if (!slug) {
    showAlert('O slug é obrigatório.', 'error');
    return returnWithReset();
  }
  
  // Verificar slug único
  const existingPage = state.pages.find(p => p.slug === slug && p.id !== state.editingPageId);
  if (existingPage) {
    showAlert('Já existe uma página com este slug.', 'error');
    return returnWithReset();
  }
  
  const pageData = {
    id: state.editingPageId || generateId(),
    label,
    slug,
    order,
    is_active: isActive,
    is_form: isForm,
    seo_title: seoTitle || label,
    seo_description: seoDesc
  };
  
  if (isForm) {
    // Validações do formulário
    const formTitle = document.getElementById('form-title').value.trim();
    const formDescription = document.getElementById('form-description').value.trim();
    
    if (!formTitle) {
      showAlert('O título do formulário é obrigatório.', 'error');
      return returnWithReset();
    }
    
    if (state.formFields.length === 0) {
      showAlert('Adicione pelo menos um campo ao formulário.', 'error');
      return returnWithReset();
    }
    
    // Validar se todos os campos têm label
    const invalidFields = state.formFields.filter(f => !f.label.trim());
    if (invalidFields.length > 0) {
      showAlert('Todos os campos devem ter um label.', 'error');
      return returnWithReset();
    }
    
    const requiresPayment = document.getElementById('form-requires-payment').checked;
    const maxParticipants = parseInt(document.getElementById('form-max-participants').value) || 0;

    pageData.form_config = {
      title: formTitle,
      description: formDescription,
      fields: state.formFields,
      requires_payment: requiresPayment,
      max_participants: maxParticipants
    };
    
    // Se requer pagamento, validar e adicionar dados
    if (requiresPayment) {
      const paymentValue = document.getElementById('payment-value').value.trim();
      const pixKey = document.getElementById('payment-pix-key').value.trim();
      const whatsapp = document.getElementById('payment-whatsapp').value.trim();
      
      if (!paymentValue || parseFloat(paymentValue) <= 0) {
        showAlert('Informe o valor da inscrição.', 'error');
        return returnWithReset();
      }
      
      if (!pixKey) {
        showAlert('Informe a chave PIX (copia e cola).', 'error');
        return returnWithReset();
      }
      
      pageData.form_config.payment = {
        value: parseFloat(paymentValue),
        pix_key: pixKey,
        whatsapp: whatsapp
      };
    }
  } else {
    // Validações do Canva
    const canvaUrl = document.getElementById('page-canva-url').value.trim();
    
    if (!canvaUrl) {
      showAlert('A URL do Canva é obrigatória.', 'error');
      return returnWithReset();
    }
    
    if (!validateCanvaUrl(canvaUrl)) {
      showAlert('A URL deve começar com https://www.canva.com/', 'error');
      return returnWithReset();
    }
    
    pageData.canva_embed_url = canvaUrl;
  }
  
  try {
    // Salvar no Supabase
    const savedPage = await savePageSupabase(pageData);
    
    if (state.editingPageId) {
      // Editar
      const index = state.pages.findIndex(p => p.id === state.editingPageId);
      state.pages[index] = savedPage;
    } else {
      // Adicionar
      state.pages.push(savedPage);
    }
    
    await savePages(state.pages);
    renderPagesList();
    hidePageForm();
    
    setTimeout(() => {
      showAlert('Página salva com sucesso!');
      if (resetFeedback) resetFeedback();
      
      // Atualizar seletor de preview
      updatePreviewSelector();
      
      // Recarregar preview se estiver visualizando páginas
      const activeTab = document.querySelector('.admin-tab.active');
      if (activeTab && activeTab.dataset.tab === 'pages') {
        refreshPreview();
      }
    }, 300);
  } catch (error) {
    showAlert('Erro ao salvar página: ' + error.message, 'error');
    if (resetFeedback) resetFeedback();
  }
}

// ============= THEME EDITOR =============

function saveTheme() {
  // Salvar estado atual no histórico antes de salvar
  saveToUndoStack();
  
  const theme = {
    primary: document.getElementById('theme-primary').value,
    secondary: document.getElementById('theme-secondary').value,
    text: document.getElementById('theme-text').value,
    background: document.getElementById('theme-bg').value
  };
  
  state.homeContent.theme = theme;
  saveHomeContent(state.homeContent);
  applyThemeToAdmin(theme);
  showAlert('Tema salvo com sucesso!');
  
  // Recarregar o preview completamente
  refreshPreview();
}

function revertTheme() {
  if (confirm('Deseja reverter as cores do tema?')) {
    const data = loadHomeContent();
    document.getElementById('theme-primary').value = data.theme?.primary || '#0E7C7B';
    document.getElementById('theme-secondary').value = data.theme?.secondary || '#F4A261';
    document.getElementById('theme-text').value = data.theme?.text || '#1B1B1B';
    document.getElementById('theme-bg').value = data.theme?.background || '#FAFAFA';
    applyThemeToAdmin(data.theme);
    showAlert('Tema revertido.');
    updatePreview();
  }
}

function restoreDefaultTheme() {
  if (confirm('Deseja restaurar as cores padrão do tema?')) {
    // Salvar estado atual no histórico antes de restaurar
    saveToUndoStack();
    
    // Cores padrão
    const defaultTheme = {
      primary: '#0E7C7B',
      secondary: '#F4A261',
      text: '#1B1B1B',
      background: '#FAFAFA'
    };
    
    document.getElementById('theme-primary').value = defaultTheme.primary;
    document.getElementById('theme-secondary').value = defaultTheme.secondary;
    document.getElementById('theme-text').value = defaultTheme.text;
    document.getElementById('theme-bg').value = defaultTheme.background;
    
    state.homeContent.theme = defaultTheme;
    saveHomeContent(state.homeContent);
    applyThemeToAdmin(defaultTheme);
    showAlert('Cores padrão restauradas com sucesso!');
    refreshPreview();
  }
}

function applyThemeToAdmin(theme) {
  if (!theme) return;
  const r = document.documentElement.style;
  if (theme.primary) r.setProperty('--color-primary', theme.primary);
  if (theme.secondary) r.setProperty('--color-secondary', theme.secondary);
  if (theme.text) r.setProperty('--color-text', theme.text);
  if (theme.background) r.setProperty('--color-bg', theme.background);
}

// ============= PREVIEW =============

function initPreview() {
  state.previewFrame = document.getElementById('preview-frame');
  
  // Atualizar preview quando iframe carregar
  state.previewFrame.addEventListener('load', () => {
    setTimeout(() => {
      updatePreview();
    }, 100);
  });
  
  // Event listener para mudança no seletor de preview
  document.getElementById('preview-selector').addEventListener('change', () => {
    updatePreview();
  });
  
  // Auto-slug
  document.getElementById('page-label').addEventListener('input', (e) => {
    const slugField = document.getElementById('page-slug');
    // Só atualiza o slug se estiver vazio ou se foi gerado automaticamente
    if (!slugField.value.trim() || slugField.dataset.autoGenerated === 'true') {
      slugField.value = slugify(e.target.value);
      slugField.dataset.autoGenerated = 'true';
    }
  });
  
  // Marcar quando o usuário edita manualmente o slug
  document.getElementById('page-slug').addEventListener('input', (e) => {
    e.target.dataset.autoGenerated = 'false';
  });
  
  // Live preview on input
  const homeInputs = document.querySelectorAll('#section-home input, #section-home textarea');
  homeInputs.forEach(input => {
    input.addEventListener('input', () => {
      updatePreview();
    });
  });
  
  // Theme preview
  const themeInputs = document.querySelectorAll('#section-theme input[type="color"]');
  themeInputs.forEach(input => {
    input.addEventListener('input', () => {
      const theme = {
        primary: document.getElementById('theme-primary').value,
        secondary: document.getElementById('theme-secondary').value,
        text: document.getElementById('theme-text').value,
        background: document.getElementById('theme-bg').value
      };
      applyThemeToAdmin(theme);
      updatePreview();
    });
  });
}

function updatePreview() {
  if (!state.previewFrame) return;
  
  const selectedPage = document.getElementById('preview-selector').value;
  
  if (selectedPage === 'home') {
    const data = collectHomeData();
    
    try {
      // Aguardar iframe carregar se necessário
      if (state.previewFrame.contentWindow) {
        state.previewFrame.contentWindow.postMessage({
          type: 'UPDATE_HOME_CONTENT',
          content: data
        }, '*');
      }
    } catch (e) {
      console.error('Erro ao atualizar preview:', e);
    }
  } else {
    // Navegar para a página específica
    const page = state.pages.find(p => p.slug === selectedPage);
    if (page) {
      state.previewFrame.src = `/p/index.html#${page.slug}?preview=1`;
    }
  }
}

function updatePreviewSelector() {
  const selector = document.getElementById('preview-selector');
  const currentValue = selector.value;
  
  // Limpar opções existentes
  selector.innerHTML = '<option value="home">Home</option>';
  
  // Adicionar páginas ativas
  state.pages
    .filter(page => page.is_active)
    .sort((a, b) => a.order - b.order)
    .forEach(page => {
      const option = document.createElement('option');
      option.value = page.slug;
      option.textContent = page.label;
      selector.appendChild(option);
    });
  
  // Restaurar seleção anterior se ainda existir
  if (Array.from(selector.options).some(opt => opt.value === currentValue)) {
    selector.value = currentValue;
  }
}

// ============= EVENT LISTENERS =============

function initEventListeners() {
  // Home
  document.getElementById('save-home').addEventListener('click', saveHome);
  document.getElementById('revert-home').addEventListener('click', revertHome);
  document.getElementById('restore-default-home').addEventListener('click', restoreDefaultHome);
  document.getElementById('export-home').addEventListener('click', exportHome);
  document.getElementById('import-home').addEventListener('click', importHome);
  
  // Services
  document.getElementById('add-service').addEventListener('click', () => {
    if (state.homeContent.services.length >= 3) {
      showAlert('Máximo de 3 serviços permitidos.', 'error');
      return;
    }
    state.homeContent.services.push({ title: '', text: '', icon_url: '' });
    renderServicesList(state.homeContent.services);
  });
  
  // Testimonials
  document.getElementById('add-testimonial').addEventListener('click', () => {
    state.homeContent.testimonials.push({ name: '', text: '' });
    renderTestimonialsList(state.homeContent.testimonials);
  });
  
  // Gallery
  document.getElementById('add-gallery-image').addEventListener('click', () => {
    if (state.homeContent.gallery.image_urls.length >= 6) {
      showAlert('Máximo de 6 imagens permitidas.', 'error');
      return;
    }
    state.homeContent.gallery.image_urls.push('');
    renderGalleryList(state.homeContent.gallery.image_urls);
  });
  
  // Pages
  document.getElementById('add-page').addEventListener('click', () => showPageForm());
  document.getElementById('save-page').addEventListener('click', savePage);
  document.getElementById('cancel-page').addEventListener('click', hidePageForm);
  
  // Toggle formulário/canva
  document.getElementById('page-is-form').addEventListener('change', (e) => {
    toggleFormFields(e.target.checked);
  });
  
  // Toggle pagamento
  document.getElementById('form-requires-payment').addEventListener('change', (e) => {
    togglePaymentFields(e.target.checked);
  });
  
  // Adicionar campo ao formulário
  document.getElementById('add-form-field').addEventListener('click', addFormField);
  
  // Theme
  document.getElementById('save-theme').addEventListener('click', saveTheme);
  document.getElementById('revert-theme').addEventListener('click', revertTheme);
  document.getElementById('restore-default-theme').addEventListener('click', restoreDefaultTheme);
  
  // Inscriptions
  document.getElementById('filter-page').addEventListener('change', () => {
    updateInscriptionsStats();
    renderInscriptionsTable();
  });
  document.getElementById('filter-status').addEventListener('change', renderInscriptionsTable);
  document.getElementById('search-inscription').addEventListener('input', renderInscriptionsTable);
  document.getElementById('export-inscriptions').addEventListener('click', exportInscriptionsCSV);
  
  // Modal
  document.getElementById('close-modal').addEventListener('click', closeInscriptionModal);
  document.getElementById('inscription-modal').addEventListener('click', (e) => {
    if (e.target.id === 'inscription-modal') {
      closeInscriptionModal();
    }
  });
  
  // Images
  document.getElementById('clear-all-images').addEventListener('click', clearAllImages);
}

// ============= INSCRIPTIONS MANAGER =============

function loadInscriptions() {
  const raw = localStorage.getItem('inscriptions');
  state.inscriptions = raw ? JSON.parse(raw) : {};
  return state.inscriptions;
}

async function loadInscriptionsEditor() {
  loadInscriptions();
  await populatePageFilter();
  updateInscriptionsStats();
  renderInscriptionsTable();
}

function updateInscriptionsStats() {
  const filterPage = document.getElementById('filter-page')?.value;
  
  let total = 0;
  let confirmed = 0;
  let pending = 0;
  
  // Se houver filtro de página, contar apenas dessa página
  if (filterPage) {
    const pageInscriptions = state.inscriptions[filterPage] || [];
    pageInscriptions.forEach(inscription => {
      total++;
      if (inscription.status === 'confirmed') {
        confirmed++;
      } else {
        pending++;
      }
    });
  } else {
    // Contar todas (fallback, não deve acontecer mais)
    Object.keys(state.inscriptions).forEach(pageSlug => {
      state.inscriptions[pageSlug].forEach(inscription => {
        total++;
        if (inscription.status === 'confirmed') {
          confirmed++;
        } else {
          pending++;
        }
      });
    });
  }
  
  document.getElementById('total-inscriptions').textContent = total;
  document.getElementById('confirmed-inscriptions').textContent = confirmed;
  document.getElementById('pending-inscriptions').textContent = pending;
}

async function populatePageFilter() {
  const select = document.getElementById('filter-page');
  // Filtrar apenas páginas de formulário que estão ativas
  const allPages = await loadPages();
  const pages = Array.isArray(allPages) ? allPages.filter(p => p.is_form && p.is_active) : [];
  
  select.innerHTML = '';
  
  // Se não houver páginas ativas, mostrar mensagem
  if (pages.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Nenhuma página de formulário ativa';
    select.appendChild(option);
    return;
  }
  
  // Adicionar páginas ativas
  pages.forEach((page, index) => {
    const option = document.createElement('option');
    option.value = page.slug;
    option.textContent = page.label;
    
    // Selecionar a primeira por padrão
    if (index === 0) {
      option.selected = true;
    }
    
    select.appendChild(option);
  });
}

function renderInscriptionsTable() {
  const tbody = document.getElementById('inscriptions-tbody');
  const filterPage = document.getElementById('filter-page').value;
  const filterStatus = document.getElementById('filter-status').value;
  const searchTerm = document.getElementById('search-inscription').value.toLowerCase();
  
  // Se não houver página selecionada, não mostrar nada
  if (!filterPage) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem;">
          Selecione uma página de formulário
        </td>
      </tr>
    `;
    return;
  }
  
  // Coletar inscrições apenas da página selecionada
  let allInscriptions = [];
  const pageInscriptions = state.inscriptions[filterPage] || [];
  pageInscriptions.forEach(inscription => {
    allInscriptions.push({
      ...inscription,
      pageSlug: filterPage
    });
  });
  
  // Filtrar por status e busca
  state.filteredInscriptions = allInscriptions.filter(inscription => {
    if (filterStatus && inscription.status !== filterStatus) return false;
    
    if (searchTerm) {
      const searchableText = JSON.stringify(inscription.data).toLowerCase();
      if (!searchableText.includes(searchTerm)) return false;
    }
    
    return true;
  });
  
  // Ordenar por data (mais recente primeiro)
  state.filteredInscriptions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Renderizar
  if (state.filteredInscriptions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem;">
          Nenhuma inscrição encontrada
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = '';
  state.filteredInscriptions.forEach((inscription, index) => {
    const page = state.pages.find(p => p.slug === inscription.pageSlug);
    const pageName = page ? page.label : inscription.pageSlug;
    const date = new Date(inscription.timestamp).toLocaleString('pt-BR');
    const status = inscription.status || 'pending';
    
    // Extrair nome do candidato (primeiro campo que contenha "nome" mas não "responsável")
    let candidateName = '-';
    Object.keys(inscription.data).forEach(key => {
      const keyLower = key.toLowerCase();
      if (candidateName === '-' && keyLower.includes('nome')) {
        // Excluir campos de responsável
        if (!keyLower.includes('responsável') && !keyLower.includes('responsavel')) {
          const value = inscription.data[key];
          if (value && typeof value === 'string') {
            candidateName = value;
          }
        }
      }
    });
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${date}</td>
      <td><strong>${candidateName}</strong></td>
      <td>${pageName}</td>
      <td>
        <span class="inscription-status ${status}">
          ${status === 'confirmed' ? 'Confirmado' : 'Pendente'}
        </span>
      </td>
      <td>
        <div class="btn-group">
          <button class="btn btn-secondary btn-small view-inscription" data-id="${inscription.id}" data-slug="${inscription.pageSlug}">👁️ Ver Detalhes</button>
          ${status === 'pending' 
            ? `<button class="btn btn-secondary btn-small confirm-inscription" data-id="${inscription.id}" data-slug="${inscription.pageSlug}">✓ Confirmar</button>`
            : `<button class="btn btn-secondary btn-small unconfirm-inscription" data-id="${inscription.id}" data-slug="${inscription.pageSlug}">✗ Desconfirmar</button>`
          }
          <button class="btn btn-danger btn-small delete-inscription" data-id="${inscription.id}" data-slug="${inscription.pageSlug}">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  // Event listeners
  tbody.querySelectorAll('.view-inscription').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const slug = e.target.dataset.slug;
      showInscriptionModal(slug, id);
    });
  });
  
  tbody.querySelectorAll('.confirm-inscription').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const slug = e.target.dataset.slug;
      confirmInscription(slug, id);
    });
  });
  
  tbody.querySelectorAll('.unconfirm-inscription').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const slug = e.target.dataset.slug;
      unconfirmInscription(slug, id);
    });
  });
  
  tbody.querySelectorAll('.delete-inscription').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const slug = e.target.dataset.slug;
      deleteInscription(slug, id);
    });
  });
}

function showInscriptionModal(pageSlug, id) {
  const inscription = state.inscriptions[pageSlug].find(i => i.id === id);
  if (!inscription) return;
  
  const page = state.pages.find(p => p.slug === pageSlug);
  const pageName = page ? page.label : pageSlug;
  const date = new Date(inscription.timestamp).toLocaleString('pt-BR');
  
  let modalContent = `
    <div class="modal-data-item">
      <span class="modal-data-label">Página</span>
      <div class="modal-data-value">${pageName}</div>
    </div>
    <div class="modal-data-item">
      <span class="modal-data-label">Data de Inscrição</span>
      <div class="modal-data-value">${date}</div>
    </div>
  `;
  
  Object.keys(inscription.data).forEach(key => {
    if (!key.startsWith('_')) {
      const value = Array.isArray(inscription.data[key]) 
        ? inscription.data[key].join(', ') 
        : inscription.data[key];
      
      modalContent += `
        <div class="modal-data-item">
          <span class="modal-data-label">${key}</span>
          <div class="modal-data-value">${value || '-'}</div>
        </div>
      `;
    }
  });
  
  document.getElementById('modal-body').innerHTML = modalContent;
  document.getElementById('inscription-modal').classList.add('active');
}

function closeInscriptionModal() {
  document.getElementById('inscription-modal').classList.remove('active');
}

function confirmInscription(pageSlug, id) {
  const inscription = state.inscriptions[pageSlug].find(i => i.id === id);
  if (inscription) {
    inscription.status = 'confirmed';
    localStorage.setItem('inscriptions', JSON.stringify(state.inscriptions));
    updateInscriptionsStats();
    renderInscriptionsTable();
    showAlert('Inscrição confirmada!');
  }
}

function unconfirmInscription(pageSlug, id) {
  const inscription = state.inscriptions[pageSlug].find(i => i.id === id);
  if (inscription) {
    inscription.status = 'pending';
    localStorage.setItem('inscriptions', JSON.stringify(state.inscriptions));
    updateInscriptionsStats();
    renderInscriptionsTable();
    showAlert('Inscrição marcada como pendente.');
  }
}

function deleteInscription(pageSlug, id) {
  if (confirm('Deseja realmente excluir esta inscrição?')) {
    state.inscriptions[pageSlug] = state.inscriptions[pageSlug].filter(i => i.id !== id);
    localStorage.setItem('inscriptions', JSON.stringify(state.inscriptions));
    updateInscriptionsStats();
    renderInscriptionsTable();
    showAlert('Inscrição excluída.');
  }
}

function exportInscriptionsCSV() {
  if (state.filteredInscriptions.length === 0) {
    showAlert('Nenhuma inscrição para exportar.', 'error');
    return;
  }
  
  // Coletar todos os campos únicos
  const allFields = new Set();
  state.filteredInscriptions.forEach(inscription => {
    Object.keys(inscription.data).forEach(key => {
      if (!key.startsWith('_')) {
        allFields.add(key);
      }
    });
  });
  
  // Criar CSV
  let csv = 'Data,Página,Status,' + Array.from(allFields).join(',') + '\n';
  
  state.filteredInscriptions.forEach(inscription => {
    const page = state.pages.find(p => p.slug === inscription.pageSlug);
    const pageName = page ? page.label : inscription.pageSlug;
    const date = new Date(inscription.timestamp).toLocaleString('pt-BR');
    const status = inscription.status === 'confirmed' ? 'Confirmado' : 'Pendente';
    
    let row = `"${date}","${pageName}","${status}"`;
    
    allFields.forEach(field => {
      const value = inscription.data[field] || '';
      const csvValue = Array.isArray(value) ? value.join('; ') : value;
      row += `,"${csvValue}"`;
    });
    
    csv += row + '\n';
  });
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `inscricoes_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  
  showAlert('CSV exportado com sucesso!');
}

function clearAllInscriptions() {
  const filterPage = document.getElementById('filter-page').value;
  
  if (!filterPage) {
    showAlert('Selecione uma página primeiro.', 'error');
    return;
  }
  
  const page = state.pages.find(p => p.slug === filterPage);
  const pageName = page ? page.label : filterPage;
  
  if (confirm(`ATENÇÃO: Isso irá apagar TODAS as inscrições de "${pageName}" permanentemente. Deseja continuar?`)) {
    if (confirm('Tem certeza absoluta? Esta ação não pode ser desfeita!')) {
      // Remover apenas as inscrições da página selecionada
      delete state.inscriptions[filterPage];
      localStorage.setItem('inscriptions', JSON.stringify(state.inscriptions));
      
      updateInscriptionsStats();
      renderInscriptionsTable();
      showAlert(`Todas as inscrições de "${pageName}" foram removidas.`);
    }
  }
}

// ============= IMAGES MANAGER =============

const API_URL = window.location.origin;

async function loadImages() {
  try {
    // Usar Supabase Storage em vez de API local
    const images = await listImagesSupabase('site-images');
    return images || [];
  } catch (error) {
    console.error('Erro ao carregar imagens:', error);
    return [];
  }
}

function loadImagesEditor() {
  renderImagesGrid();
  initImageUpload();
}

async function renderImagesGrid() {
  const images = await loadImages();
  const grid = document.getElementById('images-grid');
  const count = document.getElementById('images-count');
  
  count.textContent = images.length;
  
  if (images.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: var(--color-gray-dark); padding: var(--spacing-lg);">Nenhuma imagem ainda. Faça upload acima.</p>';
    return;
  }
  
  grid.innerHTML = '';
  
  images.forEach(image => {
    const card = document.createElement('div');
    card.className = 'image-card';

    // Calcular tamanho em KB
    const sizeKB = Math.round(image.size / 1024);

    // Obter dimensões da imagem
    const img = new Image();
    img.src = image.url;  // Usar URL do Supabase

    card.innerHTML = `
      <img src="${image.url}" alt="${image.filename}" class="image-preview">
      <div class="image-name" title="${image.filename}">${image.filename}</div>
      <div class="image-info" id="info-${image.filename.replace(/[^a-z0-9]/gi, '')}">
        💾 ${sizeKB}KB
      </div>
      <div class="image-actions">
        <button class="copy-url-btn" data-url="${image.url}">📋 Copiar URL</button>
        <button class="delete-image-btn" data-path="${image.path}">🗑️</button>
      </div>
    `;

    grid.appendChild(card);

    // Atualizar dimensões quando a imagem carregar
    img.onload = () => {
      const infoEl = document.getElementById(`info-${image.filename.replace(/[^a-z0-9]/gi, '')}`);
      if (infoEl) {
        infoEl.textContent = `📏 ${img.width}x${img.height}px | 💾 ${sizeKB}KB`;
      }
    };
  });
  
  // Event listeners
  grid.querySelectorAll('.copy-url-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const url = e.target.dataset.url;
      copyImageUrl(url);
    });
  });

  grid.querySelectorAll('.delete-image-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const path = e.target.dataset.path;
      deleteImage(path);
    });
  });
}

function initImageUpload() {
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('image-upload-input');
  
  // Click to upload
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });
  
  // File input change
  fileInput.addEventListener('change', async (e) => {
    await handleFiles(e.target.files);
    fileInput.value = ''; // Reset input
  });
  
  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  
  uploadArea.addEventListener('drop', async (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    await handleFiles(e.dataTransfer.files);
  });
}

async function handleFiles(files) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  for (const file of Array.from(files)) {
    // Validar tipo
    if (!validTypes.includes(file.type)) {
      showAlert(`${file.name}: Formato não suportado. Use JPG, PNG, GIF ou WebP.`, 'error');
      continue;
    }
    
    // Validar tamanho
    if (file.size > maxSize) {
      showAlert(`${file.name}: Arquivo muito grande. Máximo 5MB.`, 'error');
      continue;
    }
    
    // Processar imagem
    await uploadImage(file);
  }
}

async function uploadImage(file) {
  try {
    // Usar Supabase Storage em vez de upload local
    const result = await uploadImageSupabase(file, 'site-images');

    if (result.success) {
      showAlert(`Imagem "${result.originalName}" salva com sucesso!`);
      await renderImagesGrid();
    } else {
      showAlert(`Erro ao fazer upload: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Erro no upload:', error);
    showAlert(`Erro ao fazer upload de "${file.name}"`, 'error');
  }
}

function copyImageUrl(url) {
  // Copiar URL para clipboard
  navigator.clipboard.writeText(url).then(() => {
    showAlert(`URL copiada!`);
  }).catch(() => {
    // Fallback para navegadores antigos
    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showAlert(`URL copiada!`);
  });
}

async function deleteImage(path) {
  if (confirm(`Deseja realmente excluir esta imagem?`)) {
    try {
      // Usar Supabase Storage em vez de API local
      const result = await deleteImageSupabase(path);

      if (result.success) {
        showAlert(`Imagem excluída com sucesso!`);
        await renderImagesGrid();
      } else {
        showAlert(`Erro ao excluir: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      showAlert(`Erro ao excluir imagem`, 'error');
    }
  }
}

async function clearAllImages() {
  if (confirm('ATENÇÃO: Isso irá excluir TODAS as imagens. Deseja continuar?')) {
    if (confirm('Tem certeza absoluta? Esta ação não pode ser desfeita!')) {
      try {
        const images = await loadImages();

        for (const image of images) {
          await deleteImageSupabase(image.path);
        }
        
        await renderImagesGrid();
        showAlert('Todas as imagens foram removidas.');
      } catch (error) {
        console.error('Erro ao limpar imagens:', error);
        showAlert('Erro ao limpar imagens', 'error');
      }
    }
  }
}

async function exportImagesBackup() {
  showAlert('Função de backup desabilitada. As imagens estão salvas na pasta uploads/ do projeto.', 'error');
}

async function importImagesBackup() {
  showAlert('Função de importação desabilitada. Faça upload das imagens diretamente.', 'error');
}

// ============= AUTH (MVP) =============

function checkAuth() {
  const password = localStorage.getItem('admin_password');
  
  if (!password) {
    // Auto-login para desenvolvimento (remover em produção)
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev) {
      localStorage.setItem('admin_password', 'admin123');
      return true;
    }
    
    const input = prompt('Digite a senha do admin:');
    if (input === 'admin123') {
      localStorage.setItem('admin_password', 'admin123');
      return true;
    } else {
      alert('Senha incorreta!');
      window.location.href = '/';
      return false;
    }
  }
  
  return true;
}

// ============= INIT =============

function initAdmin() {
  if (!checkAuth()) return;
  
  initTabs();
  loadHomeEditor();
  loadPagesEditor();
  loadInscriptionsEditor();
  loadImagesEditor();
  initPreview();
  initEventListeners();
  
  // Aplicar tema inicial
  applyThemeToAdmin(state.homeContent.theme);
}

// Executar imediatamente se DOM já estiver carregado, ou aguardar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  // Pequeno delay para garantir que o DOM esteja completamente renderizado
  setTimeout(initAdmin, 100);
}
