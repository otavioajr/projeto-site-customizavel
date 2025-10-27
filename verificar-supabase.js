#!/usr/bin/env node
// Script para verificar o status do Supabase e das tabelas

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yzsgoxrrhjiiulmnwrfo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6c2dveHJyaGppaXVsbW53cmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMjQ1NDksImV4cCI6MjA3NjYwMDU0OX0.5F8gLht7b-Ig01Bxr0zTTSPeCfdYvBH81P-Z2afysOo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verificarSupabase() {
  console.log('🔍 Verificando status do Supabase...\n');

  let todasTabelasExistem = true;

  // Verificar tabela pages
  console.log('📊 Verificando tabela "pages"...');
  const { data: pagesData, error: pagesError } = await supabase
    .from('pages')
    .select('id')
    .limit(1);

  if (pagesError) {
    if (pagesError.code === '42P01') {
      console.log('❌ Tabela "pages" não existe\n');
      todasTabelasExistem = false;
    } else if (pagesError.code === 'PGRST116') {
      console.log('❌ Tabela "pages" não configurada (erro de schema)\n');
      todasTabelasExistem = false;
    } else {
      console.log(`⚠️  Erro ao acessar "pages": ${pagesError.message}\n`);
      todasTabelasExistem = false;
    }
  } else {
    console.log(`✅ Tabela "pages" existe (${pagesData ? pagesData.length : 0} registros)\n`);
  }

  // Verificar tabela home_content
  console.log('📊 Verificando tabela "home_content"...');
  const { data: homeData, error: homeError } = await supabase
    .from('home_content')
    .select('id')
    .limit(1);

  if (homeError) {
    if (homeError.code === '42P01') {
      console.log('❌ Tabela "home_content" não existe\n');
      todasTabelasExistem = false;
    } else if (homeError.code === 'PGRST116') {
      console.log('❌ Tabela "home_content" não configurada\n');
      todasTabelasExistem = false;
    } else {
      console.log(`⚠️  Erro ao acessar "home_content": ${homeError.message}\n`);
      todasTabelasExistem = false;
    }
  } else {
    console.log(`✅ Tabela "home_content" existe (${homeData ? homeData.length : 0} registros)\n`);
  }

  // Verificar tabela inscriptions
  console.log('📊 Verificando tabela "inscriptions"...');
  const { data: inscData, error: inscError } = await supabase
    .from('inscriptions')
    .select('id')
    .limit(1);

  if (inscError) {
    if (inscError.code === '42P01') {
      console.log('❌ Tabela "inscriptions" não existe\n');
      todasTabelasExistem = false;
    } else if (inscError.code === 'PGRST116') {
      console.log('❌ Tabela "inscriptions" não configurada\n');
      todasTabelasExistem = false;
    } else {
      console.log(`⚠️  Erro ao acessar "inscriptions": ${inscError.message}\n`);
      todasTabelasExistem = false;
    }
  } else {
    console.log(`✅ Tabela "inscriptions" existe (${inscData ? inscData.length : 0} registros)\n`);
  }

  // Resultado final
  console.log('═'.repeat(60));
  if (todasTabelasExistem) {
    console.log('');
    console.log('🎉 TUDO PRONTO! Todas as tabelas existem.');
    console.log('');
    console.log('Você pode começar a usar o sistema:');
    console.log('  npm start');
    console.log('  http://localhost:3000/admin.html');
    console.log('');
  } else {
    console.log('');
    console.log('⚠️  TABELAS NÃO ENCONTRADAS');
    console.log('');
    console.log('Execute o SQL para criar as tabelas:');
    console.log('');
    console.log('1. Acesse o dashboard do Supabase:');
    console.log('   https://supabase.com/dashboard/project/yzsgoxrrhjiiulmnwrfo');
    console.log('');
    console.log('2. Vá em "SQL Editor" no menu lateral');
    console.log('');
    console.log('3. Clique em "New query"');
    console.log('');
    console.log('4. Cole o conteúdo do arquivo:');
    console.log('   SETUP_TABELAS.sql');
    console.log('');
    console.log('5. Clique em "Run" (ou pressione Ctrl/Cmd + Enter)');
    console.log('');
    console.log('6. Execute novamente este script:');
    console.log('   node verificar-supabase.js');
    console.log('');
  }
}

verificarSupabase().catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});
