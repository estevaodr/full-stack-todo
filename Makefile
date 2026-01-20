.PHONY: help server client test test-server test-client e2e e2e-client e2e-server build build-server build-client lint lint-server lint-client clean install run all kill run-many

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Available targets:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	npm install

server: ## Run the server in development mode
	@echo "$(YELLOW)Starting server...$(NC)"
	npx nx serve server

client: ## Run the client in development mode
	@echo "$(YELLOW)Starting client...$(NC)"
	npx nx serve client

run: ## Run both server and client in parallel using run-many (automatically starts PostgreSQL)
	@echo "$(YELLOW)Starting server and client...$(NC)"
	@echo "$(GREEN)Note: PostgreSQL will be started automatically if not running$(NC)"
	npx nx run-many --target=serve --projects=server,client --parallel=2

all: run ## Alias for run (starts both server and client)

kill: ## Kill all running server and client processes
	@echo "$(YELLOW)Stopping all services...$(NC)"
	@pkill -f "nx serve server" 2>/dev/null || true
	@pkill -f "nx serve client" 2>/dev/null || true
	@pkill -f "webpack-cli" 2>/dev/null || true
	@lsof -ti :3000 2>/dev/null | xargs kill -9 2>/dev/null || true
	@lsof -ti :4200 2>/dev/null | xargs kill -9 2>/dev/null || true
	@echo "$(GREEN)All services stopped$(NC)"

run-many: ## Run a target on multiple projects (usage: make run-many TARGET=test PROJECTS=server,client)
	@if [ -z "$(TARGET)" ]; then \
		echo "$(YELLOW)Usage: make run-many TARGET=<target> [PROJECTS=<project1,project2>]$(NC)"; \
		echo "$(YELLOW)Example: make run-many TARGET=test PROJECTS=server,client$(NC)"; \
		echo "$(YELLOW)Example: make run-many TARGET=build$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$(PROJECTS)" ]; then \
		echo "$(YELLOW)Running target '$(TARGET)' on all projects...$(NC)"; \
		npx nx run-many --target=$(TARGET) --all; \
	else \
		echo "$(YELLOW)Running target '$(TARGET)' on projects: $(PROJECTS)...$(NC)"; \
		npx nx run-many --target=$(TARGET) --projects=$(PROJECTS); \
	fi

test: ## Run all tests
	@echo "$(YELLOW)Running all tests...$(NC)"
	npx nx run-many --target=test --all

test-server: ## Run server tests
	@echo "$(YELLOW)Running server tests...$(NC)"
	npx nx test server

test-client: ## Run client tests
	@echo "$(YELLOW)Running client tests...$(NC)"
	npx nx test client

e2e: ## Run all e2e tests
	@echo "$(YELLOW)Running all e2e tests...$(NC)"
	npx nx run-many --target=e2e --all

e2e-client: ## Run client e2e tests
	@echo "$(YELLOW)Running client e2e tests...$(NC)"
	npx nx e2e client-e2e

e2e-server: ## Run server e2e tests
	@echo "$(YELLOW)Running server e2e tests...$(NC)"
	npx nx e2e server-e2e

build: ## Build all projects
	@echo "$(YELLOW)Building all projects...$(NC)"
	npx nx run-many --target=build --all

build-server: ## Build server
	@echo "$(YELLOW)Building server...$(NC)"
	npx nx build server

build-client: ## Build client
	@echo "$(YELLOW)Building client...$(NC)"
	npx nx build client

lint: ## Lint all projects
	@echo "$(YELLOW)Linting all projects...$(NC)"
	npx nx run-many --target=lint --all

lint-server: ## Lint server
	@echo "$(YELLOW)Linting server...$(NC)"
	npx nx lint server

lint-client: ## Lint client
	@echo "$(YELLOW)Linting client...$(NC)"
	npx nx lint client

clean: ## Clean build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf dist
	rm -rf node_modules/.cache
	npx nx reset

