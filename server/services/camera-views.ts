import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import db from '../db.js';
import { uploadsRoot } from './catalog-private.js';

const previewsRoot = path.join(uploadsRoot, 'camera-views');

interface CameraViewRow {
  id: string;
  project_id: string;
  config: string;
}

function toCameraView(row: CameraViewRow) {
  return {
    id: row.id,
    config: JSON.parse(row.config),
    previewUrl: `/uploads/camera-views/${row.project_id}/${row.id}.jpg`,
  };
}

export function listCameraViews(projectId: string) {
  const rows = db.prepare(`
    SELECT id, project_id, config FROM camera_views WHERE project_id = ? ORDER BY rowid
  `).all(projectId) as CameraViewRow[];
  return rows.map(toCameraView);
}

export function createCameraView(projectId: string, preview: string, config: Record<string, unknown>) {
  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);
  if (!project) return null;

  const row: CameraViewRow = { id: randomUUID(), project_id: projectId, config: JSON.stringify(config) };
  const dir = path.join(previewsRoot, projectId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, `${row.id}.jpg`), Buffer.from(preview.split(',')[1], 'base64'));

  db.prepare('INSERT INTO camera_views (id, project_id, config) VALUES (?, ?, ?)').run(row.id, row.project_id, row.config);
  return toCameraView(row);
}

export function deleteCameraView(id: string) {
  const row = db.prepare('SELECT project_id FROM camera_views WHERE id = ?').get(id) as Pick<CameraViewRow, 'project_id'> | undefined;
  if (!row) return false;

  db.prepare('DELETE FROM camera_views WHERE id = ?').run(id);
  rmSync(path.join(previewsRoot, row.project_id, `${id}.jpg`), { force: true });
  return true;
}

// Rows are removed by ON DELETE CASCADE; this clears the preview files.
export function deleteCameraViewPreviews(projectId: string) {
  rmSync(path.join(previewsRoot, projectId), { recursive: true, force: true });
}
