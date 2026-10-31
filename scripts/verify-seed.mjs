import Database from 'better-sqlite3';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const dbDir = process.env.DB_DIR;
if (!dbDir) throw new Error('DB_DIR env variable is not set');
const db = new Database(path.resolve(root, dbDir, 'arcform.db'));

// --- load JSON sources ---

function countCategoryNodes(nodes) {
  let n = nodes.length;
  for (const node of nodes) if (node.nodes?.length) n += countCategoryNodes(node.nodes);
  return n;
}

const catTree = JSON.parse(readFileSync(path.join(root, 'client/vite-plugins/vite-mock-plugin/mock/category-tree.json'), 'utf-8'));
const matTree = JSON.parse(readFileSync(path.join(root, 'client/vite-plugins/vite-mock-plugin/mock/category-public-materials.json'), 'utf-8'));
const jsonProductCats = countCategoryNodes(catTree.tree);
const jsonMaterialCats = countCategoryNodes(matTree.materials);

const mockDir = path.join(root, 'client/vite-plugins/catalog-search-fallback/mocks');
const allJsonProducts = new Map();
for (const file of readdirSync(mockDir).filter(f => f.endsWith('.json'))) {
  const { data } = JSON.parse(readFileSync(path.join(mockDir, file), 'utf-8'));
  if (!data?.items) continue;
  for (const item of data.items) {
    if (!allJsonProducts.has(item.id)) allJsonProducts.set(item.id, item);
  }
}

// --- count comparison ---

const dbProducts    = db.prepare('SELECT COUNT(*) as n FROM products').get().n;
const dbCatProduct  = db.prepare("SELECT COUNT(*) as n FROM categories WHERE category_type = 'product'").get().n;
const dbCatMaterial = db.prepare("SELECT COUNT(*) as n FROM categories WHERE category_type = 'material'").get().n;
const dbFiles       = db.prepare('SELECT COUNT(*) as n FROM product_files').get().n;
const dbSlots       = db.prepare('SELECT COUNT(*) as n FROM product_material_slots').get().n;
const dbProdCats    = db.prepare('SELECT COUNT(*) as n FROM product_categories').get().n;
const dbTags        = db.prepare('SELECT COUNT(*) as n FROM product_tags').get().n;

console.log('\n=== COUNTS ===');
console.log(`categories (product) — json: ${jsonProductCats}  db: ${dbCatProduct}  ${jsonProductCats === dbCatProduct ? '✓' : '✗ MISMATCH'}`);
console.log(`categories (material)— json: ${jsonMaterialCats}  db: ${dbCatMaterial}  ${jsonMaterialCats === dbCatMaterial ? '✓' : '✗ MISMATCH'}`);
console.log(`products             — json: ${allJsonProducts.size}  db: ${dbProducts}  ${allJsonProducts.size === dbProducts ? '✓' : '✗ MISMATCH'}`);
console.log(`product_files        — db: ${dbFiles}`);
console.log(`product_material_slots— db: ${dbSlots}`);
console.log(`product_categories   — db: ${dbProdCats}`);
console.log(`product_tags         — db: ${dbTags}`);

// --- per-product field comparison ---

const getProduct = db.prepare('SELECT * FROM products WHERE external_id = ?');
const getFiles   = db.prepare('SELECT file_type, file_path FROM product_files WHERE product_id = ? ORDER BY file_type');
const getSlots   = db.prepare('SELECT slot_index, mesh_name, default_value, source, hash FROM product_material_slots WHERE product_id = ? ORDER BY slot_index');
const getProdCatIds = db.prepare("SELECT c.external_id FROM categories c JOIN product_categories pc ON pc.category_id = c.id WHERE pc.product_id = ? AND c.category_type = 'product'");
const getMatCatIds  = db.prepare("SELECT c.external_id FROM categories c JOIN product_categories pc ON pc.category_id = c.id WHERE pc.product_id = ? AND c.category_type = 'material'");

// Categories intentionally absent from the DB (stripped ghost categories not in remote tree)
const knownProdCats  = new Set(db.prepare("SELECT external_id FROM categories WHERE category_type = 'product'").all().map(r => r.external_id));
const knownMatCats   = new Set(db.prepare("SELECT external_id FROM categories WHERE category_type = 'material'").all().map(r => r.external_id));
const getTags    = db.prepare('SELECT tag FROM product_tags WHERE product_id = ? ORDER BY tag');

const mismatches = [];
let checked = 0;

