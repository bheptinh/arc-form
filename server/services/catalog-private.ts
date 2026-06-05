import db from '../db.js';
import { DEV_USER_ID } from '../schema.js';
import { getFavoriteItemIds } from './catalog.js';
import { randomUUID } from 'crypto';
import path from 'path';
import { mkdirSync } from 'fs';

const dbDir = process.env.DB_DIR;
if (!dbDir) throw new Error('DB_DIR env variable is not set');

export const uploadsRoot = path.resolve(dbDir, 'uploads');

type SlotRow = {
  id: string;
  model_id: string;
  slot_index: number;
  mesh_name: string | null;
  default_value: string | null;
  source: string | null;
  hash: string | null;
  add_material_id: string | null;
  add_material: string | null;
  set_id: string | null;
};

type ModelRow = {
  id: string;
  user_id: string;
  type: number;
  name: string | null;
  width: number | null;
  height: number | null;
  depth: number | null;
  position_y: number | null;
  contour_top: string | null;
  contour_cut: string | null;
  appointment: string | null;
  source_path: string | null;
  preview_path: string | null;
  svg_path: string | null;
  svg_outline_path: string | null;
  meta_zip_path: string | null;
  tags: string | null;
  public: number;
  original_entity_id: string | null;
  is_original_model: number;
};

function buildUploadedItem(row: ModelRow, slots: SlotRow[]) {
  return {
    id: row.id,
    externalId: null,
    type: row.type,
    name: row.name ?? '',
    description: null,
    plan: 'free' as const,
    isOwner: true,
    source: {
      images: { preview: row.preview_path ?? null },
      body: {
        package: row.source_path ?? null,
        metaZip: row.meta_zip_path ?? null,
        svgFile: row.svg_path ?? null,
        svgOutline: row.svg_outline_path ?? null,
        contourTop: row.contour_top ?? null,
        contourCut: row.contour_cut ?? null,
        materials: slots.map(s => ({
          id: s.slot_index,
          default: s.default_value != null ? Number(s.default_value) : null,
          name: s.mesh_name,
          source: s.source,
          hash: s.hash,
          addMaterialId: s.add_material_id ?? null,
          addMaterial: s.add_material ?? null,
          setId: s.set_id ?? null,
        })),
      },
    },
    property: {
      sizes: { width: row.width, height: row.height, depth: row.depth },
      position: { x: null, y: row.position_y ?? 0, z: null },
      appointment: row.appointment ?? null,
    },
    details: { description: null, availableForPurchase: false, productPage: { url: '', available: false } },
    tags: row.tags ? JSON.parse(row.tags) as string[] : [],
    applications: [],
    configurationAppId: 0,
    configAppFile: '',
    fixedSize: false,
    isOriginalModel: row.is_original_model === 1,
    originalEntityId: row.original_entity_id ?? null,
    metadata: [],
    attributes: [],
    langId: null,
    userKey: null,
    materialOwner: false,
    isFavorite: false,
    addData: '',
    categoryProduct: {},
    categoryMaterial: [],
  };
}

// --- prepared statements ---

const stmtSelectModel = db.prepare<[string, string], ModelRow>(
  `SELECT * FROM user_models WHERE id = ? AND user_id = ?`
);
const stmtSelectSlots = db.prepare<[string], SlotRow>(
  `SELECT * FROM user_model_slots WHERE model_id = ? ORDER BY slot_index`
);
const stmtInsertModel = db.prepare(`
  INSERT OR REPLACE INTO user_models
    (id, user_id, type, name, width, height, depth, position_y,
     contour_top, contour_cut, appointment,
     source_path, preview_path, svg_path, svg_outline_path, meta_zip_path,
     tags, public, original_entity_id, is_original_model)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`);
const stmtInsertSlot = db.prepare(`
  INSERT INTO user_model_slots
    (id, model_id, slot_index, mesh_name, default_value, source, hash,
     add_material_id, add_material, set_id)
  VALUES (?,?,?,?,?,?,?,?,?,?)
`);
const stmtDeleteSlots = db.prepare(`DELETE FROM user_model_slots WHERE model_id = ?`);

