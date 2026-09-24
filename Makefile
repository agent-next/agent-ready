.PHONY: setup check

setup:
	npm ci

check:
	npm run check
	npm test
