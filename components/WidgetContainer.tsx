
import React, { useState, useRef, useEffect } from 'react';
import { Widget, WidgetSize, WidgetDimensions, WidgetType } from '../types';

interface WidgetContainerProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate?: (updates: Partial<Widget>) => void;
  onRemove?: () => void;
  children: React.ReactNode;
}

const GRID_SIZE = 8;

const WidgetContainer: React.FC<WidgetContainerProps> = ({ widget, isTeacher, onUpdate, onRemove, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Track window size for clamping
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Store drag/resize state in refs to avoid re-renders during interaction
  const dragInfo = useRef({
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0
  });

  const resizeInfo = useRef({
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0
  });

  // "Sticker" widgets have transparent backgrounds and different styling
  const isSticker = [WidgetType.IMAGE, WidgetType.WORK_SYMBOLS].includes(widget.type);

  // --- DRAG HANDLERS ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isMobile || !isTeacher || widget.minimized) return;
    
    // Ignore clicks on controls or resizing handles
    if ((e.target as HTMLElement).closest('button, input, textarea, .controls-ignore, .resize-handle')) {
        return;
    }
    
    e.preventDefault();
    e.stopPropagation(); // Prevent interactions with background or other elements
    
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    
    setIsDragging(true);
    
    dragInfo.current = {
        startX: e.clientX,
        startY: e.clientY,
        startLeft: widget.position.x,
        startTop: widget.position.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    e.preventDefault();
    
    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;
    
    // Apply transform directly for 1:1 instant movement
    containerRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const target = e.currentTarget as HTMLElement;
    target.releasePointerCapture(e.pointerId);
    
    setIsDragging(false);
    
    // Clear transform so the new position (via props) takes over
    if (containerRef.current) {
        containerRef.current.style.transform = '';
    }

    if (onUpdate) {
        const dx = e.clientX - dragInfo.current.startX;
        const dy = e.clientY - dragInfo.current.startY;
        
        onUpdate({
            position: {
                x: Math.round((dragInfo.current.startLeft + dx) / GRID_SIZE) * GRID_SIZE,
                y: Math.round((dragInfo.current.startTop + dy) / GRID_SIZE) * GRID_SIZE
            }
        });
    }
  };

  // --- RESIZE HANDLERS ---
  const handleResizeStart = (e: React.PointerEvent) => {
    if (isMobile || !isTeacher || widget.minimized) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    setIsResizing(true);
    resizeInfo.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW: widget.dimensions?.width || 320,
        startH: widget.dimensions?.height || 320
    };
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!isResizing || !onUpdate) return;
    e.preventDefault();
    
    const dx = e.clientX - resizeInfo.current.startX;
    const dy = e.clientY - resizeInfo.current.startY;
    
    // Throttle resize updates if needed, but direct update is usually fine for resize
    onUpdate({
        dimensions: {
            width: Math.max(120, Math.round((resizeInfo.current.startW + dx) / GRID_SIZE) * GRID_SIZE),
            height: Math.max(80, Math.round((resizeInfo.current.startH + dy) / GRID_SIZE) * GRID_SIZE)
        }
    });
  };

  const handleResizeEnd = (e: React.PointerEvent) => {
    if (!isResizing) return;
    const target = e.currentTarget as HTMLElement;
    target.releasePointerCapture(e.pointerId);
    setIsResizing(false);
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate?.({ minimized: !widget.minimized });
  };

  const dims = widget.dimensions || { width: 320, height: 320 };

  // Responsive Calculation
  let containerStyle: React.CSSProperties = {};

  if (isMobile) {
      containerStyle = {
          position: 'relative',
          width: '100%',
          maxWidth: '600px', // Prevent overly wide widgets on tablets
          height: widget.minimized ? '56px' : 'auto',
          minHeight: widget.minimized ? 'auto' : `${dims.height}px`,
          marginBottom: '1rem',
          left: 'auto',
          top: 'auto',
          transform: 'none',
          boxShadow: isSticker && !isDragging && !showSettings ? 'none' : undefined,
          touchAction: 'none'
      };
  } else {
      // Desktop: Clamp positions to ensure visibility
      const safeWidth = widget.minimized ? 200 : dims.width;
      const safeHeight = widget.minimized ? 48 : dims.height;
      const maxLeft = Math.max(0, windowSize.width - safeWidth);
      const maxTop = Math.max(0, windowSize.height - safeHeight - 80); // Subtract roughly toolbar height

      const leftPos = Math.min(widget.position.x, maxLeft);
      const topPos = Math.min(widget.position.y, maxTop);

      containerStyle = {
          position: 'absolute',
          left: `${leftPos}px`,
          top: `${topPos}px`,
          width: widget.minimized ? '200px' : `${dims.width}px`,
          height: widget.minimized ? '48px' : `${dims.height}px`,
          maxWidth: '100vw',
          maxHeight: '100vh',
          boxShadow: isSticker && !isDragging && !showSettings ? 'none' : undefined,
          touchAction: 'none',
          zIndex: isDragging ? 50 : 10
      };
  }

  // Calculate container classes
  const containerClasses = [
    'flex flex-col overflow-hidden pointer-events-auto',
    isMobile ? 'rounded-2xl shadow-sm bg-bg-main' : 'rounded-[1.25rem]', // Modern rounded corners
    isDragging ? 'cursor-grabbing shadow-2xl ring-2 ring-focus scale-[1.02]' : '',
    (isDragging || isResizing) ? 'transition-none' : 'transition-all duration-300 cubic-bezier(0.2, 0.8, 0.2, 1)',
    isSticker && !isDragging && !showSettings 
      ? 'bg-transparent border-transparent' 
      : (isMobile ? 'border border-border-default' : 'widget-card')
  ].join(' ');

  const titleBarClasses = [
    'flex items-center justify-between px-4 py-2 select-none transition-opacity duration-200',
    (isTeacher && !isMobile) ? 'widget-drag-handle cursor-grab active:cursor-grabbing' : '',
    isSticker ? 'bg-bg-main/50 backdrop-blur-md rounded-t-[1.25rem] opacity-0 hover:opacity-100' : 'bg-transparent',
    (isDragging || showSettings || isMobile) ? '!opacity-100' : ''
  ].join(' ');

  return (
    <div 
      ref={containerRef}
      className={containerClasses}
      style={containerStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Title Bar */}
      <div className={titleBarClasses}>
        <div className="flex items-center gap-2 overflow-hidden">
            <div className={`w-1.5 h-1.5 rounded-full ${isSticker ? 'bg-text-secondary' : 'bg-primary'}`}></div>
            <span className={`text-[11px] font-bold uppercase tracking-widest truncate ${isSticker ? 'text-text-main' : 'text-text-secondary'}`}>
                {widget.title}
            </span>
        </div>
        
        <div className="flex items-center gap-1 controls-ignore" onPointerDown={e => e.stopPropagation()}>
          {isTeacher && !widget.minimized && (
            <button 
              onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} 
              className="hover:bg-bg-alt/80 p-1.5 rounded-lg transition-all text-text-secondary hover:text-primary"
              title="Settings"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
          )}
          <button 
            onClick={toggleMinimize} 
            className="hover:bg-bg-alt/80 p-1.5 rounded-lg transition-all text-text-secondary hover:text-focus"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={widget.minimized ? "M12 4v16m8-8H4" : "M20 12H4"}></path></svg>
          </button>
          {isTeacher && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove?.(); }} 
              className="hover:bg-red-50 hover:text-red-500 p-1.5 rounded-lg transition-all text-text-secondary active:scale-90"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {!widget.minimized && (
        <div className={`flex-1 flex flex-col relative overflow-hidden cursor-auto ${isSticker ? '' : 'bg-transparent'}`}>
          <div className="flex-1 overflow-auto relative scrollbar-hide text-text-main" onPointerDown={e => e.stopPropagation()}>
            {children}
          </div>

          {/* Settings Overlay */}
          {isTeacher && showSettings && (
            <div className="absolute inset-0 bg-bg-main/95 backdrop-blur-xl z-50 p-6 overflow-auto flex flex-col animate-in fade-in duration-200" onPointerDown={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs font-bold text-text-main uppercase tracking-widest">Settings</h4>
                <button onClick={() => setShowSettings(false)} className="bg-bg-alt hover:bg-border-hover p-2 rounded-lg transition-colors text-text-secondary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <section>
                    <label className="text-xs font-bold text-text-secondary uppercase mb-3 block tracking-wide">Size</label>
                    <div className="flex gap-2">
                        {(['small', 'medium', 'large'] as WidgetSize[]).map(s => (
                        <button 
                            key={s} 
                            onClick={() => {
                                const sizes: Record<WidgetSize, WidgetDimensions> = {
                                    small: { width: 192, height: 192 },
                                    medium: { width: 320, height: 320 },
                                    large: { width: 512, height: 512 }
                                };
                                onUpdate?.({ size: s, dimensions: sizes[s] });
                            }}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all uppercase ${widget.size === s ? 'bg-focus border-focus text-white shadow-md' : 'bg-bg-main text-text-secondary border-border-default hover:border-border-hover'}`}
                        >
                            {s}
                        </button>
                        ))}
                    </div>
                </section>
                <div className="p-4 rounded-xl bg-bg-alt border border-border-default text-xs text-text-secondary text-center font-medium">
                    Drag the bottom-right corner to resize freely.
                </div>
              </div>
            </div>
          )}

          {/* Resize Handle */}
          {isTeacher && !widget.minimized && !isMobile && (
            <div 
              className={`resize-handle ${isSticker && !showSettings ? 'opacity-0 hover:opacity-100' : ''}`}
              onPointerDown={handleResizeStart}
              onPointerMove={handleResizeMove}
              onPointerUp={handleResizeEnd}
              onPointerCancel={handleResizeEnd}
              style={{ touchAction: 'none' }}
            ></div>
          )}
        </div>
      )}
    </div>
  );
};

export default WidgetContainer;
