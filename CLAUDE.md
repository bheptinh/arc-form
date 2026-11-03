# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
```bash
npm run dev        # Vite (port 5115) + Express (port 3015) together
npm run dev:fe     # Vite only
npm run dev:be     # Express only, with tsx hot-reload
npm run build      # vite build → dist/  +  tsc server → dist-server/
npm run start      # production: node dist-server/server/index.js (serves dist/ + /server-api)
npm run preview    # preview vite build only
npm run seed       # seed SQLite DB from source data (reads DB_DIR from .env)
```

## Environment (.env)
```
PORT=3015
DB_DIR=data    # path to SQLite DB dir, relative to project root
S3_ENDPOINT=http://192.168.0.100:3900    # S3-compatible storage for product models (Garage on the home server)
S3_REGION=garage
S3_BUCKET=arc-form-models
S3_ACCESS_KEY_ID=…
S3_SECRET_ACCESS_KEY=…
```

## Repo Layout
```
client/             frontend — Vite + React source, index.html, tsconfig.json
  src/              React source
    api/            React Query fetch helpers + hooks (queryClient, i18n, user, favorites, projects)
      bridges/      query-cache → side-effect subscribers (languageBridge.ts, projectsBridge.ts)
      hooks/        useLanguages, useTranslation, useLanguageChange, …
    pages/          standalone React pages (MarkdownPage, ProjectsPage); /projects, /projects/archive, /renders, /tours and /profile render inside smart-components/common/page-layout.tsx (header + nav + account popups), the constructor doesn't
    shared-components/  generic UI components — no domain imports, no entity-prefixed names (Card, SortBar, …)
    smart-components/   domain-aware components (Redux, R2D); popups/ renders on shared-components/modals, input-forms/ holds extracted forms
    vendor/         R2D engine as ES modules (plannercore.js, user.js, r2d.ts)
  public/           static assets (R2D engine scripts, images)
  vite-plugins/     custom Vite dev-server plugins
    local-first-assets/       serves local assets, falls back to roomtodo.com + caches
    catalog-search-fallback/  intercepts /api/catalog/search, serves mocks + caches
    vite-mock-plugin/         handles remaining /api/ and /api2/ endpoints
shared/             TypeScript types + Zod schemas shared between server and client
  types/            Plain interfaces (User, Language, TranslationMap)
  schemas/          Zod schemas (UserPatchSchema) — server validates, FE uses z.infer<>
server/             Express backend (TypeScript, compiled to dist-server/server/)
  fixtures/         Static data files served by i18n routes (committed to source control)
    languages.json            list of supported languages
    translations/             per-language translation maps (en.json, ua.json, …)
    pages/                    per-language markdown pages — {slug}/{lang}.md, fallback en.md → index.md
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
  files/products/   catalog product models (.glb, .mrtd, previews); dev-only copy, production reads them from S3
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

### Project URLs
`/project/:uuid` opens a project; `/project/new` opens a blank one; bare `/project` redirects to `/projects`. The engine reads the hash from the URL through `getUrlProjectHash()` in `plannercore.js`. Enter `/project/new` with a full page load, because the planner singleton keeps the last scene across client-side routes.

`/view/:uuid` is the read-only viewer used by the Share popup's link and iframe embed. It renders `App` with only the canvas and `ViewerControls` (2D, 3D, walk). `R2D.isViewer` (set once at the top of `plannercore.js`, so it needs a full page load) forces `viewOnly`, blanks the project's user key so everyone is a non-owner, and skips localStorage project copies and autosave.

### View Modes
Active mode is stored in the `viewMode_new` Redux slice. Switching calls `planner[mode].activate()`. Modes:
- `constr` — 2D floor plan constructor (walls, rooms)
- `view3d` — 3D scene view
- `view2d` — 2D top-down view
- `walk` — first-person walkthrough
- `tileConfig` — tile/surface configuration

### Canvas — `client/src/components/center/CenterPanel.tsx`
A plain `<div id="planner">` where R2D mounts its WebGL canvas. Mouse/touch events are caught on this div and forwarded to `planner.scene[eventType]()` or `planner.constr[eventType]()` depending on active mode. Results from R2D calls drive Redux dispatches (showing quick panels, changing control panel mode, etc.).

#### macOS trackpad gestures (constr/2D mode)
- **Pinch** (`WheelEvent` with `ctrlKey: true`) → zoom. On `#canvasConstructor` and the `ArrowAnimation` canvases, `onCanvasWheel` in `WC.WallsEditor` (`plannercore.js:~61050`) dispatches `WHEEL_ZOOM` → `onWheelZoom` in `App.tsx`. Delta is accumulated (threshold 1.5) to slow down sensitivity.
- **Two-finger swipe** (`WheelEvent` with `ctrlKey: false`) → pan. `onCanvasWheel` dispatches `CAMERA_MOVE` and updates `WC.wallsEditor.shiftX/Y`. This also covers the plan-image ruler view (`stateAlignDrawing`). On `canvasViewer3d`, a capture-phase listener (`plannercore.js:~46134`) does the same pan through `R2D.Viewers.cameraMove(-dx, -dy)`.
- **Two-finger press+drag** (mouse events, no wheel) → pan via R2D's built-in drag handling.

