.PHONY: provision build test run clean

provision:
	@node --version
	@echo "No external dependencies to install (dependency-free Node core-only implementation)."

build:
	npm run build

test:
	npm test

run:
	npm run run

clean:
	npm run clean
