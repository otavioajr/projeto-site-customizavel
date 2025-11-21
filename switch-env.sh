#!/bin/bash

# ================================================
# Script: switch-env.sh
# Descrição: Alterna entre ambientes de produção e homologação
# Uso: ./switch-env.sh [production|homol|current]
# ================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Função para exibir o ambiente atual
show_current_env() {
    echo -e "${CYAN}==============================================\n"
    echo -e "  AMBIENTE ATUAL\n"
    echo -e "==============================================${NC}\n"

    if [ -f ".env" ]; then
        ENV_TYPE=$(grep "^NODE_ENV=" .env | cut -d '=' -f2 || echo "indefinido")
        SCHEMA=$(grep "^SUPABASE_SCHEMA=" .env | cut -d '=' -f2 || echo "indefinido")

        echo -e "${BLUE}NODE_ENV:${NC} ${ENV_TYPE}"
        echo -e "${BLUE}SUPABASE_SCHEMA:${NC} ${SCHEMA}\n"

        if [ "$ENV_TYPE" = "production" ]; then
            echo -e "${RED}⚠️  ATENÇÃO: Você está em PRODUÇÃO!${NC}"
            echo -e "${YELLOW}   Alterações afetarão o ambiente real.${NC}\n"
        elif [ "$SCHEMA" = "homol" ]; then
            echo -e "${GREEN}✓ Ambiente de homologação ativo${NC}"
            echo -e "${GREEN}  Suas alterações estão isoladas.${NC}\n"
        fi
    else
        echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
        echo -e "${YELLOW}   Execute: ./switch-env.sh production ou ./switch-env.sh homol${NC}\n"
    fi
}

# Função para alternar ambiente
switch_environment() {
    local ENV=$1

    if [ "$ENV" != "production" ] && [ "$ENV" != "homol" ]; then
        echo -e "${RED}Erro: Ambiente inválido!${NC}"
        echo -e "Uso: ./switch-env.sh [production|homol|current]\n"
        exit 1
    fi

    local ENV_FILE=".env.${ENV}"

    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${RED}Erro: Arquivo ${ENV_FILE} não encontrado!${NC}"
        echo -e "${YELLOW}Crie o arquivo com base no .env.example${NC}\n"
        exit 1
    fi

    echo -e "${CYAN}==============================================\n"
    echo -e "  ALTERNANDO AMBIENTE\n"
    echo -e "==============================================${NC}\n"

    # Backup do .env atual (se existir)
    if [ -f ".env" ]; then
        cp .env .env.backup
        echo -e "${GREEN}✓${NC} Backup criado: .env.backup"
    fi

    # Copiar arquivo de ambiente
    cp "$ENV_FILE" .env
    echo -e "${GREEN}✓${NC} Copiado: ${ENV_FILE} → .env\n"

    # Mostrar ambiente ativo
    show_current_env

    # Instruções
    echo -e "${CYAN}==============================================\n"
    echo -e "  PRÓXIMOS PASSOS\n"
    echo -e "==============================================${NC}\n"

    if [ "$ENV" = "production" ]; then
        echo -e "${RED}1.${NC} Reinicie o servidor: ${BLUE}npm start${NC}"
        echo -e "${RED}2.${NC} Ou use dev mode: ${BLUE}npm run dev${NC}\n"
        echo -e "${RED}⚠️  ATENÇÃO: Você está em PRODUÇÃO!${NC}"
        echo -e "${YELLOW}   - Alterações afetarão dados reais${NC}"
        echo -e "${YELLOW}   - Faça testes em homologação primeiro${NC}\n"
    else
        echo -e "${GREEN}1.${NC} Reinicie o servidor: ${BLUE}npm start${NC}"
        echo -e "${GREEN}2.${NC} Ou use dev mode: ${BLUE}npm run dev${NC}\n"
        echo -e "${GREEN}✓ Ambiente seguro para testes${NC}"
        echo -e "${GREEN}  - Schema isolado: homol${NC}"
        echo -e "${GREEN}  - Sem impacto em produção${NC}\n"
    fi
}

# Função de ajuda
show_help() {
    echo -e "${CYAN}==============================================\n"
    echo -e "  SWITCH-ENV - Gerenciador de Ambientes\n"
    echo -e "==============================================${NC}\n"
    echo -e "${BLUE}Uso:${NC}"
    echo -e "  ./switch-env.sh [comando]\n"
    echo -e "${BLUE}Comandos:${NC}"
    echo -e "  ${GREEN}production${NC}  - Alternar para ambiente de PRODUÇÃO"
    echo -e "  ${GREEN}homol${NC}       - Alternar para ambiente de HOMOLOGAÇÃO"
    echo -e "  ${GREEN}current${NC}     - Exibir ambiente atual"
    echo -e "  ${GREEN}help${NC}        - Exibir esta ajuda\n"
    echo -e "${BLUE}Exemplos:${NC}"
    echo -e "  ./switch-env.sh homol       ${YELLOW}# Ativar homologação${NC}"
    echo -e "  ./switch-env.sh production  ${YELLOW}# Ativar produção${NC}"
    echo -e "  ./switch-env.sh current     ${YELLOW}# Ver ambiente ativo${NC}\n"
    echo -e "${BLUE}Estrutura de Schemas:${NC}"
    echo -e "  ${GREEN}Produção:${NC}     schema 'public'  (dados reais)"
    echo -e "  ${GREEN}Homologação:${NC}  schema 'homol'   (dados de teste)\n"
}

# Main
case "${1:-help}" in
    production)
        switch_environment "production"
        ;;
    homol)
        switch_environment "homol"
        ;;
    current)
        show_current_env
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Comando inválido: ${1}${NC}\n"
        show_help
        exit 1
        ;;
esac
