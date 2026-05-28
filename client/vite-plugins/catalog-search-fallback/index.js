import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOCKS_DIR = path.join(__dirname, 'mocks');

function deriveFilename(search) {
  const p = new URLSearchParams(search);

  if (p.get('my') === '1' && p.has('category_tag')) return 'tag-my';

  const tag = p.get('category_tag');
  if (tag) return `tag-${tag}`;

  const ids = p.get('ids');
  if (ids) return `ids-${ids.replace(/,/g, '_')}`;

  const catId = p.get('category_id');
  if (catId) {
    const suffix = p.get('category_type') === '1' ? '-1' : '';
    return `category-${catId}${suffix}`;
  }

  return null;
}

export default {
  name: 'catalog-search-fallback',

  configureServer(server) {
    server.middlewares.use('/api/catalog/search', async (req, res) => {
      const search = (req.url ?? '').split('?')[1] ?? '';
      const name = deriveFilename(search);

      if (!name) {
        res.statusCode = 400;
        res.end('Unrecognized catalog/search params');
        return;
      }

      const localFile = path.join(MOCKS_DIR, `${name}.json`);

      if (fs.existsSync(localFile)) {
        res.setHeader('Content-Type', 'application/json');
        res.end(fs.readFileSync(localFile, 'utf-8'));
        return;
      }

      try {
        server.config.logger.info(`[catalog-search-fallback] cache miss, fetching: ${name}`);
        const remote = await fetch(`https://roomtodo.com/api/catalog/search?${search}`);
        if (!remote.ok) {
          server.config.logger.warn(`[catalog-search-fallback] remote ${remote.status} for: ${name}`);
          res.statusCode = remote.status;
          res.end('Remote error');
          return;
        }
        const json = await remote.text();
        fs.mkdirSync(MOCKS_DIR, { recursive: true });
        fs.writeFileSync(localFile, json, 'utf-8');
        server.config.logger.info(`[catalog-search-fallback] cached: ${name}.json`);
        res.setHeader('Content-Type', 'application/json');
        res.end(json);
      } catch (e) {
        server.config.logger.error(`[catalog-search-fallback] fetch failed for ${name}: ${e}`);
        res.statusCode = 502;
        res.end('Fetch failed');
      }
    });
  },
};
