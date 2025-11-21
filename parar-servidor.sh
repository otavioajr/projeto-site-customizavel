#!/bin/bash

# Script para parar o servidor

echo "🛑 Parando servidor..."

# Parar processos relacionados
pkill -9 -f "node server.js" 2>/dev/null
pkill -9 -f "nodemon dev-server.js" 2>/dev/null
pkill -9 -f "dev-server.js" 2>/dev/null
sleep 1

# Verificar e limpar porta 3000
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  Ainda há processo na porta 3000"
    echo "Forçando encerramento..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Verificar e limpar porta 3001 (porta padrão do dev)
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "⚠️  Ainda há processo na porta 3001"
    echo "Forçando encerramento..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo "✅ Servidor parado"
