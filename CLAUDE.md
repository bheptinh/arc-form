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

### Types — `src/types/planner.ts`
`Point`, `Wall`, `Opening`, `Viewport`, `ToolType`, `SwingDir`

### Geometry — `src/geometry/`
- `snap.ts` — `snapToGrid`, `snapPointToGrid`, `findSnapPoint`
- `wallGeometry.ts` — `wallToQuad` returns a 4-corner polygon in world mm
  - No miter correction yet; proper corner joins added in Week 2

### Canvas — `src/components/Canvas/`
- `PlannerCanvas.tsx` — Konva `Stage` with `x/y/scaleX/Y` from viewport, ResizeObserver fills container
- `GridLayer.tsx` — draws only visible grid lines, stroke width counter-scaled for 1 px at any zoom
- `WallLayer.tsx` — stub (Week 2)
- `OpeningLayer.tsx` — stub (Week 4)

### Viewport hook — `src/hooks/useViewport.ts`
- `handleWheel` — zooms toward pointer, clamps to `MIN_SCALE/MAX_SCALE`
- `handleDragMove` — syncs Stage `x/y` to store on every drag frame (keeps grid in sync)

### Toolbar — `src/components/Toolbar/Toolbar.tsx`
Keyboard shortcuts: `S` select, `W` wall, `D` door, `N` window. Skips shortcuts when focus is in an input.

### PropertiesPanel — `src/components/PropertiesPanel/PropertiesPanel.tsx`
Displays and edits `defaultWallThickness` (mm). Shows current zoom % and active tool.

## Key Constants — `src/constants.ts`
| Constant | Value | Meaning |
|---|---|---|
| `GRID_MINOR_MM` | 100 | Minor grid spacing |
| `GRID_MAJOR_MM` | 1000 | Major grid spacing |
| `DEFAULT_SCALE` | 0.15 | px/mm at 100% zoom |
| `DEFAULT_WALL_THICKNESS_MM` | 200 | 20 cm |
| `SNAP_RADIUS_PX` | 12 | Snap threshold in screen pixels |

## Roadmap
- **Week 1** ✅ Boilerplate: canvas, grid, pan/zoom, toolbar, store
- **Week 2** — Wall drawing: click to place points, snap, miter corner geometry
- **Week 3** — Wall connectivity: endpoint snapping, move walls, undo/redo
- **Week 4** — Doors + windows: place on wall, constrained drag, swing arc
- **Week 5** — Properties panel expansion, dimension labels, polish
