import fs from 'node:fs';
import path from 'node:path';

const PROXIED_PREFIXES = [
  '/src_designer/images/',
  '/Assets/css/',
  '/files/products/',
  '/files/categories/product/',
  '/files/categories/material/',
];

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.glb': 'model/gltf-binary',
  '.mrtd': 'application/octet-stream',
};

// Product models are catalog data, so they live in productsDir (outside public/) and stay out of the build
export default (productsDir) => ({
  name: 'local-first-assets',

  configureServer(server) {
    const root = server.config.root;

    server.middlewares.use(async (req, res, next) => {
      const url = (req.url ?? '').split('?')[0];
      if (!PROXIED_PREFIXES.some(p => url.startsWith(p))) return next();

      const localFile = url.startsWith('/files/products/')
        ? path.join(productsDir, url.slice('/files/products/'.length))
        : path.join(root, 'public', 'roomtodo', url);

      if (fs.existsSync(localFile) && fs.statSync(localFile).isFile()) {
        const ext = path.extname(localFile).toLowerCase();
        const mime = MIME[ext];
        if (!mime) {
          server.config.logger.warn(`[local-first-assets] unknown MIME for extension "${ext}": ${url}`);
        }
        res.setHeader('Content-Type', mime ?? 'application/octet-stream');
        fs.createReadStream(localFile).pipe(res);
        return;
      }

      server.config.logger.warn(`[local-first-assets] fetching from roomtodo.com: ${url}`);
      try {
        const remote = await fetch(`https://roomtodo.com${url}`);
        if (!remote.ok) { res.statusCode = remote.status; res.end(); return; }

        const buf = Buffer.from(await remote.arrayBuffer());
        fs.mkdirSync(path.dirname(localFile), { recursive: true });
        fs.writeFileSync(localFile, buf);

        const ext = path.extname(localFile).toLowerCase();
        res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream');
        res.end(buf);
      } catch (err) {
        server.config.logger.error(`[local-first-assets] fetch failed: ${url} — ${err.message}`);
        res.statusCode = 502;
        res.end('Fetch failed');
      }
    });
  },
});
