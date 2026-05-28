# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
```bash
npm run dev        # Vite (port 5115) + Express (port 3001) together
npm run dev:fe     # Vite only
npm run dev:be     # Express only, with tsx hot-reload
npm run build      # vite build → dist/  +  tsc server → dist-server/
npm run start      # production: node dist-server/index.js (serves dist/ + /server-api)
npm run preview    # preview vite build only
```

## Repo Layout
```
client/       frontend — Vite + React source, index.html, tsconfig.json
  client/src/        React source
  public/     static assets (R2D engine scripts, images)
  roomtodo/   Vite dev mocks + R2D engine JS files
  vite-plugins/ custom Vite dev-server plugins
server/       Express backend (TypeScript, compiled to dist-server/)
dist/         Vite build output (frontend)
dist-server/  tsc build output (server)
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
Express app on port 3001. Add routes under the `/server-api` prefix (avoids conflicts with the R2D mock plugins which own `/api/` and `/api2/`). In production, also serves the Vite build from `dist/`.
