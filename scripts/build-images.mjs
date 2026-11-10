// Genera las imágenes estáticas de SEO en public/ con Chrome en modo headless:
//   og.png (1200×630, para compartir), logo.png (512, schema Organization),
//   apple-touch-icon.png (180) y favicon-48.png (48).
// Uso: npm run og  (requiere Google Chrome; otra ruta con CHROME_PATH=...)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = new URL('..', import.meta.url);
const pub = (f) => fileURLToPath(new URL(`public/${f}`, root));
const chrome =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function shot(url, width, height, out) {
  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${width},${height}`,
      `--screenshot=${out}`,
      url,
    ],
    { stdio: 'ignore' },
  );
  console.log(out.replace(fileURLToPath(root), ''));
}

const tmp = mkdtempSync(join(tmpdir(), 'kalmaa-img-'));
const icon = readFileSync(pub('favicon.svg'), 'utf8');

for (const [file, size] of [
  ['logo.png', 512],
  ['apple-touch-icon.png', 180],
  ['favicon-48.png', 48],
]) {
  const html = join(tmp, `${size}.html`);
  writeFileSync(
    html,
    `<!doctype html><style>*{margin:0}html,body{width:${size}px;height:${size}px;overflow:hidden;background:#0e0e10}svg{display:block;width:${size}px;height:${size}px}</style>${icon}`,
  );
  shot(pathToFileURL(html).href, size, size, pub(file));
}

shot(new URL('scripts/og-image.html', root).href, 1200, 630, pub('og.png'));
rmSync(tmp, { recursive: true, force: true });
