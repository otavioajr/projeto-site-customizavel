// supabase.js - Configuração e funções do Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuração do Supabase (usar variáveis de ambiente em produção)
const supabaseUrl = window.SUPABASE_URL || 'https://yzsgoxrrhjiiulmnwrfo.supabase.co';
const supabaseAnonKey = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6c2dveHJyaGppaXVsbW53cmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMjQ1NDksImV4cCI6MjA3NjYwMDU0OX0.5F8gLht7b-Ig01Bxr0zTTSPeCfdYvBH81P-Z2afysOo';

// Permitir qualquer schema customizado (public, homol, etc.)
const supabaseSchema = typeof window.SUPABASE_SCHEMA === 'string' && window.SUPABASE_SCHEMA.trim()
  ? window.SUPABASE_SCHEMA.trim()
  : 'public';

console.log(`🔧 Supabase configurado para usar schema: "${supabaseSchema}"`);

// Warning se schema não foi definido explicitamente
if (!window.SUPABASE_SCHEMA) {
  console.warn('⚠️ ATENÇÃO: SUPABASE_SCHEMA não foi definido! Usando schema padrão "public".');
  console.warn('   Se você está em homologação, verifique se o config.js foi carregado corretamente.');
  console.warn('   Esperado: window.SUPABASE_SCHEMA = "homol"');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: supabaseSchema }
});

export function getSupabaseSchema() {
  return supabaseSchema;
}

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
  
  console.log('🔵 [saveInscription] INÍCIO');
  console.log('  pageSlug:', pageSlug);
  console.log('  maxParticipants:', maxParticipants);
  console.log('  formData:', formData);
  console.log('  Supabase URL:', supabaseUrl);
  console.log('  Supabase Key exists:', !!supabaseAnonKey);
  
  let nextSequence = await computeNextSequenceSupabase(pageSlug);
  console.log('  nextSequence:', nextSequence);

  if (maxParticipants > 0 && nextSequence > maxParticipants) {
    const errorMsg = `LIMIT_REACHED:As vagas esgotaram! Esta atividade tinha limite de ${maxParticipants} ${maxParticipants === 1 ? 'vaga' : 'vagas'}.`;
    console.error('❌ [saveInscription] Limite de vagas atingido:', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    if (Array.isArray(sessionSelections) && sessionSelections.length > 0) {
      console.log('  Verificando disponibilidade de sessões:', sessionSelections.length);
      
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

        if (sessionError) {
          console.error('❌ [saveInscription] Erro ao verificar sessão:', sessionError);
          throw sessionError;
        }

        // Somar _group_size (se não existir, considerar 1 para backward compatibility)
        let totalParticipants = 0;
        if (Array.isArray(sessionInscriptions)) {
          totalParticipants = sessionInscriptions.reduce((sum, inscription) => {
            const groupSize = inscription?.form_data?._group_size || 1;
            return sum + parseInt(groupSize, 10);
          }, 0);
        }

        console.log(`  Sessão ${selection.sessionId}: ${totalParticipants}/${capacity} participantes`);

        if (totalParticipants >= capacity) {
          const sessionName = selection.sessionDisplay || selection.sessionTitle || 'A bateria selecionada';
          const errorMsg = `SESSION_FULL:${sessionName} já atingiu o limite de ${capacity} ${capacity === 1 ? 'vaga' : 'vagas'}.`;
          console.error('❌ [saveInscription] Sessão lotada:', errorMsg);
          throw new Error(errorMsg);
        }
      }
    }

    const formDataWithSequence = {
      ...formData,
      _sequence: nextSequence,
      _group_size: 1 // Inscrição individual = 1 participante
    };

    // Gerar UUID para o grupo (mesmo sendo individual, mantém compatibilidade)
    const groupId = generateUUID();

    const inscriptionData = {
      page_slug: pageSlug,
      group_id: groupId,
      is_responsible: true,
      responsible_id: null,
      participant_number: 1,
      total_participants: 1,
      form_data: formDataWithSequence,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    console.log('  Enviando inscrição para Supabase:', inscriptionData);

    const { data, error } = await supabase
      .from('inscriptions')
      .insert([inscriptionData])
      .select()
      .single();

    if (error) {
      console.error('❌ [saveInscription] Erro do Supabase ao inserir:', error);
      console.error('  Código do erro:', error.code);
      console.error('  Mensagem:', error.message);
      console.error('  Detalhes:', error.details);
      console.error('  Schema atual:', supabaseSchema);

      // Melhorar mensagem de erro para o usuário
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        throw new Error(`ERRO DE CONFIGURAÇÃO: Tabela não encontrada no schema "${supabaseSchema}". Verifique se o ambiente está configurado corretamente.`);
      } else if (error.code === '42501' || error.message?.includes('permission')) {
        throw new Error(`ERRO DE PERMISSÃO: Sem permissão para inserir no schema "${supabaseSchema}". Verifique as políticas RLS.`);
      }

      throw error;
    }
    
    if (!data) {
      console.error('❌ [saveInscription] CRÍTICO: Supabase retornou sem erro mas sem dados!');
      throw new Error('Falha ao salvar inscrição: Nenhum dado retornado do Supabase.');
    }
    
    if (!data.id) {
      console.error('❌ [saveInscription] CRÍTICO: Dados retornados sem ID:', data);
      throw new Error('Falha ao salvar inscrição: ID não retornado.');
    }

    console.log('✅ [saveInscription] Inscrição salva com sucesso!');
    console.log('  ID:', data.id);
    console.log('  Group ID:', data.group_id);
    return data;
  } catch (error) {
    console.error('❌ [saveInscription] ERRO CAPTURADO:', error);
    console.error('  Tipo:', error.constructor.name);
    console.error('  Mensagem:', error.message);
    console.error('  Stack:', error.stack);
    throw error;
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
    throw error;
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
    console.warn('⚠️ Supabase não configurado. Funcionalidades de inscrição podem não funcionar corretamente.');
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
  
  console.log('🔵 [saveMultipleInscriptions] INÍCIO (RPC Version)');
  console.log('  pageSlug:', pageSlug);
  console.log('  responsibleParticipates:', responsibleParticipates);
  console.log('  maxParticipants:', maxParticipants);
  
  try {
    // Garantir que participantsData seja sempre um array válido
    const validParticipantsData = Array.isArray(participantsData) ? participantsData : [];

    // Preparar dados para o RPC
    // Nota: O Supabase client serializa automaticamente objetos JS para JSONB
    const rpcParams = {
      p_page_slug: String(pageSlug),
      p_responsible_data: responsibleData || {},
      p_participants_data: validParticipantsData,
      p_max_participants: Number(maxParticipants) || 0,
      p_responsible_participates: Boolean(responsibleParticipates)
    };

    console.log('  Chamando RPC register_group...', rpcParams);
    console.log('  participantsData type:', typeof validParticipantsData, Array.isArray(validParticipantsData));

    const { data, error } = await supabase
      .rpc('register_group', rpcParams);

    if (error) {
      console.error('❌ [saveMultipleInscriptions] Erro do RPC:', error);
      // Tentar extrair mensagem amigável
      if (error.message && error.message.includes('LIMIT_REACHED')) {
        throw new Error(error.message); // Já está formatada
      }
      throw error;
    }

    console.log('✅ [saveMultipleInscriptions] Sucesso:', data);
    
    return {
      success: true,
      groupId: data.group_id,
      message: data.message
    };

  } catch (error) {
    console.error('❌ [saveMultipleInscriptions] ERRO:', error);
    throw error;
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
    throw error;
  }
}