### State — `client/src/redux/`
**Redux Toolkit** (not Zustand). The store at `client/src/redux/store.ts` combines these slices:

| Slice | Key purpose |
|---|---|
| `viewMode_new` | Active view mode, previous modes |
| `controlPanel` | Active left-panel mode with history/breadcrumbs per mode |
| `popups` | Which popup is open + its data |
| `quickPanels` | Floating action panels (delete, helper, helper_model, etc.) |
| `user` | Login state, profile, active project |
| `common` | Preloader status, hidden elements, project ownership |
| `topPanel` | Undo/redo availability |
| `constructor` | Wall height, image plan state |
| `metrics` | Units display |
| `tips` | Contextual tips shown to user |

> **Dead code audit (c8d56d48):** knip was run and removed unused Redux slice object exports, dead selectors, their backing reducers, and dead state fields from all slices. If an action or selector appears missing, check that commit before assuming it was never there.

### Shared components — `client/src/shared-components/`
Pure presentational components with no domain imports. Naming follows MUI conventions: describe the shape, not the caller. **Never** prefix with an entity name (`Card` not `ProjectCard`, `SortBar` not `ProjectSortBar`) and never group into domain subdirectories (`shared-components/Card.tsx` not `shared-components/projects/Card.tsx`). The folder itself provides the namespace.

Current components:
- `Card.tsx` — image area + hover action overlay + meta rows. Props: `name`, `preview?`, `modified?`, `created?`, `actions?`, `onClick?` (also sets the pointer cursor), `nameContent?` (replaces the name, e.g. a rename input), `metaContent?` (replaces the date rows), `overlay?` (covers the image, e.g. progress), `className?`.
- `GridPage.tsx` — card-list page shell: title row, scroll area, preloader, responsive grid and "Load more". `PageLayout` owns the page width through `--page-gutter`; `GridPage` centres its content in that width, and the grid only arranges items. Props: `title`, `actions?` (beside the title), `intro?` (above the grid), `isLoading?`, `onLoadMore?`, `children` (grid items).
- `ActionList.tsx` — vertical list of full-width clickable items with an animated hover frame, used for left-panel catalogs and tool lists. `ActionList` props: `size?` (`big`, default: 160px tile with the label over the image; `small`: 72px row, icon column + label), `iconFit?` (`cover`, default, fills the icon cell for photos; `contain` keeps glyph icons whole). `ActionList.Item` props: `icon` (ReactNode, e.g. `<img>` or a Tabler icon), `label` (ReactNode), `active?`, `onClick`.
- `TileGrid.tsx` — wrapping grid of square-image tiles with an animated hover frame, used for left-panel product and material catalogs. `TileGrid` props: `size?` (`big`, default, one per row; `medium`, two; `small`, four, title hidden). Parts: `TileGrid.Item` (`active?` shows the frame in accent), `TileGrid.Media` (holds the `<img>`, corners and bar), `TileGrid.Title` (two-line clamp), `TileGrid.Corner` (round icon button; `position` `top-left`/`top-right`/`bottom-right`, `reveal` `always`/`hover`/`idle`), `TileGrid.Bar` (slides up over the image on hover), `TileGrid.Overlay` (covers the tile, e.g. to start a drag). All parts pass through div props, so callers can keep marker classes for DOM queries.
- `SortBar.tsx` — dropdown + direction toggle. Props: `options[]`, `activeLabel`, `direction`, `onOptionSelect`, `onDirectionToggle`.
- `inputs/` — form controls: `text-input.tsx` (`inset` adds the auth-form side padding, `inputClassName` styles the field), `text-area.tsx`, `radio.tsx`, `checkbox.tsx`, `button.tsx` (`variant`: `primary` or `secondary`, defaults to `type="button"`), `icon-button.tsx` (icon-only; `label` sets `aria-label` and the tooltip, `to` renders a router `Link`, otherwise a `<button>`).
- `modals/default.tsx` — modal frame for all popups. `DefaultModal.Actions` is the bottom button row, placed where the row sits so submit buttons stay inside their `<form>`. It has no top margin by default; `spaced` adds 17px and `align="between"` spreads the buttons. With `title` it renders the blue header band and fixed width; without it, the popup supplies its own title and sizing through `className` and `contentClassName`. Pass `visible` when the popup animates its own programmatic close (the modal then calls `onClose` immediately); otherwise the modal handles the 500ms close animation.

