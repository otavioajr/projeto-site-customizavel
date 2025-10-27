#!/bin/bash

# Script para iniciar o servidor local

echo "🔧 Parando processos antigos..."
pkill -9 -f "node server.js" 2>/dev/null
sleep 1

echo "🚀 Iniciando servidor..."
cd "$(dirname "$0")"

# Iniciar servidor
node server.js &
SERVER_PID=$!

echo "⏳ Aguardando servidor inicializar..."
sleep 3

# Testar se está funcionando
if curl -s http://localhost:3000/api/images > /dev/null 2>&1; then
    echo ""
    echo "═══════════════════════════════════════════"
    echo "✅ Servidor iniciado com sucesso!"
    echo "═══════════════════════════════════════════"
    echo ""
    echo "📍 URLs disponíveis:"
    echo "   Admin:  http://localhost:3000/admin.html"
    echo "   Site:   http://localhost:3000"
    echo "   Teste:  http://localhost:3000/test-supabase.html"
    echo ""
    echo "🔑 Senha do admin: admin123"
    echo ""
    echo "⚠️  Mantenha este Terminal aberto!"
    echo "   Para parar: Ctrl+C ou ./parar-servidor.sh"
    echo ""
    echo "PID do servidor: $SERVER_PID"
    echo "═══════════════════════════════════════════"
    echo ""

    # Manter script rodando
    wait $SERVER_PID
else
    echo ""
    echo "❌ Erro ao iniciar servidor"
    echo "Verifique se a porta 3000 está livre"
    echo ""
    pkill -9 $SERVER_PID 2>/dev/null
    exit 1
fi
