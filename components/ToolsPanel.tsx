
import React, { useState } from 'react';
import { BrushSettings, ToolType } from '../types';

interface ToolsPanelProps {
  settings: BrushSettings;
  onUpdate: (updates: Partial<BrushSettings>) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

const COLORS_TOP = [
  { val: '#000000', id: 'black' },
  { val: '#ef4444', id: 'red' },
  { val: '#f97316', id: 'orange' },
  { val: '#eab308', id: 'yellow' },
  { val: '#22c55e', id: 'green' },
];

const COLORS_BOTTOM = [
  { val: '#ffffff', id: 'white' },
  { val: '#3b82f6', id: 'blue' },
  { val: '#06b6d4', id: 'lightblue' },
  { val: '#a855f7', id: 'purple' },
  { val: '#ec4899', id: 'pink' },
];

const STROKE_SIZES = [4, 8, 16];

const SHAPE_TOOLS: ToolType[] = ['line', 'arrow', 'rect', 'circle', 'ellipse'];

export const ToolsPanel: React.FC<ToolsPanelProps> = ({ settings, onUpdate, onClear, onUndo, onRedo }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [lastDrawTool, setLastDrawTool] = useState<ToolType>('pen');
  const [lastShapeTool, setLastShapeTool] = useState<ToolType>('rect');

  const isSelectTool = settings.tool === 'select';
  const isShapeActive = SHAPE_TOOLS.includes(settings.tool);

  const handleToolClick = (tool: ToolType, fill?: boolean) => {
    onUpdate({ tool, fill: fill ?? settings.fill });
    if (tool !== 'select') {
      if (SHAPE_TOOLS.includes(tool)) {
        setLastShapeTool(tool);
        setLastDrawTool(tool); // Resume to this shape
      } else {
        setLastDrawTool(tool);
      }
    }
  };

  const cycleSize = () => {
    const currentIndex = STROKE_SIZES.indexOf(settings.size);
    const nextIndex = (currentIndex + 1) % STROKE_SIZES.length;
    onUpdate({ size: STROKE_SIZES[nextIndex] });
  };

  const handleSquiggleClick = () => {
    if (isSelectTool) {
      onUpdate({ tool: lastDrawTool });
    }
  };

  return (
    <div className="relative flex flex-col items-center max-w-[95vw]">
      
      {/* Floating Shapes Toolbar */}
      {isShapeActive && (
        <div className="absolute bottom-full mb-3 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-gray-100 p-2 flex items-center gap-1 animate-in slide-in-from-bottom-2 duration-200 z-50">
          <ToolButton 
            isActive={settings.tool === 'line'} 
            onClick={() => handleToolClick('line')}
            icon={<LineIcon />}
            small
          />
          <ToolButton 
            isActive={settings.tool === 'arrow'} 
            onClick={() => handleToolClick('arrow')}
            icon={<ArrowIcon />}
            small
          />
          <ToolButton 
            isActive={settings.tool === 'rect' && !settings.fill} 
            onClick={() => handleToolClick('rect', false)}
            icon={<RectOutlineIcon />}
            small
          />
          <ToolButton 
            isActive={settings.tool === 'circle' && !settings.fill} 
            onClick={() => handleToolClick('circle', false)}
            icon={<CircleOutlineIcon />}
            small
          />
          <ToolButton 
            isActive={settings.tool === 'rect' && settings.fill} 
            onClick={() => handleToolClick('rect', true)}
            icon={<RectFillIcon />}
            small
          />
          <ToolButton 
            isActive={settings.tool === 'circle' && settings.fill} 
            onClick={() => handleToolClick('circle', true)}
            icon={<CircleFillIcon />}
            small
          />
        </div>
      )}

      {/* Main Toolbar */}
      <div className="bg-white rounded-[2rem] shadow-floating border border-border-subtle p-2 px-3 md:p-3 md:px-5 flex items-center gap-2 md:gap-5 h-auto min-h-[70px] md:h-[88px] select-none animate-in slide-in-from-bottom-8 duration-300 z-40 overflow-x-auto scrollbar-hide max-w-full">
        
        {/* Left Group: Mode Toggles */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSquiggleClick}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${!isSelectTool ? 'bg-primary text-white shadow-lg shadow-glow scale-105' : 'text-gray-400 hover:bg-gray-100'}`}
            title="Draw Mode"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12c0-2 2-4 4-4s4 2 4 4 2 4 4 4 4-2 4-4" />
            </svg>
          </button>
          <button
            onClick={() => handleToolClick('select')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${isSelectTool ? 'bg-focus-light text-focus ring-2 ring-focus-light' : 'text-gray-400 hover:bg-gray-100'}`}
            title="Select / Move"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.636 4.228a.75.75 0 0 1 1.155-.572l12.428 9.32a.75.75 0 0 1-.22 1.34l-4.943 1.353 3.69 6.225a.75.75 0 1 1-1.288.764l-3.692-6.223-3.41 3.41a.75.75 0 0 1-1.28-.53V4.228Z" />
            </svg>
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-10 bg-gray-200 shrink-0"></div>

        {/* Tools Group */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Pencil */}
          <ToolButton 
            isActive={settings.tool === 'pen'} 
            onClick={() => handleToolClick('pen')}
            icon={<PencilIcon />}
          />
          {/* Highlighter */}
          <ToolButton 
            isActive={settings.tool === 'highlighter'} 
            onClick={() => handleToolClick('highlighter')}
            icon={<HighlighterIcon />}
          />
          {/* Brush */}
          <ToolButton 
            isActive={settings.tool === 'brush'} 
            onClick={() => handleToolClick('brush')}
            icon={<PaintBrushIcon />}
          />
          {/* Eraser */}
          <ToolButton 
            isActive={settings.tool === 'eraser'} 
            onClick={() => handleToolClick('eraser')}
            icon={<EraserIcon />}
          />
          {/* Shapes Group */}
          <ToolButton 
            isActive={isShapeActive} 
            onClick={() => handleToolClick(lastShapeTool)}
            icon={<ShapesGroupIcon />}
          />
        </div>

        {/* Separator */}
        <div className="w-px h-10 bg-gray-200 shrink-0"></div>

        {/* Colors Group */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex gap-2">
            {COLORS_TOP.map(c => (
              <ColorButton 
                key={c.id} 
                color={c.val} 
                isSelected={settings.color === c.val} 
                onClick={() => onUpdate({ color: c.val })} 
              />
            ))}
          </div>
          <div className="flex gap-2">
            {COLORS_BOTTOM.map(c => (
              <ColorButton 
                key={c.id} 
                color={c.val} 
                isSelected={settings.color === c.val} 
                onClick={() => onUpdate({ color: c.val })} 
              />
            ))}
          </div>
        </div>

        {/* Separator Dot */}
        <div className="w-1 h-1 rounded-full bg-gray-300 mx-1 shrink-0"></div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Size Button */}
          <button 
            onClick={cycleSize}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
            title="Stroke Size"
          >
            <div 
              className="bg-gray-800 rounded-full transition-all" 
              style={{ width: Math.max(4, settings.size), height: Math.max(4, settings.size) }}
            />
          </button>

          {/* Current Color Indicator */}
          <div 
            className="w-10 h-10 rounded-full border-2 border-gray-100 shadow-sm"
            style={{ backgroundColor: settings.color }}
            title="Current Color"
          />

          {/* Menu Toggle */}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>

            {showMenu && (
              <div className="absolute bottom-full right-0 mb-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 min-w-[160px] animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                <button onClick={() => { onUndo(); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl font-bold text-gray-600 text-sm flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                  Undo
                </button>
                <button onClick={() => { onRedo(); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl font-bold text-gray-600 text-sm flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                  Redo
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button onClick={() => { onClear(); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-xl font-bold text-red-500 text-sm flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Clear Board
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

interface ToolButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  small?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ isActive, onClick, icon, small }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center justify-center transition-all duration-200 shrink-0
      ${small 
        ? (isActive 
            ? 'w-10 h-10 bg-focus-light rounded-lg text-focus' 
            : 'w-10 h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg')
        : (isActive 
            ? 'w-14 h-14 md:w-16 md:h-16 bg-focus-light rounded-2xl text-focus' 
            : 'w-10 h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl')
      }
    `}
  >
    <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
      {icon}
    </div>
  </button>
);

interface ColorButtonProps {
  color: string;
  isSelected: boolean;
  onClick: () => void;
}

const ColorButton: React.FC<ColorButtonProps> = ({ color, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-5 h-5 md:w-6 md:h-6 rounded-full transition-all duration-200 relative shrink-0
      ${color === '#ffffff' ? 'border border-gray-200' : ''}
    `}
    style={{ backgroundColor: color }}
  >
    {isSelected && (
      <div className="absolute -inset-1 rounded-full border-[3px] border-focus opacity-80" />
    )}
  </button>
);

// --- Icons ---

const PencilIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2L22 6L7 21H3V17L18 2Z" fill="#FCA5A5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M14 6L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 21L7 21L5 19L3 21Z" fill="currentColor"/>
    <rect x="16.5" y="3.5" width="4" height="4" transform="rotate(45 16.5 3.5)" fill="#FEE2E2"/>
    <path d="M13.5 10.5L10.5 13.5" stroke="#F87171" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

const HighlighterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15.5 3.5L20.5 8.5L7 22H2V17L15.5 3.5Z" />
    <path d="M13 6L18 11" />
    <path d="M5 22H2V19L5 22Z" fill="currentColor" fillOpacity="0.3"/>
  </svg>
);

const PaintBrushIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21C12 21 16 19 18 16C20 13 21 8 21 8L16 3C16 3 11 4 8 6C5 8 3 12 3 12" />
    <path d="M3 12L10 19" />
    <path d="M9 13C9 13 11 13 13 11C15 9 15 7 15 7" />
  </svg>
);

const EraserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M18 5L21 8L10 19H4V16L15 5H18Z" fill="#FEE2E2" />
    <path d="M13 7L16 10" />
    <path d="M8 12L5 15" />
    <path d="M4 16H10L12 19H6L4 16Z" fill="#374151" stroke="none" />
  </svg>
);

// Combined Shapes Icon for Main Toolbar
const ShapesGroupIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="17" cy="7" r="4" stroke="#60A5FA" />
    <rect x="4" y="11" width="10" height="10" rx="1" stroke="#F472B6" />
  </svg>
);

// -- Mini Shape Icons --

const LineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="4" y="20" x2="20" y2="4" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20L20 4" />
    <path d="M10 4H20V14" />
  </svg>
);

const RectOutlineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="5" width="16" height="14" rx="2" />
  </svg>
);

const CircleOutlineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" />
  </svg>
);

const RectFillIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="5" width="16" height="14" rx="2" fill="currentColor" />
  </svg>
);

const CircleFillIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" fill="currentColor" />
  </svg>
);
