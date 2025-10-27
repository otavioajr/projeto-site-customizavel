#!/bin/bash

# Script para parar o servidor

echo "🛑 Parando servidor..."
pkill -9 -f "node server.js"
sleep 1

if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  Ainda há processo na porta 3000"
    echo "Forçando encerramento..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo "✅ Servidor parado"
