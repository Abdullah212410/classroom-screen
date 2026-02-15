
export type ToolType = 'pen' | 'eraser' | 'arrow' | 'rect' | 'ellipse' | 'line' | 'select' | 'highlighter' | 'brush' | 'circle';

export interface BrushSettings {
  tool: ToolType;
  color: string;
  size: number;
  fill?: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingElement {
  id: string;
  type: ToolType;
  points: Point[];
  color: string;
  size: number;
  fill?: boolean;
  timestamp: number;
}

export interface WhiteboardState {
  undoStack: DrawingElement[][];
  redoStack: DrawingElement[][];
  lastSaved: string | null;
}

export enum WidgetType {
  TIMER = 'timer',
  TRAFFIC_LIGHT = 'traffic_light',
  RANDOMIZER = 'randomizer',
  QR = 'qr',
  EMBED = 'embed',
  HYPERLINK = 'hyperlink',
  DRAW = 'draw',
  NOISE_METER = 'noise_meter',
  POLL = 'poll',
  DICE = 'dice',
  IMAGE = 'image',
  TEXT = 'text',
  WORK_SYMBOLS = 'work_symbols',
  TIMETABLE = 'timetable',
  CLOCK = 'clock',
  // New Widgets
  GROUP_MAKER = 'group_maker',
  VIDEO = 'video',
  WEBCAM = 'webcam',
  CALENDAR = 'calendar',
  EVENT_COUNT = 'event_count',
  STOPWATCH = 'stopwatch',
  STICKERS = 'stickers',
  SCOREBOARD = 'scoreboard'
}

export type WidgetSize = 'small' | 'medium' | 'large';

export interface WidgetDimensions {
  width: number;
  height: number;
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  dimensions: WidgetDimensions;
  position: { x: number; y: number };
  minimized: boolean;
  settings: any;
  state: any;
}

export interface RoomBackground {
  type: 'none' | 'preset' | 'upload';
  value: string;
  fit: 'cover' | 'contain' | 'fill';
  mediaType?: 'image' | 'video';
}

export interface RoomState {
  roomId: string;
  background: RoomBackground;
  widgets: Widget[];
  drawingData?: string; 
  drawingElements?: DrawingElement[];
}

export type AppMode = 'tools' | 'annotate';

export type SyncMessage = 
  | { type: 'SYNC_REQUEST'; roomId: string; sender: 'student' | 'teacher'; payload: any }
  | { type: 'SYNC_RESPONSE'; roomId: string; sender: 'teacher' | 'student'; payload: RoomState }
  | { type: 'UPDATE_ROOM'; roomId: string; sender: 'teacher' | 'student'; payload: RoomState };
