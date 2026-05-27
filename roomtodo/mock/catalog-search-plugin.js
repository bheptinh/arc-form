import path from 'path';
import fs from 'fs';

/**
 * Mock files live under ./mock/catalog-search/ in three subdirs:
 *   ids/        — single-ID lookups, e.g. ids/41805.json
 *   category/   — category_id lookups, e.g. category/8450.json or category/695-1.json
 *   tag/        — category_tag lookups, e.g. tag/moldings.json
 *
 * For multi-ID bulk requests add an entry to BULK_IDS_LOOKUP below and
 * drop the corresponding file under ids/.
 */

const BASE = './mock/catalog-search';

const BULK_IDS_LOOKUP = {
  '260,354,707,984,3319,941,2021,2020,54828,1610,774,54836,41818,53097,55344,41833,55338,844,839,55155,2013,1618,3008,41803,2525,41823,2318,3377': 'ids/initial.json',
};

function resolveMockFile(search) {
  const p = new URLSearchParams(search);

  if (p.get('my') === '1' && p.has('category_tag')) {
    return `${BASE}/tag/my.json`;
  }

  const tag = p.get('category_tag');
  if (tag) {
    return `${BASE}/tag/${tag}.json`;
  }

  const ids = p.get('ids');
  if (ids) {
    const bulk = BULK_IDS_LOOKUP[ids];
    return bulk ? `${BASE}/${bulk}` : `${BASE}/ids/${ids}.json`;
  }

  const catId = p.get('category_id');
  if (catId) {
    const suffix = p.get('category_type') === '1' ? '-1' : '';
    return `${BASE}/category/${catId}${suffix}.json`;
  }

  return null;
}

export default {
  name: 'mock-catalog-search',

  configureServer(server) {
    server.middlewares.use('/api/catalog/search', (req, res) => {
      const search = (req.url ?? '').split('?')[1] ?? '';
      const candidate = resolveMockFile(search);

      if (!candidate) {
        res.statusCode = 400;
        res.end('Unrecognized catalog/search params');
        return;
      }

      const filePath = path.resolve(__dirname, candidate);
      if (!fs.existsSync(filePath)) {
        res.statusCode = 404;
        res.end(`Mock not found: ${candidate}`);
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(fs.readFileSync(filePath, 'utf-8'));
    });
  },
};
