import { randomUUID } from 'node:crypto';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import JSZip from 'jszip';
import db from '../db.js';
import { DEV_USER_ID } from '../schema.js';
import { uploadsRoot } from './catalog-private.js';

const TYPE_LABEL: Record<number, string> = { 3: '2K', 4: '4K', 5: '360' };
const RENDER_TYPE_360 = 5;
const rendersRoot = path.join(uploadsRoot, 'renders');

interface RenderRow {
  id: string;
  render_type: number;
  status: string;
  preview: string | null;
  image_url: string | null;
  created_at: number;
}

// TEMPORARY, not the final solution: saves the viewport screenshot the client sends in
// content.json, so a "2K"/"4K" render is only viewport resolution. Replace with the
// Puppeteer worker described in routes/renders.ts.
async function saveViewportImage(id: string, projectData: string): Promise<string | null> {
  try {
    const zip = await JSZip.loadAsync(projectData.split(',')[1], { base64: true });
    const { preview } = JSON.parse(await zip.file('content.json')!.async('string'));
    if (!preview) return null;

    const dir = path.join(rendersRoot, id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'preview.jpg'), Buffer.from(preview, 'base64'));
    return `/uploads/renders/${id}/preview.jpg`;
  } catch (err) {
    console.error('Render image extraction failed:', err);
    return null;
  }
}

export async function createRender(
  renderType: number,
  renderView: string,
  renderOrientation: string,
  projectData: string,
): Promise<string> {
  const id = randomUUID();
  // TEMPORARY: a 360° panorama can't come from a screenshot, so those end as 'error' until the Puppeteer worker exists.
  const imageUrl = renderType === RENDER_TYPE_360 ? null : await saveViewportImage(id, projectData);
  db.prepare(`
    INSERT INTO renders (id, user_id, render_type, render_view, render_orientation, status, preview, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, DEV_USER_ID, renderType, renderView, renderOrientation, imageUrl ? 'stored' : 'error', imageUrl, imageUrl);
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
  rmSync(path.join(rendersRoot, id), { recursive: true, force: true });
}

export function restartRender(id: string): { renderId: string } | { error: string } | null {
  const row = db.prepare(`
    SELECT id FROM renders WHERE id = ? AND user_id = ?
  `).get(id, DEV_USER_ID) as { id: string } | undefined;

  if (!row) return null;

  // TODO: re-enqueue the render job (retrieve saved projectData from disk, submit to the Puppeteer worker).
  // TEMPORARY: projectData isn't kept, so there is nothing to re-run yet.
  return { error: "render can't be restarted" };
}
