.PHONY: help setup build start stop restart logs status clean rebuild backup-db shell psql dev-start dev-stop dev-logs

# Default target
.DEFAULT_GOAL := help

# Colors
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo ""
	@echo "$(CYAN)🐳 WA Gateway - Docker Management$(NC)"
	@echo ""
	@echo "$(YELLOW)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

setup: ## Setup environment file (.env)
	@echo "$(CYAN)📝 Setting up environment file...$(NC)"
	@if [ -f .env ]; then \
		echo "$(RED)❌ .env file already exists!$(NC)"; \
		read -p "Do you want to overwrite? (y/N): " confirm; \
		if [ "$$confirm" != "y" ]; then \
			echo "$(YELLOW)Setup cancelled.$(NC)"; \
			exit 0; \
		fi; \
	fi
	@cp .env.docker .env
	@echo "$(GREEN)✅ Created .env file from template$(NC)"
	@echo "$(YELLOW)⚠️  IMPORTANT: Edit .env file and change:$(NC)"
	@echo "   - DB_PASSWORD"
	@echo "   - JWT_SECRET"
	@echo "   - SMTP_USER and SMTP_PASS"
	@echo ""

build: ## Build Docker images
	@echo "$(CYAN)🏗️  Building Docker images...$(NC)"
	@docker-compose build
	@echo "$(GREEN)✅ Build completed!$(NC)"

start: ## Start all containers (production)
	@echo "$(CYAN)🚀 Starting containers...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✅ Containers started!$(NC)"
	@echo "$(CYAN)Access: http://localhost:5000$(NC)"

stop: ## Stop all containers
	@echo "$(CYAN)🛑 Stopping containers...$(NC)"
	@docker-compose stop
	@echo "$(GREEN)✅ Containers stopped!$(NC)"

restart: ## Restart all containers
	@echo "$(CYAN)🔄 Restarting containers...$(NC)"
	@docker-compose restart
	@echo "$(GREEN)✅ Containers restarted!$(NC)"

logs: ## Show container logs
	@echo "$(CYAN)📋 Showing logs (Ctrl+C to exit)...$(NC)"
	@docker-compose logs -f

status: ## Show container status
	@echo "$(CYAN)📊 Container Status:$(NC)"
	@docker-compose ps

clean: ## Stop and remove all containers
	@echo "$(CYAN)🧹 Cleaning up...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✅ Cleanup completed!$(NC)"

clean-all: ## Stop and remove containers + volumes (WARNING: Data loss!)
	@echo "$(RED)⚠️  WARNING: This will delete all data including database!$(NC)"
	@read -p "Are you sure? Type 'yes' to confirm: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker-compose down -v; \
		echo "$(GREEN)✅ Full cleanup completed!$(NC)"; \
	else \
		echo "$(YELLOW)Cleanup cancelled.$(NC)"; \
	fi

rebuild: ## Rebuild and restart containers
	@echo "$(CYAN)🔨 Rebuilding...$(NC)"
	@docker-compose down
	@docker-compose build --no-cache
	@docker-compose up -d
	@echo "$(GREEN)✅ Rebuild completed!$(NC)"

backup-db: ## Backup database
	@echo "$(CYAN)💾 Creating database backup...$(NC)"
	@docker exec waapi-postgres pg_dump -U waapi_user waapi_db > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Backup completed!$(NC)"

restore-db: ## Restore database from backup (Usage: make restore-db FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)❌ Please specify backup file: make restore-db FILE=backup.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(CYAN)📥 Restoring database from $(FILE)...$(NC)"
	@docker exec -i waapi-postgres psql -U waapi_user waapi_db < $(FILE)
	@echo "$(GREEN)✅ Database restored!$(NC)"

shell: ## Access backend container shell
	@echo "$(CYAN)🐚 Opening backend shell...$(NC)"
	@docker exec -it waapi-backend sh

psql: ## Access PostgreSQL shell
	@echo "$(CYAN)🗄️  Opening PostgreSQL shell...$(NC)"
	@docker exec -it waapi-postgres psql -U waapi_user -d waapi_db

dev-start: ## Start development environment with hot-reload
	@echo "$(CYAN)🚀 Starting development environment...$(NC)"
	@docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✅ Development environment started!$(NC)"
	@echo "$(CYAN)Access: http://localhost:5000$(NC)"
	@echo "$(CYAN)pgAdmin: http://localhost:5050$(NC)"

dev-stop: ## Stop development environment
	@echo "$(CYAN)🛑 Stopping development environment...$(NC)"
	@docker-compose -f docker-compose.dev.yml down
	@echo "$(GREEN)✅ Development environment stopped!$(NC)"

dev-logs: ## Show development logs
	@echo "$(CYAN)📋 Development logs (Ctrl+C to exit)...$(NC)"
	@docker-compose -f docker-compose.dev.yml logs -f backend

dev-rebuild: ## Rebuild development environment
	@echo "$(CYAN)🔨 Rebuilding development environment...$(NC)"
	@docker-compose -f docker-compose.dev.yml down
	@docker-compose -f docker-compose.dev.yml build --no-cache
	@docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✅ Development rebuild completed!$(NC)"

health: ## Check health status of all containers
	@echo "$(CYAN)🏥 Checking health status...$(NC)"
	@echo ""
	@echo "Backend:"
	@docker inspect --format='{{.State.Health.Status}}' waapi-backend 2>/dev/null || echo "Not running"
	@echo ""
	@echo "PostgreSQL:"
	@docker inspect --format='{{.State.Health.Status}}' waapi-postgres 2>/dev/null || echo "Not running"
	@echo ""

stats: ## Show container resource usage
	@echo "$(CYAN)📊 Resource Usage:$(NC)"
	@docker stats waapi-backend waapi-postgres --no-stream

prune: ## Clean up unused Docker resources
	@echo "$(CYAN)🧹 Cleaning unused Docker resources...$(NC)"
	@docker system prune -f
	@echo "$(GREEN)✅ Cleanup completed!$(NC)"

update: ## Pull latest images and restart
	@echo "$(CYAN)📥 Pulling latest images...$(NC)"
	@docker-compose pull
	@docker-compose up -d
	@echo "$(GREEN)✅ Update completed!$(NC)"

install-deps: ## Install or update backend dependencies
	@echo "$(CYAN)📦 Installing dependencies...$(NC)"
	@docker-compose exec backend npm install
	@echo "$(GREEN)✅ Dependencies installed!$(NC)"
