#!/bin/bash

# Script para iniciar o servidor e ngrok automaticamente
# Uso: ./start-ngrok.sh

echo "🚀 Projeto Leo - Iniciando servidor e túnel público..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se ngrok está instalado
if ! command -v ngrok &> /dev/null; then
    echo -e "${YELLOW}⚠️  ngrok não encontrado!${NC}"
    echo ""
    echo "Instale o ngrok com:"
    echo "  brew install ngrok/ngrok/ngrok"
    echo ""
    echo "Ou baixe em: https://ngrok.com/download"
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

# Iniciar ngrok
echo -e "${BLUE}🌐 Iniciando túnel ngrok...${NC}"
echo -e "${YELLOW}💡 Dica: Acesse http://localhost:4040 para ver logs detalhados${NC}"
echo ""

# Trap para cleanup ao sair
trap "echo ''; echo '🛑 Encerrando servidor...'; kill $SERVER_PID 2>/dev/null; exit" INT TERM

# Iniciar ngrok (região South America para melhor performance no Brasil)
ngrok http 3000 --region=sa

# Cleanup (executado quando ngrok é fechado)
echo ""
echo "🛑 Encerrando servidor..."
kill $SERVER_PID 2>/dev/null
echo "✅ Finalizado!"
