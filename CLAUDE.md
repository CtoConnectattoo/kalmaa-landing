Este proyecto pertenece a la línea Kalmaa de Connectattoo S.L. Antes de trabajar, lee el mapa de proyectos en Google Drive ("Claude → 00 MAPA DE PROYECTOS") y la carpeta de Drive de esta línea ("Kalmaa · ManyChat en español", empezando por su 00 LÉEME y el 00 BRIEF PARA CLAUDE CODE). Lo que se decida aquí que afecte a la estrategia se anota también en esa carpeta.

# kalmaa-landing

Landing de kalmaa.io (tarea 1 del Brief). Astro con salida estática, desplegada en Vercel. La app vive en app.kalmaa.io (repo `kalmaa-app`).

## Reglas
- Textos de la home y de precios: anexos A y B del Brief, tal cual. Claims y vocabulario: skill `kalmaa-branding` (sección 0b).
- Marca «Kalmaa» (K, doble a, sin h). Paleta «Pulso»: negro #0E0E10, lima #C6F432, rosa #FF6FB5. Bricolage Grotesque para títulos, Inter para texto (servidas desde el propio dominio con @fontsource).
- Un solo H1 por página; title y description propios; idioma `es`.
- No prometer: escribir primero, envíos masivos, Follow to DM, ventas garantizadas, TikTok.
- Sin logos de ChatGPT, Claude, Instagram ni WhatsApp como propios. Mantener el aviso de no afiliación del pie.
- Ni cifras ni testimonios inventados. Lo que no esté comprobado va como `<span class="verify">[VERIFICAR]</span>`; antes de publicar en kalmaa.io no debe quedar ninguno (`grep -rn "VERIFICAR\|COMPLETAR\|CONFIRMAR" src`).
- Todos los CTA «Conecta tu Instagram» y «Entrar» llevan al registro de la app (`SITE.ctaHref` = `https://app.kalmaa.io/entrar`). No hay lista de espera.
- No reutilizar código de Inkup.

## Comandos
- `npm install`, `npm run dev`, `npm run build`.