const upsertModel = db.transaction((modelId: string, userId: string, body: Record<string, unknown>) => {
  const props = (body.properties ?? {}) as Record<string, unknown>;
  const titles = body.titles as Record<string, string> | undefined;
  stmtInsertModel.run(
    modelId, userId,
    body.type ?? 2,
    titles?.en ?? body.name ?? null,
    props.width ?? null, props.height ?? null, props.depth ?? null, props.positionY ?? null,
    props.contourTop ?? null, props.contourCut ?? null, props.appointment ?? null,
    body.source ?? null, body.preview ?? null,
    body.svg_file ?? null, body.svg_outline ?? null, body.metaZip ?? null,
    body.tags ? JSON.stringify(body.tags) : null,
    body.public ? 1 : 0,
    body.originalEntityId ?? null,
    body.isOriginalModel ? 1 : 0,
  );
  stmtDeleteSlots.run(modelId);
  const geometries = (body.geometries ?? []) as Record<string, unknown>[];
  geometries.forEach((g, i) => {
    stmtInsertSlot.run(
      randomUUID(), modelId, i,
      g.name ?? null, g.materialId ?? null, g.source ?? null, g.md5 ?? null,
      g.addMaterialId ?? null, g.addMaterial ?? null, g.setId ?? null,
    );
  });
  return modelId;
});

// --- public API ---

export function saveModelFiles(
  uploadId: string,
  files: Record<string, Express.Multer.File[]>,
): { uploadId: string; source?: string; preview?: string; svg?: string; svgOutline?: string; metaZip?: string } {
  mkdirSync(path.join(uploadsRoot, uploadId), { recursive: true });
  const pick = (field: string): string | undefined => {
    const f = files[field]?.[0];
    return f ? `/uploads/${uploadId}/${f.filename}` : undefined;
  };
  return {
    uploadId,
    source: pick('source'),
    preview: pick('preview'),
    svg: pick('svg'),
    svgOutline: pick('svg_outline'),
    metaZip: pick('metaZip'),
  };
}

export function createUserModel(userId: string, body: Record<string, unknown>): { entityId: string } {
  const modelId = randomUUID();
  upsertModel(modelId, userId, body);
  return { entityId: modelId };
}

export function updateUserModel(modelId: string, userId: string, body: Record<string, unknown>): { entityId: string } | null {
  const existing = stmtSelectModel.get(modelId, userId);
  if (!existing) return null;
  upsertModel(modelId, userId, body);
  return { entityId: modelId };
}

export function getUserModelById(modelId: string, userId: string) {
  const row = stmtSelectModel.get(modelId, userId);
  if (!row) return null;
  const slots = stmtSelectSlots.all(row.id);
  return buildUploadedItem(row, slots);
}

export function getUserModelFavorites(userId: string) {
  const favIds = getFavoriteItemIds(userId);
  if (favIds.length === 0) return [];
  const ph = favIds.map(() => '?').join(',');
  const rows = db.prepare<string[], ModelRow>(
    `SELECT * FROM user_models WHERE user_id = ? AND id IN (${ph})`
  ).all(userId, ...favIds) as ModelRow[];
  return rows.map(row => {
    const slots = stmtSelectSlots.all(row.id);
    return { ...buildUploadedItem(row, slots), isFavorite: true };
  });
}

export function getUserModels(userId: string) {
  const rows = db.prepare<[string], ModelRow>(
    `SELECT * FROM user_models WHERE user_id = ? ORDER BY created_at DESC`
  ).all(userId);
  const items = rows.map(row => {
    const slots = stmtSelectSlots.all(row.id);
    return buildUploadedItem(row, slots);
  });
  return { total: items.length, items, offset: 0, limit: items.length };
}

export function createUserMaterial(
  userId: string,
  body: Record<string, unknown>,
  files: Record<string, Express.Multer.File[]>,
): { id: string; source: string | null; preview: string | null } {
  const id = randomUUID();
  mkdirSync(path.join(uploadsRoot, id), { recursive: true });
  const sourcePath = files['source']?.[0] ? `/uploads/${id}/${files['source'][0].filename}` : null;
  const previewPath = files['preview']?.[0] ? `/uploads/${id}/${files['preview'][0].filename}` : null;
  db.prepare(`
    INSERT INTO user_materials (id, user_id, type_id, source_path, preview_path, width, height, depth)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(
    id, userId,
    body.type_id ?? null,
    sourcePath, previewPath,
    body.width ?? null, body.height ?? null, body.depth ?? null,
  );
  return { id, source: sourcePath, preview: previewPath };
}
