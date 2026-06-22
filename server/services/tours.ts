import db from '../db.js';
import { DEV_USER_ID } from '../schema.js';

interface TourRow {
  id: string;
  name: string;
  status: string;
  preview: string | null;
  created_at: string;
  updated_at: string;
}

// TODO: Tour creation — the original flow opens an iframe to R2D.URL.DOMAIN + /tours/add
// (roomtodo.com's tour builder), which POSTs to /api2/planner-sharing/ when saved and sends
// a 'tour_360_save' postMessage back to close the iframe. To support tour creation locally:
//   1. Build a tour editor page at GET /tours/add (or serve a React page at that route)
//   2. Handle POST /server-api/tours to persist the tour (renders[], name, etc.)
//   3. On save, respond so the iframe can postMessage 'tour_360_save' to the parent

export function listTours() {
  const rows = db.prepare(`
    SELECT id, name, status, preview, created_at, updated_at
    FROM tours
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(DEV_USER_ID) as TourRow[];

  return rows.map(row => ({
    h: row.id,
    name: row.name,
    status: row.status,
    preview: row.preview,
    edit: `/tours/${row.id}/edit`,
    view: `/tours/${row.id}`,
    delete: `/server-api/tours/${row.id}`,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export function deleteTour(id: string): boolean {
  const result = db.prepare(`
    DELETE FROM tours WHERE id = ? AND user_id = ?
  `).run(id, DEV_USER_ID);
  return result.changes > 0;
}
