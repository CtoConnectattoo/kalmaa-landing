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

## Capturas publicadas en la home (13 nov 2026)

C1–C5 se exportaron a `src/assets/capturas/` (PNG a 2×; Astro genera AVIF y WebP) y sustituyen a los mockups anteriores de la home mediante `src/components/Captura.astro`, que sirve la versión móvil por debajo de 700 px.

Cambios hechos en estos diseños antes de exportar:
- `C1-Portada`: el texto del chat es el del anexo A del Brief («Listo. He respondido por DM a todos los que comentaron PRECIO…»).
- `C2-ConectarIA` (y móvil): ChatGPT ya no dice «Busca Kalmaa en Apps» y Claude no dice «Busca Kalmaa», porque Kalmaa no está en ninguno de los dos directorios; se explica el paso a paso y el conector personalizado.
- `C3-Plantillas`: la etiqueta «Más usada» pasa a «Seleccionada» (no hay datos de uso).
- `C1-Portada-movil` y `C4-WhatsApp-movil`: versiones móviles nuevas, derivadas de las de escritorio.
- `C5-Inicio`: en la web lleva el pie «Las cifras son ilustrativas».

Para regenerar una captura: abre el `.dc.html` en Chrome sin cabeza a su tamaño de lienzo con `--force-device-scale-factor=2` (p. ej. `--window-size=1440,900 --screenshot=…`) y sustituye el PNG del mismo nombre en `src/assets/capturas/`. Cuando exista la app, sustituye esos PNG por capturas reales.
