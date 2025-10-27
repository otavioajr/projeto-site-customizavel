#!/usr/bin/env node
// Script para configurar as tabelas do Supabase

const fs = require('fs');
const path = require('path');

// Ler o arquivo SQL
const sqlFile = path.join(__dirname, 'SETUP_TABELAS.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

// Credenciais do Supabase
const SUPABASE_URL = 'https://yzsgoxrrhjiiulmnwrfo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada');
  console.error('');
  console.error('Execute o script assim:');
  console.error('SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key node setup-database.js');
  console.error('');
  console.error('Ou defina a variável de ambiente SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Importar SDK do Supabase
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('🚀 Iniciando configuração do banco de dados...');
  console.log('');

  try {
    // Executar o SQL usando a API REST do Supabase
    // Nota: A API do Supabase JS não suporta SQL arbitrário diretamente
    // Vamos executar manualmente cada comando importante

    console.log('📋 Criando tabela pages...');
    const { error: pagesError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS pages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          label TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          "order" INTEGER NOT NULL DEFAULT 1,
          is_active BOOLEAN DEFAULT true,
          is_form BOOLEAN DEFAULT false,
          canva_embed_url TEXT,
          form_config JSONB,
          seo_title TEXT,
          seo_description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }).catch(err => ({ error: err }));

    if (pagesError) {
      console.log('⚠️  Tabela pages já existe ou erro:', pagesError.message);
    } else {
      console.log('✅ Tabela pages criada');
    }

    console.log('');
    console.log('⚠️  ATENÇÃO: A API do Supabase JS tem limitações para executar SQL arbitrário.');
    console.log('');
    console.log('Por favor, execute o SQL manualmente:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/yzsgoxrrhjiiulmnwrfo');
    console.log('2. Vá em SQL Editor → New Query');
    console.log('3. Cole o conteúdo de SETUP_TABELAS.sql');
    console.log('4. Clique em Run');
    console.log('');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

setupDatabase();
