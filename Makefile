.PHONY: setup setup-e2e up down quality test e2e ci build

# Optional: PLAYWRIGHT_INSTALL_ARGS=--with-deps on Linux CI runners
setup:
	npm ci

setup-e2e: setup
	npx playwright install --with-deps chromium

up:
	npm run dev

down:
	@fuser -k 4321/tcp 2>/dev/null || true
	@echo "Dev server stopped (port 4321)."

build:
	npm run build

quality:
	npm run quality

test:
	npm run test:unit

e2e:
	npm run test:e2e

ci:
	npm run ci
