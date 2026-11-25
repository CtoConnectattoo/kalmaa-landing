# Producto · catálogo de funcionalidades

`funcionalidades.yaml` es la **fuente única de verdad** de lo que hace Kalmaa. De él salen la ficha de la KB (`kalmaa/producto/funcionalidades.md`), la skill de marca/producto, los textos de esta web y el agente SEO/GEO. Si la web dice algo que el catálogo no respalda como `activa`, se corrige la web, no el catálogo.

> **Provisional aquí.** La app no existe todavía (`kalmaa-app` está vacío y el MVP no se empieza sin confirmar). Cuando arranque, este directorio se mueve a `kalmaa-app/producto/` y aquí queda un enlace.

## Cómo mantenerlo

1. **Cambia solo el YAML.** Una entrada por funcionalidad con: `id`, `nombre` (como lo dice el cliente), `que_hace` (una frase), `estado`, `fase`, `planes`, `limites`, `desde`, `pasos`, `no_hace`, `claims` (permitidos / prohibidos) y `capturas` (archivo, tipo, fecha, versión).
2. **Estados**: `en-desarrollo` → `beta` → `activa`; `oculta` (existe pero no se anuncia) y `retirada`. Solo `activa` (y `beta`, diciéndolo) se presenta como disponible. Al pasar a `activa`, pon `desde: AAAA-MM-DD`.
3. **Capturas**: `tipo: diseño` para maquetas del lienzo (todas las de `src/assets/capturas/` hoy); `real` solo con la app funcionando. El validador rechaza una captura `real` en algo que no está activo ni en beta.
4. **Lo que no hace** va en `no_hace` (`no-previsto` o `en-pausa`): la web puede negarlo, nunca prometerlo.
5. **Valida y regenera la ficha de la KB**:
   ```bash
   python3 producto/generar_ficha.py --check
   python3 producto/generar_ficha.py -o ~/Desktop/KB-local/kalmaa/producto/funcionalidades.md
   ```
   Requiere PyYAML. Luego commit y push en la KB.
6. Cambios de **precio o plan** solo si ya están decididos en `kalmaa/decisiones.md` de la KB.
