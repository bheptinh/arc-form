import { create } from 'zustand';
import { DEFAULT_SCALE, DEFAULT_WALL_THICKNESS_MM } from '../constants';
import type { Opening, Point, ToolType, Viewport, Wall } from '../types/planner';

export interface DrawingState {
  startPointId: string;
  previewX: number;
  previewY: number;
}

type Snapshot = { points: Record<string, Point>; walls: Record<string, Wall>; openings: Record<string, Opening> };

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

  addOpening: (o: Omit<Opening, 'id'>) => void;
  updateOpening: (id: string, patch: Partial<Omit<Opening, 'id'>>) => void;

  loadPlan: (data: { points: Record<string, Point>; walls: Record<string, Wall>; openings: Record<string, Opening> }) => void;
  clearPlan: () => void;
}

function snap(s: PlannerState): Pick<PlannerState, 'past' | 'future'> {
  return { past: [...s.past, { points: s.points, walls: s.walls, openings: s.openings }], future: [] };
}

const STORAGE_KEY = '2d-planner-v1';

function loadPersistedData(): Pick<PlannerState, 'points' | 'walls' | 'openings'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { points: {}, walls: {}, openings: {} };
    const { points, walls, openings } = JSON.parse(raw);
    return { points: points ?? {}, walls: walls ?? {}, openings: openings ?? {} };
  } catch {
    return { points: {}, walls: {}, openings: {} };
  }
}

const initialState: PlannerState = {
  ...loadPersistedData(),
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
      if (!selectedId) return {};

      // Opening selected
      if (s.openings[selectedId]) {
        const { [selectedId]: _o, ...openings } = s.openings;
        return { ...snap(s), openings, selectedId: null };
      }

      // Wall selected
      if (!s.walls[selectedId]) return {};
      const wall = s.walls[selectedId];
      const { [selectedId]: _w, ...walls } = s.walls;

      const orphans = [wall.startId, wall.endId].filter(
        (ptId) => !Object.values(walls).some((w) => w.startId === ptId || w.endId === ptId),
      );
      const points = { ...s.points };
      for (const id of orphans) delete points[id];

      // Remove openings on this wall
      const openings = Object.fromEntries(
        Object.entries(s.openings).filter(([, o]) => o.wallId !== selectedId),
      );

      return { ...snap(s), walls, points, openings, selectedId: null };
    }),

  undo: () =>
    set((s) => {
      if (s.past.length === 0) return {};
      const prev = s.past[s.past.length - 1];
      return {
        past: s.past.slice(0, -1),
        future: [{ points: s.points, walls: s.walls, openings: s.openings }, ...s.future],
        points: prev.points,
        walls: prev.walls,
        openings: prev.openings,
        selectedId: null,
        drawing: null,
      };
    }),

  redo: () =>
    set((s) => {
      if (s.future.length === 0) return {};
      const next = s.future[0];
      return {
        past: [...s.past, { points: s.points, walls: s.walls, openings: s.openings }],
        future: s.future.slice(1),
        points: next.points,
        walls: next.walls,
        openings: next.openings,
        selectedId: null,
        drawing: null,
      };
    }),

  addOpening: (o) =>
    set((s) => {
      const id = crypto.randomUUID();
      return {
        ...snap(s),
        openings: { ...s.openings, [id]: { ...o, id } },
        selectedId: id,
      };
    }),

  updateOpening: (id, patch) =>
    set((s) => {
      const existing = s.openings[id];
      if (!existing) return {};
      return {
        ...snap(s),
        openings: { ...s.openings, [id]: { ...existing, ...patch } },
      };
    }),

  loadPlan: (data) =>
    set({
      points: data.points,
      walls: data.walls,
      openings: data.openings,
      past: [],
      future: [],
      selectedId: null,
      drawing: null,
    }),

  clearPlan: () =>
    set({
      points: {},
      walls: {},
      openings: {},
      past: [],
      future: [],
      selectedId: null,
      drawing: null,
    }),
}));

// Auto-save plan data to localStorage on every state change
usePlannerStore.subscribe((state) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ points: state.points, walls: state.walls, openings: state.openings }),
  );
});
