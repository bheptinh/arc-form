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

const materialsTreePath = path.resolve(__dirname, '../..', dbDir, 'materials-tree.json');

export function getMaterialsTree() {
  return JSON.parse(readFileSync(materialsTreePath, 'utf-8'));
}

// --- shared types ---

type FileMap  = Map<string, Record<string, string>>;
type TagMap   = Map<string, string[]>;
type SlotMap  = Map<string, { id: number; default: number | null; name: string | null; source: string | null; hash: string | null }[]>;

// --- fetch files, tags, slots for a list of product UUIDs ---

function fetchRelated(uuids: string[]): { files: FileMap; tags: TagMap; slots: SlotMap } {
  const ph = uuids.map(() => '?').join(',');

  const filesRaw = db.prepare(`
    SELECT product_id, file_type, file_path FROM product_files WHERE product_id IN (${ph})
  `).all(...uuids) as { product_id: string; file_type: string; file_path: string }[];
  const files: FileMap = new Map();
  for (const f of filesRaw) {
    if (!files.has(f.product_id)) files.set(f.product_id, {});
    files.get(f.product_id)![f.file_type] = f.file_path;
  }

  const tagsRaw = db.prepare(`
    SELECT product_id, tag FROM product_tags WHERE product_id IN (${ph})
  `).all(...uuids) as { product_id: string; tag: string }[];
  const tags: TagMap = new Map();
  for (const t of tagsRaw) {
    if (!tags.has(t.product_id)) tags.set(t.product_id, []);
    tags.get(t.product_id)!.push(t.tag);
  }

  const slotsRaw = db.prepare(`
    SELECT product_id, slot_index, mesh_name, default_value, source, hash
    FROM product_material_slots WHERE product_id IN (${ph})
    ORDER BY product_id, slot_index
  `).all(...uuids) as { product_id: string; slot_index: number; mesh_name: string | null; default_value: string | null; source: string | null; hash: string | null }[];
  const slots: SlotMap = new Map();
  for (const s of slotsRaw) {
    if (!slots.has(s.product_id)) slots.set(s.product_id, []);
    slots.get(s.product_id)!.push({
      id: s.slot_index,
      default: s.default_value != null ? Number(s.default_value) : null,
      name: s.mesh_name,
      source: s.source,
      hash: s.hash,
    });
  }

  return { files, tags, slots };
}

// --- buildItem ---

