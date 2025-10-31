import { getAllPages, getInscriptions } from './supabase.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConfirmation);
} else {
  initConfirmation();
}

async function initConfirmation() {
  const urlParams = new URLSearchParams(window.location.search);
  const inscriptionId = urlParams.get('id');
  const pageSlug = urlParams.get('page');

  if (!inscriptionId || !pageSlug) {
    renderError('Parâmetros inválidos na URL.', 'Erro');
    return;
  }

  try {
    const [page, inscription] = await Promise.all([
      fetchPage(pageSlug),
      fetchInscription(pageSlug, inscriptionId)
    ]);

    if (!inscription) {
      renderError(`ID: ${inscriptionId}`, 'Inscrição não encontrada');
      return;
    }

    if (!page || !page.is_form) {
      renderError(`Slug: ${pageSlug}`, 'Página não encontrada');
      return;
    }

    displayInscription(inscription, page);
  } catch (error) {
    console.error('Erro ao carregar confirmação:', error);
    renderError(error.message || 'Ocorreu um erro inesperado.', 'Erro');
  }
}

async function fetchInscription(pageSlug, inscriptionId) {
  try {
    const inscriptions = await getInscriptions(pageSlug);
    if (Array.isArray(inscriptions)) {
      const match = inscriptions.find(item => String(item.id) === String(inscriptionId));
      if (match) return match;
    }
  } catch (error) {
    console.error('Erro ao carregar inscrição do Supabase:', error);
  }

  try {
    const fallbackKey = `inscriptions_${pageSlug}`;
    const raw = localStorage.getItem(fallbackKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const match = parsed.find(item => String(item.id) === String(inscriptionId));
        if (match) return match;
      }
    }
  } catch (error) {
    console.error('Erro ao carregar inscrição do localStorage:', error);
  }

  try {
    const legacyRaw = localStorage.getItem('inscriptions');
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed[pageSlug])) {
        return parsed[pageSlug].find(item => String(item.id) === String(inscriptionId));
      }
    }
  } catch (error) {
    console.error('Erro ao carregar inscrição no formato legado:', error);
  }

  return null;
}

async function fetchPage(pageSlug) {
  try {
    const pages = await getAllPages();
    if (Array.isArray(pages)) {
      const match = pages.find(page => page.slug === pageSlug);
      if (match) return match;
    }
  } catch (error) {
    console.error('Erro ao carregar páginas do Supabase:', error);
  }

  try {
    const raw = localStorage.getItem('pages');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.find(page => page.slug === pageSlug) : null;
  } catch (error) {
    console.error('Erro ao carregar páginas do localStorage:', error);
    return null;
  }
}

function displayInscription(inscription, page) {
  const formDataRaw = inscription.form_data ?? inscription.data ?? {};
  const formData = typeof formDataRaw === 'string' ? safeParseJson(formDataRaw) : formDataRaw;

  const subtitleText = document.getElementById('subtitle-text');
  if (page.form_config?.confirmation_message && subtitleText) {
    subtitleText.textContent = page.form_config.confirmation_message;
  }

  const inscriptionNumber =
    formData._sequence ??
    formData._numero_inscricao ??
    formData._inscricao ??
    formData._inscricao_numero ??
    inscription.id;

  const inscriptionIdEl = document.getElementById('inscription-id');
  if (inscriptionIdEl) {
    inscriptionIdEl.textContent = inscriptionNumber || '-';
  }

  const candidateName = extractCandidateName(formData);
  const inscriptionNameEl = document.getElementById('inscription-name');
  if (inscriptionNameEl) {
    inscriptionNameEl.textContent = candidateName;
  }

  setupPaymentSection(page, inscription, candidateName, inscriptionNumber);
}

function extractCandidateName(formData) {
  let candidateName = '-';
  Object.keys(formData).forEach(key => {
    const keyLower = key.toLowerCase();
    if (candidateName === '-' && keyLower.includes('nome')) {
      if (!keyLower.includes('responsável') && !keyLower.includes('responsavel')) {
        const value = formData[key];
        if (value && typeof value === 'string') {
          candidateName = value;
        }
      }
    }
  });
  return candidateName;
}

function setupPaymentSection(page, inscription, candidateName, inscriptionNumber) {
  const requiresPayment = page.form_config?.requires_payment || false;
  const paymentConfig = page.form_config?.payment;

  const alertBox = document.getElementById('alert-box');
  const paymentSection = document.getElementById('payment-section');
  const whatsappSection = document.getElementById('whatsapp-section');

  if (!requiresPayment || !paymentConfig) {
    if (alertBox) alertBox.style.display = 'none';
    if (paymentSection) paymentSection.style.display = 'none';
    if (whatsappSection) whatsappSection.style.display = 'none';
    return;
  }

  if (alertBox) alertBox.style.display = 'block';
  if (paymentSection) paymentSection.style.display = 'block';

  const pixKeyValueEl = document.getElementById('pix-key-value');
  if (pixKeyValueEl) {
    pixKeyValueEl.textContent = paymentConfig.pix_key || '-';
  }
  generateQRCode(paymentConfig.pix_key || '');

  const copyButton = document.getElementById('copy-button');
  if (copyButton) {
    copyButton.addEventListener('click', () => {
      copyToClipboard(paymentConfig.pix_key || '');
    });
  }

  if (paymentConfig.whatsapp) {
    if (whatsappSection) whatsappSection.style.display = 'block';
    const whatsappLink = document.getElementById('whatsapp-link');
    if (whatsappLink) {
      const whatsappMessage = encodeURIComponent(
        `Olá! Gostaria de pagar a inscrição #${inscriptionNumber} (${candidateName}) com cartão de crédito.`
      );
      whatsappLink.href = `https://wa.me/${paymentConfig.whatsapp}?text=${whatsappMessage}`;
    }
  } else if (whatsappSection) {
    whatsappSection.style.display = 'none';
  }
}

function renderError(detail, title = 'Erro') {
  document.body.innerHTML = `
    <div style="padding: 2rem; text-align: center;">
      <h1>${title}</h1>
      <p>${detail}</p>
      <a href="/">Voltar à Home</a>
    </div>
  `;
}

function generateQRCode(pixKey) {
  const qrCodeImage = document.getElementById('qr-code-image');
  if (!qrCodeImage) return;

  if (!pixKey) {
    qrCodeImage.removeAttribute('src');
    return;
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixKey)}`;
  qrCodeImage.src = qrCodeUrl;
}

function copyToClipboard(text) {
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    handleCopyFeedback(true);
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      handleCopyFeedback(true);
    } catch (error) {
      handleCopyFeedback(false);
    } finally {
      document.body.removeChild(textarea);
    }
  });
}

function handleCopyFeedback(success) {
  const button = document.getElementById('copy-button');
  if (!button) return;

  const originalText = button.textContent;
  button.textContent = success ? 'Copiado!' : 'Não foi possível copiar';
  button.classList.add('copied');

  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('copied');
  }, 2000);
}

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Não foi possível converter JSON de inscrição:', error);
    return {};
  }
}
