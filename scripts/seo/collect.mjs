// Recoge los datos de la semana para el agente SEO/GEO y los guarda en
// seo/history/AAAA-MM-DD/. Cada fuente es opcional: si falta su credencial,
// se salta y queda anotado en summary.json.
//
//   GSC_SERVICE_ACCOUNT  JSON de la cuenta de servicio (o el JSON en base64)
//                        con acceso de lectura a la propiedad sc-domain:kalmaa.io
//   APIFY_TOKEN          token de Apify (SERPs, respuestas de IA y volúmenes)
//
// Uso: npm run seo:collect [-- --volumes] [-- --dry-run]
//   --volumes  fuerza la actualización de volúmenes (por defecto, la primera
//              ejecución de cada mes)
//   --dry-run  no llama a Apify; muestra lo que haría y su coste estimado
import { createSign } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SITE = 'https://kalmaa.io';
const GSC_PROPERTY = 'sc-domain:kalmaa.io';
const MONTHLY_BUDGET_USD = 10;
// Precios de Apify (tier BRONZE, nov 2026). Se usan para estimar y poner topes.
const PRICE = {
  serpPage: 0.0025,
  aiOverview: 0.002,
  aiMode: 0.005,
  chatGpt: 0.005,
  perplexity: 0.013,
  kwRequest: 0.25,
  kwRow: 0.0036,
};
const VOLUME_MARKETS = [
  { location: 'Spain', key: 'es' },
  { location: 'Mexico', key: 'mx' },
];
const MAX_IDEAS = 100;

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const today = new Date().toISOString().slice(0, 10);
const histDir = `${ROOT}seo/history`;
const outDir = `${histDir}/${today}`;
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const save = (name, data) =>
  dryRun ? null : writeFileSync(`${outDir}/${name}.json`, JSON.stringify(data, null, 2) + '\n');

const keywords = readJson(`${ROOT}seo/keywords.json`).keywords;
const geo = readJson(`${ROOT}seo/geo-queries.json`);
const summary = { date: today, sources: {}, estimatedCostUsd: 0, notes: [] };

// ---------- Presupuesto ----------
function spentThisMonth() {
  if (!existsSync(histDir)) return 0;
  const month = today.slice(0, 7);
  return readdirSync(histDir)
    .filter((d) => d.startsWith(month) && d !== today && existsSync(`${histDir}/${d}/summary.json`))
    .reduce((sum, d) => sum + (readJson(`${histDir}/${d}/summary.json`).estimatedCostUsd || 0), 0);
}
function volumesDoneThisMonth() {
  if (!existsSync(histDir)) return false;
  const month = today.slice(0, 7);
  return readdirSync(histDir).some((d) => d.startsWith(month) && d !== today && existsSync(`${histDir}/${d}/volumes.json`));
}

// ---------- Search Console ----------
function loadServiceAccount() {
  const raw = process.env.GSC_SERVICE_ACCOUNT;
  if (!raw) return null;
  const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  return JSON.parse(text);
}
async function googleToken(sa) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!res.ok) throw new Error(`token de Google: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}
async function gsc(token, url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url}: ${res.status} ${await res.text()}`);
  return res.json();
}
const isoDaysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

