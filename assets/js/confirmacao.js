// confirmacao.js - Página de confirmação de inscrição

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Confirmação carregada');
  
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const inscriptionId = urlParams.get('id');
    const pageSlug = urlParams.get('page');

    console.log('📋 Parâmetros:', { id: inscriptionId, page: pageSlug });

    if (!inscriptionId || !pageSlug) {
      console.error('❌ Parâmetros faltando');
      document.body.innerHTML = `
        <div style="padding: 2rem; text-align: center;">
          <h1>Erro</h1>
          <p>Parâmetros inválidos na URL.</p>
          <a href="/">Voltar à Home</a>
        </div>
      `;
      return;
    }

    loadInscription(pageSlug, parseInt(inscriptionId));
  } catch (error) {
    console.error('❌ Erro ao carregar:', error);
    document.body.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h1>Erro</h1>
        <p>${error.message}</p>
        <a href="/">Voltar à Home</a>
      </div>
    `;
  }
});

function loadInscription(pageSlug, inscriptionId) {
  console.log('Carregando inscrição:', pageSlug, inscriptionId);
  
  // Carregar inscrição do localStorage
  const inscriptions = JSON.parse(localStorage.getItem('inscriptions') || '{}');
  console.log('Inscrições:', inscriptions);
  
  const pageInscriptions = inscriptions[pageSlug] || [];
  console.log('Inscrições da página:', pageInscriptions);
  
  const inscription = pageInscriptions.find(i => i.id === inscriptionId);
  console.log('Inscrição encontrada:', inscription);

  if (!inscription) {
    console.error('❌ Inscrição não encontrada');
    document.body.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h1>Inscrição não encontrada</h1>
        <p>ID: ${inscriptionId}</p>
        <a href="/">Voltar à Home</a>
      </div>
    `;
    return;
  }

  // Carregar configuração da página
  const pages = JSON.parse(localStorage.getItem('pages') || '[]');
  const page = pages.find(p => p.slug === pageSlug);
  console.log('📄 Página encontrada:', page);

  if (!page || !page.is_form) {
    console.error('❌ Página não encontrada ou não é formulário');
    document.body.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h1>Página não encontrada</h1>
        <p>Slug: ${pageSlug}</p>
        <a href="/">Voltar à Home</a>
      </div>
    `;
    return;
  }

  console.log('✅ Exibindo inscrição');
  // Exibir dados da inscrição
  displayInscription(inscription, page);
}

function displayInscription(inscription, page) {
  // Número da inscrição
  document.getElementById('inscription-id').textContent = inscription.id;

  // Nome do candidato
  let candidateName = '-';
  Object.keys(inscription.data).forEach(key => {
    const keyLower = key.toLowerCase();
    if (candidateName === '-' && keyLower.includes('nome')) {
      if (!keyLower.includes('responsável') && !keyLower.includes('responsavel')) {
        const value = inscription.data[key];
        if (value && typeof value === 'string') {
          candidateName = value;
        }
      }
    }
  });
  document.getElementById('inscription-name').textContent = candidateName;

  // Verificar se requer pagamento
  const requiresPayment = page.form_config?.requires_payment || false;

  if (requiresPayment && page.form_config?.payment) {
    const payment = page.form_config.payment;
    
    // Mostrar alerta importante
    document.getElementById('alert-box').style.display = 'block';
    
    // Mostrar seção de pagamento
    document.getElementById('payment-section').style.display = 'block';

    // PIX Copia e Cola
    const pixKey = payment.pix_key;
    document.getElementById('pix-key-value').textContent = pixKey;

    // Gerar QR Code
    generateQRCode(pixKey);

    // Botão copiar
    document.getElementById('copy-button').addEventListener('click', () => {
      copyToClipboard(pixKey);
    });

    // WhatsApp (se configurado)
    if (payment.whatsapp) {
      document.getElementById('whatsapp-section').style.display = 'block';
      const whatsappMessage = encodeURIComponent(
        `Olá! Gostaria de pagar a inscrição #${inscription.id} (${candidateName}) com cartão de crédito.`
      );
      document.getElementById('whatsapp-link').href = 
        `https://wa.me/${payment.whatsapp}?text=${whatsappMessage}`;
    }
  }
}

function generateQRCode(pixKey) {
  // Usar API gratuita para gerar QR Code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixKey)}`;
  document.getElementById('qr-code-image').src = qrCodeUrl;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const button = document.getElementById('copy-button');
    const originalText = button.textContent;
    button.textContent = 'Copiado!';
    button.classList.add('copied');
    
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    // Fallback para navegadores antigos
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    const button = document.getElementById('copy-button');
    button.textContent = 'Copiado!';
    button.classList.add('copied');
    
    setTimeout(() => {
      button.textContent = 'Copiar Código PIX';
      button.classList.remove('copied');
    }, 2000);
  });
}
