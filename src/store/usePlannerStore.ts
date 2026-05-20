import { create } from 'zustand';
import { DEFAULT_SCALE, DEFAULT_WALL_THICKNESS_MM } from '../constants';
import type { Opening, Point, ToolType, Viewport, Wall } from '../types/planner';

interface PlannerState {
  points: Record<string, Point>;
  walls: Record<string, Wall>;
  openings: Record<string, Opening>;

  tool: ToolType;
  selectedId: string | null;
  defaultWallThickness: number;
  viewport: Viewport;
}

interface PlannerActions {
  setTool: (tool: ToolType) => void;
  setViewport: (v: Partial<Viewport>) => void;
  setDefaultWallThickness: (mm: number) => void;
  selectElement: (id: string | null) => void;
}

const initialState: PlannerState = {
  points: {},
  walls: {},
  openings: {},
  tool: 'select',
  selectedId: null,
  defaultWallThickness: DEFAULT_WALL_THICKNESS_MM,
  viewport: { x: 0, y: 0, scale: DEFAULT_SCALE },
};

export const usePlannerStore = create<PlannerState & PlannerActions>((set) => ({
  ...initialState,

  setTool: (tool) => set({ tool }),

  setViewport: (v) =>
    set((s) => ({ viewport: { ...s.viewport, ...v } })),

  setDefaultWallThickness: (mm) => set({ defaultWallThickness: mm }),

  selectElement: (id) => set({ selectedId: id }),
}));