async function collectGsc() {
  const sa = loadServiceAccount();
  if (!sa) {
    summary.sources.gsc = 'omitido: falta GSC_SERVICE_ACCOUNT';
    return;
  }
  const token = await googleToken(sa);
  const base = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_PROPERTY)}`;
  // Search Console publica con 2-3 días de retraso: ventana de 28 días terminada hace 3.
  const range = { startDate: isoDaysAgo(30), endDate: isoDaysAgo(3) };
  const query = (dimensions, rowLimit = 1000) =>
    gsc(token, `${base}/searchAnalytics/query`, { ...range, dimensions, rowLimit, dataState: 'final' }).then(
      (r) => r.rows ?? [],
    );
  const [byQueryPage, byPage, byCountry] = await Promise.all([
    query(['query', 'page']),
    query(['page']),
    query(['country'], 50),
  ]);
  save('gsc', { property: GSC_PROPERTY, ...range, byQueryPage, byPage, byCountry });

  // Estado de indexación de cada URL del sitemap (URL Inspection API, gratis).
  const sitemap = await fetch(`${SITE}/sitemap-0.xml`).then((r) => r.text());
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const inspection = [];
  for (const url of urls) {
    try {
      const r = await gsc(token, 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        inspectionUrl: url,
        siteUrl: GSC_PROPERTY,
        languageCode: 'es',
      });
      const s = r.inspectionResult?.indexStatusResult ?? {};
      inspection.push({
        url,
        verdict: s.verdict,
        coverageState: s.coverageState,
        lastCrawlTime: s.lastCrawlTime,
        googleCanonical: s.googleCanonical,
      });
    } catch (e) {
      inspection.push({ url, error: String(e.message).slice(0, 200) });
    }
  }
  save('inspection', inspection);
  summary.sources.gsc = `${byQueryPage.length} filas consulta/página, ${inspection.length} URLs inspeccionadas`;
}

// ---------- Apify ----------
async function apify(actor, input, maxUsd) {
  const url = `https://api.apify.com/v2/acts/${actor.replace('/', '~')}/run-sync-get-dataset-items?timeout=600&maxTotalChargeUsd=${maxUsd}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.APIFY_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`${actor}: ${res.status} ${(await res.text()).slice(0, 300)}`);
  return res.json();
}
const mentionsKalmaa = (v) => /kalmaa/i.test(JSON.stringify(v ?? ''));
const strip = (item) => {
  const { html, htmlSnapshotUrl, ...rest } = item;
  return rest;
};

function plan() {
  const serpQueries = keywords
    .filter((k) => k.role === 'primary' || k.role === 'backlog')
    .map((k) => k.kw);
  const serpCost = serpQueries.length * (PRICE.serpPage + PRICE.aiOverview);
  const geoCost = geo.queries.length * (PRICE.serpPage + PRICE.aiOverview + PRICE.aiMode + PRICE.chatGpt + PRICE.perplexity);
  const doVolumes = args.has('--volumes') || !volumesDoneThisMonth();
  const kwCount = keywords.filter((k) => k.role !== 'discard').length;
  const volCost = doVolumes
    ? VOLUME_MARKETS.length * (PRICE.kwRequest + kwCount * PRICE.kwRow) + (PRICE.kwRequest + MAX_IDEAS * PRICE.kwRow)
    : 0;
  return { serpQueries, serpCost, geoCost, doVolumes, volCost };
}

