/*
 * Servidor estático para o preview local do insper-eds (módulos ES não carregam via file://).
 *
 *   node test/serve.mjs <raiz> [porta=3920]
 *   -> http://localhost:3920/test/eds-port.html
 *
 * - Ignora o prefixo /pt ou /en do caminho, para testar blocos que inferem o idioma pela URL
 *   (/en/test/eds-port.html serve test/eds-port.html).
 * - Caminho sem extensão tenta <caminho>.html (o nav/footer do test/ é pedido como
 *   /test/nav.plain.html, que existe direto).
 * - Sem cache, para cada reload pegar o CSS/JS editado.
 * Rodar em background (run_in_background) e parar com TaskStop ao terminar.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import {
  extname, join, normalize, resolve, sep,
} from 'node:path';

const ROOT = resolve(process.argv[2] || '.');
const PORT = Number(process.argv[3]) || 3920;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  let path = new URL(req.url, 'http://x').pathname.replace(/^\/(pt|en)(?=\/)/, '');
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(ROOT, decodeURIComponent(path)));
  if (!file.startsWith(ROOT + sep)) {
    res.writeHead(403).end();
    return;
  }
  const read = (candidate) => readFile(candidate).then((body) => ({ candidate, body }));
  try {
    const { candidate, body } = await read(file).catch(() => read(`${file}.html`));
    res.writeHead(200, {
      'content-type': TYPES[extname(candidate)] || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(PORT, '127.0.0.1', () => process.stdout.write(`http://localhost:${PORT}/ -> ${ROOT}
`));
