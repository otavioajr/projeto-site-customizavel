// supabase.js - Configuração e funções do Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Configuração do Supabase (usar variáveis de ambiente em produção)
const supabaseUrl = window.SUPABASE_URL || 'https://seu-projeto.supabase.co';
const supabaseAnonKey = window.SUPABASE_ANON_KEY || 'sua-chave-publica';

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

export async function saveInscription(pageSlug, formData, maxParticipants = 0) {
  try {
    // Se há limite definido, verificar quantidade de inscrições
    if (maxParticipants > 0) {
      const { count, error: countError } = await supabase
        .from('inscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('page_slug', pageSlug);

      if (countError) throw countError;

      if (count >= maxParticipants) {
        throw new Error(`LIMIT_REACHED:As vagas esgotaram! Esta atividade tinha limite de ${maxParticipants} ${maxParticipants === 1 ? 'vaga' : 'vagas'}.`);
      }
    }

    const { data, error } = await supabase
      .from('inscriptions')
      .insert([{
        page_slug: pageSlug,
        form_data: formData,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao salvar inscrição no Supabase:', error);

    // Se for erro de limite atingido, propagar
    if (error.message && error.message.startsWith('LIMIT_REACHED:')) {
      throw error;
    }

    // Fallback para localStorage
    const key = `inscriptions_${pageSlug}`;
    const inscriptions = JSON.parse(localStorage.getItem(key) || '[]');

    // Verificar limite no localStorage também
    if (maxParticipants > 0 && inscriptions.length >= maxParticipants) {
      throw new Error(`LIMIT_REACHED:As vagas esgotaram! Esta atividade tinha limite de ${maxParticipants} ${maxParticipants === 1 ? 'vaga' : 'vagas'}.`);
    }

    const newInscription = {
      id: 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      page_slug: pageSlug,
      form_data: formData,
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
    // Fallback para localStorage
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
