#!/bin/bash

# Script para iniciar o servidor e Cloudflare Tunnel automaticamente
# Uso: ./start-cloudflare.sh

echo "🚀 Projeto Leo - Iniciando servidor e túnel Cloudflare..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se cloudflared está instalado
if ! command -v cloudflared &> /dev/null; then
    echo -e "${YELLOW}⚠️  cloudflared não encontrado!${NC}"
    echo ""
    echo "Instale o Cloudflare Tunnel com:"
    echo "  brew install cloudflare/cloudflare/cloudflared"
    echo ""
    echo "Ou use localtunnel:"
    echo "  ./start-localtunnel.sh"
    exit 1
fi

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

# Iniciar Cloudflare Tunnel
echo -e "${BLUE}🌐 Iniciando túnel Cloudflare...${NC}"
echo -e "${GREEN}✅ Vantagens: Sem cadastro, sem aviso de segurança, super rápido!${NC}"
echo ""

# Trap para cleanup ao sair
trap "echo ''; echo '🛑 Encerrando servidor...'; kill $SERVER_PID 2>/dev/null; exit" INT TERM

# Iniciar cloudflared
cloudflared tunnel --url http://localhost:3000

# Cleanup (executado quando cloudflared é fechado)
echo ""
echo "🛑 Encerrando servidor..."
kill $SERVER_PID 2>/dev/null
echo "✅ Finalizado!"
