// admin.js - CRUD completo e preview ao vivo

// Estado global
const state = {
  homeContent: null,
  pages: [],
  editingPageId: null,
  previewFrame: null,
  formFields: [],
  inscriptions: {},
  filteredInscriptions: []
};

// ============= HELPERS =============

function showAlert(message, type = 'success') {
  const container = document.getElementById('alert-container');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  container.appendChild(alert);
  
  setTimeout(() => {
    alert.remove();
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

function loadHomeContent() {
  const raw = localStorage.getItem('home_content');
  if (!raw) return getDefaultHomeContent();
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao carregar home_content:', e);
    return getDefaultHomeContent();
  }
}

function saveHomeContent(content) {
  localStorage.setItem('home_content', JSON.stringify(content));
}

function loadPages() {
  const raw = localStorage.getItem('pages');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao carregar pages:', e);
    return [];
  }
}

function savePages(pages) {
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

function loadHomeEditor() {
  state.homeContent = loadHomeContent();
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
        <label>Título</label>
        <input type="text" class="service-title" value="${service.title || ''}" data-index="${index}">
      </div>
      <div class="form-group">
        <label>Texto</label>
        <textarea class="service-text" data-index="${index}">${service.text || ''}</textarea>
      </div>
      <div class="form-group">
        <label>URL do Ícone</label>
        <input type="url" class="service-icon" value="${service.icon_url || ''}" data-index="${index}">
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
        <label>Nome</label>
        <input type="text" class="testimonial-name" value="${testimonial.name || ''}" data-index="${index}">
      </div>
      <div class="form-group">
        <label>Depoimento</label>
        <textarea class="testimonial-text" data-index="${index}">${testimonial.text || ''}</textarea>
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
        <label>URL da Imagem ${index + 1}</label>
        <input type="url" class="gallery-url" value="${url || ''}" data-index="${index}">
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

function saveHome() {
  const data = collectHomeData();
  saveHomeContent(data);
  state.homeContent = data;
  showAlert('Home salva com sucesso!');
  updatePreview();
}

function revertHome() {
  if (confirm('Deseja reverter todas as alterações?')) {
    loadHomeEditor();
    showAlert('Alterações revertidas.');
    updatePreview();
  }
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

function loadPagesEditor() {
  state.pages = loadPages();
  renderPagesList();
}

function renderPagesList() {
  const container = document.getElementById('pages-list');
  container.innerHTML = '';
  
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
    document.getElementById('page-slug').value = page.slug;
    
    // Verificar se é formulário
    const isForm = page.is_form || false;
    document.getElementById('page-is-form').checked = isForm;
    toggleFormFields(isForm);
    
    if (isForm) {
      // Preencher campos do formulário
      document.getElementById('form-title').value = page.form_config?.title || '';
      document.getElementById('form-description').value = page.form_config?.description || '';
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
    document.getElementById('page-slug').value = '';
    document.getElementById('page-is-form').checked = false;
    document.getElementById('page-canva-url').value = '';
    document.getElementById('form-title').value = '';
    document.getElementById('form-description').value = '';
    document.getElementById('page-order').value = state.pages.length + 1;
    document.getElementById('page-seo-title').value = '';
    document.getElementById('page-seo-desc').value = '';
    document.getElementById('page-active').checked = true;
    state.formFields = [];
    toggleFormFields(false);
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
        <button class="array-item-remove" data-index="${index}">×</button>
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

function deletePage(id) {
  const page = state.pages.find(p => p.id === id);
  if (!page) return;
  
  if (confirm(`Deseja realmente excluir a página "${page.label}"?`)) {
    state.pages = state.pages.filter(p => p.id !== id);
    savePages(state.pages);
    renderPagesList();
    showAlert('Página excluída com sucesso!');
  }
}

function savePage() {
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
    return;
  }
  
  // Verificar slug único
  const existingPage = state.pages.find(p => p.slug === slug && p.id !== state.editingPageId);
  if (existingPage) {
    showAlert('Já existe uma página com este slug.', 'error');
    return;
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
      return;
    }
    
    if (state.formFields.length === 0) {
      showAlert('Adicione pelo menos um campo ao formulário.', 'error');
      return;
    }
    
    // Validar se todos os campos têm label
    const invalidFields = state.formFields.filter(f => !f.label.trim());
    if (invalidFields.length > 0) {
      showAlert('Todos os campos devem ter um label.', 'error');
      return;
    }
    
    pageData.form_config = {
      title: formTitle,
      description: formDescription,
      fields: state.formFields
    };
  } else {
    // Validações do Canva
    const canvaUrl = document.getElementById('page-canva-url').value.trim();
    
    if (!canvaUrl) {
      showAlert('A URL do Canva é obrigatória.', 'error');
      return;
    }
    
    if (!validateCanvaUrl(canvaUrl)) {
      showAlert('A URL deve começar com https://www.canva.com/', 'error');
      return;
    }
    
    pageData.canva_embed_url = canvaUrl;
  }
  
  if (state.editingPageId) {
    // Editar
    const index = state.pages.findIndex(p => p.id === state.editingPageId);
    state.pages[index] = pageData;
  } else {
    // Adicionar
    state.pages.push(pageData);
  }
  
  savePages(state.pages);
  renderPagesList();
  hidePageForm();
  showAlert('Página salva com sucesso!');
}

// ============= THEME EDITOR =============

function saveTheme() {
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
  updatePreview();
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
  
  // Auto-slug
  document.getElementById('page-label').addEventListener('input', (e) => {
    if (!document.getElementById('page-slug').value) {
      document.getElementById('page-slug').value = slugify(e.target.value);
    }
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
        background: document.getElementById('theme-bg').value
      };
      applyThemeToAdmin(theme);
      updatePreview();
    });
  });
}

function updatePreview() {
  if (!state.previewFrame) return;
  
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
}

// ============= EVENT LISTENERS =============

function initEventListeners() {
  // Home
  document.getElementById('save-home').addEventListener('click', saveHome);
  document.getElementById('revert-home').addEventListener('click', revertHome);
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
  
  // Adicionar campo ao formulário
  document.getElementById('add-form-field').addEventListener('click', addFormField);
  
  // Theme
  document.getElementById('save-theme').addEventListener('click', saveTheme);
  document.getElementById('revert-theme').addEventListener('click', revertTheme);
  
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
}

// ============= INSCRIPTIONS MANAGER =============

function loadInscriptions() {
  const raw = localStorage.getItem('inscriptions');
  state.inscriptions = raw ? JSON.parse(raw) : {};
  return state.inscriptions;
}

function loadInscriptionsEditor() {
  loadInscriptions();
  populatePageFilter();
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

function populatePageFilter() {
  const select = document.getElementById('filter-page');
  // Filtrar apenas páginas de formulário que estão ativas
  const pages = loadPages().filter(p => p.is_form && p.is_active);
  
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

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;
  
  initTabs();
  loadHomeEditor();
  loadPagesEditor();
  loadInscriptionsEditor();
  initPreview();
  initEventListeners();
  
  // Aplicar tema inicial
  applyThemeToAdmin(state.homeContent.theme);
});
