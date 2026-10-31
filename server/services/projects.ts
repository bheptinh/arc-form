import db from '../db.js';
import { appConfig } from '../config/app.js';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = process.env.DB_DIR;
if (!dbDir) throw new Error('DB_DIR env variable is not set');

const projectsDir = path.resolve(__dirname, '../..', dbDir, 'projects');
mkdirSync(projectsDir, { recursive: true });

function projectFile(hash: string) {
  return path.join(projectsDir, `${hash}.json`);
}


type ProjectRow = { id: string; user_id: string; name: string; view_only: number; created_at: string; updated_at: string };

function buildResponse(row: ProjectRow) {
  const filePath = projectFile(row.id);
  const plan = existsSync(filePath) ? JSON.parse(readFileSync(filePath, 'utf-8')) : {};
  plan.id = row.id;
  return { status: 'success', viewOnly: row.view_only === 1, plan };
}

export function getConfig() {
  const { logo, startPopup, defaultMaterials, ui, branding } = appConfig;
  return {
    logo,
    start_popup: {
      show: String(startPopup.show),
      title: startPopup.title,
      items: startPopup.items,
    },
    default_materials: defaultMaterials,
    ui: { show_pro_button: String(ui.showProButton) },
    additional: {
      copyright: { type: 'text', show: String(branding.copyright.show), text: branding.copyright.text },
      terms: { type: 'text', show: String(branding.terms.show), text: branding.terms.text, href: branding.terms.href },
    },
  };
}

export function listProjects(userId: string, limit: number, offset: number) {
  const rows = db.prepare(
    'SELECT id, name, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?'
  ).all(userId, limit || 100, offset) as ProjectRow[];
  const { count } = db.prepare('SELECT COUNT(*) as count FROM projects WHERE user_id = ?').get(userId) as { count: number };
  return {
    status: 'ok',
    data: {
      items: rows.map(r => ({ id: r.id, hash: r.id, name: r.name, modified: r.updated_at, opened: r.created_at })),
      total: count,
    },
  };
}

export function loadProject(id: string) {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined;
  return row ? buildResponse(row) : null;
}

export function saveProject(userId: string, plan: Record<string, unknown>) {
  const id = (plan.id as string) || randomUUID();
  const name = (plan.name as string) ?? '';
  const planToStore = { ...plan, id };

  writeFileSync(projectFile(id), JSON.stringify(planToStore));

  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined;
  if (existing) {
    db.prepare(`UPDATE projects SET name = ?, updated_at = datetime('now') WHERE id = ?`).run(name, id);
  } else {
    db.prepare('INSERT INTO projects (id, user_id, name, view_only) VALUES (?, ?, ?, 0)').run(id, userId, name);
  }

  return { status: 'success', plan_id: id, hash: id };
}

export function renameProject(id: string, newName: string) {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined;
  if (!row) return null;

  db.prepare(`UPDATE projects SET name = ?, updated_at = datetime('now') WHERE id = ?`).run(newName, id);

  const filePath = projectFile(id);
  if (existsSync(filePath)) {
    const plan = JSON.parse(readFileSync(filePath, 'utf-8'));
    plan.name = newName;
    writeFileSync(filePath, JSON.stringify(plan));
  }

  return { status: 'success' };
}

export function copyProject(id: string, newName: string) {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined;
  if (!row) return null;

  const newId = randomUUID();
  db.prepare('INSERT INTO projects (id, user_id, name, view_only) VALUES (?, ?, ?, 0)').run(newId, row.user_id, newName);

  const srcFile = projectFile(id);
  if (existsSync(srcFile)) {
    const plan = JSON.parse(readFileSync(srcFile, 'utf-8'));
    plan.name = newName;
    plan.id = newId;
    writeFileSync(projectFile(newId), JSON.stringify(plan));
  }

  return { status: 'success', plan: newId, hash: newId };
}

export function deleteProject(id: string) {
  const row = db.prepare('SELECT id FROM projects WHERE id = ?').get(id) as ProjectRow | undefined;
  if (!row) return null;

  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  const filePath = projectFile(id);
  if (existsSync(filePath)) rmSync(filePath);

  return { status: 'success' };
}
