# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
```bash
npm run dev        # Vite (port 5115) + Express (port 3015) together
npm run dev:fe     # Vite only
npm run dev:be     # Express only, with tsx hot-reload
npm run build      # vite build → dist/  +  tsc server → dist-server/
npm run start      # production: node dist-server/index.js (serves dist/ + /server-api)
npm run preview    # preview vite build only
npm run seed       # seed SQLite DB from source data (reads DB_DIR from .env)
```

## Environment (.env)
```
PORT=3015
DB_DIR=data    # path to SQLite DB dir, relative to project root
```

## Repo Layout
```
client/             frontend — Vite + React source, index.html, tsconfig.json
  src/              React source
  public/           static assets (R2D engine scripts, images)
  vite-plugins/     custom Vite dev-server plugins
    local-first-assets/       serves local assets, falls back to roomtodo.com + caches
    catalog-search-fallback/  intercepts /api/catalog/search, serves mocks + caches
    vite-mock-plugin/         handles remaining /api/ and /api2/ endpoints
server/             Express backend (TypeScript, compiled to dist-server/)
  routes/
    catalog/
      index.ts      public catalog routes (/server-api/catalog/...)
      private.ts    user upload routes (/server-api/catalog/private/...)
    projects.ts     project save/load (/server-api/projects/...)
    user.ts         user profile (/server-api/user)
  services/
    catalog.ts      catalog DB queries
    catalog-private.ts  user model/material DB queries + file handling
    projects.ts     project DB queries
    user.ts         user DB queries
  schema.sql        SQLite table definitions (source of truth)
  schema.ts         runs schema.sql on startup (CREATE TABLE IF NOT EXISTS — idempotent)
  db.ts             better-sqlite3 connection, WAL mode
data/               SQLite DB + uploaded files (gitignored, path set by DB_DIR env)
  arcform.db        SQLite database
  uploads/          user-uploaded model/material files
  nav-tree.json     product navigation tree (served by /server-api/catalog/products/nav)
  materials-tree.json  materials navigation tree
docs/               feature documentation
dist/               Vite build output (frontend)
dist-server/        tsc build output (server)
```

## Architecture

This project is a **React UI shell** around the **R2D planner engine** (roomtodo.com). The R2D engine handles all 2D/3D rendering via Three.js and is loaded as pre-built scripts in `index.html`. React is responsible for the surrounding UI — panels, popups, toolbar, state.

### R2D Engine — loaded via `index.html` script tags
The global `R2D` namespace exposes `PlannerCore` and `UserCore`. Both are instantiated in `client/src/initR2D.ts` and imported wherever needed:

```ts
export const user = new R2D.UserCore();
export const planner = new R2D.PlannerCore(user);
```

`planner` has sub-controllers for each view mode: `planner.scene`, `planner.constr`, `planner.view2d`, `planner.view3d`, `planner.walk`. Mouse events are forwarded to these controllers by `CenterPanel`.

### View Modes
Active mode is stored in the `viewMode_new` Redux slice. Switching calls `planner[mode].activate()`. Modes:
- `constr` — 2D floor plan constructor (walls, rooms)
- `view3d` — 3D scene view
- `view2d` — 2D top-down view
- `walk` — first-person walkthrough
- `tileConfig` — tile/surface configuration

### Canvas — `client/src/components/center/CenterPanel.tsx`
A plain `<div id="planner">` where R2D mounts its WebGL canvas. Mouse/touch events are caught on this div and forwarded to `planner.scene[eventType]()` or `planner.constr[eventType]()` depending on active mode. Results from R2D calls drive Redux dispatches (showing quick panels, changing control panel mode, etc.).

### State — `client/src/redux/`
**Redux Toolkit** (not Zustand). The store at `client/src/redux/store.ts` combines these slices:

| Slice | Key purpose |
|---|---|
| `viewMode_new` | Active view mode, previous modes |
| `controlPanel` | Active left-panel mode with history/breadcrumbs per mode |
| `popups` | Which popup is open + its data |
| `quickPanels` | Floating action panels (delete, helper, helper_model, etc.) |
| `user` | Login state, profile, active project |
| `language` | Active language, translations |
| `common` | Preloader status, hidden elements, project ownership |
| `topPanel` | Undo/redo availability |
| `constructor` | Wall height, image plan state |
| `metrics` | Units display |
| `tips` | Contextual tips shown to user |

### Styling
**react-jss** (`createUseStyles`) throughout. Not CSS Modules. Class names are generated at runtime.

### UI Layout — `client/src/App.tsx`
```
TopPanel      — project name, undo/redo, save, share
LeftMain      — left sidebar with ControlPanel + DynamicPanel (catalog, selected-object props)
CenterPanel   — canvas area (R2D engine)
RightPanel    — view mode toggle (2D/3D/constr), settings
BottomPanel   — zoom, ruler, center, fullscreen buttons
Popups        — all modal dialogs rendered in a single component
QuickPanels   — floating contextual action panels (positioned near selected object)
```

### Left Panel — `client/src/components/left_new/`
`ControlPanel` holds named modes (furniture, decor, constructor, selectedModel, etc.). Each mode has a `history` array for back-navigation and `breadCrumbs` for display. `DynamicPanel` renders the active mode's content from `parts/dynamicPanel/panels/`.

### Initialization — `client/src/main.tsx`
Sequential async init before React renders:
1. Load language list + translations
2. Check user login status
3. `planner.init()` — initializes R2D engine
4. Load catalog materials, product tree, panoramas
5. `createRoot(...).render(...)` — mount React app

### Vite Plugins — `client/vite-plugins/` and `client/roomtodo/mock/`

Three dev-server plugins intercept network requests so the app works offline/locally:

