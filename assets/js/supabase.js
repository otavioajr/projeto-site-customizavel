// supabase.js - Configuração e funções do Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Configuração do Supabase (usar variáveis de ambiente em produção)
const supabaseUrl = window.SUPABASE_URL || 'https://yzsgoxrrhjiiulmnwrfo.supabase.co';
const supabaseAnonKey = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6c2dveHJyaGppaXVsbW53cmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMjQ1NDksImV4cCI6MjA3NjYwMDU0OX0.5F8gLht7b-Ig01Bxr0zTTSPeCfdYvBH81P-Z2afysOo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============= FUNÇÕES DE PÁGINAS =============

export async function getPages() {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('is_active', true)
      .order('order');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao carregar páginas do Supabase:', error);
    // Fallback para localStorage
    const local = localStorage.getItem('pages');
    return local ? JSON.parse(local) : [];
  }
}

export async function getAllPages() {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('order');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao carregar todas as páginas do Supabase:', error);
    // Fallback para localStorage
    const local = localStorage.getItem('pages');
    return local ? JSON.parse(local) : [];
  }
}

export async function savePage(page) {
  try {
    // Verificar se já existe (update) ou é novo (insert)
    if (page.id && page.id.startsWith('id_')) {
      // ID local, fazer insert sem o ID
      const { id, ...pageWithoutId } = page;
      const { data, error } = await supabase
        .from('pages')
        .insert([pageWithoutId])
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar localStorage com novo ID do Supabase
      const pages = JSON.parse(localStorage.getItem('pages') || '[]');
      const index = pages.findIndex(p => p.id === id);
      if (index !== -1) {
        pages[index] = data;
        localStorage.setItem('pages', JSON.stringify(pages));
      }
      
      return data;
    } else if (page.id) {
      // ID do Supabase, fazer update
      const { error } = await supabase
        .from('pages')
        .update(page)
        .eq('id', page.id);
      
      if (error) throw error;
      return page;
    } else {
      // Novo registro
      const { data, error } = await supabase
        .from('pages')
        .insert([page])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Erro ao salvar página no Supabase:', error);
    // Fallback para localStorage
    const pages = JSON.parse(localStorage.getItem('pages') || '[]');
    if (page.id) {
      const index = pages.findIndex(p => p.id === page.id);
      if (index !== -1) {
        pages[index] = page;
      } else {
        pages.push(page);
      }
    } else {
      page.id = 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      pages.push(page);
    }
    localStorage.setItem('pages', JSON.stringify(pages));
    return page;
  }
}

export async function deletePage(id) {
  try {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar página no Supabase:', error);
    // Fallback para localStorage
    const pages = JSON.parse(localStorage.getItem('pages') || '[]');
    const filtered = pages.filter(p => p.id !== id);
    localStorage.setItem('pages', JSON.stringify(filtered));
  }
}

// ============= FUNÇÕES DE HOME CONTENT =============

export async function getHomeContent() {
  try {
    const { data, error } = await supabase
      .from('home_content')
      .select('content')
      .single();
    
    if (error) throw error;
    return data.content;
  } catch (error) {
    console.error('Erro ao carregar home do Supabase:', error);
    // Fallback para localStorage
    const local = localStorage.getItem('home_content');
    if (local) {
      return JSON.parse(local);
    }
    return null;
  }
}

export async function updateHomeContent(content) {
  try {
    const { error } = await supabase
      .from('home_content')
      .update({ content })
      .eq('id', '00000000-0000-0000-0000-000000000001');
    
    if (error) throw error;
    
    // Também salvar no localStorage como cache
    localStorage.setItem('home_content', JSON.stringify(content));
  } catch (error) {
    console.error('Erro ao salvar home no Supabase:', error);
    // Fallback para localStorage
    localStorage.setItem('home_content', JSON.stringify(content));
    throw error;
  }
}

// ============= FUNÇÕES DE INSCRIÇÕES =============

function parseSequenceValue(value) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function computeNextSequenceLocal(pageSlug) {
  const entries = [];

  try {
    const key = `inscriptions_${pageSlug}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        entries.push(...parsed);
      }
    }
  } catch (error) {
    console.warn('Erro ao ler inscrições locais (por slug):', error);
  }

  try {
    const legacyRaw = localStorage.getItem('inscriptions');
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed[pageSlug])) {
        entries.push(...parsed[pageSlug]);
      }
    }
  } catch (error) {
    console.warn('Erro ao ler inscrições locais (formato legado):', error);
  }

  const sequences = entries
    .map(item => parseSequenceValue(
      item?.form_data?._sequence ||
      item?.data?._sequence ||
      item?.form_data?._numero_inscricao ||
      item?.data?._numero_inscricao
    ))
    .filter(value => value !== null);

  const totalEntries = entries.length;
  const maxSequence = sequences.length > 0 ? Math.max(...sequences) : totalEntries;
  return maxSequence + 1;
}

async function computeNextSequenceSupabase(pageSlug) {
  let nextSequence = 1;

  try {
    const { count, error } = await supabase
      .from('inscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('page_slug', pageSlug);

    if (error) throw error;
    if (Number.isFinite(count)) {
      nextSequence = Math.max(nextSequence, (count || 0) + 1);
    }
  } catch (error) {
    console.warn('Erro ao contar inscrições no Supabase:', error);
  }

  try {
    const { data, error } = await supabase
      .from('inscriptions')
      .select('form_data->>_sequence')
      .eq('page_slug', pageSlug)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && Array.isArray(data) && data.length > 0) {
      const lastSequence = parseSequenceValue(data[0]['form_data->>_sequence']);
      if (lastSequence !== null) {
        nextSequence = Math.max(nextSequence, lastSequence + 1);
      }
    }
  } catch (error) {
    console.warn('Erro ao recuperar sequência anterior no Supabase:', error);
  }

  return nextSequence;
}

export async function saveInscription(pageSlug, formData, options = {}) {
  const { sessionSelections = [], maxParticipants = 0 } = options || {};
  let nextSequence = await computeNextSequenceSupabase(pageSlug);

  if (maxParticipants > 0 && nextSequence > maxParticipants) {
    throw new Error(`LIMIT_REACHED:As vagas esgotaram! Esta atividade tinha limite de ${maxParticipants} ${maxParticipants === 1 ? 'vaga' : 'vagas'}.`);
  }

  try {
    if (Array.isArray(sessionSelections) && sessionSelections.length > 0) {
      for (const selection of sessionSelections) {
        const capacity = parseInt(selection?.capacity, 10);
        if (!selection?.storageKey || !selection?.sessionId || !Number.isFinite(capacity) || capacity <= 0) {
          continue;
        }

        const column = `form_data->>'${selection.storageKey}'`;

        // Buscar inscrições para essa sessão e somar _group_size
        const { data: sessionInscriptions, error: sessionError } = await supabase
          .from('inscriptions')
          .select('form_data')
          .eq('page_slug', pageSlug)
          .eq(column, selection.sessionId);

        if (sessionError) throw sessionError;

        // Somar _group_size (se não existir, considerar 1 para backward compatibility)
        let totalParticipants = 0;
        if (Array.isArray(sessionInscriptions)) {
          totalParticipants = sessionInscriptions.reduce((sum, inscription) => {
            const groupSize = inscription?.form_data?._group_size || 1;
            return sum + parseInt(groupSize, 10);
          }, 0);
        }

        if (totalParticipants >= capacity) {
          const sessionName = selection.sessionDisplay || selection.sessionTitle || 'A bateria selecionada';
          throw new Error(`SESSION_FULL:${sessionName} já atingiu o limite de ${capacity} ${capacity === 1 ? 'vaga' : 'vagas'}.`);
        }
      }
    }

    const formDataWithSequence = {
      ...formData,
      _sequence: nextSequence
    };

    const { data, error } = await supabase
      .from('inscriptions')
      .insert([{
        page_slug: pageSlug,
        form_data: formDataWithSequence,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao salvar inscrição no Supabase:', error);

    if (error.message && error.message.startsWith('SESSION_FULL:')) {
      throw error;
    }
    if (error.message && error.message.startsWith('LIMIT_REACHED:')) {
      throw error;
    }

    const key = `inscriptions_${pageSlug}`;
    const inscriptions = JSON.parse(localStorage.getItem(key) || '[]');

    const localSequence = computeNextSequenceLocal(pageSlug);
    nextSequence = Math.max(nextSequence, localSequence);

    if (maxParticipants > 0 && nextSequence > maxParticipants) {
      throw new Error(`LIMIT_REACHED:As vagas esgotaram! Esta atividade tinha limite de ${maxParticipants} ${maxParticipants === 1 ? 'vaga' : 'vagas'}.`);
    }

    if (Array.isArray(sessionSelections) && sessionSelections.length > 0) {
      for (const selection of sessionSelections) {
        const capacity = parseInt(selection?.capacity, 10);
        if (!selection?.storageKey || !selection?.sessionId || !Number.isFinite(capacity) || capacity <= 0) {
          continue;
        }

        // Somar _group_size para contagem correta
        const totalParticipants = inscriptions.reduce((sum, inscription) => {
          const formDataLocal = inscription?.form_data || inscription?.data || {};
          if (formDataLocal?.[selection.storageKey] === selection.sessionId) {
            const groupSize = formDataLocal?._group_size || 1;
            return sum + parseInt(groupSize, 10);
          }
          return sum;
        }, 0);

        if (totalParticipants >= capacity) {
          const sessionName = selection.sessionDisplay || selection.sessionTitle || 'A bateria selecionada';
          throw new Error(`SESSION_FULL:${sessionName} já atingiu o limite de ${capacity} ${capacity === 1 ? 'vaga' : 'vagas'}.`);
        }
      }
    }

    const newInscription = {
      id: 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      page_slug: pageSlug,
      form_data: {
        ...formData,
        _sequence: nextSequence
      },
      status: 'pending',
      created_at: new Date().toISOString()
    };
    inscriptions.push(newInscription);
    localStorage.setItem(key, JSON.stringify(inscriptions));
    return newInscription;
  }
}

export async function getInscriptions(pageSlug) {
  try {
    const { data, error } = await supabase
      .from('inscriptions')
      .select('*')
      .eq('page_slug', pageSlug)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao carregar inscrições do Supabase:', error);
    const key = `inscriptions_${pageSlug}`;
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : [];
  }
}

export async function updateInscriptionStatus(id, status) {
  try {
    const { error } = await supabase
      .from('inscriptions')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar status no Supabase:', error);
    throw error;
  }
}

export async function deleteInscription(id) {
  // Se o ID for gerado localmente, não há nada para remover no Supabase
  if (typeof id === 'string' && id.startsWith('id_')) {
    return;
  }

  try {
    const { data, error } = await supabase
      .from('inscriptions')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      throw new Error('Inscrição não encontrada no Supabase.');
    }
  } catch (error) {
    console.error('Erro ao excluir inscrição no Supabase:', error);
    throw error;
  }
}

// ============= AUTENTICAÇÃO =============

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
}

export async function signInWithMagicLink(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + '/admin.html'
    }
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  return await supabase.auth.getUser();
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

// ============= VERIFICAÇÃO DE CONEXÃO =============

export async function checkSupabaseConnection() {
  try {
    // Tentar fazer uma query simples para verificar conexão
    const { error } = await supabase
      .from('home_content')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('Supabase não está conectado:', error);
    return false;
  }
}

// Verificar conexão ao carregar
let isSupabaseConnected = false;
checkSupabaseConnection().then(connected => {
  isSupabaseConnected = connected;
  if (!connected) {
    console.warn('⚠️ Supabase não configurado. Usando localStorage como fallback.');
  } else {
    console.log('✅ Supabase conectado com sucesso!');
  }
});

export function isConnected() {
  return isSupabaseConnected;
}

// ============= FUNÇÕES DE STORAGE (IMAGENS) =============

/**
 * Faz upload de uma imagem para o Supabase Storage
 * @param {File} file - Arquivo de imagem
 * @param {string} folder - Pasta dentro do bucket (opcional)
 * @returns {Promise<{success: boolean, url?: string, path?: string, error?: string}>}
 */
export async function uploadImage(file, folder = '') {
  try {
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Formato não suportado. Use JPG, PNG, GIF ou WebP.'
      };
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'Arquivo muito grande. Tamanho máximo: 5MB.'
      };
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${random}.${ext}`;
    const path = folder ? `${folder}/${filename}` : filename;

    // Upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(path);

    return {
      success: true,
      url: publicUrl,
      path: path,
      filename: filename,
      originalName: file.name,
      size: file.size
    };
  } catch (error) {
    console.error('Erro ao fazer upload de imagem:', error);
    return {
      success: false,
      error: error.message || 'Erro ao fazer upload da imagem'
    };
  }
}

/**
 * Lista todas as imagens do bucket
 * @param {string} folder - Pasta dentro do bucket (opcional)
 * @returns {Promise<Array>}
 */
export async function listImages(folder = '') {
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) throw error;

    // Adicionar URL pública para cada imagem
    const images = data.map(file => {
      const path = folder ? `${folder}/${file.name}` : file.name;
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(path);

      return {
        filename: file.name,
        path: path,
        url: publicUrl,
        size: file.metadata?.size || 0,
        uploadedAt: file.created_at,
        mimetype: file.metadata?.mimetype
      };
    });

    return images;
  } catch (error) {
    console.error('Erro ao listar imagens:', error);
    return [];
  }
}

