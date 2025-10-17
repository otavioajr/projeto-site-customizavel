#!/bin/bash

# Script de inicialização do projeto

echo "🚀 Iniciando Projeto Leo..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null
then
    echo "❌ Node.js não está instalado!"
    echo "📥 Instale em: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node -v)"
echo ""

# Verificar se dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo ""
fi

# Criar pasta uploads se não existir
if [ ! -d "uploads" ]; then
    echo "📁 Criando pasta uploads..."
    mkdir uploads
    echo "✅ Pasta uploads criada!"
    echo ""
fi

# Iniciar servidor
echo "🌐 Iniciando servidor..."
echo "📍 Admin: http://localhost:3000/admin.html"
echo "📍 Site: http://localhost:3000/"
echo ""
echo "💡 Pressione Ctrl+C para parar o servidor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm start
