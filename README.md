# kalmaa-landing

Landing de [kalmaa.io](https://kalmaa.io): respuestas automáticas en Instagram con ChatGPT y Claude.

## Stack
- [Astro](https://astro.build) con salida estática y el adaptador de Vercel.
- `@astrojs/sitemap` para `sitemap-index.xml`; `public/robots.txt`.
- SEO en `src/layouts/Base.astro` (canonical, Open Graph y X con `og.png`, iconos, JSON-LD `Organization` y `WebSite`) y `src/layouts/Article.astro` (`Article`, `BreadcrumbList` con migas visibles y `FAQPage`).
- Imágenes de SEO (`og.png`, `logo.png`, `apple-touch-icon.png`, `favicon-48.png`): se generan con `npm run og` a partir de `public/favicon.svg` y `scripts/og-image.html` (necesita Google Chrome).
- Tipografías Bricolage Grotesque e Inter servidas desde el propio dominio (`@fontsource`), sin cookies ni llamadas a terceros.
- Sin lista de espera desde la apertura de la app: los CTA llevan a `https://app.kalmaa.io/entrar` (`ctaHref` en `src/data/site.ts`) y `/lista-de-espera` redirige ahí (`vercel.json`). La tabla `waitlist` de Supabase se conserva hasta cumplir los plazos de borrado de la política de privacidad (`supabase/waitlist.sql`).

## Páginas
| Ruta | Contenido |
|---|---|
| `/` | Home (anexo A del Brief) |
| `/precios` | Precios (anexo B) |
| `/chatgpt-instagram`, `/claude-instagram`, `/mcp-instagram` | Guías ChatGPT / Claude / MCP |
| `/respuesta-automatica-instagram`, `/como-poner-mensaje-automatico-instagram` | Guías de respuesta automática |
| `/que-es-manychat`, `/manychat-precio`, `/alternativas/manychat`, `/alternativas/chatfuel` | Comparativas |
| `/aviso-legal`, `/privacidad`, `/cookies` | Legales |

## Desarrollo
Astro pide Node 22.23.4 o superior.
```bash
npm install
npm run dev
```

## Antes de publicar en kalmaa.io
Quedan marcadores por resolver: `grep -rn "VERIFICAR\|COMPLETAR\|CONFIRMAR" src`.