### Styling
Migrating from **react-jss** (`createUseStyles`) to **CSS Modules**. The routed pages (`client/src/pages/`), `page-layout.tsx` and the components they use are already on CSS Modules; the constructor UI is still on JSS. Write new components with a `<name>.module.css` beside the component and `import classes from './<name>.module.css'`.

`classes.x` is `undefined` if `.x` has no rules, so don't keep empty classes. Wrap a class that isn't defined in the module in `:global(...)`, or it gets hashed.

Colours are CSS variables in `client/src/tokens.css`, loaded first in `main.tsx`. Use `var(--color-…)` in CSS and style objects, but not in canvas `fillStyle`, `THREE.Color` or `url()` data URIs, where `var()` doesn't work.

**Migration goal: CSS Modules is the only styling system.** We chose it over Tailwind, MUI and staying on JSS. All remaining JSS, `client/src/index.css` and `client/public/roomtodo/src_designer/css/style.css` move to CSS Modules, then `react-jss` is removed. Migrate incrementally.
- **New code:** CSS Modules only. Don't add `createUseStyles`, and don't add Tailwind or MUI. If a component needs hard behaviour such as a combobox, use a headless library (Radix, Base UI) wrapped in `shared-components`.
- **Converting JSS:** generate the CSS from the existing sheet with JSS rather than rewriting it by hand, so its property sorting and `px` units are preserved. Import the module after child components, and raise specificity for overrides of a child's styles (`.wrap .child`), because load order changes during hot reload.
- **Global stylesheets:** the engine sets and queries literal class names, such as `viewer-canvas`, and hashing would break them. Rules for engine classes stay global in one small file; only rules used by React alone move into modules. Delete unused rules after checking each one, because some classes are applied dynamically.
- **`plannercore.js`:** don't change its class names as part of this migration.
- **Colours:** tokens hold exact existing values. Near-duplicates are merged in separate steps, using perceptual distance (CIEDE2000) and a check that no hover or border pair relies on the difference. Merged so far: ΔE ≤ 1.5.
- **Still to do:** font size and spacing tokens.

### UI Layout — `client/src/App.tsx`
```
TopPanel      — project name, undo/redo, save, share
LeftMain      — left sidebar with ControlPanel + DynamicPanel (catalog, selected-object props)
CenterPanel   — canvas area (R2D engine)
RightPanel    — view mode toggle (2D/3D/constr), settings
BottomPanel   — zoom, ruler, center, fullscreen buttons
Popups        — all modal dialogs rendered by `smart-components/popups/index.tsx` (ConfirmPopup handles the `confirm` Redux slot as a real two-button dialog; handles `project_delete` and `project_copied_open` types; stubs all others)
QuickPanels   — floating contextual action panels (positioned near selected object)
```

> **TODO: delete `client/src/components/popups/`.** All popups moved to `smart-components/popups/`. The folder only holds the old `_*.tsx` versions, kept for reference, and nothing imports them. Before deleting, decide whether the rewritten login and registration popups need the phone-only `onTapToClose` listener from `_LoginPopup.tsx` and `_RegistrationPopup.tsx`.

### Left Panel — `client/src/components/left_new/`
`ControlPanel` holds named modes (furniture, decor, constructor, selectedModel, etc.). Each mode has a `history` array for back-navigation and `breadCrumbs` for display. `DynamicPanel` renders the active mode's content from `parts/dynamicPanel/panels/`.

