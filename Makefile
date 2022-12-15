install:
	npm ci

start:
	npx webpack serve --open

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint .

.PHONY: test