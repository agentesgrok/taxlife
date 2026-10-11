# taxlife-scraper

Scraper em Puppeteer da plataforma **TaxLife — Comunidade O Novo Tributário**. Faz login com conta de assinante, mapeia as áreas, extrai a estrutura dos cursos (módulos, aulas, textos, links de PDF/vídeo) e normaliza cada curso em um `.md` (pensado para virar fonte no NotebookLM).

> Use apenas com a sua própria conta e respeitando os termos de uso da plataforma. O conteúdo extraído é do autor/plataforma.

## Instalação

```bash
npm install
cp .env.example .env   # preencher TAXLIFE_EMAIL e TAXLIFE_PASSWORD
```

Node 20.12+. O login é pelo formulário local da plataforma (não OAuth Google). Os cookies ficam em `~/.taxlife/storage_state.json` e são reaproveitados por até 12 h.

## Uso

Saída sempre em JSON no stdout.

```bash
node cli.js login-test
node cli.js inventario '{"areas":["/tracks","/news"],"includeText":false,"cardLimit":100}'
node cli.js aprofundar '{"hrefs":["/tracks/algum-curso"],"includeText":true}'
node cli.js extrair '{"titleMatch":"Reforma"}'
node cli.js extrair-lote '{"titleMatches":["Curso A","Curso B"]}' > cursos.json
node cli.js normalizar cursos.json --dry-run
```

`normalizar` grava em `~/.taxlife/cache/<slug>.md`, com frontmatter e hash estável do corpo.

Também dá para usar como biblioteca:

```js
const taxlife = require('taxlife-scraper');
const inv = await taxlife.inventarioRaiz({ areas: ['/tracks'] });
```

## Estrutura

| Arquivo | Função |
|---|---|
| `src/client.js` | Puppeteer + login persistente (`authenticatedPage`, `healthcheck`) |
| `src/inventario.js` | Mapeia áreas e cards (`inventarioRaiz`, `aprofundarHrefs`) |
| `src/extractor.js` | Entra no curso por clique (site React, sem `href`) e extrai a estrutura |
| `src/normalize.js` | Converte cursos extraídos em Markdown |
| `cli.js` | Linha de comando |
