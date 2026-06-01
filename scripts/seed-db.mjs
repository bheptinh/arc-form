import Database from 'better-sqlite3';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const dbDir = process.env.DB_DIR;
if (!dbDir) throw new Error('DB_DIR env variable is not set');

const db = new Database(path.resolve(root, dbDir, 'arcform.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = OFF'); // disabled during bulk insert; re-enabled after
db.exec(readFileSync(path.join(root, 'server/schema.sql'), 'utf-8'));

// --- helpers ---

const prodCatExtToUuid = new Map(); // external_id → uuid for product categories
const matCatExtToUuid  = new Map(); // external_id → uuid for material categories
const prodExtToUuid    = new Map(); // external_id → uuid for products

function prodCatUuid(extId) { if (!prodCatExtToUuid.has(extId)) prodCatExtToUuid.set(extId, randomUUID()); return prodCatExtToUuid.get(extId); }
function matCatUuid(extId)  { if (!matCatExtToUuid.has(extId))  matCatExtToUuid.set(extId,  randomUUID()); return matCatExtToUuid.get(extId); }
function prodUuid(extId)    { if (!prodExtToUuid.has(extId))    prodExtToUuid.set(extId,    randomUUID()); return prodExtToUuid.get(extId); }

// --- phase 1: categories ---

const insertCat = db.prepare(`
  INSERT OR IGNORE INTO categories (id, external_id, name, parent_id, category_type)
  VALUES (@id, @external_id, @name, @parent_id, @category_type)
`);

function flattenProductTree(nodes, parentExtId = null) {
  for (const node of nodes) {
    const extId = Number(node.id);
    insertCat.run({ id: prodCatUuid(extId), external_id: extId, name: node.name, parent_id: parentExtId != null ? prodCatUuid(parentExtId) : null, category_type: 'product' });
    if (node.nodes?.length) flattenProductTree(node.nodes, extId);
  }
}

const catTree = JSON.parse(readFileSync(path.join(root, 'client/vite-plugins/vite-mock-plugin/mock/category-tree.json'), 'utf-8'));
flattenProductTree(catTree.tree);
console.log(`categories (product): ${prodCatExtToUuid.size}`);

function flattenMaterialTree(nodes, parentExtId = null) {
  for (const node of nodes) {
    const extId = Number(node.id);
    insertCat.run({ id: matCatUuid(extId), external_id: extId, name: node.name, parent_id: parentExtId ? matCatUuid(parentExtId) : null, category_type: 'material' });
    if (node.nodes?.length) flattenMaterialTree(node.nodes, extId);
  }
}

const matTree = JSON.parse(readFileSync(path.join(root, 'client/vite-plugins/vite-mock-plugin/mock/category-public-materials.json'), 'utf-8'));
flattenMaterialTree(matTree.materials);
console.log(`categories (material): ${matCatExtToUuid.size}`);

// --- phase 2: collect all products (deduplicated by external_id) ---

const allProducts = new Map();
const mockDir = path.join(root, 'client/vite-plugins/catalog-search-fallback/mocks');
for (const file of readdirSync(mockDir).filter(f => f.endsWith('.json'))) {
  const { data } = JSON.parse(readFileSync(path.join(mockDir, file), 'utf-8'));
  if (!data?.items) continue;
  for (const item of data.items) {
    if (!allProducts.has(item.id)) allProducts.set(item.id, item);
  }
}
console.log(`products found: ${allProducts.size}`);

// --- phase 3: insert products + files + categories + tags ---

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products
    (id, external_id, type, name, description, plan, appointment,
     width, height, depth, position_x, position_y, position_z,
     fixed_size, is_original_model, original_entity_id, user_key, lang_id)
  VALUES
    (@id, @external_id, @type, @name, @description, @plan, @appointment,
     @width, @height, @depth, @position_x, @position_y, @position_z,
     @fixed_size, @is_original_model, @original_entity_id, @user_key, @lang_id)
`);

const insertFile = db.prepare(`
  INSERT OR IGNORE INTO product_files (product_id, file_type, file_path)
  VALUES (@product_id, @file_type, @file_path)
`);

const insertProdCat = db.prepare(`
  INSERT OR IGNORE INTO product_categories (product_id, category_id)
  VALUES (@product_id, @category_id)
`);

const insertTag = db.prepare(`
  INSERT OR IGNORE INTO product_tags (product_id, tag)
  VALUES (@product_id, @tag)
`);

const seedProducts = db.transaction(() => {
  for (const item of allProducts.values()) {
    const uuid = prodUuid(item.id);
    const sizes = item.property?.sizes ?? {};
    const pos = item.property?.position ?? {};
    const origExtId = item.originalEntityId ? Number(item.originalEntityId) : null;

    insertProduct.run({
      id: uuid,
      external_id: item.id,
      type: item.type != null ? String(item.type) : null,
      name: item.name,
      description: item.description ?? null,
      plan: Array.isArray(item.plan) ? item.plan.join(',') : (item.plan ?? null),
      appointment: item.property?.appointment ?? null,
      width: sizes.width ?? null,
      height: sizes.height ?? null,
      depth: sizes.depth ?? null,
      position_x: pos.x ?? null,
      position_y: pos.y ?? null,
      position_z: pos.z ?? null,
      fixed_size: item.fixedSize ? 1 : 0,
      is_original_model: item.isOriginalModel ? 1 : 0,
      original_entity_id: origExtId ? prodUuid(origExtId) : null,
      user_key: item.userKey ?? null,
      lang_id: item.langId ?? null,
    });

    const imgs = item.source?.images ?? {};
    const body = item.source?.body ?? {};
    if (imgs.preview)    insertFile.run({ product_id: uuid, file_type: 'preview',     file_path: imgs.preview });
    if (body.package)    insertFile.run({ product_id: uuid, file_type: 'glb',          file_path: body.package });
    if (body.metaZip)    insertFile.run({ product_id: uuid, file_type: 'meta_zip',     file_path: body.metaZip });
    if (body.svgFile)    insertFile.run({ product_id: uuid, file_type: 'svg_file',     file_path: body.svgFile });
    if (body.svgOutline) insertFile.run({ product_id: uuid, file_type: 'svg_outline',  file_path: body.svgOutline });

    for (const extCatId of Object.keys(item.categoryProduct ?? {})) {
      const catId = prodCatExtToUuid.get(Number(extCatId));
      if (catId) insertProdCat.run({ product_id: uuid, category_id: catId });
    }
    for (const extCatId of Object.keys(item.categoryMaterial ?? {})) {
      const catId = matCatExtToUuid.get(Number(extCatId));
      if (catId) insertProdCat.run({ product_id: uuid, category_id: catId });
    }

    for (const tag of item.tags ?? []) {
      if (tag) insertTag.run({ product_id: uuid, tag });
    }
  }
});

seedProducts();
console.log(`products inserted: ${prodExtToUuid.size}`);

// --- phase 4: material slots (after all products exist so add_material_id FKs resolve) ---

const insertSlot = db.prepare(`
  INSERT OR IGNORE INTO product_material_slots
    (product_id, slot_index, mesh_name, default_value, source, hash, add_material_id)
  VALUES
    (@product_id, @slot_index, @mesh_name, @default_value, @source, @hash, @add_material_id)
`);

const seedSlots = db.transaction(() => {
  for (const item of allProducts.values()) {
    const uuid = prodUuid(item.id);
    for (const mat of item.source?.body?.materials ?? []) {
      insertSlot.run({
        product_id: uuid,
        slot_index: mat.id,
        mesh_name: mat.name ?? null,
        default_value: mat.default != null ? String(mat.default) : null,
        source: mat.source ?? null,
        hash: mat.hash ?? null,
        add_material_id: mat.addMaterial ? (prodExtToUuid.get(mat.addMaterial) ?? null) : null,
      });
    }
  }
});

seedSlots();

db.pragma('foreign_keys = ON');

// --- phase 5: generate nav-tree.json ---
// Transform category-tree.json: replace numeric ids with UUIDs, rewrite urlList
// to /server-api/catalog/collections/:uuid. Written once to data/ alongside the DB.

function transformNavNode(node) {
  const uuid = prodCatExtToUuid.get(Number(node.id));
  const out = { ...node, id: uuid ?? node.id };
  if (uuid && node.urlList) out.urlList = `/server-api/catalog/collections/${uuid}`;
  if (node.nodes?.length) out.nodes = node.nodes.map(transformNavNode);
  return out;
}

const navTree = { ...catTree, tree: catTree.tree.map(transformNavNode) };
writeFileSync(path.resolve(root, dbDir, 'nav-tree.json'), JSON.stringify(navTree, null, 2));
console.log('nav-tree.json written.');

// --- phase 6: generate materials-tree.json ---

function transformMatNode(node) {
  const uuid = matCatExtToUuid.get(Number(node.id));
  const out = { ...node, id: uuid ?? node.id };
  if (uuid && node.urlList) out.urlList = `/server-api/catalog/collections/${uuid}`;
  if (node.nodes?.length) out.nodes = node.nodes.map(transformMatNode);
  return out;
}

const materialsTree = { ...matTree, materials: matTree.materials.map(transformMatNode) };
writeFileSync(path.resolve(root, dbDir, 'materials-tree.json'), JSON.stringify(materialsTree, null, 2));
console.log('materials-tree.json written.');

db.close();
console.log('done.');
