#!/usr/bin/env node
// taxlife-scraper — CLI. Saída sempre em JSON no stdout.
//
//   node cli.js login-test
//   node cli.js inventario  ['{"areas":["/tracks"],"includeText":true,"cardLimit":50}']
//   node cli.js aprofundar  '{"hrefs":["/tracks/x"],"includeText":true}'
//   node cli.js extrair     '{"titleMatch":"Reforma"}'          (1 curso)
//   node cli.js extrair-lote '{"titleMatches":["A","B"]}'       (vários)
//   node cli.js normalizar  cursos.json [--dry-run]             (gera .md em ~/.taxlife/cache)

const fs = require('fs');
const path = require('path');

try { process.loadEnvFile(path.join(__dirname, '.env')); } catch { /* sem .env: usa o ambiente */ }

const taxlife = require('./src');

function parseOpts(raw) {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (e) {
    throw new Error(`opções devem ser JSON válido: ${e.message}`);
  }
}

const COMMANDS = {
  'login-test':   ()  => taxlife.healthcheck(),
  'inventario':   (a) => taxlife.inventarioRaiz(parseOpts(a[0])),
  'aprofundar':   (a) => taxlife.aprofundarHrefs(parseOpts(a[0])),
  'extrair':      (a) => taxlife.extrairCurso(parseOpts(a[0])),
  'extrair-lote': (a) => taxlife.extrairLote(parseOpts(a[0])),
  'normalizar':   (a) => {
    const file = a.find(x => !x.startsWith('--'));
    if (!file) throw new Error('uso: normalizar <cursos.json> [--dry-run]');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const cursos = Array.isArray(data) ? data : (data.cursos || data.results || [data]);
    return taxlife.normalize(cursos, { dryRun: a.includes('--dry-run') });
  },
};

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (!cmd || !COMMANDS[cmd]) {
    console.error(`uso: taxlife-scraper <${Object.keys(COMMANDS).join('|')}> [opções JSON]`);
    process.exit(2);
  }
  const result = await COMMANDS[cmd](args);
  console.log(JSON.stringify(result, null, 2));
  // healthcheck/normalize devolvem { ok:false } em vez de lançar — refletir no exit code
  if (result && result.ok === false) process.exit(1);
}

main().catch(err => {
  console.error(JSON.stringify({ ok: false, error: err.message }));
  process.exit(1);
});
