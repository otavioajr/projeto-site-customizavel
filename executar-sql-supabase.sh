#!/bin/bash

# Script para executar SQL no Supabase via API Management
# Requer a SERVICE_ROLE_KEY (não a anon key)

SUPABASE_URL="https://yzsgoxrrhjiiulmnwrfo.supabase.co"
SQL_FILE="SETUP_TABELAS.sql"

echo "🔐 Verificando SERVICE_ROLE_KEY..."
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo ""
  echo "❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não definida"
  echo ""
  echo "Para executar SQL via API, você precisa da SERVICE ROLE KEY (não a anon key)"
  echo ""
  echo "📋 COMO OBTER:"
  echo "1. Acesse: https://supabase.com/dashboard/project/yzsgoxrrhjiiulmnwrfo"
  echo "2. Vá em Settings → API"
  echo "3. Copie a 'service_role' key (não a 'anon' key)"
  echo "4. Execute:"
  echo "   export SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key"
  echo "   ./executar-sql-supabase.sh"
  echo ""
  echo "⚠️  ALTERNATIVA MAIS FÁCIL:"
  echo "Execute o SQL manualmente no dashboard:"
  echo "1. Acesse: https://supabase.com/dashboard/project/yzsgoxrrhjiiulmnwrfo"
  echo "2. SQL Editor → New Query"
  echo "3. Cole o conteúdo de $SQL_FILE"
  echo "4. Clique em Run"
  echo ""
  exit 1
fi

echo "✅ SERVICE_ROLE_KEY encontrada"
echo ""
echo "📝 Lendo arquivo SQL: $SQL_FILE"

if [ ! -f "$SQL_FILE" ]; then
  echo "❌ Arquivo $SQL_FILE não encontrado"
  exit 1
fi

# Ler o conteúdo do arquivo SQL
SQL_CONTENT=$(cat "$SQL_FILE")

echo "🚀 Executando SQL no Supabase..."
echo ""

# Usar a API query do Supabase
RESPONSE=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}")

echo "📊 Resposta:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Verificar se houve sucesso
if echo "$RESPONSE" | grep -q "error"; then
  echo "⚠️  Houve um erro. Isso é esperado se a API rpc não estiver disponível."
  echo ""
  echo "✅ SOLUÇÃO: Execute manualmente no dashboard"
  echo "1. Acesse: https://supabase.com/dashboard/project/yzsgoxrrhjiiulmnwrfo"
  echo "2. SQL Editor → New Query"
  echo "3. Cole o conteúdo de $SQL_FILE"
  echo "4. Clique em Run"
else
  echo "✅ SQL executado com sucesso!"
fi
