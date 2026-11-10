# kalmaa-landing

Landing de [kalmaa.io](https://kalmaa.io): respuestas automáticas en Instagram con ChatGPT y Claude.

## Stack
- [Astro](https://astro.build) con salida estática y el adaptador de Vercel.
- `@astrojs/sitemap` para `sitemap-index.xml`; `public/robots.txt`.
- Tipografías Bricolage Grotesque e Inter servidas desde el propio dominio (`@fontsource`), sin cookies ni llamadas a terceros.
- Lista de espera: `POST /api/waitlist` guarda en Supabase (tabla `waitlist`, ver `supabase/waitlist.sql`).

## Páginas
| Ruta | Contenido |
|---|---|
| `/` | Home (anexo A del Brief) |
| `/precios` | Precios (anexo B) |
| `/chatgpt-instagram`, `/claude-instagram`, `/mcp-instagram` | Guías ChatGPT / Claude / MCP |
| `/respuesta-automatica-instagram`, `/como-poner-mensaje-automatico-instagram` | Guías de respuesta automática |
| `/que-es-manychat`, `/manychat-precio`, `/alternativas/manychat`, `/alternativas/chatfuel` | Comparativas |
| `/aviso-legal`, `/privacidad`, `/cookies` | Legales |
| `/lista-de-espera` | Formulario (noindex) |

## Desarrollo
```bash
npm install
npm run dev
```

## Puesta en marcha de la lista de espera
1. En el proyecto de Supabase de Kalmaa, ejecuta `supabase/waitlist.sql`.
2. En Vercel, añade las variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (ver `.env.example`). La clave solo se usa en el servidor.

Sin esas variables, el formulario responde «La lista de espera aún no está activa».

## Antes de publicar en kalmaa.io
Quedan marcadores por resolver: `grep -rn "VERIFICAR\|COMPLETAR\|CONFIRMAR" src`.