### React Query — `client/src/api/`
**@tanstack/react-query** manages all server state. Key files:
- `queryClient.ts` — singleton `QueryClient`; imported directly by vendor JS and bridge modules
- `i18n.ts` — `languagesQueryOptions`, `translationQueryOptions`, `setLanguage()`
- `user.ts` — `fetchUser()`, `userQueryOptions`, `patchUser()`
- `favorites.ts` — `favoritesQueryOptions` (`staleTime: Infinity` — invalidate on add/remove mutations)
- `catalog.ts` — `materialsNavQueryOptions`, `useCatalogMaterials()` hook; fetches `/server-api/catalog/materials/nav`, unwraps to `materials[]` directly
- `projects.ts` — `Project` type (includes `preview?: string`), `projectsInfiniteQueryOptions`, `deleteProject()`, `renameProject()`, `copyProject()`
- `hooks/useLanguages.ts`, `hooks/useTranslation.ts` — component hooks (data always present after init)
- `hooks/useLanguageChange.ts` — mutation: PATCHes user, invalidates languages + translation queries
- `bridges/languageBridge.ts` — query cache subscriber (see pattern below)
- `bridges/projectsBridge.ts` — listens to `planner.scene.PROJECTS_UPDATE` → invalidates `['projects']`

Components use `useTranslation()` / `useLanguages()` instead of Redux selectors. Data is pre-fetched via `queryClient.ensureQueryData()` in `main.tsx` before React renders, so hooks never see a loading state.

#### Patterns: XHR → React Query migration

See agent **`xhr-to-react-query`** (`.claude/agents/xhr-to-react-query.md`) for full guidance on:
- Replacing R2D XHR reads with React Query cache reads (vendor files, `getQueryData`)
- Writing pure `useMutation` definitions and handling side effects in `useEffect([mutation.status])`
- Bridge pattern for cross-cutting query → side-effect wiring (`client/src/api/bridges/`)
- Which `URL_*` entries in `index.html` are safe to remove vs. still needed by R2D

React Query mutations that bypass R2D (delete, rename, copy for projects) invalidate `['projects']` directly from `useEffect` instead of relying on the bridge. R2D-driven saves fire `PROJECTS_UPDATE` → `projectsBridge` invalidates the cache.

### Initialization — `client/src/main.tsx`
Sequential async init before React renders:
1. `queryClient.ensureQueryData(userQueryOptions)` — fetches user profile into cache
2. `queryClient.ensureQueryData(favoritesQueryOptions)` — fetches favorites into cache
3. `queryClient.ensureQueryData(languagesQueryOptions)` — fetches language list into cache
4. `queryClient.ensureQueryData(translationQueryOptions)` — fetches translations into cache
5. `user.checkIsLogged()` — reads user + favorites from cache, calls `user.setUserData()`, sets `R2D.isLoggedStatus`
6. `planner.init()` — initializes R2D engine (vendor `load()` functions read from cache populated above)
7. Load catalog materials, product tree, panoramas
8. `setupLanguageBridge()` — mount query cache subscriber for language-change side effects
9. `setupProjectsBridge()` — mount R2D event listener for project list invalidation
10. `createRoot(...).render(...)` — mount React app wrapped in `QueryClientProvider`

### Vite Plugins — `client/vite-plugins/` and `client/roomtodo/mock/`

Three dev-server plugins intercept network requests so the app works offline/locally:

**`client/vite-plugins/local-first-assets/`** — intercepts static asset URLs (`/src_designer/images/`, `/Assets/css/`, `/files/products/`, `/files/categories/`). Serves `/files/products/` from `$DB_DIR/files/products/` and everything else from `client/public/roomtodo/{url}` if the file exists; otherwise fetches from `https://roomtodo.com` and caches it. Known MIME types include `.mrtd` (R2D proprietary binary model format → `application/octet-stream`).

**`client/vite-plugins/catalog-search-fallback/`** — intercepts `/api/catalog/search?...`. Derives a flat filename from query params and looks it up in `client/vite-plugins/catalog-search-fallback/mocks/`. Falls back to roomtodo.com and caches on miss.

