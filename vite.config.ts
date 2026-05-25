import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import viteMockPlugin from './roomtodo/mock/vite-mock-plugin.js';
import fs from 'node:fs';
import path from 'node:path';

const PROXIED_PREFIXES = [
  '/src_designer/images/',
  '/Assets/css/',
  '/files/products/',
  '/files/categories/product/',
  '/files/categories/material/',
];

const MIME: Record<string, string> = {
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
};

function localFirstAssets(): Plugin {
  const root = process.cwd();
  return {
    name: 'local-first-assets',
    configureServer(server) {
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

        try {
          server.config.logger.info(`[local-first-assets] cache miss, fetching: ${url}`);
          const remote = await fetch(`https://roomtodo.com${url}`);
          if (!remote.ok) {
            server.config.logger.warn(`[local-first-assets] remote ${remote.status} for: ${url}`);
            return next();
          }
          const buffer = Buffer.from(await remote.arrayBuffer());
          fs.mkdirSync(path.dirname(localFile), { recursive: true });
          fs.writeFileSync(localFile, buffer);
          server.config.logger.info(`[local-first-assets] cached: ${url}`);
          const ext = path.extname(localFile).toLowerCase();
          const mime = MIME[ext] ?? remote.headers.get('content-type') ?? 'application/octet-stream';
          if (!MIME[ext]) {
            server.config.logger.error(`[local-first-assets] unknown MIME for extension "${ext}": ${url}`);
          }
          res.setHeader('Content-Type', mime);
          res.end(buffer);
        } catch (e) {
          server.config.logger.error(`[local-first-assets] fetch failed for ${url}: ${e}`);
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), viteMockPlugin, localFirstAssets()],
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
  },

  // root: 'roomtodo',
  build: {
    sourcemap: true
  },
  server: {
    proxy: {
      '/src_designer/images/': {
        target: 'https://roomtodo.com',
        changeOrigin: true,
      },
      '/Assets/css/': {
        target: 'https://roomtodo.com',
        changeOrigin: true,
      },
      '/files/products/': {
        target: 'https://roomtodo.com',
        changeOrigin: true,
      },
      '/files/categories/product/': {
        target: 'https://roomtodo.com',
        changeOrigin: true,
      },
    }
  }
});
