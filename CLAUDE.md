# 2D Floor Planner

Schematic 2D floor planner: walls, doors, windows. No furniture. Metric only (millimeters).

## Stack
- **React 19 + TypeScript** — Vite, CSS Modules
- **Konva 10 / react-konva** — canvas rendering, drag interactions
- **Zustand 5** — global state

## Commands
```bash
npm run dev      # dev server
npm run build    # tsc + vite build (use this to verify before committing)
npm run preview  # preview prod build
```

## Coordinate System
All world coordinates are in **millimeters**.
- Default scale: `0.15 px/mm` → 1 m = 150 px at 100% zoom
- Stage `x/y` = viewport pan offset (px), `scaleX/Y` = viewport scale (px/mm)
- Grid: minor lines every 100 mm, major lines every 1000 mm
- Zoom range: 0.03–2.0 px/mm, factor 1.12 per wheel tick

## Architecture

### State — `src/store/usePlannerStore.ts`
Single Zustand store. Entities stored as `Record<string, T>` (normalized, not arrays).

Key slices:
- `points` — wall endpoint nodes (world mm)
- `walls` — connect two point IDs, carry `thickness` (mm)
- `openings` — doors/windows placed on a wall via `offset` from start (mm)
- `tool` — active tool: `select | wall | door | window`
- `viewport` — `{ x, y, scale }` synced from Stage on every drag frame
- `past / future` — undo/redo stacks, each snapshot includes `{ points, walls, openings }`

Key actions:
- `beginWall / extendWall / cancelDrawing` — wall drawing flow
- `movePoint / moveWall` — drag walls and endpoints
- `setWallThickness / deleteSelected` — per-wall editing
- `addOpening / updateOpening` — door/window placement and editing
- `undo / redo` — full history across all mutations
- `loadPlan / clearPlan` — JSON import and new-plan reset

Persistence: auto-saves `{ points, walls, openings }` to `localStorage` key `2d-planner-v1` on every mutation. Loaded on startup.

### Types — `src/types/planner.ts`
`Point`, `Wall`, `Opening`, `Viewport`, `ToolType`, `SwingDir`

### Geometry — `src/geometry/`
- `snap.ts` — `snapToGrid`, `snapPointToGrid`, `findSnapPoint`
- `wallGeometry.ts` — `computeWallPolygon` returns a 4-corner miter polygon in world mm; uses `lineIntersect` for proper corner joins, clamped at 4× thickness
- `openingGeometry.ts` — `computeOpeningGeom` returns gap rect, jamb lines, door arc/panel, window panes; `findWallHit` projects cursor onto walls for placement

### Canvas — `src/components/Canvas/`
- `PlannerCanvas.tsx` — Konva `Stage`, routes mouse events by active tool, tracks hover wall for door/window feedback
- `GridLayer.tsx` — draws only visible grid lines, stroke width counter-scaled for 1 px at any zoom
- `WallLayer.tsx` — wall polygons (select/drag/highlight), endpoint dots (drag with snap), drawing preview, snap indicator
- `DimensionLayer.tsx` — wall length labels in meters, counter-scaled, auto-flipped to stay readable
- `OpeningLayer.tsx` — gap overlay, jamb lines, door (panel line + quarter-circle arc) and window (two pane lines) symbols, drag constrained to wall axis

### Viewport hook — `src/hooks/useViewport.ts`
- `handleWheel` — zooms toward pointer, clamps to `MIN_SCALE/MAX_SCALE`
- `handleDragMove` — syncs Stage `x/y` to store on every drag frame (keeps grid in sync)

### Toolbar — `src/components/Toolbar/Toolbar.tsx`
Tool buttons: `S` select, `W` wall, `D` door, `N` window.
Action buttons: Save (download JSON), Open (import JSON), New (clear with confirm).
Keyboard shortcuts skip when focus is in `<input>` or `<select>`.

### PropertiesPanel — `src/components/PropertiesPanel/PropertiesPanel.tsx`
- Selected wall: thickness input (mm)
- Selected door/window: width input (mm), swing toggle (doors only)
- Defaults: default wall thickness
- View: zoom %, active tool

## Key Constants — `src/constants.ts`
| Constant | Value | Meaning |
|---|---|---|
| `GRID_MINOR_MM` | 100 | Minor grid spacing |
| `GRID_MAJOR_MM` | 1000 | Major grid spacing |
| `DEFAULT_SCALE` | 0.15 | px/mm at 100% zoom |
| `DEFAULT_WALL_THICKNESS_MM` | 200 | 20 cm |
| `SNAP_RADIUS_PX` | 12 | Snap threshold in screen pixels |
| `DEFAULT_DOOR_WIDTH_MM` | 900 | Default door width |
| `DEFAULT_WINDOW_WIDTH_MM` | 1200 | Default window width |

## Roadmap
- **Week 1** ✅ Boilerplate: canvas, grid, pan/zoom, toolbar, store
- **Week 2** ✅ Wall drawing: click to place points, snap, miter corner geometry
- **Week 3** ✅ Wall interactivity: select, move endpoints/body, delete, per-wall thickness, undo/redo
- **Week 4** ✅ Doors + windows: place on wall, constrained drag, swing arc, per-opening properties
- **Week 5** ✅ Dimension labels, wall hover feedback, JSON save/load, auto-save to localStorage
