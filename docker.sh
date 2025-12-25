#!/bin/bash

# WA Gateway Docker Helper Script
# Script untuk memudahkan operasi Docker

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function show_help() {
    echo -e "\n${CYAN}🐳 WA Gateway - Docker Helper Script${NC}\n"
    echo -e "${NC}Usage: ./docker.sh [command]${NC}\n"
    
    echo -e "${YELLOW}Available commands:${NC}"
    echo -e "  ${GREEN}setup${NC}      - Setup environment file (.env)"
    echo -e "  ${GREEN}build${NC}      - Build Docker images"
    echo -e "  ${GREEN}start${NC}      - Start all containers"
    echo -e "  ${GREEN}stop${NC}       - Stop all containers"
    echo -e "  ${GREEN}restart${NC}    - Restart all containers"
    echo -e "  ${GREEN}logs${NC}       - Show container logs"
    echo -e "  ${GREEN}status${NC}     - Show container status"
    echo -e "  ${GREEN}clean${NC}      - Stop and remove all containers"
    echo -e "  ${GREEN}rebuild${NC}    - Rebuild and restart containers"
    echo -e "  ${GREEN}backup-db${NC}  - Backup database"
    echo -e "  ${GREEN}shell${NC}      - Access backend container shell"
    echo -e "  ${GREEN}psql${NC}       - Access PostgreSQL shell"
    echo -e "  ${GREEN}help${NC}       - Show this help message\n"
}

function setup_environment() {
    echo -e "\n${CYAN}📝 Setting up environment file...${NC}\n"
    
    if [ -f ".env" ]; then
        echo -e "${RED}❌ .env file already exists!${NC}"
        read -p "Do you want to overwrite? (y/N): " overwrite
        if [ "$overwrite" != "y" ]; then
            echo -e "${YELLOW}Setup cancelled.${NC}"
            return
        fi
    fi
    
    cp .env.docker .env
    echo -e "${GREEN}✅ Created .env file from template${NC}"
    echo -e "\n${YELLOW}⚠️  IMPORTANT: Edit .env file and change:${NC}"
    echo -e "   ${YELLOW}- DB_PASSWORD${NC}"
    echo -e "   ${YELLOW}- JWT_SECRET${NC}"
    echo -e "   ${YELLOW}- SMTP_USER and SMTP_PASS${NC}\n"
}

function build_images() {
    echo -e "\n${CYAN}🏗️  Building Docker images...${NC}\n"
    docker-compose build
    echo -e "\n${GREEN}✅ Build completed successfully!${NC}\n"
}

function start_containers() {
    echo -e "\n${CYAN}🚀 Starting containers...${NC}\n"
    docker-compose up -d
    echo -e "\n${GREEN}✅ Containers started successfully!${NC}\n"
    echo -e "${CYAN}Access the application at: http://localhost:5000${NC}"
    echo -e "${CYAN}API endpoint: http://localhost:5000/api${NC}\n"
}

function stop_containers() {
    echo -e "\n${CYAN}🛑 Stopping containers...${NC}\n"
    docker-compose stop
    echo -e "\n${GREEN}✅ Containers stopped successfully!${NC}\n"
}

function restart_containers() {
    echo -e "\n${CYAN}🔄 Restarting containers...${NC}\n"
    docker-compose restart
    echo -e "\n${GREEN}✅ Containers restarted successfully!${NC}\n"
}

function show_logs() {
    echo -e "\n${CYAN}📋 Showing container logs (Press Ctrl+C to exit)...${NC}\n"
    docker-compose logs -f
}

function show_status() {
    echo -e "\n${CYAN}📊 Container Status:${NC}\n"
    docker-compose ps
    echo ""
}

function clean_all() {
    echo -e "\n${CYAN}🧹 Cleaning up containers...${NC}\n"
    read -p "This will stop and remove all containers. Continue? (y/N): " confirm
    if [ "$confirm" = "y" ]; then
        docker-compose down
        echo -e "\n${GREEN}✅ Cleanup completed!${NC}\n"
    else
        echo -e "${YELLOW}Cleanup cancelled.${NC}"
    fi
}

function rebuild_all() {
    echo -e "\n${CYAN}🔨 Rebuilding and restarting containers...${NC}\n"
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo -e "\n${GREEN}✅ Rebuild completed successfully!${NC}\n"
    echo -e "${CYAN}Access the application at: http://localhost:5000${NC}\n"
}

function backup_database() {
    echo -e "\n${CYAN}💾 Creating database backup...${NC}\n"
    timestamp=$(date +%Y%m%d_%H%M%S)
    filename="backup_$timestamp.sql"
    
    docker exec waapi-postgres pg_dump -U waapi_user waapi_db > "$filename"
    echo -e "${GREEN}✅ Database backed up to: $filename${NC}\n"
}

function open_shell() {
    echo -e "\n${CYAN}🐚 Opening backend container shell...${NC}\n"
    docker exec -it waapi-backend sh
}

function open_postgresql() {
    echo -e "\n${CYAN}🗄️  Opening PostgreSQL shell...${NC}\n"
    docker exec -it waapi-postgres psql -U waapi_user -d waapi_db
}

# Main
COMMAND=${1:-help}

case "$COMMAND" in
    setup)
        setup_environment
        ;;
    build)
        build_images
        ;;
    start)
        start_containers
        ;;
    stop)
        stop_containers
        ;;
    restart)
        restart_containers
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    clean)
        clean_all
        ;;
    rebuild)
        rebuild_all
        ;;
    backup-db)
        backup_database
        ;;
    shell)
        open_shell
        ;;
    psql)
        open_postgresql
        ;;
    help)
        show_help
        ;;
    *)
        echo -e "\n${RED}❌ Unknown command: $COMMAND${NC}\n"
        show_help
        exit 1
        ;;
esac
