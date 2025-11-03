import { getAllPages, getInscriptions, getInscriptionGroup } from './supabase.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConfirmation);
} else {
  initConfirmation();
}

async function initConfirmation() {
  const urlParams = new URLSearchParams(window.location.search);
  const inscriptionId = urlParams.get('id');
  const groupId = urlParams.get('group');
  const pageSlug = urlParams.get('page');

  // Aceita tanto id quanto group
  if ((!inscriptionId && !groupId) || !pageSlug) {
    renderError('Parâmetros inválidos na URL.', 'Erro');
    return;
  }

  try {
    const page = await fetchPage(pageSlug);
    
    if (!page || !page.is_form) {
      renderError(`Slug: ${pageSlug}`, 'Página não encontrada');
      return;
    }

    let inscription;
    
    if (groupId) {
      // Buscar grupo completo
      inscription = await fetchInscriptionGroup(groupId);
      if (!inscription) {
        renderError(`Group ID: ${groupId}`, 'Grupo não encontrado');
        return;
      }
    } else {
      // Buscar inscrição individual
      inscription = await fetchInscription(pageSlug, inscriptionId);
      if (!inscription) {
        renderError(`ID: ${inscriptionId}`, 'Inscrição não encontrada');
        return;
      }
    }

    displayInscription(inscription, page, !!groupId);
  } catch (error) {
    console.error('Erro ao carregar confirmação:', error);
    renderError(error.message || 'Ocorreu um erro inesperado.', 'Erro');
  }
}

