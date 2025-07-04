# 🐋 Docker Compose Shortcuts

.PHONY: help up down build logs clean restart dev

# Default target
help: ## Show this help message
	@echo "🎬 Movie Chat Application - Docker Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start the application
	docker compose up

dev: ## Start the application in development mode (with logs)
	docker compose up

build: ## Build and start the application
	docker compose up --build

down: ## Stop the application
	docker compose down

restart: ## Restart the application
	docker compose restart

logs: ## View application logs
	docker compose logs -f

logs-app: ## View application logs only
	docker compose logs -f app

logs-db: ## View database logs only
	docker compose logs -f db

clean: ## Stop and remove all containers, networks, and volumes
	docker compose down -v --remove-orphans
	docker system prune -f

reset: ## Reset everything (clean + rebuild)
	make clean
	make build

status: ## Show running containers
	docker compose ps

shell: ## Open shell in the app container
	docker compose exec app sh

db-shell: ## Open PostgreSQL shell
	docker compose exec db psql -U postgres -d testpers

# Quick setup for new users
setup: ## Initial setup with environment file creation
	@echo "🚀 Setting up your movie chat application..."
	@if [ ! -f .env ]; then \
		echo "Creating .env file..."; \
		echo "# Add your OpenAI API key here" > .env; \
		echo "OPENAI_API_KEY=your_openai_api_key_here" >> .env; \
		echo "# Optional: Add your TMDB access token" >> .env; \
		echo "TMDB_ACCESS_TOKEN=" >> .env; \
		echo "✅ .env file created!"; \
		echo "📝 Please edit .env and add your OpenAI API key"; \
	else \
		echo "✅ .env file already exists"; \
	fi
	@echo "🎬 Run 'make up' to start the application!" 