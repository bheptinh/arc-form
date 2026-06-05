import Database from 'better-sqlite3';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const mockDir = path.join(root, 'client/vite-plugins/catalog-search-fallback/mocks');
const API_KEY = '4500282e6846fe6650de81bd35d27540';

const dbDir = process.env.DB_DIR;
if (!dbDir) throw new Error('DB_DIR env variable is not set');
const db = new Database(path.resolve(root, dbDir, 'arcform.db'));

const { materials } = JSON.parse(readFileSync(path.join(root, dbDir, 'materials-tree.json'), 'utf-8'));

function collectLeaves(nodes, out = []) {
  for (const n of nodes) {
    if (n.urlList) out.push(n);
    if (n.nodes?.length) collectLeaves(n.nodes, out);
  }
  return out;
}

const leaves = collectLeaves(materials);

let downloaded = 0, skipped = 0, failed = 0;

for (const node of leaves) {
  const row = db.prepare('SELECT external_id FROM categories WHERE id = ?').get(node.id);
  if (!row) continue;

  const extId = row.external_id;
  const filename = `category-${extId}-1.json`;
  const filepath = path.join(mockDir, filename);

  if (existsSync(filepath)) {
    const existing = JSON.parse(readFileSync(filepath, 'utf-8'));
    const total = existing.data?.total ?? 0;
    const have = existing.data?.items?.length ?? 0;
    if (have >= total) { skipped++; continue; }
  }

  const url = `https://roomtodo.com/api/catalog/search?key=${API_KEY}&category_id=${extId}&category_type=1`;
  process.stdout.write(`downloading ${filename} (${node.name})... `);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.status !== 'ok') throw new Error(`status: ${json.status}`);
    writeFileSync(filepath, JSON.stringify(json, null, 2));
    console.log(`${json.data?.items?.length ?? 0} items`);
    downloaded++;
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    failed++;
  }

  await new Promise(r => setTimeout(r, 150));
}

db.close();
console.log(`\ndone. downloaded: ${downloaded}, skipped (already complete): ${skipped}, failed: ${failed}`);
