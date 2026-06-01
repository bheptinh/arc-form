import db from './db.js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8'));

// Single dev user. Auth is not validated server-side for now — all requests
// use this user. Replace with real auth when multi-user support is needed.
export const DEV_USER_ID = '57022071-c204-6e51-1e36-78691b317b3f';

db.prepare(`
  INSERT OR IGNORE INTO users (id, email, name, plan)
  VALUES (?, 'varjatua@gmail.com', 'Bohdan Heptinh', 'pro')
`).run(DEV_USER_ID);
