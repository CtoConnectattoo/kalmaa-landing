# Diseños de Kalmaa (11 nov 2026)

Exportados del lienzo de diseño en Claude. Fuente: Drive, «Kalmaa · ManyChat en español» → «Diseños para desarrollo (lienzo, 11 nov 2026)» (allí está el LEEME completo con el formato de los `.dc.html`). Si algo choca con «00 BRIEF PARA CLAUDE CODE», manda el Brief.

Son referencia, no código de producción: no se compilan ni se publican (Astro solo usa `src/` y `public/`).

| Archivo | Qué es |
|---|---|
| `Home.dc.html`, `Precios.dc.html`, `ManyChat.dc.html` | Landing (1440 px) |
| `C1-Portada` … `C5-Inicio` (+ `-movil`) | Capturas del producto para la landing y especificación de la app |
| `O-Onboarding.dc.html`, `O-Onboarding-movil.dc.html` | Onboarding de la app |

## Antes de copiar nada a la web o a la app

- Quedan marcadores de diseño que la web publicada ya resolvió con fuentes: `[VERIFICAR]` en `ManyChat.dc.html` (conector) y `[CONFIRMAR al publicar]` en `Home` y `Precios` (directorio de apps de ChatGPT). Usar el texto de `src/pages`, no el del diseño.
- `C2-ConectarIA` dice «Busca Kalmaa en Apps y pulsa Conectar» en ChatGPT: solo será cierto cuando Kalmaa esté en el directorio de complementos de ChatGPT. Hasta entonces, un MCP propio con escritura solo se conecta en Business, Enterprise y Edu.
- `C5-Inicio` muestra cifras de ejemplo (312 comentarios, 298 DMs, 141 clics, 73 emails). Si se usa como captura en la landing, debe quedar claro que es un ejemplo: no son datos reales.
- Las interfaces de ChatGPT, Instagram y WhatsApp van sin sus logos; no añadirlos.