for (const item of allJsonProducts.values()) {
  const row = getProduct.get(item.id);
  if (!row) { mismatches.push({ id: item.id, field: '(row missing)' }); continue; }

  const sizes = item.property?.sizes ?? {};
  const pos   = item.property?.position ?? {};

  // Normalize values to match what the seed stores and SQLite returns:
  //   type   → TEXT in DB (seed casts via String()); compare as strings
  //   lang_id → INTEGER in DB; JSON may be string or number
  //   floats  → round to 6dp to avoid IEEE754 drift
  const norm = (v, dbVal) => {
    if (v === null || v === undefined) return null;
    if (typeof dbVal === 'number') return Number(Number(v).toFixed(6));
    if (typeof dbVal === 'string') return String(v);
    return v;
  };

  const fieldChecks = [
    ['type',               row.type,               item.type != null ? String(item.type) : null],
    ['name',               row.name,               item.name],
    ['description',        row.description,        item.description ?? null],
    ['appointment',        row.appointment,        item.property?.appointment ?? null],
    ['width',              row.width,              sizes.width != null ? Number(Number(sizes.width).toFixed(6)) : null],
    ['height',             row.height,             sizes.height != null ? Number(Number(sizes.height).toFixed(6)) : null],
    ['depth',              row.depth,              sizes.depth != null ? Number(Number(sizes.depth).toFixed(6)) : null],
    ['position_x',         row.position_x,         pos.x != null ? Number(Number(pos.x).toFixed(6)) : null],
    ['position_y',         row.position_y,         pos.y != null ? Number(Number(pos.y).toFixed(6)) : null],
    ['position_z',         row.position_z,         pos.z != null ? Number(Number(pos.z).toFixed(6)) : null],
    ['fixed_size',         row.fixed_size,         item.fixedSize ? 1 : 0],
    ['is_original_model',  row.is_original_model,  item.isOriginalModel ? 1 : 0],
    ['user_key',           row.user_key,           item.userKey ?? null],
    ['lang_id',            row.lang_id,            item.langId != null ? Number(item.langId) : null],
  ];

  for (const [field, got, want] of fieldChecks) {
    const g = got != null && typeof want === 'number' ? Number(Number(got).toFixed(6)) : got;
    if (g !== want) mismatches.push({ id: item.id, field, got, want });
  }

  // files
  const dbFileMap = Object.fromEntries(getFiles.all(row.id).map(f => [f.file_type, f.file_path]));
  const imgs = item.source?.images ?? {};
  const body = item.source?.body ?? {};
  const wantFiles = {
    ...(imgs.preview    ? { preview:     imgs.preview }    : {}),
    ...(body.package    ? { glb:         body.package }    : {}),
    ...(body.metaZip    ? { meta_zip:    body.metaZip }    : {}),
    ...(body.svgFile    ? { svg_file:    body.svgFile }    : {}),
    ...(body.svgOutline ? { svg_outline: body.svgOutline } : {}),
  };
  for (const [ft, fp] of Object.entries(wantFiles)) {
    if (dbFileMap[ft] !== fp) mismatches.push({ id: item.id, field: `file:${ft}`, got: dbFileMap[ft], want: fp });
  }
  if (Object.keys(dbFileMap).length !== Object.keys(wantFiles).length) {
    mismatches.push({ id: item.id, field: 'file count', got: Object.keys(dbFileMap).length, want: Object.keys(wantFiles).length });
  }

  // material slots
  const dbSlotList = getSlots.all(row.id);
  const jsonSlots  = item.source?.body?.materials ?? [];
  if (dbSlotList.length !== jsonSlots.length) {
    mismatches.push({ id: item.id, field: 'slot count', got: dbSlotList.length, want: jsonSlots.length });
  } else {
    for (let i = 0; i < jsonSlots.length; i++) {
      const mat = jsonSlots[i];
      const s   = dbSlotList.find(r => r.slot_index === mat.id);
      if (!s) { mismatches.push({ id: item.id, field: `slot[${mat.id}] missing` }); continue; }
      if (s.mesh_name    !== (mat.name ?? null))                        mismatches.push({ id: item.id, field: `slot[${mat.id}].mesh_name`, got: s.mesh_name, want: mat.name ?? null });
      if (s.default_value!== (mat.default != null ? String(mat.default) : null)) mismatches.push({ id: item.id, field: `slot[${mat.id}].default_value`, got: s.default_value, want: mat.default });
      if (s.source       !== (mat.source ?? null))                      mismatches.push({ id: item.id, field: `slot[${mat.id}].source`, got: s.source, want: mat.source });
      if (s.hash         !== (mat.hash ?? null))                        mismatches.push({ id: item.id, field: `slot[${mat.id}].hash`, got: s.hash, want: mat.hash });
    }
  }

  // product categories (checked per type — product and material are stored separately)
  const dbProdCatSet = new Set(getProdCatIds.all(row.id).map(r => r.external_id));
  const dbMatCatSet  = new Set(getMatCatIds.all(row.id).map(r => r.external_id));
  for (const extId of Object.keys(item.categoryProduct ?? {})) {
    const id = Number(extId);
    if (knownProdCats.has(id) && !dbProdCatSet.has(id))
      mismatches.push({ id: item.id, field: `categoryProduct[${extId}] missing` });
  }
  for (const extId of Object.keys(item.categoryMaterial ?? {})) {
    const id = Number(extId);
    if (knownMatCats.has(id) && !dbMatCatSet.has(id))
      mismatches.push({ id: item.id, field: `categoryMaterial[${extId}] missing` });
  }

  // tags
  const dbTagSet   = new Set(getTags.all(row.id).map(r => r.tag));
  const jsonTagSet = new Set((item.tags ?? []).filter(Boolean));
  for (const tag of jsonTagSet) {
    if (!dbTagSet.has(tag)) mismatches.push({ id: item.id, field: `tag[${tag}] missing` });
  }

  checked++;
}

console.log(`\n=== FIELD COMPARISON (${checked}/${allJsonProducts.size} products checked) ===`);
if (mismatches.length === 0) {
  console.log('✓ All fields match');
} else {
  console.log(`✗ ${mismatches.length} mismatches found (first 20):`);
  for (const m of mismatches.slice(0, 20)) {
    console.log(`  external_id=${m.id}  field=${m.field}  got=${JSON.stringify(m.got)}  want=${JSON.stringify(m.want)}`);
  }
  if (mismatches.length > 20) console.log(`  ... and ${mismatches.length - 20} more`);
}

db.close();