async function collectApify() {
  const p = plan();
  const spent = spentThisMonth();
  const left = MONTHLY_BUDGET_USD - spent;
  summary.budget = { monthlyUsd: MONTHLY_BUDGET_USD, spentBeforeUsd: +spent.toFixed(3), plannedUsd: +(p.serpCost + p.geoCost + p.volCost).toFixed(3) };
  if (dryRun) {
    summary.sources.apify = `dry-run: ${p.serpQueries.length} SERPs, ${geo.queries.length} GEO, volúmenes=${p.doVolumes}`;
    return;
  }
  if (!process.env.APIFY_TOKEN) {
    summary.sources.apify = 'omitido: falta APIFY_TOKEN';
    return;
  }
  if (p.serpCost + p.geoCost + p.volCost > left) {
    summary.sources.apify = `omitido: presupuesto (quedan ${left.toFixed(2)} $ este mes)`;
    return;
  }

  // 1) SERPs de las keywords atacadas y del backlog, con AI Overview.
  const serp = await apify(
    'apify/google-search-scraper',
    {
      queries: p.serpQueries.join('\n'),
      maxPagesPerQuery: 1,
      countryCode: 'es',
      languageCode: 'es',
      aiOverview: { scrapeFullAiOverview: true },
      saveHtmlToKeyValueStore: false,
    },
    +(p.serpCost * 1.5).toFixed(2),
  );
  const serpRows = serp.map((it) => {
    const organic = (it.organicResults ?? []).map((r) => ({ position: r.position, title: r.title, url: r.url }));
    const own = organic.find((r) => r.url?.includes('kalmaa.io'));
    return {
      query: it.searchQuery?.term,
      kalmaaPosition: own?.position ?? null,
      kalmaaUrl: own?.url ?? null,
      aiOverviewMentionsKalmaa: mentionsKalmaa(it.aiOverview),
      organic,
      aiOverview: it.aiOverview ?? null,
      peopleAlsoAsk: (it.peopleAlsoAsk ?? []).map((q) => q.question ?? q.title),
      relatedQueries: (it.relatedQueries ?? []).map((q) => q.title ?? q.query),
    };
  });
  save('serp', serpRows);
  summary.estimatedCostUsd += p.serpCost;

  // 2) GEO: misma pregunta en Google (AI Overview y AI Mode), ChatGPT y Perplexity.
  const geoItems = await apify(
    'apify/google-search-scraper',
    {
      queries: geo.queries.join('\n'),
      maxPagesPerQuery: 1,
      countryCode: geo.country,
      languageCode: 'es',
      aiOverview: { scrapeFullAiOverview: true },
      aiModeSearch: { enableAiMode: true },
      chatGptSearch: { enableChatGpt: true },
      perplexitySearch: { enablePerplexity: true, returnImages: false, returnRelatedQuestions: false },
      saveHtmlToKeyValueStore: false,
    },
    +(p.geoCost * 1.5).toFixed(2),
  );
  const geoRows = geoItems.map((it) => {
    const raw = strip(it);
    const engines = Object.fromEntries(
      Object.entries(raw)
        .filter(([k]) => /aiOverview|aiMode|chatGpt|perplexity/i.test(k))
        .map(([k, v]) => [k, { mentionsKalmaa: mentionsKalmaa(v), answer: v }]),
    );
    return {
      query: it.searchQuery?.term,
      organicKalmaaPosition: (it.organicResults ?? []).find((r) => r.url?.includes('kalmaa.io'))?.position ?? null,
      engines,
    };
  });
  save('geo', geoRows);
  summary.estimatedCostUsd += p.geoCost;

  // 3) Volúmenes (mensual): métricas por mercado + ideas nuevas en España.
  if (p.doVolumes) {
    const list = keywords.filter((k) => k.role !== 'discard').map((k) => k.kw);
    const volumes = {};
    for (const m of VOLUME_MARKETS) {
      volumes[m.key] = await apify(
        'wrenfield-data/keyword-search-volume',
        { keywords: list, mode: 'search_volume', location: m.location, language: 'Spanish', includeMonthlySearches: true },
        +(PRICE.kwRequest + list.length * PRICE.kwRow + 0.1).toFixed(2),
      );
    }
    volumes.ideas_es = await apify(
      'wrenfield-data/keyword-search-volume',
      {
        keywords: keywords.filter((k) => k.role === 'primary').map((k) => k.kw).slice(0, 20),
        mode: 'keyword_ideas',
        location: 'Spain',
        language: 'Spanish',
        maxIdeas: MAX_IDEAS,
        minSearchVolume: 10,
        includeMonthlySearches: false,
      },
      +(PRICE.kwRequest + MAX_IDEAS * PRICE.kwRow + 0.1).toFixed(2),
    );
    save('volumes', volumes);
    summary.estimatedCostUsd += p.volCost;
  }
  summary.estimatedCostUsd = +summary.estimatedCostUsd.toFixed(3);
  summary.sources.apify = `${serpRows.length} SERPs, ${geoRows.length} preguntas GEO, volúmenes=${p.doVolumes}`;
  summary.kalmaa = {
    serpRanked: serpRows.filter((r) => r.kalmaaPosition).map((r) => ({ query: r.query, position: r.kalmaaPosition, url: r.kalmaaUrl })),
    aiOverviewMentions: serpRows.filter((r) => r.aiOverviewMentionsKalmaa).map((r) => r.query),
    geoMentions: geoRows.flatMap((r) =>
      Object.entries(r.engines)
        .filter(([, v]) => v.mentionsKalmaa)
        .map(([engine]) => `${engine}: ${r.query}`),
    ),
  };
}

if (!dryRun) mkdirSync(outDir, { recursive: true });
for (const [name, fn] of [
  ['gsc', collectGsc],
  ['apify', collectApify],
]) {
  try {
    await fn();
  } catch (e) {
    summary.sources[name] = `error: ${String(e.message).slice(0, 300)}`;
    summary.notes.push(`${name} falló; el resto de fuentes sigue.`);
  }
}
save('summary', summary);
console.log(JSON.stringify(summary, null, 2));
