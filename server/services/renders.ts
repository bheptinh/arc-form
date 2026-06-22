import { randomUUID } from 'node:crypto';
import db from '../db.js';
import { DEV_USER_ID } from '../schema.js';

const TYPE_LABEL: Record<number, string> = { 3: '2K', 4: '4K', 5: '360' };

interface RenderRow {
  id: string;
  render_type: number;
  status: string;
  preview: string | null;
  image_url: string | null;
  created_at: number;
}

export function createRender(renderType: number, renderView: string, renderOrientation: string): string {
  const id = randomUUID();
  db.prepare(`
    INSERT INTO renders (id, user_id, render_type, render_view, render_orientation)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, DEV_USER_ID, renderType, renderView, renderOrientation);
  return id;
}

export function listRenders(limit: number, offset: number) {
  const rows = db.prepare(`
    SELECT id, render_type, status, preview, image_url, created_at
    FROM renders
    WHERE user_id = ? AND status != 'deleted'
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(DEV_USER_ID, limit, offset) as RenderRow[];

  const { count } = db.prepare(`
    SELECT COUNT(*) as count FROM renders WHERE user_id = ? AND status != 'deleted'
  `).get(DEV_USER_ID) as { count: number };

  return {
    items: rows.map(row => ({
      id: row.id,
      renderId: row.id,
      type: TYPE_LABEL[row.render_type] ?? String(row.render_type),
      status: row.status,
      preview: row.preview,
      actions: row.image_url ? { open: { link: row.image_url } } : undefined,
      created: row.created_at,
    })),
    total: count,
    limit,
    offset,
  };
}

export function getRender(id: string): { url: string | null } | null {
  const row = db.prepare(`
    SELECT image_url FROM renders WHERE id = ? AND user_id = ?
  `).get(id, DEV_USER_ID) as { image_url: string | null } | undefined;
  if (!row) return null;
  return { url: row.image_url };
}

export function deleteRender(id: string): void {
  db.prepare(`
    UPDATE renders SET status = 'deleted' WHERE id = ? AND user_id = ?
  `).run(id, DEV_USER_ID);
}

export function restartRender(id: string): { renderId: string } | { error: string } | null {
  const row = db.prepare(`
    SELECT id, status FROM renders WHERE id = ? AND user_id = ?
  `).get(id, DEV_USER_ID) as { id: string; status: string } | undefined;

  if (!row) return null;
  if (row.status !== 'error') return { error: "render can't be restarted" };

  // TODO: re-enqueue the render job (retrieve saved projectData from disk, submit to worker)
  db.prepare(`UPDATE renders SET status = 'stored' WHERE id = ?`).run(id);
  return { renderId: id };
}
