.PHONY: build
build: deps lint format
	npx rollup --config rollup.config.js
	cp -r src/index.html src/wordlists output/

.PHONY: deps
deps:
	npm install

.PHONY: lint
lint:
	npx eslint src/**.js --fix

.PHONY: format
format:
	npx prettier -w src/**.js --no-semi

.PHONY: deploy
deploy: build
	bash -c "cd output && git add . && git commit -m 'Deploy' && git push origin gh-pages"

.PHONE: build/docker
build/docker:
	docker run --rm -v ${PWD}:/wd --workdir=/wd --entrypoint bash node:16 -c "make build"