Filename convention:
- `?ids=41805` → `ids-41805.json`
- `?ids=260,354` → `ids-260_354.json` (commas → underscores)
- `?category_id=8450` → `category-8450.json`
- `?category_id=695&category_type=1` → `category-695-1.json`
- `?category_tag=moldings` → `tag-moldings.json`

**`client/vite-plugins/vite-mock-plugin/vite-mock-plugin.js`** — handles remaining `/api/` and `/api2/` endpoints (renders, planner connect) via static JSON/JS files in `mock/`. Language and translation endpoints were removed — R2D now reads those from React Query cache directly.

### Backend — `server/`

Express 5 app on port 3015 (set via `PORT` env). All routes use the `/server-api` prefix to avoid conflicts with Vite mock plugins that own `/api/` and `/api2/`. In production, also serves the Vite build from `dist/`, uploaded files from `data/uploads/`, and product models from S3.

**Product models:** `product_files.file_path` keeps relative paths (`/files/products/…`), and only config says where they're stored. In dev the `local-first-assets` plugin serves them from `$DB_DIR/files/products/`; in production `GET /files/products/*` streams them from the S3 bucket under the same key. The bucket stays private. To add new models to S3, run `aws s3 sync data/files/products s3://$S3_BUCKET/files/products`.

**Database:** better-sqlite3, WAL mode. UUID TEXT primary keys throughout. Schema is in `server/schema.sql` — all tables use `CREATE TABLE IF NOT EXISTS` so the file is re-run on every startup safely.

**Auth:** No auth implemented. All requests use `DEV_USER_ID` hardcoded in `server/schema.ts`.

> **Project sharing and auth — must be covered when auth is implemented.** Today there is no access control: anyone who can reach the server can list, open, save, rename, copy or delete any project, so don't deploy publicly with real user projects. The `/view/:uuid` viewer and the `view_only` flag ("forbid to copy/edit") only limit the UI, and neither is enforced by the API. Auth work must:
> - Make projects private by default, with ownership checks on every project route, including `/sharing`, `/copy`, render and camera-view routes.
> - Enforce `view_only` on the server.
> - Replace the project UUID in share links with a separate revocable token (for example `/view/<token>`), plus a read-only endpoint that resolves it, so `/view` no longer needs an owner-only project route.
> - Drop the `user_key` comparison in the client as the only ownership check.

#### Route map

