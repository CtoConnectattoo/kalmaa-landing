# SEO y GEO de kalmaa.io

Un agente revisa cada semana cómo posiciona kalmaa.io en Google y en las respuestas de las IAs, y propone cambios en un PR. Las instrucciones del agente están en [AGENT.md](AGENT.md).

## Piezas

| Fichero | Qué es |
|---|---|
| `keywords.json` | Universo de keywords con volumen, URL asignada y papel (primary, secondary, backlog, watch, discard). Fuente inicial: Keyword Planner del 7 de noviembre de 2026 (hoja de Drive «06 SEO y GEO»). |
| `geo-queries.json` | Preguntas que se hacen cada semana a Google, ChatGPT y Perplexity para medir si citan Kalmaa. |
| `history/AAAA-MM-DD/` | Datos brutos de cada semana: `gsc.json`, `inspection.json`, `serp.json`, `geo.json`, `volumes.json` (mensual) y `summary.json`. |
| `reports/AAAA-MM-DD.md` | Informe semanal del agente. |
| `../scripts/seo/collect.mjs` | Recoge los datos (`npm run seo:collect`, `-- --dry-run` para ver el coste sin gastar). |
| `../scripts/seo/audit.mjs` | Audita el build: técnica, reglas de marca, enlaces internos, cobertura de keywords y canibalización (`npm run seo:audit`). |

## Fuentes de datos

- **Google Search Console** (gratis): consultas, páginas, países e indexación por URL, mediante la API con una cuenta de servicio de solo lectura.
- **Apify** (de pago, tope de 10 $/mes en el código):
  - `wrenfield-data/keyword-search-volume`: volúmenes, CPC y tendencia de Google Keyword Planner, para España y México, más ideas nuevas. Una vez al mes.
  - `apify/google-search-scraper`: SERP de Google España con AI Overview, y para las preguntas GEO también AI Mode, ChatGPT y Perplexity. Cada semana.

Gasto estimado: unos 1,7 $ la primera semana del mes (con volúmenes) y unos 0,4 $ el resto, unos 3 $/mes.

## Credenciales (en el entorno de la rutina, nunca en el repo)

- `APIFY_TOKEN`: token de Apify.
- `GSC_SERVICE_ACCOUNT`: JSON (o JSON en base64) de una cuenta de servicio de Google Cloud con la API de Search Console activada, añadida como usuario con permiso **restringido** en la propiedad `sc-domain:kalmaa.io`.
