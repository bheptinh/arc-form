import db from './db.js';

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         TEXT    PRIMARY KEY,
    email      TEXT    NOT NULL,
    name       TEXT    NOT NULL DEFAULT '',
    plan       TEXT    NOT NULL DEFAULT 'free',
    tips       TEXT    NOT NULL DEFAULT '{}',
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    hash       TEXT    NOT NULL UNIQUE,
    user_id    TEXT    NOT NULL REFERENCES users(id),
    name       TEXT    NOT NULL DEFAULT '',
    json_data  TEXT    NOT NULL DEFAULT '{}',
    view_only  INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id                  TEXT    PRIMARY KEY,
    external_id         INTEGER UNIQUE,
    type                TEXT,
    name                TEXT    NOT NULL DEFAULT '',
    description         TEXT    NOT NULL DEFAULT '',
    plan                TEXT,
    appointment         TEXT,
    width               REAL,
    height              REAL,
    depth               REAL,
    position_x          REAL,
    position_y          REAL,
    position_z          REAL,
    fixed_size          INTEGER NOT NULL DEFAULT 0,
    is_original_model   INTEGER NOT NULL DEFAULT 0,
    original_entity_id  TEXT,
    user_key            TEXT,
    lang_id             INTEGER
  );

  CREATE TABLE IF NOT EXISTS product_files (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id  TEXT    NOT NULL REFERENCES products(id),
    file_type   TEXT    NOT NULL,
    file_path   TEXT    NOT NULL,
    file_hash   TEXT
  );

  CREATE TABLE IF NOT EXISTS product_material_slots (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id      TEXT    NOT NULL REFERENCES products(id),
    slot_index      INTEGER NOT NULL,
    mesh_name       TEXT,
    default_value   TEXT,
    source          TEXT,
    hash            TEXT,
    add_material_id TEXT    REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id            TEXT    PRIMARY KEY,
    external_id   INTEGER UNIQUE,
    name          TEXT    NOT NULL DEFAULT '',
    parent_id     TEXT    REFERENCES categories(id),
    category_type TEXT    NOT NULL DEFAULT 'product'
  );

  CREATE TABLE IF NOT EXISTS product_categories (
    product_id  TEXT    NOT NULL REFERENCES products(id),
    category_id TEXT    NOT NULL REFERENCES categories(id),
    PRIMARY KEY (product_id, category_id)
  );

  CREATE TABLE IF NOT EXISTS product_tags (
    product_id  TEXT    NOT NULL REFERENCES products(id),
    tag         TEXT    NOT NULL,
    PRIMARY KEY (product_id, tag)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    user_id    TEXT    NOT NULL REFERENCES users(id),
    product_id TEXT    NOT NULL REFERENCES products(id),
    PRIMARY KEY (user_id, product_id)
  );
`);

// Single dev user. Auth is not validated server-side for now — all requests
// use this user. Replace with real auth when multi-user support is needed.
export const DEV_USER_ID = '57022071-c204-6e51-1e36-78691b317b3f';

db.prepare(`
  INSERT OR IGNORE INTO users (id, email, name, plan)
  VALUES (?, 'varjatua@gmail.com', 'Bohdan Heptinh', 'pro')
`).run(DEV_USER_ID);
