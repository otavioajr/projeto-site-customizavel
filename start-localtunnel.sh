#!/bin/bash

# Script para iniciar o servidor e localtunnel automaticamente
# Uso: ./start-localtunnel.sh

echo "🚀 Projeto Leo - Iniciando servidor e túnel público (localtunnel)..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se a porta 3000 já está em uso
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Porta 3000 já está em uso${NC}"
    echo ""
    read -p "Deseja matar o processo e continuar? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "🔪 Matando processo na porta 3000..."
        lsof -ti:3000 | xargs kill -9
        sleep 2
    else
        echo "❌ Cancelado pelo usuário"
        exit 1
    fi
fi

# Iniciar servidor Node.js em background
echo -e "${BLUE}📦 Iniciando servidor Node.js...${NC}"
npm start &
SERVER_PID=$!

# Aguardar servidor iniciar
echo "⏳ Aguardando servidor iniciar (3 segundos)..."
sleep 3

# Verificar se o servidor iniciou corretamente
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}❌ Erro: Servidor não iniciou na porta 3000${NC}"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Servidor rodando em http://localhost:3000${NC}"
echo ""

# Iniciar localtunnel
echo -e "${BLUE}🌐 Iniciando túnel localtunnel...${NC}"
echo -e "${YELLOW}💡 Vantagens: Sem cadastro, gratuito, fácil de usar${NC}"
echo ""

# Trap para cleanup ao sair
trap "echo ''; echo '🛑 Encerrando servidor...'; kill $SERVER_PID 2>/dev/null; exit" INT TERM

# Iniciar localtunnel
npx localtunnel --port 3000

# Cleanup (executado quando localtunnel é fechado)
echo ""
echo "🛑 Encerrando servidor..."
kill $SERVER_PID 2>/dev/null
echo "✅ Finalizado!"
