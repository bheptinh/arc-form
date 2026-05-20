import { create } from 'zustand';
import { DEFAULT_SCALE, DEFAULT_WALL_THICKNESS_MM } from '../constants';
import type { Opening, Point, ToolType, Viewport, Wall } from '../types/planner';

export interface DrawingState {
  startPointId: string;
  previewX: number;
  previewY: number;
}

interface PlannerState {
  points: Record<string, Point>;
  walls: Record<string, Wall>;
  openings: Record<string, Opening>;

  tool: ToolType;
  selectedId: string | null;
  defaultWallThickness: number;
  viewport: Viewport;
  drawing: DrawingState | null;
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
        points,
        walls: { ...s.walls, [wallId]: wall },
        drawing: { startPointId: endId, previewX: x, previewY: y },
      };
    }),

  updateDrawingPreview: (x, y) =>
    set((s) => s.drawing ? { drawing: { ...s.drawing, previewX: x, previewY: y } } : {}),

  cancelDrawing: () =>
    set((s) => {
      if (!s.drawing) return {};
      const { startPointId } = s.drawing;
      const hasWalls = Object.values(s.walls).some(
        (w) => w.startId === startPointId || w.endId === startPointId,
      );
      if (!hasWalls) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [startPointId]: _removed, ...rest } = s.points;
        return { drawing: null, points: rest };
      }
      return { drawing: null };
    }),
}));
