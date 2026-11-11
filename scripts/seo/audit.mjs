// Auditoría SEO del sitio compilado (ejecutar después de `npm run build`).
// Errores (salida 1): lo que no puede llegar a producción.
// Avisos: oportunidades que el agente debe valorar.
//
// Uso: npm run seo:audit [-- --json]
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const OUT = ['.vercel/output/static', 'dist/client', 'dist'].map((d) => join(ROOT, d)).find((d) => existsSync(join(d, 'index.html')));
if (!OUT) {
  console.error('No hay build: ejecuta npm run build antes.');
  process.exit(2);
}

const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const STOP = new Set(['en', 'de', 'la', 'el', 'a', 'para', 'con', 'que', 'es', 'como', 'un', 'una', 'y', 'mi', 'poner']);
const terms = (kw) => norm(kw).split(' ').filter((w) => !STOP.has(w));
const covers = (text, kw) => {
  const t = norm(text);
  // Tolera plural/singular: «mensajes automaticos» cubre «mensaje automatico».
  return terms(kw).every((w) => t.includes(w.replace(/(es|s)$/, '')));
};

// Reglas de marca de CLAUDE.md: nada de prometer lo que el producto no hace.
const FORBIDDEN = [
  { re: /env[ií]os? masivos?(?![^.]{0,60}\b(no|nunca|sin)\b)/i, why: 'promete envíos masivos' },
  { re: /follow to dm/i, why: 'menciona Follow to DM' },
  { re: /ventas garantizadas|garantizamos (ventas|resultados)/i, why: 'promete ventas garantizadas' },
  { re: /escribe(mos)? primero a/i, why: 'promete escribir primero' },
];
const NEGATION = /\b(no|nunca|sin|tampoco|ni)\b/i;

const pages = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) pages.push(p);
  }
})(OUT);

const errors = [];
const warnings = [];
const info = {};
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const path = '/' + file.slice(OUT.length + 1).replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
  const url = path === '/' ? '/' : path.replace(/\/$/, '');
  const get = (re) => html.match(re)?.[1]?.trim() ?? '';
  const title = get(/<title>([^<]*)<\/title>/);
  const description = get(/<meta name="description" content="([^"]*)"/);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim());
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim());
  const noindex = /<meta name="robots" content="noindex/.test(html);
  const main = html.split('<main')[1]?.split('</main>')[0] ?? '';
  const text = main.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const links = [...main.matchAll(/href="(\/[a-z0-9\/-]*)"/g)].map((m) => m[1]);
  info[url] = { title, description, h1: h1s[0] ?? '', h2s, noindex, words, links };

  const err = (m) => errors.push(`${url}: ${m}`);
  const warn = (m) => warnings.push(`${url}: ${m}`);
  if (!/<html lang="es"/.test(html)) err('falta lang="es"');
  if (h1s.length !== 1) err(`${h1s.length} H1 (debe haber 1)`);
  if (!title) err('sin <title>');
  else if (title.length > 70) warn(`title de ${title.length} caracteres (Google corta a ~60)`);
  if (!description) err('sin meta description');
  else if (description.length < 70 || description.length > 170) warn(`description de ${description.length} caracteres (ideal 120-160)`);
  if (!/<link rel="canonical" href="https:\/\/kalmaa\.io/.test(html)) err('sin canonical absoluto a kalmaa.io');
  if (!/property="og:image"/.test(html)) err('sin og:image');
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch {
      err('JSON-LD inválido');
    }
  }
  if (/\[(VERIFICAR|COMPLETAR|CONFIRMAR)/.test(html)) err('quedan marcadores [VERIFICAR]/[COMPLETAR]/[CONFIRMAR]');
  for (const sentence of text.split(/(?<=[.!?¿¡])\s+/)) {
    for (const f of FORBIDDEN) if (f.re.test(sentence) && !NEGATION.test(sentence)) err(`${f.why}: «${sentence.trim().slice(0, 90)}»`);
  }
  if (!noindex && words < 300 && !/aviso-legal|cookies|privacidad|lista-de-espera/.test(url)) warn(`contenido corto (${words} palabras)`);
}

// Enlaces internos rotos y páginas huérfanas (sin enlaces desde el contenido).
const inbound = {};
for (const [from, p] of Object.entries(info))
  for (const l of p.links) {
    const to = l.split('#')[0] || '/';
    if (!info[to]) errors.push(`${from}: enlace interno roto a ${l}`);
    else if (to !== from) inbound[to] = (inbound[to] ?? 0) + 1;
  }
for (const [url, p] of Object.entries(info))
  if (!p.noindex && url !== '/' && !/aviso-legal|cookies|privacidad/.test(url) && (inbound[url] ?? 0) < 2)
    warnings.push(`${url}: solo ${inbound[url] ?? 0} enlaces internos desde el contenido de otras páginas`);

// Mapa de keywords: cobertura on-page y canibalización.
const { keywords } = JSON.parse(readFileSync(join(ROOT, 'seo/keywords.json'), 'utf8'));
const primaries = {};
for (const k of keywords) {
  if (!k.url || k.role === 'discard' || k.role === 'watch') continue;
  const p = info[k.url];
  if (!p) {
    errors.push(`keywords.json: «${k.kw}» apunta a ${k.url}, que no existe`);
    continue;
  }
  if (k.role === 'primary') {
    (primaries[norm(k.kw)] ??= []).push(k.url);
    if (!covers(p.title, k.kw) && !covers(p.h1, k.kw)) warnings.push(`${k.url}: la keyword principal «${k.kw}» no está en el title ni en el H1`);
  }
  if (k.role === 'secondary' && (k.es ?? 0) >= 30 && ![p.title, p.h1, ...p.h2s].some((t) => covers(t, k.kw)))
    warnings.push(`${k.url}: la secundaria «${k.kw}» (${k.es}/mes en España) no aparece en title, H1 ni H2`);
}
for (const [kw, urls] of Object.entries(primaries)) if (urls.length > 1) errors.push(`canibalización: «${kw}» es principal en ${urls.join(', ')}`);
// Dos páginas indexables con el mismo title también compiten entre sí.
const byTitle = {};
for (const [url, p] of Object.entries(info)) if (!p.noindex) (byTitle[norm(p.title)] ??= []).push(url);
for (const urls of Object.values(byTitle)) if (urls.length > 1) errors.push(`title duplicado en ${urls.join(', ')}`);

const result = { pages: Object.keys(info).length, errors, warnings };
if (process.argv.includes('--json')) console.log(JSON.stringify({ ...result, info }, null, 2));
else {
  console.log(`Auditoría SEO · ${result.pages} páginas`);
  console.log(`\nErrores (${errors.length})`);
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  console.log(`\nAvisos (${warnings.length})`);
  warnings.forEach((w) => console.log(`  · ${w}`));
}
process.exit(errors.length ? 1 : 0);
