# BE Plan: Mock → SQLite + Express

## Goal
Replace all Vite mock plugins with real Express routes backed by SQLite.
The Vite plugins stay in place during migration — routes are added one by one,
and each mock endpoint is removed once the real route is working.

---

## 1. Setup

- Install `better-sqlite3` + types in `server/`
- Create `server/db.ts` — opens/creates `data/planner.db`, exports `db`
- Create `server/schema.ts` — runs `CREATE TABLE IF NOT EXISTS` on startup
- Wire `db.ts` init into `server/index.ts` before routes mount

---

## 2. Schema

```sql
users (id, key, email, name, plan, tips, created_at)

projects (id, hash, user_id FK, name, json_data, view_only, created_at, updated_at)

products (
  id, type, name, description, plan,
  appointment, width, height, depth,
  position_x, position_y, position_z,
  fixed_size, is_original_model, original_entity_id,
  user_key, lang_id
)

product_files (
  id, product_id FK,
  file_type,   -- preview | glb | svg_file | svg_outline | meta_zip
  file_path,   -- relative: files/products/{id}/preview.png
  file_hash
)

product_material_slots (
  id, product_id FK, slot_index, mesh_name,
  default_value, source, hash, add_material_id FK nullable
)

categories (id, name, parent_id, category_type)  -- product | material
product_categories (product_id FK, category_id FK)
product_tags (product_id FK, tag)

favorites (user_id FK, product_id FK)
```

Note: `languages` and `translations` tables are NOT needed — language/i18n moves to the frontend.

---

## 3. Seed script

`scripts/seed-db.mjs` — reads all mock JSONs and populates SQLite:

1. Parse `category-tree.json` → `categories`
2. Parse all `catalog-search-fallback/mocks/*.json` → `products`, `product_files`,
   `product_material_slots`, `product_categories`, `product_tags`
   (upsert by id to handle duplicates across files)
3. Seed one dev user row into `users`

Run once: `node scripts/seed-db.mjs`

---

## 4. Static asset serving

Add to `server/index.ts`:
```ts
app.use('/files', express.static('client/public/roomtodo/files'));
app.use('/src_designer', express.static('client/public/roomtodo/src_designer'));
app.use('/Assets', express.static('client/public/roomtodo/Assets'));
```

In production this replaces `local-first-assets` Vite plugin entirely.

---

## 5. Routes (easiest → hardest)

All under `/server-api` prefix for now. Migration strategy:
- When a real route is ready, delete its handler from the mock plugin — nothing else to do.
- After full migration: rename `/server-api` → `/api` and add a catch-all `/api2` → `/api` redirect.
- All `R2D.URL` entries in `index.html` are updated per route as it goes live.

### 5a. No DB needed
- `GET /server-api/projects/config` ✅

### 5b. User
- `GET /server-api/user` ✅

### 5c. Catalog navigation
- `GET /server-api/catalog/products/nav` ✅ — product category nav tree
- `GET /server-api/catalog/materials/nav` ✅ — material category nav tree

### 5d. Favorites
- `GET /server-api/catalog/favorites` — list user's favorites
- `POST /server-api/catalog/favorites/:id` — add favorite
- `DELETE /server-api/catalog/favorites/:id` — remove favorite

### 5e. Catalog products
- `GET /server-api/catalog/collections/:id` — products in a category/collection
- `GET /server-api/catalog/products/:id` — single product by UUID
- `GET /server-api/catalog/products?ids=uuid1,uuid2` — fetch multiple products by UUID

### 5f. Projects
- `GET /server-api/projects/open` — load project by id
- `GET /server-api/projects/open-shared` — load project by hash (view-only)
- `POST /server-api/projects/save` — upsert project by hash
- `POST /server-api/projects/rename` — update project name
- `POST /server-api/projects/copy` — duplicate project row
- `DELETE /server-api/projects/delete` — delete project

---

## 6. Obsolete / FE-bound routes — do NOT implement on backend

These exist in the mock plugin or `R2D.URL` config but have no backend future:

| Mock endpoint | Verdict | Reason |
|---|---|---|
| `POST /api/planner/connect` | **Delete** | No-op with no purpose; remove from mock and `R2D.URL` |
| `GET /api/language/list` | **Move to FE** | Replaced by i18n bundled in the React app |
| `GET /api/user/translations` | **Move to FE** | Same — i18n handles this |
| `POST /api/language/set` | **Move to FE** | Language preference stored client-side |

---

## 7. Auth strategy

For now: API key in query string (matches existing `?key=...` pattern).
Store a single dev user in DB seeded by the seed script.
Add session/JWT later when login UI is needed.
