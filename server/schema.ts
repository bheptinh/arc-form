import db from './db.js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8'));

// Column migrations for existing DBs (CREATE TABLE IF NOT EXISTS won't add new columns)
try { db.exec(`ALTER TABLE users ADD COLUMN language_code TEXT NOT NULL DEFAULT 'en'`); } catch { /* already exists */ }
try { db.exec(`ALTER TABLE users ADD COLUMN show_tips INTEGER NOT NULL DEFAULT 1`); } catch { /* already exists */ }
try { db.exec(`ALTER TABLE users DROP COLUMN tips`); } catch { /* already dropped */ }
try { db.exec(`ALTER TABLE users ADD COLUMN subscription_news INTEGER NOT NULL DEFAULT 0`); } catch { /* already exists */ }
try { db.exec(`ALTER TABLE users ADD COLUMN auto_save INTEGER NOT NULL DEFAULT 1`); } catch { /* already exists */ }
try { db.exec(`ALTER TABLE projects ADD COLUMN archived_at TEXT`); } catch { /* already exists */ }

// Single dev user. Auth is not validated server-side for now — all requests
// use this user. Replace with real auth when multi-user support is needed.
export const DEV_USER_ID = '57022071-c204-6e51-1e36-78691b317b3f';

db.prepare(`
  INSERT OR IGNORE INTO users (id, email, name)
  VALUES (?, 'varjatua@gmail.com', 'Bohdan Heptinh')
`).run(DEV_USER_ID);
