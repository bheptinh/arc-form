CREATE TABLE IF NOT EXISTS users (
  id              TEXT    PRIMARY KEY,
  email           TEXT    NOT NULL,
  name            TEXT    NOT NULL DEFAULT '',
  plan            TEXT    NOT NULL DEFAULT 'free',
  tips            TEXT    NOT NULL DEFAULT '{}',
  language_code   TEXT    NOT NULL DEFAULT 'en',
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id         TEXT    PRIMARY KEY,
  user_id    TEXT    NOT NULL REFERENCES users(id),
  name       TEXT    NOT NULL DEFAULT '',
  view_only  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id                  TEXT    PRIMARY KEY,
  external_id         INTEGER UNIQUE,
  type                TEXT,
  name                TEXT    NOT NULL DEFAULT '',
  description         TEXT,
  plan                TEXT,
  appointment         TEXT,
  width               REAL,
  height              REAL,
  depth               REAL,
  position_x          REAL,
  position_y          REAL,
  position_z          REAL,
  contour_top         TEXT,
  contour_cut         TEXT,
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
  external_id   INTEGER,
  name          TEXT    NOT NULL DEFAULT '',
  parent_id     TEXT    REFERENCES categories(id),
  category_type TEXT    NOT NULL DEFAULT 'product',
  UNIQUE(external_id, category_type)
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
  user_id TEXT NOT NULL REFERENCES users(id),
  item_id TEXT NOT NULL,
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS user_models (
  id                 TEXT    PRIMARY KEY,
  user_id            TEXT    NOT NULL REFERENCES users(id),
  type               INTEGER NOT NULL DEFAULT 2,
  name               TEXT,
  width              REAL,
  height             REAL,
  depth              REAL,
  position_y         REAL,
  contour_top        TEXT,
  contour_cut        TEXT,
  appointment        TEXT,
  source_path        TEXT,
  preview_path       TEXT,
  svg_path           TEXT,
  svg_outline_path   TEXT,
  meta_zip_path      TEXT,
  tags               TEXT,
  public             INTEGER NOT NULL DEFAULT 0,
  original_entity_id TEXT,
  is_original_model  INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_model_slots (
  id              TEXT    PRIMARY KEY,
  model_id        TEXT    NOT NULL REFERENCES user_models(id) ON DELETE CASCADE,
  slot_index      INTEGER NOT NULL,
  mesh_name       TEXT,
  default_value   TEXT,
  source          TEXT,
  hash            TEXT,
  add_material_id TEXT,
  add_material    TEXT,
  set_id          TEXT
);

CREATE TABLE IF NOT EXISTS user_materials (
  id           TEXT    PRIMARY KEY,
  user_id      TEXT    NOT NULL REFERENCES users(id),
  type_id      INTEGER,
  source_path  TEXT,
  preview_path TEXT,
  width        REAL,
  height       REAL,
  depth        REAL,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);
