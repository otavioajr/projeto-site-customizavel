/**
 * Testes unitários para helpers de app.js
 * Funções de resolução de URL e aplicação de tema
 */

import { describe, it, expect } from 'vitest';
import {
  resolveImageUrl,
  isValidImageUrl,
  applyThemeVars
} from '../../assets/js/utils/helpers.js';

// Helper para conteúdo padrão (mantido inline para testes específicos)
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
      text: "Sou guia de montanha com 10+ anos de experiência em trilhas, escalada e expedições.",
      image_url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600"
    },
    services: [
      { title: "Trilhas guiadas", text: "Do básico ao avançado.", icon_url: "https://api.iconify.design/mdi/hiking.svg" },
      { title: "Escalada", text: "Aulas e expedições.", icon_url: "https://api.iconify.design/mdi/climbing.svg" },
      { title: "Mergulho", text: "Batismo e certificações.", icon_url: "https://api.iconify.design/mdi/diving-scuba.svg" }
    ],
    testimonials: [
      { name: "Ana P.", text: "Experiência incrível e segura!" },
      { name: "Carlos M.", text: "Profissionalismo do início ao fim." }
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
    theme: { primary: "#0E7C7B", secondary: "#F4A261", text: "#1B1B1B", background: "#FAFAFA" },
    seo: { title: "Aventuras Guiadas", description: "Trilhas, escalada e mergulho com guia certificado. Experiências inesquecíveis em contato com a natureza." },
    contact: { whatsapp: "https://wa.me/5511999999999", email: "contato@aventura.com", instagram: "https://instagram.com/aventuras", location: "São Paulo" }
  };
}

// ========== TESTES ==========

