import { create } from 'zustand';
import { DEFAULT_SCALE, DEFAULT_WALL_THICKNESS_MM } from '../constants';
import type { Opening, Point, ToolType, Viewport, Wall } from '../types/planner';

export interface DrawingState {
  startPointId: string;
  previewX: number;
  previewY: number;
}

type Snapshot = { points: Record<string, Point>; walls: Record<string, Wall> };

interface PlannerState {
  points: Record<string, Point>;
  walls: Record<string, Wall>;
  openings: Record<string, Opening>;

  tool: ToolType;
  selectedId: string | null;
  defaultWallThickness: number;
  viewport: Viewport;
  drawing: DrawingState | null;

  past: Snapshot[];
  future: Snapshot[];
}

interface PlannerActions {
  setTool: (tool: ToolType) => void;
  setViewport: (v: Partial<Viewport>) => void;
  setDefaultWallThickness: (mm: number) => void;
  selectElement: (id: string | null) => void;

  beginWall: (x: number, y: number, reusePointId?: string) => void;
  extendWall: (x: number, y: number, reusePointId?: string) => void;
  updateDrawingPreview: (x: number, y: number) => void;
  cancelDrawing: () => void;

  movePoint: (pointId: string, x: number, y: number) => void;
  moveWall: (wallId: string, dx: number, dy: number) => void;
  setWallThickness: (wallId: string, mm: number) => void;
  deleteSelected: () => void;
  undo: () => void;
  redo: () => void;
}

function snap(s: PlannerState): Pick<PlannerState, 'past' | 'future'> {
  return { past: [...s.past, { points: s.points, walls: s.walls }], future: [] };
}

const initialState: PlannerState = {
  points: {},
  walls: {},
  openings: {},
  tool: 'select',
  selectedId: null,
  defaultWallThickness: DEFAULT_WALL_THICKNESS_MM,
  viewport: { x: 0, y: 0, scale: DEFAULT_SCALE },
  drawing: null,
  past: [],
  future: [],
};

export const usePlannerStore = create<PlannerState & PlannerActions>((set) => ({
  ...initialState,

  setTool: (tool) => set({ tool }),
  setViewport: (v) => set((s) => ({ viewport: { ...s.viewport, ...v } })),
  setDefaultWallThickness: (mm) => set({ defaultWallThickness: mm }),
  selectElement: (id) => set({ selectedId: id }),

  beginWall: (x, y, reusePointId) =>
    set((s) => {
      const id = reusePointId ?? crypto.randomUUID();
      const points = reusePointId ? s.points : { ...s.points, [id]: { id, x, y } };
      return { points, drawing: { startPointId: id, previewX: x, previewY: y } };
    }),

  extendWall: (x, y, reusePointId) =>
    set((s) => {
      if (!s.drawing) return {};
      const { startPointId } = s.drawing;
      const startPt = s.points[startPointId];
      if (!startPt) return {};

      const dx = x - startPt.x;
      const dy = y - startPt.y;
      if (Math.sqrt(dx * dx + dy * dy) < 10) return {};

      const endId = reusePointId ?? crypto.randomUUID();
      const points = reusePointId ? s.points : { ...s.points, [endId]: { id: endId, x, y } };

      const wallId = crypto.randomUUID();
      const wall: Wall = {
        id: wallId,
        startId: startPointId,
        endId,
        thickness: s.defaultWallThickness,
      };

      return {
        ...snap(s),
        points,
        walls: { ...s.walls, [wallId]: wall },
        drawing: { startPointId: endId, previewX: x, previewY: y },
      };
    }),

  updateDrawingPreview: (x, y) =>
    set((s) => (s.drawing ? { drawing: { ...s.drawing, previewX: x, previewY: y } } : {})),

  cancelDrawing: () =>
    set((s) => {
      if (!s.drawing) return {};
      const { startPointId } = s.drawing;
      const hasWalls = Object.values(s.walls).some(
        (w) => w.startId === startPointId || w.endId === startPointId,
      );
      if (!hasWalls) {
        const { [startPointId]: _removed, ...rest } = s.points;
        return { drawing: null, points: rest };
      }
      return { drawing: null };
    }),

  movePoint: (pointId, x, y) =>
    set((s) => ({
      ...snap(s),
      points: { ...s.points, [pointId]: { ...s.points[pointId], x, y } },
    })),

  moveWall: (wallId, dx, dy) =>
    set((s) => {
      const wall = s.walls[wallId];
      if (!wall) return {};
      const sp = s.points[wall.startId];
      const ep = s.points[wall.endId];
      if (!sp || !ep) return {};
      return {
        ...snap(s),
        points: {
          ...s.points,
          [wall.startId]: { ...sp, x: sp.x + dx, y: sp.y + dy },
          [wall.endId]:   { ...ep, x: ep.x + dx, y: ep.y + dy },
        },
      };
    }),

  setWallThickness: (wallId, mm) =>
    set((s) => {
      const wall = s.walls[wallId];
      if (!wall) return {};
      return {
        ...snap(s),
        walls: { ...s.walls, [wallId]: { ...wall, thickness: mm } },
      };
    }),

  deleteSelected: () =>
    set((s) => {
      const { selectedId } = s;
      if (!selectedId || !s.walls[selectedId]) return {};

      const wall = s.walls[selectedId];
      const { [selectedId]: _w, ...walls } = s.walls;

      // Remove points that are no longer connected to any remaining wall
      const orphans = [wall.startId, wall.endId].filter(
        (ptId) => !Object.values(walls).some((w) => w.startId === ptId || w.endId === ptId),
      );
      const points = { ...s.points };
      for (const id of orphans) delete points[id];

      return { ...snap(s), walls, points, selectedId: null };
    }),

  undo: () =>
    set((s) => {
      if (s.past.length === 0) return {};
      const prev = s.past[s.past.length - 1];
      return {
        past: s.past.slice(0, -1),
        future: [{ points: s.points, walls: s.walls }, ...s.future],
        points: prev.points,
        walls: prev.walls,
        selectedId: null,
        drawing: null,
      };
    }),

  redo: () =>
    set((s) => {
      if (s.future.length === 0) return {};
      const next = s.future[0];
      return {
        past: [...s.past, { points: s.points, walls: s.walls }],
        future: s.future.slice(1),
        points: next.points,
        walls: next.walls,
        selectedId: null,
        drawing: null,
      };
    }),
}));
