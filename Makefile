.PHONY: help install dev build test clean docker-up docker-down docker-logs

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ All dependencies installed!"

dev: ## Start development servers
	@echo "Starting development servers..."
	@$(MAKE) -j2 dev-backend dev-frontend

dev-backend: ## Start backend development server
	cd backend && npm run dev

dev-frontend: ## Start frontend development server
	cd frontend && npm run dev

build: ## Build both backend and frontend
	@echo "Building backend..."
	cd backend && npm run build
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "✅ Build complete!"

test: ## Run tests
	@echo "Running backend tests..."
	cd backend && npm test

lint: ## Lint all code
	@echo "Linting backend..."
	cd backend && npm run lint
	@echo "Linting frontend..."
	cd frontend && npm run lint

format: ## Format all code
	@echo "Formatting backend..."
	cd backend && npm run format
	@echo "Formatting frontend..."
	cd frontend && npm run format

clean: ## Clean build artifacts and node_modules
	@echo "Cleaning..."
	rm -rf backend/dist backend/node_modules backend/coverage
	rm -rf frontend/dist frontend/node_modules frontend/coverage
	@echo "✅ Cleaned!"

docker-up: ## Start Docker containers
	docker-compose up -d
	@echo "✅ Containers started!"
	@echo "Frontend: http://localhost"
	@echo "Backend: http://localhost:3000"
	@echo "API Docs: http://localhost:3000/api/docs"

docker-down: ## Stop Docker containers
	docker-compose down
	@echo "✅ Containers stopped!"

docker-logs: ## Show Docker logs
	docker-compose logs -f

docker-build: ## Build Docker images
	docker-compose build

docker-restart: ## Restart Docker containers
	docker-compose restart

seed: ## Seed the database with sample data
	cd backend && npx tsx src/scripts/seed.ts

check: ## Run all checks (lint, type-check, test)
	@echo "Running all checks..."
	@$(MAKE) lint
	@echo "Type checking backend..."
	cd backend && npm run type-check
	@echo "Type checking frontend..."
	cd frontend && npm run type-check
	@$(MAKE) test
	@echo "✅ All checks passed!"