| Method | Path | Handler | Notes |
|---|---|---|---|
| GET | `/server-api/catalog/products/nav` | catalog/index.ts | product nav tree from `nav-tree.json` |
| GET | `/server-api/catalog/materials/nav` | catalog/index.ts | materials nav tree from `materials-tree.json` |
| GET | `/server-api/catalog/products` | catalog/index.ts | supports `?my=1` (the user's uploaded models and materials, newest first), `?query=`, `?category_tag=`, `?ids=` (catalog products plus the user's own uploads) |
| GET | `/server-api/catalog/collections/:id` | catalog/index.ts | products in a category |
| GET | `/server-api/catalog/favorites` | catalog/index.ts | merged catalog + user upload (model and material) favorites |
| POST | `/server-api/catalog/favorites/:id` | catalog/index.ts | add favorite (UUID of a catalog product or one of the user's uploads) |
| DELETE | `/server-api/catalog/favorites/:id` | catalog/index.ts | remove favorite |
| POST | `/server-api/catalog/private/products/upload` | catalog/private.ts | multer upload (preview, source, svg, metaZip) |
| POST | `/server-api/catalog/private/products` | catalog/private.ts | create user model record |
| PUT | `/server-api/catalog/private/products/:id` | catalog/private.ts | update user model |
| DELETE | `/server-api/catalog/private/products/:id` | catalog/private.ts | delete user model (slots cascade) |
| GET | `/server-api/catalog/private/products` | catalog/private.ts | list user models |
| GET | `/server-api/catalog/private/products/:id` | catalog/private.ts | get single user model |
| POST | `/server-api/catalog/private/materials/upload` | catalog/private.ts | save a material, poster or carpet from the engine's material creator: URL-encoded form with base64 `source` (engine package, saved as `.mrtd`) and `preview` |
| DELETE | `/server-api/catalog/private/materials/:id` | catalog/private.ts | delete custom material |
| DELETE | `/server-api/catalog/private/uploads/:id` | catalog/private.ts | delete one of the user's uploads, model or material, with its files and favourite; used by the tiles' delete button |
| GET | `/server-api/projects` | projects.ts | list user projects (`?limit=&offset=`, `?archived=1` lists the archive, `?sort=modified\|opened&dir=asc\|desc`, default `modified desc`) |
| POST | `/server-api/projects` | projects.ts | create project |
| GET | `/server-api/projects/:id` | projects.ts | load project |
| PUT | `/server-api/projects/:id` | projects.ts | save project (full scene payload) |
| PATCH | `/server-api/projects/:id` | projects.ts | rename project (`{ name }`) |
| POST | `/server-api/projects/:id/copy` | projects.ts | copy project (`{ name }`) |
| GET | `/server-api/projects/:id/sharing` | projects.ts | read view-only flag → `{ viewOnly }` |
| PUT | `/server-api/projects/:id/sharing` | projects.ts | set view-only flag (`{ view_only }`) |
| PUT | `/server-api/projects/:id/archive` | projects.ts | archive or restore (`{ archived }`); archived projects return 404 from `GET /:id` |
| DELETE | `/server-api/projects/:id` | projects.ts | permanently delete project; the UI offers this only from the archive |
| GET | `/server-api/user` | user.ts | get user profile |
| PATCH | `/server-api/user` | user.ts | update user profile (name, email, language_code, show_tips, subscription_news, auto_save) — validated via Zod UserPatchSchema, returns updated User |
| GET | `/server-api/i18n/languages` | i18n.ts | language list with `current` flag from user's saved preference |
| GET | `/server-api/i18n/translation` | i18n.ts | flat `Record<string,string>` for user's current language, falls back to `en` |
| GET | `/server-api/i18n/pages/:slug` | i18n.ts | markdown page content from `server/fixtures/pages/{slug}/{lang}.md`, fallback `en.md` → `index.md` |
| GET | `/server-api/render` | renders.ts | list renders (`?limit=&offset=`) |
| POST | `/server-api/render` | renders.ts | submit render job (`{ renderType, renderView, renderOrientation, projectData, cameraData, frameData }`) |
| GET | `/server-api/render/env` | renders.ts | render environment presets (stub — returns empty list) |
| GET | `/server-api/render/:id` | renders.ts | get render output URL → `{ url }` |
| PUT | `/server-api/render/restart/:id` | renders.ts | re-queue a failed render |
| DELETE | `/server-api/render/:id` | renders.ts | soft-delete render |
| GET | `/server-api/tours` | tours.ts | list 360° tours |
| DELETE | `/server-api/tours/:id` | tours.ts | delete tour |
| GET | `/server-api/camera-views` | camera-views.ts | list a project's saved render cameras (`?plan_id=`) |
| POST | `/server-api/camera-views` | camera-views.ts | save camera view (`{ preview, config, plan_entity_id }`) |
| DELETE | `/server-api/camera-views/:id` | camera-views.ts | delete camera view + preview file |
| GET | `/uploads/*` | static | user-uploaded files from `data/uploads/` |
| GET | `/files/products/*` | files.ts | product model files streamed from S3 (`services/storage.ts`), cached for a year |

#### Catalog item shape

`buildItem` (catalog.ts) and `buildUploadedItem` (catalog-private.ts) both return the same shape. Key fields:

- `id` — UUID string (NOT the integer external_id — changed to enable UUID-based favorites)
- `externalId` — integer (legacy; used for R2D pool dual-indexing; see note below)
- `source.body.materials[]` — material slots: `{ id, default, name, source, hash }`

#### R2D pool dual-indexing (plannercore.js patch)

`R2D.Pool.addProductData` is patched to index products under **both** UUID and integer externalId:

```js
R2D.Pool._products_data[productData.productId] = productData;
if (productData.externalId != null) {
    R2D.Pool._products_data[productData.externalId] = productData;
}
```

This allows legacy saved projects (which stored integer productIds) to still resolve after the `id` field was changed from externalId to UUID.

#### Render item shape

`renders` table columns: `id`, `user_id`, `render_type` (integer: 3=2K, 4=4K, 5=360°), `render_view`, `render_orientation`, `status`, `preview`, `image_url`, `created_at` (Unix timestamp integer).

`POST /server-api/render` body (sent as JSON by `user.makeRender()`):
```json
{
  "renderType": 3,
  "renderView": "interior" | "top" | "exterior",
  "renderOrientation": "landscape" | "portrait",
  "renderData": { "environment": null },
  "projectData": "<base64 data-URL of JSZip containing content.json>",
  "frameData": { "screenWidth", "screenHeight", "frameWidth", "frameHeight" },
  "cameraData": { "type", "fov", "pan", "tilt", "distance", "position", "anchor", "clipping", "rotation" }
}
```

`content.json` inside the ZIP: full scene state from `getSceneState(true)` — `scene.products[]`, `construction`, `preview` (base64 JPEG screenshot), `modelsZipSrc`, light info, etc.

Render status lifecycle: `waiting → rendering → stored` (done) or `error`.

> **TEMPORARY — needs the Puppeteer worker.** Rendering is not real yet. `POST /server-api/render` finishes inside the request: 2K/4K save the viewport screenshot from `content.json` to `uploads/renders/<id>/preview.jpg` and use it as both `preview` and `image_url`, so the image is only viewport resolution. 360° renders go straight to `error`, and `PUT /server-api/render/restart/:id` always refuses because `projectData` isn't kept. Renders created before this change stay `stored` with null images. Search for `TEMPORARY` in `server/services/renders.ts` when replacing this; the worker plan is the TODO in `server/routes/renders.ts`.

List response item shape: `{ id, renderId, type ("2K"|"4K"|"360"), status, preview, actions: { open: { link } } | undefined, created (Unix timestamp) }`. Both `id` and `renderId` are the same UUID (client uses `renderId` for API calls, `id` as React key and display).

The client polls `GET /server-api/render?limit=20&offset=0` every 15 seconds after submitting a job. When a render transitions to `stored` or `error`, R2D fires `RENDERS_UPDATE` → shows a toast, and `RENDERS_DATA_UPDATED` → refreshes the popup list.

#### Tour item shape

`tours` table columns: `id`, `user_id`, `name`, `status`, `preview`, `created_at`, `updated_at` (both TEXT datetime).

List response item shape: `{ h (id), name, status, preview, edit ("/tours/{id}/edit"), view ("/tours/{id}"), delete ("/server-api/tours/{id}"), createdAt, updatedAt }`.

Tour creation opens an iframe to `R2D.URL.DOMAIN + /tours/add` (roomtodo.com's tour builder). When saved, the iframe sends a `tour_360_save` postMessage → `UPDATE_TOURS` event → list refreshes. **Tour creation doesn't work locally** until a local tour builder page is implemented at `/tours/add`. The `edit` and `view` URL paths are similarly non-functional locally.

`ConfirmPopup` handles `render_delete` (calls `user.deleteRender`, fires `RENDERS_DATA_UPDATED`) and `tour_delete` (calls `user.uTours360_delete`, fires `UPDATE_TOURS`). Both were no-ops before.

#### Not yet implemented

- **`GET /server-api/catalog/set-tree?set_id=<id>`** — material sets (curated per-slot material collections). See `docs/set-tree.md` for full spec. Trigger requires `product_material_slots.set_id` column (not in schema yet) and set data which must be sourced externally or hand-curated.
- **`/api/planner/connect`** — mocked with TODO: DELETE (no purpose).
- **`URL_DELETE_PRIVATE`** (`/api/planner/delete_private_entity`) — `user.deleteMaterial()` is never called from React UI yet; route exists at `DELETE /server-api/catalog/private/materials/:id` but URL in `index.html` not updated. See TODO comment in `index.html:70`.
- **Render image generation (Puppeteer worker)** — currently a temporary viewport-screenshot stand-in; see the TEMPORARY note under Render item shape. The full pipeline (Puppeteer + R2D engine headless, true 2K/4K WebGL screenshot, 360° cubemap stitch) is described in a TODO comment in `server/routes/renders.ts`.
- **Project sharing access control** — needs auth; see the "Project sharing and auth" note under Backend.
- **Tour creation** — the tour builder iframe targets `R2D.URL.DOMAIN + /tours/add`, which doesn't exist locally. A local tour editor page at `/tours/add` is needed, plus a `POST /server-api/tours` endpoint to persist the tour and its linked 360° render IDs. See TODO in `server/services/tours.ts`.
- **`POST /server-api/tours`** — create tour. Needed when the local tour builder is implemented.