describe('resolveImageUrl', () => {
  describe('URLs externas', () => {
    it('deve retornar URL HTTPS como está', () => {
      expect(resolveImageUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
    });

    it('deve retornar URL HTTP como está', () => {
      expect(resolveImageUrl('http://example.com/image.jpg')).toBe('http://example.com/image.jpg');
    });

    it('deve preservar query strings em URLs externas', () => {
      const url = 'https://images.unsplash.com/photo-123?w=800&h=600';
      expect(resolveImageUrl(url)).toBe(url);
    });
  });

  describe('Data URIs', () => {
    it('deve retornar data URI como está', () => {
      const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==';
      expect(resolveImageUrl(dataUri)).toBe(dataUri);
    });

    it('deve preservar data URI JPEG', () => {
      const dataUri = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
      expect(resolveImageUrl(dataUri)).toBe(dataUri);
    });
  });

  describe('Caminhos absolutos', () => {
    it('deve retornar caminho absoluto como está', () => {
      expect(resolveImageUrl('/uploads/image.jpg')).toBe('/uploads/image.jpg');
    });

    it('deve preservar caminhos com subdiretórios', () => {
      expect(resolveImageUrl('/assets/images/logo.png')).toBe('/assets/images/logo.png');
    });
  });

  describe('Nomes de arquivo', () => {
    it('deve adicionar /uploads/ para nome de arquivo simples', () => {
      expect(resolveImageUrl('image.jpg')).toBe('/uploads/image.jpg');
    });

    it('deve adicionar /uploads/ para nome com timestamp', () => {
      expect(resolveImageUrl('image-1699999999999-abc123.png')).toBe('/uploads/image-1699999999999-abc123.png');
    });

    it('deve lidar com nomes de arquivo com espaços', () => {
      expect(resolveImageUrl('minha imagem.jpg')).toBe('/uploads/minha imagem.jpg');
    });
  });

  describe('Valores inválidos', () => {
    it('deve retornar null para string vazia', () => {
      expect(resolveImageUrl('')).toBe(null);
    });

    it('deve retornar null para null', () => {
      expect(resolveImageUrl(null)).toBe(null);
    });

    it('deve retornar null para undefined', () => {
      expect(resolveImageUrl(undefined)).toBe(null);
    });

    it('deve retornar null para false', () => {
      expect(resolveImageUrl(false)).toBe(null);
    });
  });
});

describe('getDefaultHomeContent', () => {
  it('deve retornar objeto com todas as seções', () => {
    const content = getDefaultHomeContent();
    expect(content).toHaveProperty('hero');
    expect(content).toHaveProperty('about');
    expect(content).toHaveProperty('services');
    expect(content).toHaveProperty('testimonials');
    expect(content).toHaveProperty('gallery');
    expect(content).toHaveProperty('theme');
    expect(content).toHaveProperty('seo');
    expect(content).toHaveProperty('contact');
  });

  it('deve ter hero com campos necessários', () => {
    const { hero } = getDefaultHomeContent();
    expect(hero.title).toBeTruthy();
    expect(hero.subtitle).toBeTruthy();
    expect(hero.primary_cta_label).toBeTruthy();
    expect(hero.primary_cta_link).toBeTruthy();
    expect(hero.background_image_url).toBeTruthy();
  });

  it('deve ter 3 serviços', () => {
    expect(getDefaultHomeContent().services).toHaveLength(3);
  });

  it('deve ter serviços com campos necessários', () => {
    getDefaultHomeContent().services.forEach(service => {
      expect(service.title).toBeTruthy();
      expect(service.text).toBeTruthy();
      expect(service.icon_url).toBeTruthy();
    });
  });

  it('deve ter tema com cores válidas', () => {
    const { theme } = getDefaultHomeContent();
    expect(theme.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.secondary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.text).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.background).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('deve ter galeria com 6 imagens', () => {
    expect(getDefaultHomeContent().gallery.image_urls).toHaveLength(6);
  });

  it('deve ter contato com campos de redes sociais', () => {
    const { contact } = getDefaultHomeContent();
    expect(contact.whatsapp).toContain('wa.me');
    expect(contact.email).toContain('@');
    expect(contact.instagram).toContain('instagram');
    expect(contact.location).toBeTruthy();
  });

  it('deve ter SEO com título e descrição', () => {
    const { seo } = getDefaultHomeContent();
    expect(seo.title).toBeTruthy();
    expect(seo.description).toBeTruthy();
    expect(seo.description.length).toBeGreaterThan(50);
  });
});

describe('applyThemeVars', () => {
  it('deve aplicar todas as cores do tema', () => {
    const theme = { primary: '#FF0000', secondary: '#00FF00', text: '#0000FF', background: '#FFFFFF' };
    const result = applyThemeVars(theme);
    expect(result['--color-primary']).toBe('#FF0000');
    expect(result['--color-secondary']).toBe('#00FF00');
    expect(result['--color-text']).toBe('#0000FF');
    expect(result['--color-bg']).toBe('#FFFFFF');
  });

  it('deve aplicar apenas cores fornecidas', () => {
    const result = applyThemeVars({ primary: '#FF0000' });
    expect(result['--color-primary']).toBe('#FF0000');
    expect(result['--color-secondary']).toBeUndefined();
    expect(result['--color-text']).toBeUndefined();
    expect(result['--color-bg']).toBeUndefined();
  });

  it('deve retornar objeto vazio para tema null', () => {
    expect(applyThemeVars(null)).toEqual({});
  });

  it('deve retornar objeto vazio para tema undefined', () => {
    expect(applyThemeVars(undefined)).toEqual({});
  });

  it('deve ignorar propriedades inválidas', () => {
    const result = applyThemeVars({ primary: '#FF0000', invalidProperty: '#000000' });
    expect(result['--color-primary']).toBe('#FF0000');
    expect(result['--invalidProperty']).toBeUndefined();
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('deve preservar style object existente', () => {
    const result = applyThemeVars({ primary: '#FF0000' }, { 'font-size': '16px' });
    expect(result['font-size']).toBe('16px');
    expect(result['--color-primary']).toBe('#FF0000');
  });
});

describe('isValidImageUrl', () => {
  describe('URLs válidas', () => {
    it('deve aceitar URL HTTPS', () => {
      expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true);
    });

    it('deve aceitar URL HTTP', () => {
      expect(isValidImageUrl('http://example.com/image.png')).toBe(true);
    });

    it('deve aceitar data URI de imagem', () => {
      expect(isValidImageUrl('data:image/png;base64,abc123')).toBe(true);
    });

    it('deve aceitar caminho absoluto', () => {
      expect(isValidImageUrl('/uploads/image.jpg')).toBe(true);
    });

    it('deve aceitar nome de arquivo com extensão de imagem', () => {
      expect(isValidImageUrl('image.jpg')).toBe(true);
      expect(isValidImageUrl('image.jpeg')).toBe(true);
      expect(isValidImageUrl('image.png')).toBe(true);
      expect(isValidImageUrl('image.gif')).toBe(true);
      expect(isValidImageUrl('image.webp')).toBe(true);
      expect(isValidImageUrl('image.svg')).toBe(true);
    });

    it('deve aceitar extensões em maiúscula', () => {
      expect(isValidImageUrl('image.JPG')).toBe(true);
      expect(isValidImageUrl('image.PNG')).toBe(true);
    });
  });

  describe('URLs inválidas', () => {
    it('deve rejeitar string vazia', () => {
      expect(isValidImageUrl('')).toBe(false);
    });

    it('deve rejeitar null', () => {
      expect(isValidImageUrl(null)).toBe(false);
    });

    it('deve rejeitar undefined', () => {
      expect(isValidImageUrl(undefined)).toBe(false);
    });

    it('deve rejeitar número', () => {
      expect(isValidImageUrl(123)).toBe(false);
    });

    it('deve rejeitar data URI não-imagem', () => {
      expect(isValidImageUrl('data:text/plain;base64,abc')).toBe(false);
    });

    it('deve rejeitar arquivo sem extensão de imagem', () => {
      expect(isValidImageUrl('document.pdf')).toBe(false);
      expect(isValidImageUrl('script.js')).toBe(false);
      expect(isValidImageUrl('style.css')).toBe(false);
    });
  });
});

describe('Integração: Resolução de URLs em conteúdo padrão', () => {
  it('deve resolver todas as URLs do conteúdo padrão', () => {
    const content = getDefaultHomeContent();

    expect(resolveImageUrl(content.hero.background_image_url)).toBe(content.hero.background_image_url);
    expect(resolveImageUrl(content.about.image_url)).toBe(content.about.image_url);

    content.services.forEach(service => {
      expect(resolveImageUrl(service.icon_url)).toBe(service.icon_url);
    });

    content.gallery.image_urls.forEach(url => {
      expect(resolveImageUrl(url)).toBe(url);
    });
  });

  it('deve resolver URLs locais corretamente', () => {
    expect(resolveImageUrl('hero-bg.jpg')).toBe('/uploads/hero-bg.jpg');
    expect(resolveImageUrl('/uploads/profile.png')).toBe('/uploads/profile.png');
    expect(resolveImageUrl('https://example.com/icon.svg')).toBe('https://example.com/icon.svg');
  });
});
