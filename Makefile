.PHONY: install dev build lint format db-push db-seed db-studio docker-up docker-down clean setup

# Install dependencies
install:
	pnpm install

# Start development server
dev:
	pnpm dev

# Build all packages
build:
	pnpm build

# Lint all packages
lint:
	pnpm lint

# Format all files
format:
	pnpm format

# Push Prisma schema to database
db-push:
	pnpm db:push

# Seed the database
db-seed:
	pnpm db:seed

# Open Prisma Studio
db-studio:
	pnpm db:studio

# Start Docker services
docker-up:
	docker compose up -d

# Stop Docker services
docker-down:
	docker compose down

# Clean all build artifacts and node_modules
clean:
	pnpm clean
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules

# Full setup: Docker + Install + DB
setup: docker-up install
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 3
	$(MAKE) db-push
	@echo ""
	@echo "============================================"
	@echo "  HyperHub is ready! Run 'make dev' to start"
	@echo "============================================"
