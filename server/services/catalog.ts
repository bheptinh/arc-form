import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = process.env.DB_DIR;
if (!dbDir) throw new Error('DB_DIR env variable is not set');

const navTreePath = path.resolve(__dirname, '../..', dbDir, 'nav-tree.json');

export function getNavTree() {
  return JSON.parse(readFileSync(navTreePath, 'utf-8'));
}
