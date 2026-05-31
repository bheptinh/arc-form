import Database from 'better-sqlite3';
import path from 'path';

const dbDir = process.env.DB_DIR;
if (!dbDir) throw new Error('DB_DIR env variable is not set');

const db = new Database(path.resolve(dbDir, 'arcform.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
