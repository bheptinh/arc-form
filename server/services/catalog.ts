import db from '../db.js';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = process.env.DB_DIR;
if (!dbDir) throw new Error('DB_DIR env variable is not set');

const navTreePath = path.resolve(__dirname, '../..', dbDir, 'nav-tree.json');

export function getNavTree() {
  return JSON.parse(readFileSync(navTreePath, 'utf-8'));
}

// --- collections ---

const stmtProducts = db.prepare(`
  SELECT p.id as uuid, p.external_id, p.type, p.name, p.description, p.plan,
         p.appointment, p.width, p.height, p.depth,
         p.position_x, p.position_y, p.position_z,
         p.fixed_size, p.is_original_model, p.user_key, p.lang_id
  FROM products p
  JOIN product_categories pc ON pc.product_id = p.id
  WHERE pc.category_id = ?
  ORDER BY p.external_id
`);

const stmtFiles = db.prepare(`
  SELECT product_id, file_type, file_path
  FROM product_files
  WHERE product_id IN (SELECT product_id FROM product_categories WHERE category_id = ?)
`);

const stmtTags = db.prepare(`
  SELECT product_id, tag
  FROM product_tags
  WHERE product_id IN (SELECT product_id FROM product_categories WHERE category_id = ?)
`);

function buildItem(row: Record<string, unknown>, files: Map<string, Record<string, string>>, tags: Map<string, string[]>) {
  const f = files.get(row.uuid as string) ?? {};
  return {
    id: row.external_id,
    type: row.type,
    name: row.name,
    description: row.description ?? null,
    source: {
      images: { preview: f.preview ?? null },
      body: {
        package: f.glb ?? null,
        metaZip: f.meta_zip ?? null,
        svgFile: f.svg_file ?? null,
        svgOutline: f.svg_outline ?? null,
      },
    },
    // TODO: R2D API inconsistency — 'free' is a plain string, paid tiers are arrays.
    // FE checks both (plan == 'free' || plan.find(...)). Consider normalising to always-array on the FE side.
    plan: row.plan === null ? null : row.plan === 'free' ? 'free' : (row.plan as string).split(','),
    property: {
      sizes: { width: row.width, height: row.height, depth: row.depth },
      position: { x: row.position_x, y: row.position_y, z: row.position_z },
      appointment: row.appointment ?? null,
    },
    tags: tags.get(row.uuid as string) ?? [],
    fixedSize: row.fixed_size === 1,
    isOriginalModel: row.is_original_model === 1,
    userKey: row.user_key ?? null,
    langId: row.lang_id ?? null,
    isFavorite: false,
    categoryProduct: [],
    categoryMaterial: [],
  };
}

export function getCollectionProducts(categoryId: string) {
  const rows = stmtProducts.all(categoryId) as Record<string, unknown>[];

  const filesRaw = stmtFiles.all(categoryId) as { product_id: string; file_type: string; file_path: string }[];
  const files = new Map<string, Record<string, string>>();
  for (const f of filesRaw) {
    if (!files.has(f.product_id)) files.set(f.product_id, {});
    files.get(f.product_id)![f.file_type] = f.file_path;
  }

  const tagsRaw = stmtTags.all(categoryId) as { product_id: string; tag: string }[];
  const tags = new Map<string, string[]>();
  for (const t of tagsRaw) {
    if (!tags.has(t.product_id)) tags.set(t.product_id, []);
    tags.get(t.product_id)!.push(t.tag);
  }

  const items = rows.map(r => buildItem(r, files, tags));
  return { total: items.length, items, offset: 0, limit: items.length };
}
