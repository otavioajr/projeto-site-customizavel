#!/bin/bash

# switch-env.sh - Script para alternar entre ambientes (homol/production)

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🔄 Switch de Ambiente - Landing Page  ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Função para mostrar ambiente atual
show_current_env() {
  if [ -f .env ]; then
    local current_env=$(grep NODE_ENV .env | cut -d '=' -f2)
    echo -e "${BLUE}Ambiente atual:${NC} ${GREEN}${current_env}${NC}"
  else
    echo -e "${YELLOW}Nenhum ambiente ativo (.env não encontrado)${NC}"
  fi
}

# Função para alternar ambiente
switch_to() {
  local env=$1
  local env_file=".env.${env}"

  if [ ! -f "$env_file" ]; then
    echo -e "${RED}❌ Erro: Arquivo ${env_file} não encontrado!${NC}"
    echo -e "${YELLOW}💡 Dica: Copie .env.example para ${env_file} e configure as credenciais${NC}"
    exit 1
  fi

  # Backup do .env atual (se existir)
  if [ -f .env ]; then
    mv .env .env.backup
    echo -e "${YELLOW}📦 Backup criado: .env.backup${NC}"
  fi

  # Copiar arquivo de ambiente
  cp "$env_file" .env
  echo -e "${GREEN}✅ Ambiente alterado para: ${env}${NC}"
  echo ""

  # Mostrar configuração
  echo -e "${BLUE}📋 Configuração do ambiente:${NC}"
  grep -v "SUPABASE_ANON_KEY" .env | grep -v "^#" | grep -v "^$"
  echo ""

  # Instruções
  echo -e "${YELLOW}🚀 Para iniciar o servidor:${NC}"
  echo -e "   ${GREEN}npm start${NC} (ou npm run dev:${env})"
  echo ""
}

# Mostrar ambiente atual
show_current_env
echo ""

# Menu de opções
if [ -z "$1" ]; then
  echo -e "${YELLOW}Escolha o ambiente:${NC}"
  echo "  1) Homologação (homol)"
  echo "  2) Produção (production)"
  echo "  3) Mostrar ambiente atual"
  echo "  4) Sair"
  echo ""
  read -p "Opção: " option

  case $option in
    1)
      switch_to "homol"
      ;;
    2)
      echo -e "${RED}⚠️  ATENÇÃO: Você está alternando para PRODUÇÃO!${NC}"
      read -p "Tem certeza? (s/n): " confirm
      if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
        switch_to "production"
      else
        echo "Operação cancelada."
      fi
      ;;
    3)
      show_current_env
      ;;
    4)
      echo "Saindo..."
      exit 0
      ;;
    *)
      echo -e "${RED}Opção inválida!${NC}"
      exit 1
      ;;
  esac
else
  # Modo de linha de comando
  case $1 in
    homol|homologacao)
      switch_to "homol"
      ;;
    prod|production|producao)
      echo -e "${RED}⚠️  ATENÇÃO: Você está alternando para PRODUÇÃO!${NC}"
      switch_to "production"
      ;;
    current|show)
      show_current_env
      ;;
    *)
      echo -e "${RED}❌ Ambiente inválido: $1${NC}"
      echo -e "${YELLOW}Uso: ./switch-env.sh [homol|production|current]${NC}"
      exit 1
      ;;
  esac
fi
