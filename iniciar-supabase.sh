#!/bin/bash

# Script de inicialização rápida do Supabase
# Execute: bash iniciar-supabase.sh

echo "🚀 Configuração Rápida do Supabase"
echo "=================================="
echo ""

# Verificar se npm install foi executado
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo "✅ Dependências instaladas!"
    echo ""
fi

# Verificar se config.js existe
if [ ! -f "config.js" ]; then
    echo "⚠️  Arquivo config.js não encontrado!"
    echo ""
    echo "Por favor, siga estes passos:"
    echo ""
    echo "1. Copie o arquivo de exemplo:"
    echo "   cp config.example.js config.js"
    echo ""
    echo "2. Edite config.js e adicione suas credenciais do Supabase:"
    echo "   - SUPABASE_URL: https://seu-projeto.supabase.co"
    echo "   - SUPABASE_ANON_KEY: sua-chave-publica"
    echo ""
    echo "3. Para obter as credenciais:"
    echo "   a) Acesse https://supabase.com"
    echo "   b) Crie um novo projeto (se ainda não criou)"
    echo "   c) Vá em Settings > API"
    echo "   d) Copie 'Project URL' e 'anon public key'"
    echo ""
    echo "4. Execute o SQL para criar as tabelas:"
    echo "   Veja o arquivo: CONFIGURAR_SUPABASE.md"
    echo ""
    echo "5. Execute este script novamente"
    echo ""
    exit 1
fi

echo "✅ Arquivo config.js encontrado!"
echo ""

# Verificar se as credenciais foram preenchidas
if grep -q "seu-projeto.supabase.co" config.js; then
    echo "⚠️  ATENÇÃO: As credenciais ainda não foram configuradas!"
    echo ""
    echo "Edite o arquivo config.js e substitua:"
    echo "  - 'seu-projeto.supabase.co' pela URL real do seu projeto"
    echo "  - 'sua-chave-publica-aqui' pela chave anon key real"
    echo ""
    echo "Depois execute este script novamente."
    echo ""
    exit 1
fi

echo "✅ Credenciais configuradas!"
echo ""

# Iniciar servidor
echo "🚀 Iniciando servidor local..."
echo ""
echo "Acesse:"
echo "  - Home: http://localhost:3000"
echo "  - Admin: http://localhost:3000/admin.html"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

npm start
