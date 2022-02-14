.PHONY: build
build: lint format
	npx rollup --config rollup.config.js
	cp -r src/index.html src/wordlists output/

.PHONY: lint
lint:
	npx eslint src/**.js --fix

.PHONY: format
format:
	npx prettier -w src/**.js --no-semi

.PHONY: deploy
deploy: build
	bash -c "cd output && git add . && git commit -m 'Deploy' && git push origin gh-pages"