**`client/vite-plugins/local-first-assets/`** — intercepts static asset URLs (`/src_designer/images/`, `/Assets/css/`, `/files/products/`, `/files/categories/`). Serves from `client/public/roomtodo/{url}` if the file exists; otherwise fetches from `https://roomtodo.com` and caches it.

**`client/vite-plugins/catalog-search-fallback/`** — intercepts `/api/catalog/search?...`. Derives a flat filename from query params and looks it up in `client/vite-plugins/catalog-search-fallback/mocks/`. Falls back to roomtodo.com and caches on miss.

Filename convention:
- `?ids=41805` → `ids-41805.json`
- `?ids=260,354` → `ids-260_354.json` (commas → underscores)
- `?category_id=8450` → `category-8450.json`
- `?category_id=695&category_type=1` → `category-695-1.json`
- `?category_tag=moldings` → `tag-moldings.json`

**`client/roomtodo/mock/vite-mock-plugin.js`** — handles all other `/api/` and `/api2/` endpoints (language, translations, favorites, planner config, planner save/load) via static JSON files in `client/roomtodo/mock/`.

### Backend — `server/`

Express 5 app on port 3015 (set via `PORT` env). All routes use the `/server-api` prefix to avoid conflicts with Vite mock plugins that own `/api/` and `/api2/`. In production, also serves the Vite build from `dist/` and uploaded files from `data/uploads/`.

**Database:** better-sqlite3, WAL mode. UUID TEXT primary keys throughout. Schema is in `server/schema.sql` — all tables use `CREATE TABLE IF NOT EXISTS` so the file is re-run on every startup safely.

**Auth:** No auth implemented. All requests use `DEV_USER_ID` hardcoded in `server/schema.ts`.

#### Route map

| Method | Path | Handler | Notes |
|---|---|---|---|
| GET | `/server-api/catalog/products/nav` | catalog/index.ts | product nav tree from `nav-tree.json` |
| GET | `/server-api/catalog/materials/nav` | catalog/index.ts | materials nav tree from `materials-tree.json` |
| GET | `/server-api/catalog/products` | catalog/index.ts | supports `?my=1`, `?query=`, `?category_tag=`, `?ids=` |
| GET | `/server-api/catalog/collections/:id` | catalog/index.ts | products in a category |
| GET | `/server-api/catalog/favorites` | catalog/index.ts | merged catalog + user model favorites |
| POST | `/server-api/catalog/favorites/:id` | catalog/index.ts | add favorite (UUID) |
| DELETE | `/server-api/catalog/favorites/:id` | catalog/index.ts | remove favorite |
| POST | `/server-api/catalog/private/products/upload` | catalog/private.ts | multer upload (preview, source, svg, metaZip) |
| POST | `/server-api/catalog/private/products` | catalog/private.ts | create user model record |
| PUT | `/server-api/catalog/private/products/:id` | catalog/private.ts | update user model |
| DELETE | `/server-api/catalog/private/products/:id` | catalog/private.ts | delete user model (slots cascade) |
| GET | `/server-api/catalog/private/products` | catalog/private.ts | list user models |
| GET | `/server-api/catalog/private/products/:id` | catalog/private.ts | get single user model |
| POST | `/server-api/catalog/private/materials/upload` | catalog/private.ts | upload custom material textures |
| DELETE | `/server-api/catalog/private/materials/:id` | catalog/private.ts | delete custom material |
| GET | `/server-api/projects` | projects.ts | list user projects |
| POST | `/server-api/projects` | projects.ts | create project |
| GET | `/server-api/projects/:id` | projects.ts | load project |
| PUT | `/server-api/projects/:id` | projects.ts | save project |
| DELETE | `/server-api/projects/:id` | projects.ts | delete project |
| GET | `/server-api/user` | user.ts | get user profile |
| PATCH | `/server-api/user` | user.ts | update user profile (name, email) |
| GET/PUT | `/server-api/user/tips` | user.ts | tips state |
| GET | `/uploads/*` | static | user-uploaded files from `data/uploads/` |

#### Catalog item shape

`buildItem` (catalog.ts) and `buildUploadedItem` (catalog-private.ts) both return the same shape. Key fields:

- `id` — UUID string (NOT the integer external_id — changed to enable UUID-based favorites)
- `externalId` — integer (legacy; used for R2D pool dual-indexing; see note below)
- `source.body.materials[]` — material slots: `{ id, default, name, source, hash }`
- `plan` — `'free'` string or comma-separated string split to array

#### R2D pool dual-indexing (plannercore.js patch)

`R2D.Pool.addProductData` is patched to index products under **both** UUID and integer externalId:

```js
R2D.Pool._products_data[productData.productId] = productData;
if (productData.externalId != null) {
    R2D.Pool._products_data[productData.externalId] = productData;
}
```

This allows legacy saved projects (which stored integer productIds) to still resolve after the `id` field was changed from externalId to UUID.

#### Not yet implemented

- **`GET /server-api/catalog/set-tree?set_id=<id>`** — material sets (curated per-slot material collections). See `docs/set-tree.md` for full spec. Trigger requires `product_material_slots.set_id` column (not in schema yet) and set data which must be sourced externally or hand-curated.
- **Language/translations** — still mocked in `vite-mock-plugin`. TODO: move to bundled FE i18n (react-i18next).
- **`/api/planner/connect`** — mocked with TODO: DELETE (no purpose).
- **`URL_DELETE_PRIVATE`** (`/api/planner/delete_private_entity`) — `user.deleteMaterial()` is never called from React UI yet; route exists at `DELETE /server-api/catalog/private/materials/:id` but URL in `index.html` not updated. See TODO comment in `index.html:70`.
