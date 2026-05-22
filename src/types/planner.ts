export type ToolType = 'select' | 'wall' | 'door' | 'window';

export interface Point {
  id: string;
  x: number;  // world mm
  y: number;  // world mm
}

export interface Wall {
  id: string;
  startId: string;  // Point id
  endId: string;    // Point id
  thickness: number; // mm
}

export type SwingDir = 'inside-left' | 'inside-right' | 'outside-left' | 'outside-right';

export interface Opening {
  id: string;
  wallId: string;
  type: 'door' | 'window';
  offset: number;    // mm from wall start point
  width: number;     // mm
  swing?: SwingDir;  // doors only
}

export interface Viewport {
  x: number;      // stage offset px
  y: number;
  scale: number;  // px per mm
}
