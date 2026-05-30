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
};

export default {
  name: 'local-first-assets',

  configureServer(server) {
    const root = server.config.root;

    server.middlewares.use(async (req, res, next) => {
      const url = (req.url ?? '').split('?')[0];
      if (!PROXIED_PREFIXES.some(p => url.startsWith(p))) return next();

      const localFile = path.join(root, 'public', 'roomtodo', url);

      if (fs.existsSync(localFile) && fs.statSync(localFile).isFile()) {
        const ext = path.extname(localFile).toLowerCase();
        const mime = MIME[ext];
        if (!mime) {
          server.config.logger.error(`[local-first-assets] unknown MIME for extension "${ext}": ${url}`);
        }
        res.setHeader('Content-Type', mime ?? 'application/octet-stream');
        fs.createReadStream(localFile).pipe(res);
        return;
      }

      server.config.logger.warn(`[local-first-assets] MISSING local asset: ${url}`);
      res.statusCode = 404;
      res.end('Asset not found locally');
    });
  },
};