function buildItem(row: Record<string, unknown>, files: FileMap, tags: TagMap, slots: SlotMap) {
  const f = files.get(row.uuid as string) ?? {};
  return {
    id: row.external_id,
    type: row.type != null ? Number(row.type) : null,
    name: row.name,
    description: row.description ?? null,
    source: {
      images: { preview: f.preview ?? null },
      body: {
        package: f.glb ?? null,
        metaZip: f.meta_zip ?? null,
        svgFile: f.svg_file ?? null,
        svgOutline: f.svg_outline ?? null,
        contourTop: row.contour_top ?? null,
        contourCut: row.contour_cut ?? null,
        materials: slots.get(row.uuid as string) ?? [],
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
    details: { description: null, availableForPurchase: false, productPage: { url: '', available: false } },
    tags: tags.get(row.uuid as string) ?? [],
    applications: [],
    configurationAppId: 0,
    configAppFile: '',
    fixedSize: row.fixed_size === 1,
    isOriginalModel: row.is_original_model === 1,
    originalEntityId: 0,
    metadata: [],
    attributes: [],
    langId: row.lang_id ?? null,
    userKey: row.user_key ?? null,
    materialOwner: false,
    isOwner: false,
    isFavorite: false,
    categoryProduct: {},
    categoryMaterial: [],
  };
}

// --- product SELECT fragment reused across queries ---

const PRODUCT_COLS = `
  p.id as uuid, p.external_id, p.type, p.name, p.description, p.plan,
  p.appointment, p.width, p.height, p.depth,
  p.position_x, p.position_y, p.position_z,
  p.contour_top, p.contour_cut,
  p.fixed_size, p.is_original_model, p.user_key, p.lang_id
`;

// --- prepared statements for collection queries ---

const stmtCollectionProducts = db.prepare(`
  SELECT ${PRODUCT_COLS}
  FROM products p
  JOIN product_categories pc ON pc.product_id = p.id
  WHERE pc.category_id = ?
  ORDER BY p.external_id
`);

const stmtCollectionFiles = db.prepare(`
  SELECT product_id, file_type, file_path FROM product_files
  WHERE product_id IN (SELECT product_id FROM product_categories WHERE category_id = ?)
`);

const stmtCollectionTags = db.prepare(`
  SELECT product_id, tag FROM product_tags
  WHERE product_id IN (SELECT product_id FROM product_categories WHERE category_id = ?)
`);

const stmtCollectionSlots = db.prepare(`
  SELECT product_id, slot_index, mesh_name, default_value, source, hash
  FROM product_material_slots
  WHERE product_id IN (SELECT product_id FROM product_categories WHERE category_id = ?)
  ORDER BY product_id, slot_index
`);

function buildCollection(rows: Record<string, unknown>[], filesRaw: { product_id: string; file_type: string; file_path: string }[], tagsRaw: { product_id: string; tag: string }[], slotsRaw: { product_id: string; slot_index: number; mesh_name: string | null; default_value: string | null; source: string | null; hash: string | null }[]) {
  const files: FileMap = new Map();
  for (const f of filesRaw) {
    if (!files.has(f.product_id)) files.set(f.product_id, {});
    files.get(f.product_id)![f.file_type] = f.file_path;
  }

  const tags: TagMap = new Map();
  for (const t of tagsRaw) {
    if (!tags.has(t.product_id)) tags.set(t.product_id, []);
    tags.get(t.product_id)!.push(t.tag);
  }

  const slots: SlotMap = new Map();
  for (const s of slotsRaw) {
    if (!slots.has(s.product_id)) slots.set(s.product_id, []);
    slots.get(s.product_id)!.push({
      id: s.slot_index,
      default: s.default_value != null ? Number(s.default_value) : null,
      name: s.mesh_name,
      source: s.source,
      hash: s.hash,
    });
  }

  const items = rows.map(r => buildItem(r, files, tags, slots));
  return { total: items.length, items, offset: 0, limit: items.length };
}

export function getCollectionProducts(categoryId: string) {
  const rows = stmtCollectionProducts.all(categoryId) as Record<string, unknown>[];
  const filesRaw = stmtCollectionFiles.all(categoryId) as { product_id: string; file_type: string; file_path: string }[];
  const tagsRaw = stmtCollectionTags.all(categoryId) as { product_id: string; tag: string }[];
  const slotsRaw = stmtCollectionSlots.all(categoryId) as { product_id: string; slot_index: number; mesh_name: string | null; default_value: string | null; source: string | null; hash: string | null }[];
  return buildCollection(rows, filesRaw, tagsRaw, slotsRaw);
}

export function getProductsByExternalIds(externalIds: number[]) {
  if (externalIds.length === 0) return { total: 0, items: [], offset: 0, limit: 0 };

  const ph = externalIds.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT ${PRODUCT_COLS} FROM products p WHERE p.external_id IN (${ph})
  `).all(...externalIds) as Record<string, unknown>[];

  if (rows.length === 0) return { total: 0, items: [], offset: 0, limit: 0 };

  const uuids = rows.map(r => r.uuid as string);
  const { files, tags, slots } = fetchRelated(uuids);
  const items = rows.map(r => buildItem(r, files, tags, slots));
  return { total: items.length, items, offset: 0, limit: items.length };
}

export function getProductsByTag(tag: string) {
  const rows = db.prepare(`
    SELECT ${PRODUCT_COLS} FROM products p
    JOIN product_tags pt ON pt.product_id = p.id
    WHERE pt.tag = ?
    ORDER BY p.external_id
  `).all(tag) as Record<string, unknown>[];

  if (rows.length === 0) return { total: 0, items: [], offset: 0, limit: 0 };

  const uuids = rows.map(r => r.uuid as string);
  const { files, tags, slots } = fetchRelated(uuids);
  const items = rows.map(r => buildItem(r, files, tags, slots));
  return { total: items.length, items, offset: 0, limit: items.length };
}
