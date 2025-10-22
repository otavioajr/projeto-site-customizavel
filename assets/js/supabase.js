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

export async function saveInscription(pageSlug, formData) {
  try {
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
    // Fallback para localStorage
    const key = `inscriptions_${pageSlug}`;
    const inscriptions = JSON.parse(localStorage.getItem(key) || '[]');
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