async function fetchInscriptionGroup(groupId) {
  try {
    const group = await getInscriptionGroup(groupId);
    return group;
  } catch (error) {
    console.error('Erro ao carregar grupo:', error);
    return null;
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

function displayInscription(inscription, page, isGroupView = false) {
  let formData, groupSize, isGroup;
  
  if (isGroupView && Array.isArray(inscription)) {
    // Dados de grupo (array de inscrições)
    const responsible = inscription.find(i => i.is_responsible);
    const participants = inscription.filter(i => !i.is_responsible);
    
    // Se tem responsável, usar dados dele; senão pegar do primeiro participante
    if (responsible) {
      formData = responsible.form_data || {};
    } else if (participants.length > 0) {
      // Responsável não participa - pegar dados de contato do metadata
      formData = {
        'Nome do Responsável': participants[0].form_data._responsible_name,
        'Email': participants[0].form_data._responsible_email,
        'Telefone': participants[0].form_data._responsible_phone
      };
    } else {
      formData = {};
    }
    
    // groupSize = APENAS participantes (sempre)
    groupSize = participants.length;
    isGroup = groupSize > 0;
    
    // Adicionar lista de participantes com números de inscrição ao formData
    formData.participants = participants.map(i => ({
      ...i.form_data,
      _inscription_number: i.form_data._sequence || i.id
    }));
    
    // Guardar apenas participantes para exibir números (sem responsável)
    formData._all_inscriptions = participants;
  } else {
    // Dados de inscrição individual
    const formDataRaw = inscription.form_data ?? inscription.data ?? {};
    formData = typeof formDataRaw === 'string' ? safeParseJson(formDataRaw) : formDataRaw;
    groupSize = parseInt(formData._group_size, 10) || 1;
    isGroup = groupSize > 1;
  }

  const subtitleText = document.getElementById('subtitle-text');
  if (page.form_config?.confirmation_message && subtitleText) {
    subtitleText.textContent = page.form_config.confirmation_message;
  }

  const candidateName = extractCandidateName(formData);
  const inscriptionNameEl = document.getElementById('inscription-name');
  const inscriptionIdEl = document.getElementById('inscription-id');
  let inscriptionNumber;
  
  if (isGroup && Array.isArray(formData._all_inscriptions)) {
    // MODO GRUPO: Mostrar números dos participantes
    if (inscriptionIdEl) {
      if (formData._all_inscriptions.length > 0) {
        const numbers = formData._all_inscriptions
          .map(i => i.form_data._sequence || i.id)
          .join(', #');
        inscriptionIdEl.innerHTML = `#${numbers}`;
      }
    }
    
    // Número da primeira inscrição para referência
    inscriptionNumber = formData._all_inscriptions[0]?.form_data._sequence || formData._all_inscriptions[0]?.id;
    
    if (inscriptionNameEl) {
      const participantCount = groupSize;
      const participantWord = participantCount === 1 ? 'participante' : 'participantes';
      inscriptionNameEl.textContent = `Grupo de ${participantCount} ${participantWord}`;

      // Adicionar lista de participantes após o nome
      const participantsHtml = renderParticipantsList(formData);
      if (participantsHtml) {
        const participantsContainer = document.createElement('div');
        participantsContainer.className = 'participants-list';
        participantsContainer.style.marginTop = '1rem';
        participantsContainer.style.fontSize = '0.9em';
        participantsContainer.innerHTML = participantsHtml;
        inscriptionNameEl.parentElement.appendChild(participantsContainer);
      }
    }
  } else {
    // MODO INDIVIDUAL
    inscriptionNumber =
      formData._sequence ??
      formData._numero_inscricao ??
      formData._inscricao ??
      formData._inscricao_numero ??
      (Array.isArray(inscription) ? inscription[0]?.id : inscription.id);

    if (inscriptionIdEl) {
      inscriptionIdEl.textContent = inscriptionNumber || '-';
    }
    
    if (inscriptionNameEl) {
      inscriptionNameEl.textContent = candidateName;
    }
  }

  setupPaymentSection(page, inscription, candidateName, inscriptionNumber, groupSize, isGroupView);
}

function renderParticipantsList(formData) {
  const participants = formData.participants;
  if (!Array.isArray(participants) || participants.length === 0) {
    return '';
  }

  let html = '<h3 style="margin-top: 1.5rem; margin-bottom: 0.5rem;">Participantes:</h3><ul style="list-style: none; padding: 0;">';
  participants.forEach((participant, index) => {
    // Buscar nome em diferentes formatos possíveis
    const name = 
      participant['Nome do Participante'] ||
      participant['Nome'] || 
      participant['Nome completo'] || 
      `Participante ${index + 1}`;
    const age = participant['Idade'] || participant['Idade do Participante'] ? ` (${participant['Idade'] || participant['Idade do Participante']} anos)` : '';
    const inscriptionNum = participant._inscription_number ? ` - Inscrição #${participant._inscription_number}` : '';
    html += `<li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;"><strong>${name}</strong>${age}${inscriptionNum}</li>`;
  });
  html += '</ul>';
  return html;
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

function setupPaymentSection(page, inscription, candidateName, inscriptionNumber, groupSize = 1, isGroupView = false) {
  const requiresPayment = page.form_config?.requires_payment || false;
  const paymentConfig = page.form_config?.payment;

  const alertBox = document.getElementById('alert-box');
  const paymentSection = document.getElementById('payment-section');
  const whatsappSection = document.getElementById('whatsapp-section');

  // Sempre mostrar alerta se página tem pagamento configurado
  if (!requiresPayment || !paymentConfig) {
    if (alertBox) alertBox.style.display = 'none';
    if (paymentSection) paymentSection.style.display = 'none';
    if (whatsappSection) whatsappSection.style.display = 'none';
    return;
  }

  // Grupo = inscrição múltipla com participantes
  const isGroup = isGroupView && groupSize >= 1;

  if (alertBox) alertBox.style.display = 'block';

  if (isGroup) {
    // MODO GRUPO: Esconder PIX e mostrar apenas WhatsApp
    if (paymentSection) paymentSection.style.display = 'none';

    // Adicionar mensagem especial para grupos
    if (alertBox) {
      const totalValue = paymentConfig.value * groupSize;
      const unitValue = paymentConfig.value;

      // Substituir completamente o conteúdo do alertBox
      alertBox.innerHTML = `
        <h3 style="margin: 0 0 0.5rem 0; color: #2C7A7B;">💰 Pagamento de Grupo</h3>
        <p style="margin: 0;">
          Sua inscrição foi registrada para <strong>${groupSize} participantes</strong>.<br><br>
          <strong>💵 Valor a ser pago:</strong><br>
          <span style="font-size: 1.3em; color: #667eea; font-weight: bold;">R$ ${totalValue.toFixed(2)}</span><br>
          <span style="font-size: 0.9em; color: #666;">(${groupSize} participantes × R$ ${unitValue.toFixed(2)} cada)</span><br><br>
          📱 Entre em contato pelo WhatsApp abaixo. A mensagem já estará preenchida com as informações da sua inscrição!
        </p>
      `;
    }

    if (paymentConfig.whatsapp) {
      if (whatsappSection) {
        whatsappSection.style.display = 'block';
      }
      const whatsappLink = document.getElementById('whatsapp-link');
      if (whatsappLink) {
        const totalValue = paymentConfig.value * groupSize;
        const unitValue = paymentConfig.value;
        const whatsappMessage = encodeURIComponent(
          `Olá! Me inscrevi em grupo para ${groupSize} participantes (inscrição #${inscriptionNumber}) e o valor será de R$ ${totalValue.toFixed(2)} (${groupSize} × R$ ${unitValue.toFixed(2)}).`
        );
        whatsappLink.href = `https://wa.me/${paymentConfig.whatsapp}?text=${whatsappMessage}`;
      }
    }
  } else {
    // MODO INDIVIDUAL: Comportamento original
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
