
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

// Global z-index manager for bringing windows to front
let topZIndex = 100;

const WidgetContainer: React.FC<WidgetContainerProps> = ({ widget, isTeacher, onUpdate, onRemove, children }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [zIndex, setZIndex] = useState(100);

  // Track window size for clamping
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const containerRef = useRef<HTMLDivElement>(null);

  // Use refs instead of state for drag/resize to avoid re-renders during interaction
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const isPotentialDragRef = useRef(false); // Track if pointerdown occurred
  const rafIdRef = useRef<number | null>(null);
  
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
    startTop: 0,
    offsetX: 0,
    offsetY: 0,
    hasMoved: false
  });

  const resizeInfo = useRef({
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0
  });

  // "Sticker" widgets have transparent backgrounds and different styling
  const isSticker = [WidgetType.IMAGE, WidgetType.WORK_SYMBOLS].includes(widget.type);

  // Bring window to front
  const bringToFront = () => {
    topZIndex++;
    setZIndex(topZIndex);
  };

  // Check if element or its parents should prevent dragging
  const shouldIgnoreDrag = (target: HTMLElement): boolean => {
    // Check for data-no-drag attribute
    if (target.closest('[data-no-drag="true"]')) {
      return true;
    }

    // Check for interactive elements
    if (target.closest('button, a, input, textarea, select, [role="button"], [contenteditable="true"], .controls-ignore, .resize-handle')) {
      return true;
    }

    return false;
  };

  // --- DRAG HANDLERS (PIXEL-ACCURATE - DRAG FROM ANYWHERE NON-INTERACTIVE) ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isMobile || !isTeacher || widget.minimized) return;

    const target = e.target as HTMLElement;

    // ONLY exclude interactive elements (buttons, inputs, etc.)
    // This allows drag from: header, edges, corners, empty body space
    // But NOT from: buttons, inputs, textareas, links, etc.
    if (shouldIgnoreDrag(target)) {
      return;
    }

    // Bring window to front
    bringToFront();

    // Mark that we're in a potential drag state (pointer is down)
    isPotentialDragRef.current = true;

    // Don't prevent default yet - allow text selection to start
    // We'll only start drag if user moves the pointer

    // Get accurate window position from widget state (source of truth)
    // Don't use getBoundingClientRect() as it includes transforms
    const currentLeft = widget.position.x;
    const currentTop = widget.position.y;

    dragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: currentLeft,
      startTop: currentTop,
      offsetX: e.clientX - currentLeft,  // Offset from pointer to window top-left
      offsetY: e.clientY - currentTop,
      hasMoved: false
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // CRITICAL: Only process if we had a pointerdown AND button is still pressed
    if (!isPotentialDragRef.current || e.buttons !== 1 || !containerRef.current) {
      return;
    }

    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;

    // If not dragging yet, check if user has moved enough to start drag
    if (!isDraggingRef.current) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      const DRAG_THRESHOLD = 5; // pixels (increased for more intentional drag)

      if (distance > DRAG_THRESHOLD && !dragInfo.current.hasMoved) {
        // User has moved enough - start dragging
        dragInfo.current.hasMoved = true;
        isDraggingRef.current = true;

        // Now capture pointer and prevent default
        const target = e.currentTarget as HTMLElement;
        target.setPointerCapture(e.pointerId);
        e.preventDefault();

        // Ensure window is on top during drag (apply immediately via DOM)
        if (containerRef.current) {
          topZIndex++;
          setZIndex(topZIndex);
          containerRef.current.style.zIndex = String(topZIndex);
        }

        // Apply visual feedback
        containerRef.current.classList.add('is-dragging');
      } else {
        return; // Not enough movement yet
      }
    }

    e.preventDefault();

    // Use requestAnimationFrame for smooth 60fps dragging
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      if (containerRef.current) {
        // Apply transform with scale for visual feedback - hardware accelerated, no reflow
        containerRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.02)`;
      }
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // Reset potential drag flag
    isPotentialDragRef.current = false;

    // Only process if we actually started dragging
    if (!isDraggingRef.current && !dragInfo.current.hasMoved) {
      return;
    }

    // Release pointer capture only if we captured it
    if (isDraggingRef.current) {
      const target = e.currentTarget as HTMLElement;
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
    }

    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;
    dragInfo.current.hasMoved = false;

    // Cancel any pending animation frame
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Remove visual feedback
    if (containerRef.current) {
      containerRef.current.classList.remove('is-dragging');
      containerRef.current.style.transform = '';
    }

    // Only update position if we actually dragged
    if (wasDragging && onUpdate) {
      // Calculate final position: pointer position minus offset to window top-left
      const finalX = e.clientX - dragInfo.current.offsetX;
      const finalY = e.clientY - dragInfo.current.offsetY;

      // Clamp within viewport bounds
      const clampedX = Math.max(0, Math.min(finalX, windowSize.width - (widget.minimized ? 200 : dims.width)));
      const clampedY = Math.max(0, Math.min(finalY, windowSize.height - (widget.minimized ? 48 : 200)));

      onUpdate({
        position: {
          x: Math.round(clampedX / GRID_SIZE) * GRID_SIZE,
          y: Math.round(clampedY / GRID_SIZE) * GRID_SIZE
        }
      });
    }
  };

  // --- RESIZE HANDLERS (OPTIMIZED) ---
  const handleResizeStart = (e: React.PointerEvent) => {
    if (isMobile || !isTeacher || widget.minimized) return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    // Use ref instead of state
    isResizingRef.current = true;

    resizeInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: widget.dimensions?.width || 320,
      startH: widget.dimensions?.height || 320
    };
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!isResizingRef.current || !onUpdate) return;
    e.preventDefault();

    const dx = e.clientX - resizeInfo.current.startX;
    const dy = e.clientY - resizeInfo.current.startY;

    // Direct update for resize (still causes re-render but acceptable for resize)
    onUpdate({
      dimensions: {
        width: Math.max(120, Math.round((resizeInfo.current.startW + dx) / GRID_SIZE) * GRID_SIZE),
        height: Math.max(80, Math.round((resizeInfo.current.startH + dy) / GRID_SIZE) * GRID_SIZE)
      }
    });
  };

  const handleResizeEnd = (e: React.PointerEvent) => {
    if (!isResizingRef.current) return;
    const target = e.currentTarget as HTMLElement;
    target.releasePointerCapture(e.pointerId);
    isResizingRef.current = false;
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
          width: '90%',
          maxWidth: '600px',
          height: widget.minimized ? '56px' : 'auto',
          maxHeight: widget.minimized ? '56px' : '90vh',
          marginBottom: '1rem',
          marginLeft: 'auto',
          marginRight: 'auto',
          left: 'auto',
          top: 'auto',
          transform: 'none',
          boxShadow: isSticker && !showSettings ? 'none' : undefined,
          touchAction: 'none'
      };
  } else {
      // Desktop: Content-based sizing with constraints
      const baseWidth = widget.minimized ? 200 : dims.width;
      const safeWidth = Math.min(baseWidth, windowSize.width * 0.9);
      const estimatedHeight = widget.minimized ? 48 : 500; // Rough estimate for positioning

      const maxLeft = Math.max(0, windowSize.width - safeWidth);
      const maxTop = Math.max(0, windowSize.height - estimatedHeight);

      const leftPos = Math.min(widget.position.x, maxLeft);
      const topPos = Math.min(widget.position.y, maxTop);

      containerStyle = {
          position: 'absolute',
          left: `${leftPos}px`,
          top: `${topPos}px`,
          width: widget.minimized ? '200px' : `${dims.width}px`,
          maxWidth: 'min(600px, 90vw)',
          height: widget.minimized ? '48px' : 'auto',
          maxHeight: widget.minimized ? '48px' : '90vh',
          boxShadow: isSticker && !showSettings ? 'none' : undefined,
          touchAction: 'none',
          zIndex: zIndex
      };
  }

  // Calculate container classes
  const containerClasses = [
    'flex flex-col pointer-events-auto',
    isMobile ? 'rounded-2xl shadow-sm bg-bg-main' : 'rounded-[1.25rem]', // Modern rounded corners
    isSticker && !showSettings
      ? 'bg-transparent border-transparent'
      : (isMobile ? 'border border-border-default' : 'widget-card')
  ].join(' ');

  const titleBarClasses = [
    'flex items-center justify-between px-4 py-2 select-none transition-opacity duration-200',
    (isTeacher && !isMobile) ? 'widget-drag-handle cursor-grab active:cursor-grabbing' : '',
    isSticker ? 'bg-bg-main/50 backdrop-blur-md rounded-t-[1.25rem] opacity-0 hover:opacity-100' : 'bg-transparent',
    (showSettings || isMobile) ? '!opacity-100' : ''
  ].join(' ');

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={containerStyle}
      onClick={(e) => {
        // Bring to front on any click (unless clicking controls)
        if (!(e.target as HTMLElement).closest('button, input, textarea, .controls-ignore')) {
          bringToFront();
        }
      }}
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
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowSettings(!showSettings);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="hover:bg-bg-alt/80 p-2.5 rounded-lg transition-all text-text-secondary hover:text-primary relative z-10"
              style={{ pointerEvents: 'auto' }}
              title="Settings"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleMinimize(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="hover:bg-bg-alt/80 p-2.5 rounded-lg transition-all text-text-secondary hover:text-focus relative z-10"
            style={{ pointerEvents: 'auto' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={widget.minimized ? "M12 4v16m8-8H4" : "M20 12H4"}></path></svg>
          </button>
          {isTeacher && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (onRemove) {
                  onRemove();
                } else {
                  console.warn('[WidgetContainer] Close button clicked but onRemove handler is not provided');
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="hover:bg-red-50 hover:text-red-500 p-2.5 rounded-lg transition-all text-text-secondary active:scale-90 relative z-10"
              style={{ pointerEvents: 'auto' }}
              title="Close"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {!widget.minimized && (
        <div className={`flex-1 flex flex-col relative cursor-auto ${isSticker ? '' : 'bg-transparent'}`} style={{ minHeight: 0 }}>
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide text-text-main">
            {children}
          </div>

          {/* Settings Overlay */}
          {isTeacher && showSettings && (
            <div className="absolute inset-0 bg-bg-main/95 backdrop-blur-xl z-50 p-6 overflow-auto flex flex-col animate-in fade-in duration-200">
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