/**
 * Deleta uma imagem do bucket
 * @param {string} path - Caminho completo da imagem no bucket
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteImage(path) {
  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([path]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return {
      success: false,
      error: error.message || 'Erro ao deletar imagem'
    };
  }
}

/**
 * Obtém URL pública de uma imagem
 * @param {string} path - Caminho da imagem no bucket
 * @returns {string}
 */
export function getImageUrl(path) {
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(path);
  
  return publicUrl;
}

// ============= FUNÇÕES DE INSCRIÇÃO MÚLTIPLA =============

/**
 * Gera um UUID v4
 * @returns {string}
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Salva múltiplas inscrições vinculadas em grupo
 * @param {string} pageSlug - Slug da página
 * @param {object} responsibleData - Dados do responsável
 * @param {array} participantsData - Array com dados de cada participante
 * @param {object} options - Opções adicionais (sessionSelections, maxParticipants)
 * @returns {Promise<object>} - Dados das inscrições criadas
 */
export async function saveMultipleInscriptions(pageSlug, responsibleData, participantsData = [], options = {}) {
  const { sessionSelections = [], maxParticipants = 0, responsibleParticipates = true } = options;
  const groupId = generateUUID();
  const totalParticipants = responsibleParticipates 
    ? 1 + participantsData.length  // Responsável participa: 1 + outros
    : participantsData.length;      // Responsável NÃO participa: apenas outros
  
  try {
    // Validar vagas disponíveis
    if (maxParticipants > 0) {
      const { data: availabilityCheck, error: checkError } = await supabase
        .rpc('check_available_slots', {
          p_page_slug: pageSlug,
          p_requested_slots: totalParticipants,
          p_max_participants: maxParticipants
        });
      
      if (checkError) throw checkError;
      
      if (availabilityCheck && availabilityCheck.length > 0 && !availabilityCheck[0].available) {
        throw new Error(`LIMIT_REACHED:${availabilityCheck[0].message}`);
      }
    }
    
    // Validar sessões se houver
    if (Array.isArray(sessionSelections) && sessionSelections.length > 0) {
      for (const selection of sessionSelections) {
        const capacity = parseInt(selection?.capacity, 10);
        if (!selection?.storageKey || !selection?.sessionId || !Number.isFinite(capacity) || capacity <= 0) {
          continue;
        }
        
        const column = `form_data->>'${selection.storageKey}'`;
        
        // Buscar inscrições para essa sessão
        const { data: sessionInscriptions, error: sessionError } = await supabase
          .from('inscriptions')
          .select('form_data')
          .eq('page_slug', pageSlug)
          .eq(column, selection.sessionId);
        
        if (sessionError) throw sessionError;
        
        // Contar participantes já inscritos
        let currentParticipants = 0;
        if (Array.isArray(sessionInscriptions)) {
          currentParticipants = sessionInscriptions.reduce((sum, inscription) => {
            const groupSize = inscription?.form_data?._group_size || inscription?.form_data?.total_participants || 1;
            return sum + parseInt(groupSize, 10);
          }, 0);
        }
        
        // Verificar se há espaço para o novo grupo
        if (currentParticipants + totalParticipants > capacity) {
          const sessionName = selection.sessionDisplay || selection.sessionTitle || 'A sessão selecionada';
          throw new Error(`SESSION_FULL:${sessionName} já tem ${currentParticipants} participantes de ${capacity} vagas. Não há espaço para ${totalParticipants} pessoas.`);
        }
      }
    }
    
    // Obter próximo sequence
    let nextSequence = await computeNextSequenceSupabase(pageSlug);
    
    // Preparar inscrições
    const inscriptions = [];
    
    // 1. Se responsável PARTICIPA: criar inscrição para ele
    if (responsibleParticipates) {
      const responsibleInscription = {
        page_slug: pageSlug,
        group_id: groupId,
        is_responsible: true,
        responsible_id: null,
        participant_number: 1,
        total_participants: totalParticipants,
        form_data: {
          ...responsibleData,
          _sequence: nextSequence,
          _group_size: totalParticipants,
          _participant_number: 1,
          _total_participants: totalParticipants,
          _is_responsible: true
        },
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      inscriptions.push(responsibleInscription);
      nextSequence++; // Incrementar para os próximos participantes
    }
    
    // 2. Inscrições dos participantes
    for (let i = 0; i < participantsData.length; i++) {
      // Se responsável participa: participantes são 2, 3, 4...
      // Se responsável NÃO participa: participantes são 1, 2, 3...
      const participantNumber = responsibleParticipates ? i + 2 : i + 1;
      const participantInscription = {
        page_slug: pageSlug,
        group_id: groupId,
        is_responsible: false,
        responsible_id: null,
        participant_number: participantNumber,
        total_participants: totalParticipants,
        form_data: {
          ...participantsData[i],
          _sequence: nextSequence + i,
          _group_size: totalParticipants,
          _participant_number: participantNumber,
          _total_participants: totalParticipants,
          _is_responsible: false,
          // Adicionar dados do responsável como contato quando ele NÃO participa
          ...(!responsibleParticipates ? {
            _responsible_name: responsibleData['Nome do Responsável'] || responsibleData.nome || '',
            _responsible_email: responsibleData.email || responsibleData.Email || '',
            _responsible_phone: responsibleData.telefone || responsibleData.Telefone || ''
          } : {})
        },
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      inscriptions.push(participantInscription);
    }
    
    // Inserir todas as inscrições
    const { data, error } = await supabase
      .from('inscriptions')
      .insert(inscriptions)
      .select();
    
    if (error) throw error;
    
    // Atualizar responsible_id dos participantes (apenas se responsável participa)
    if (responsibleParticipates && data && data.length > 0) {
      const responsibleId = data[0].id; // Primeira inscrição é do responsável
      const participantIds = data.slice(1).map(p => p.id);
      
      if (participantIds.length > 0) {
        const { error: updateError } = await supabase
          .from('inscriptions')
          .update({ responsible_id: responsibleId })
          .in('id', participantIds);
        
        if (updateError) {
          console.warn('Aviso: Não foi possível atualizar responsible_id:', updateError);
        }
      }
    }
    
    return {
      success: true,
      groupId: groupId,
      totalParticipants: totalParticipants,
      inscriptions: data
    };
    
  } catch (error) {
    console.error('Erro ao salvar inscrições múltiplas:', error);
    
    // Propagar erros de validação
    if (error.message && (error.message.startsWith('SESSION_FULL:') || error.message.startsWith('LIMIT_REACHED:'))) {
      throw error;
    }
    
    // Fallback para localStorage
    console.warn('Tentando salvar no localStorage como fallback...');
    const key = `inscriptions_${pageSlug}`;
    const existingInscriptions = JSON.parse(localStorage.getItem(key) || '[]');
    
    const localInscriptions = inscriptions.map(ins => ({
      ...ins,
      id: 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }));
    
    existingInscriptions.push(...localInscriptions);
    localStorage.setItem(key, JSON.stringify(existingInscriptions));
    
    return {
      success: true,
      groupId: groupId,
      totalParticipants: totalParticipants,
      inscriptions: localInscriptions,
      savedLocally: true
    };
  }
}

/**
 * Busca todas as inscrições de um grupo
 * @param {string} groupId - UUID do grupo
 * @returns {Promise<array>}
 */
export async function getInscriptionGroup(groupId) {
  try {
    const { data, error } = await supabase
      .from('inscriptions')
      .select('*')
      .eq('group_id', groupId)
      .order('participant_number');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar grupo de inscrições:', error);
    return [];
  }
}

/**
 * Busca grupos de inscrições com informações agregadas
 * @param {string} pageSlug - Slug da página
 * @returns {Promise<array>}
 */
export async function getInscriptionGroups(pageSlug) {
  try {
    const { data, error } = await supabase
      .from('v_inscription_groups')
      .select('*')
      .eq('page_slug', pageSlug)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar grupos de inscrições:', error);
    // Fallback: buscar inscrições normais e agrupar manualmente
    return await getInscriptionsGroupedManually(pageSlug);
  }
}

/**
 * Agrupa inscrições manualmente quando a view não está disponível
 * @param {string} pageSlug - Slug da página
 * @returns {Promise<array>}
 */
async function getInscriptionsGroupedManually(pageSlug) {
  try {
    const inscriptions = await getInscriptions(pageSlug);
    const groups = {};
    
    inscriptions.forEach(inscription => {
      const groupId = inscription.group_id || inscription.id;
      
      if (!groups[groupId]) {
        groups[groupId] = {
          group_id: groupId,
          page_slug: inscription.page_slug,
          status: inscription.status,
          created_at: inscription.created_at,
          total_participants: inscription.total_participants || 1,
          responsible_id: null,
          responsible_name: null,
          responsible_email: null,
          responsible_phone: null,
          participants: []
        };
      }
      
      if (inscription.is_responsible) {
        groups[groupId].responsible_id = inscription.id;
        groups[groupId].responsible_name = inscription.form_data?.nome || inscription.form_data?.responsible_name;
        groups[groupId].responsible_email = inscription.form_data?.email || inscription.form_data?.responsible_email;
        groups[groupId].responsible_phone = inscription.form_data?.telefone || inscription.form_data?.responsible_phone;
      }
      
      groups[groupId].participants.push({
        id: inscription.id,
        participant_number: inscription.participant_number || 1,
        is_responsible: inscription.is_responsible || false,
        form_data: inscription.form_data
      });
    });
    
    return Object.values(groups);
  } catch (error) {
    console.error('Erro ao agrupar inscrições manualmente:', error);
    return [];
  }
}

/**
 * Deleta um grupo completo de inscrições
 * @param {string} groupId - UUID do grupo
 * @returns {Promise<object>}
 */
export async function deleteInscriptionGroup(groupId) {
  try {
    const { data, error } = await supabase
      .rpc('delete_inscription_group', { p_group_id: groupId });
    
    if (error) throw error;
    
    return {
      success: true,
      deletedCount: data
    };
  } catch (error) {
    console.error('Erro ao deletar grupo:', error);
    
    // Fallback: deletar manualmente
    try {
      const { error: deleteError } = await supabase
        .from('inscriptions')
        .delete()
        .eq('group_id', groupId);
      
      if (deleteError) throw deleteError;
      
      return { success: true };
    } catch (fallbackError) {
      console.error('Erro no fallback de deleção:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Atualiza o status de todas as inscrições de um grupo
 * @param {string} groupId - UUID do grupo
 * @param {string} newStatus - Novo status (pending, confirmed, cancelled)
 * @returns {Promise<object>}
 */
export async function updateGroupStatus(groupId, newStatus) {
  try {
    const { data, error } = await supabase
      .rpc('update_group_status', {
        p_group_id: groupId,
        p_new_status: newStatus
      });
    
    if (error) throw error;
    
    return {
      success: true,
      updatedCount: data
    };
  } catch (error) {
    console.error('Erro ao atualizar status do grupo:', error);
    
    // Fallback: atualizar manualmente
    try {
      const { error: updateError } = await supabase
        .from('inscriptions')
        .update({ status: newStatus })
        .eq('group_id', groupId);
      
      if (updateError) throw updateError;
      
      return { success: true };
    } catch (fallbackError) {
      console.error('Erro no fallback de atualização:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Verifica vagas disponíveis para inscrição múltipla
 * @param {string} pageSlug - Slug da página
 * @param {number} requestedSlots - Número de vagas solicitadas
 * @param {number} maxParticipants - Máximo de participantes permitidos
 * @returns {Promise<object>}
 */
export async function checkAvailableSlots(pageSlug, requestedSlots, maxParticipants) {
  try {
    const { data, error } = await supabase
      .rpc('check_available_slots', {
        p_page_slug: pageSlug,
        p_requested_slots: requestedSlots,
        p_max_participants: maxParticipants
      });
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data[0];
    }
    
    return {
      available: false,
      remaining_slots: 0,
      message: 'Não foi possível verificar disponibilidade'
    };
  } catch (error) {
    console.error('Erro ao verificar vagas:', error);
    
    // Fallback: contar manualmente
    try {
      const inscriptions = await getInscriptions(pageSlug);
      const currentCount = inscriptions.length;
      const remaining = maxParticipants - currentCount;
      
      return {
        available: remaining >= requestedSlots,
        remaining_slots: remaining,
        message: remaining >= requestedSlots 
          ? `✅ ${remaining} vagas disponíveis`
          : `❌ Apenas ${remaining} vagas disponíveis. Você solicitou ${requestedSlots}.`
      };
    } catch (fallbackError) {
      console.error('Erro no fallback de verificação:', fallbackError);
      return {
        available: false,
        remaining_slots: 0,
        message: 'Erro ao verificar disponibilidade'
      };
    }
  }
}
