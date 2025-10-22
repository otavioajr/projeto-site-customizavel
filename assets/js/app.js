// app.js - Renderização da Home
import { getHomeContent, getPages } from './supabase.js';

// Helpers para buscar imagens locais
function resolveImageUrl(urlOrName) {
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

// Helpers
function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el && value) el.textContent = value;
}

function setHref(selector, value) {
  const el = document.querySelector(selector);
  if (el && value) el.href = value;
}

function setSrc(selector, value) {
  const el = document.querySelector(selector);
  if (el && value) {
    const resolvedUrl = resolveImageUrl(value);
    el.src = resolvedUrl;
  }
}

function setBg(selector, url) {
  const el = document.querySelector(selector);
  if (el && url) {
    const resolvedUrl = resolveImageUrl(url);
    el.style.backgroundImage = `url(${resolvedUrl})`;
  }
}

function applyThemeVars(theme) {
  if (!theme) return;
  const r = document.documentElement.style;
  if (theme.primary) r.setProperty('--color-primary', theme.primary);
  if (theme.secondary) r.setProperty('--color-secondary', theme.secondary);
  if (theme.text) r.setProperty('--color-text', theme.text);
  if (theme.background) r.setProperty('--color-bg', theme.background);
}

// Carregar conteúdo da Home
async function loadHomeContent() {
  try {
    const content = await getHomeContent();
    if (content) return content;
    return getDefaultHomeContent();
  } catch (e) {
    console.error('Erro ao carregar home_content do Supabase:', e);
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

// Conteúdo padrão
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

// Renderizar Serviços
function renderServices(services) {
  const grid = document.getElementById('services-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  services.slice(0, 3).forEach(service => {
    const card = document.createElement('div');
    card.className = 'service-card';
    const iconUrl = service.icon_url ? resolveImageUrl(service.icon_url) : null;
    card.innerHTML = `
      ${iconUrl ? `<img src="${iconUrl}" alt="${service.title}" class="service-icon">` : ''}
      <h3>${service.title || ''}</h3>
      <p>${service.text || ''}</p>
    `;
    grid.appendChild(card);
  });
}

// Renderizar Depoimentos
function renderTestimonials(testimonials) {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  testimonials.forEach(testimonial => {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.innerHTML = `
      <p class="testimonial-text">${testimonial.text || ''}</p>
      <p class="testimonial-author">— ${testimonial.name || 'Anônimo'}</p>
    `;
    grid.appendChild(card);
  });
}

// Renderizar Galeria
function renderGallery(imageUrls) {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  imageUrls.slice(0, 6).forEach(url => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    const resolvedUrl = resolveImageUrl(url);
    item.innerHTML = `<img src="${resolvedUrl}" alt="Galeria" loading="lazy">`;
    grid.appendChild(item);
  });
}

// Carregar páginas do menu
async function loadPages() {
  try {
    const pages = await getPages();
    return pages || [];
  } catch (e) {
    console.error('Erro ao carregar pages do Supabase:', e);
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

// Renderizar menu dinâmico
async function renderMenu() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  
  const pages = await loadPages();
  const activePages = pages.filter(p => p.is_active).sort((a, b) => a.order - b.order);
  
  activePages.forEach(page => {
    const link = document.createElement('a');
    link.href = `/p/#${page.slug}`;
    link.textContent = page.label;
    nav.appendChild(link);
  });
}

// Renderizar Home
async function renderHome() {
  const data = await loadHomeContent();
  if (!data) return;

  // SEO
  document.title = data.seo?.title || document.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && data.seo?.description) {
    metaDesc.setAttribute('content', data.seo.description);
  }

  // Tema
  if (data.theme) applyThemeVars(data.theme);

  // Hero
  const hero = data.hero || {};
  setText('#hero-title', hero.title);
  setText('#hero-subtitle', hero.subtitle);
  setText('#hero-cta', hero.primary_cta_label);
  setHref('#hero-cta', hero.primary_cta_link);
  setBg('#hero', hero.background_image_url);

  // Sobre
  setText('#about-title', data.about?.title);
  setText('#about-text', data.about?.text);
  setSrc('#about-img', data.about?.image_url);

  // Serviços
  renderServices(data.services || []);

  // Depoimentos
  renderTestimonials(data.testimonials || []);

  // Galeria
  setText('#gallery-title', data.gallery?.title || 'Galeria');
  renderGallery((data.gallery && data.gallery.image_urls) || []);

  // Contato
  setHref('#contact-whats', data.contact?.whatsapp);
  setText('#contact-email', data.contact?.email);
  setHref('#contact-ig', data.contact?.instagram);
  setText('#contact-location', data.contact?.location);
}

// Mobile menu toggle
function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const nav = document.getElementById('main-nav');
  
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }
}

// Preview mode (para o Admin)
function handlePreviewMode() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('preview') === '1') {
    // Escutar mensagens do Admin
    window.addEventListener('message', (event) => {
      if (event.data.type === 'UPDATE_HOME_CONTENT') {
        // Salvar temporariamente e re-renderizar
        const tempData = event.data.content;
        if (tempData.theme) applyThemeVars(tempData.theme);
        // Re-renderizar com novos dados sem salvar no localStorage
        renderHomeWithData(tempData);
      } else if (event.data.type === 'HIGHLIGHT_SECTION') {
        highlightSection(event.data.section);
      }
    });
  }
}

function renderHomeWithData(data) {
  // Versão que aceita dados externos (para preview)
  if (data.seo?.title) document.title = data.seo.title;
  
  if (data.theme) applyThemeVars(data.theme);
  
  const hero = data.hero || {};
  setText('#hero-title', hero.title);
  setText('#hero-subtitle', hero.subtitle);
  setText('#hero-cta', hero.primary_cta_label);
  setHref('#hero-cta', hero.primary_cta_link);
  setBg('#hero', hero.background_image_url);
  
  setText('#about-title', data.about?.title);
  setText('#about-text', data.about?.text);
  setSrc('#about-img', data.about?.image_url);
  
  renderServices(data.services || []);
  renderTestimonials(data.testimonials || []);
  setText('#gallery-title', data.gallery?.title || 'Galeria');
  renderGallery((data.gallery && data.gallery.image_urls) || []);
  
  setHref('#contact-whats', data.contact?.whatsapp);
  setText('#contact-email', data.contact?.email);
  setHref('#contact-ig', data.contact?.instagram);
  setText('#contact-location', data.contact?.location);
}

function highlightSection(sectionId) {
  // Remove highlight anterior
  document.querySelectorAll('.admin-preview-highlight').forEach(el => {
    el.classList.remove('admin-preview-highlight');
  });
  
  // Adiciona novo highlight
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('admin-preview-highlight');
    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Inicialização
async function initApp() {
  await renderMenu();
  await renderHome();
  initMobileMenu();
  handlePreviewMode();
}

// Executar imediatamente se DOM já estiver carregado, ou aguardar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
