
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { BrushSettings, DrawingElement, Point } from '../types';

interface WhiteboardProps {
  settings: BrushSettings;
  isTeacher: boolean;
  isDrawingMode: boolean;
  elements?: DrawingElement[];
  onUpdate?: (elements: DrawingElement[]) => void;
}

const Whiteboard = forwardRef((props: WhiteboardProps, ref) => {
  const { settings, isTeacher, isDrawingMode, elements = [], onUpdate } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point | null>(null);
  
  const [localElements, setLocalElements] = useState<DrawingElement[]>(elements);
  const [history, setHistory] = useState<DrawingElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Refs for continuous erasing logic
  const hasErasedRef = useRef(false);
  const elementsRef = useRef<DrawingElement[]>(elements);

  // Sync elements when props change
  useEffect(() => {
    setLocalElements(elements);
    if (historyIndex === -1 && elements.length > 0) {
       setHistory([elements]);
       setHistoryIndex(0);
    }
  }, [elements]);

  // Keep elementsRef in sync with state
  useEffect(() => {
    elementsRef.current = localElements;
  }, [localElements]);

  const getPointerPos = (e: React.PointerEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top 
    };
  };

  const drawElements = useCallback((ctx: CanvasRenderingContext2D, elementsToDraw: DrawingElement[], preview?: DrawingElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    
    ctx.clearRect(0, 0, width, height);
    
    const allElements = preview ? [...elementsToDraw, preview] : elementsToDraw;

    allElements.forEach(el => {
      ctx.save();
      ctx.beginPath();
      
      // Default styles
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 1.0;

      // Tool-specific style overrides
      if (el.type === 'highlighter') {
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = el.size * 2.5; // Highlighter is thicker
        ctx.globalCompositeOperation = 'source-over'; // Standard blending
      } else if (el.type === 'brush') {
        ctx.lineWidth = el.size * 1.5; // Brush is slightly thicker
      } else if (el.type === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      }

      if (el.id === selectedElementId && isDrawingMode && settings.tool === 'select') {
         ctx.shadowBlur = 10;
         ctx.shadowColor = el.color;
         ctx.lineWidth = el.size + 4;
      }

      const p = el.points;
      if (p.length < 1) {
        ctx.restore();
        return;
      }

      switch (el.type) {
        case 'pen':
        case 'eraser':
        case 'highlighter':
        case 'brush':
          ctx.moveTo(p[0].x, p[0].y);
          if (p.length === 1) {
             ctx.lineTo(p[0].x, p[0].y);
          } else {
             // Quadratic smoothing
             for (let i = 1; i < p.length; i++) {
                const midPoint = {
                    x: p[i - 1].x + (p[i].x - p[i - 1].x) / 2,
                    y: p[i - 1].y + (p[i].y - p[i - 1].y) / 2
                };
                if (i === 1) ctx.lineTo(p[i].x, p[i].y);
                else ctx.quadraticCurveTo(p[i-1].x, p[i-1].y, midPoint.x, midPoint.y);
                if (i === p.length - 1) ctx.lineTo(p[i].x, p[i].y);
             }
          }
          ctx.stroke();
          break;
        
        case 'line':
        case 'arrow':
          if (p.length < 2) break;
          ctx.moveTo(p[0].x, p[0].y);
          ctx.lineTo(p[1].x, p[1].y);
          ctx.stroke();
          if (el.type === 'arrow') {
            const headlen = Math.max(el.size * 3, 10);
            const angle = Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x);
            ctx.beginPath();
            ctx.moveTo(p[1].x, p[1].y);
            ctx.lineTo(p[1].x - headlen * Math.cos(angle - Math.PI / 6), p[1].y - headlen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(p[1].x - headlen * Math.cos(angle + Math.PI / 6), p[1].y - headlen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = el.color;
            ctx.fill();
          }
          break;

        case 'rect':
          if (p.length < 2) break;
          const w = p[1].x - p[0].x;
          const h = p[1].y - p[0].y;
          if (el.fill) {
            ctx.fillStyle = el.color;
            ctx.fillRect(p[0].x, p[0].y, w, h);
          } else {
            ctx.strokeRect(p[0].x, p[0].y, w, h);
          }
          break;

        case 'ellipse':
        case 'circle':
          if (p.length < 2) break;
          const rx = Math.abs(p[1].x - p[0].x) / 2;
          const ry = Math.abs(p[1].y - p[0].y) / 2;
          const cx = (p[0].x + p[1].x) / 2;
          const cy = (p[0].y + p[1].y) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          if (el.fill) {
            ctx.fillStyle = el.color;
            ctx.fill();
          } else {
            ctx.stroke();
          }
          break;
      }
      ctx.restore();
    });
  }, [selectedElementId, isDrawingMode, settings.tool]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawElements(ctx, localElements, currentElement || undefined);
    }
  }, [drawElements, localElements, currentElement]);

  useEffect(() => {
    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (canvasRef.current?.parentElement) {
        observer.observe(canvasRef.current.parentElement);
    }
    return () => observer.disconnect();
  }, [handleResize]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      const next: DrawingElement[] = [];
      updateElements(next);
    },
    undo: () => {
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        updateElements(history[nextIdx], false);
      } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          updateElements([], false);
      }
    },
    redo: () => {
      if (historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        updateElements(history[nextIdx], false);
      }
    }
  }));

  const updateElements = (next: DrawingElement[], saveToHistory = true) => {
    setLocalElements(next);
    onUpdate?.(next);
    if (saveToHistory) {
        const nextHistory = history.slice(0, historyIndex + 1);
        nextHistory.push(next);
        if (nextHistory.length > 50) nextHistory.shift();
        setHistory(nextHistory);
        setHistoryIndex(nextHistory.length - 1);
    }
  };

  const hitTest = (p: Point, el: DrawingElement): boolean => {
    const pts = el.points;
    if (pts.length < 1) return false;
    const pad = el.size + 10;
    const minX = Math.min(...pts.map(pt => pt.x)) - pad;
    const maxX = Math.max(...pts.map(pt => pt.x)) + pad;
    const minY = Math.min(...pts.map(pt => pt.y)) - pad;
    const maxY = Math.max(...pts.map(pt => pt.y)) + pad;
    return p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isTeacher || !isDrawingMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const pos = getPointerPos(e);
    setIsDragging(true);
    hasErasedRef.current = false;

    if (settings.tool === 'select') {
      const hit = [...localElements].reverse().find(el => hitTest(pos, el));
      if (hit) {
        setSelectedElementId(hit.id);
        setDragOffset({ x: pos.x - hit.points[0].x, y: pos.y - hit.points[0].y });
      } else {
        setSelectedElementId(null);
      }
      return;
    }

    if (settings.tool === 'eraser') {
       // Check against elementsRef for most up-to-date list during rapid events
       const hit = [...elementsRef.current].reverse().find(el => hitTest(pos, el));
       if (hit) {
         const next = elementsRef.current.filter(el => el.id !== hit.id);
         elementsRef.current = next; 
         updateElements(next, false); // Don't save history until drag ends
         hasErasedRef.current = true;
       }
       return;
    }

    const newEl: DrawingElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: settings.tool,
      points: [pos],
      color: settings.color,
      size: settings.size,
      fill: settings.fill,
      timestamp: Date.now()
    };
    setCurrentElement(newEl);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !isTeacher || !isDrawingMode) return;
    e.preventDefault(); 
    e.stopPropagation();
    
    const pos = getPointerPos(e);

    if (settings.tool === 'select' && selectedElementId && dragOffset) {
      const next = localElements.map(el => {
        if (el.id === selectedElementId) {
          const dx = pos.x - dragOffset.x - el.points[0].x;
          const dy = pos.y - dragOffset.y - el.points[0].y;
          return { ...el, points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
        }
        return el;
      });
      setLocalElements(next);
      return;
    }

    if (settings.tool === 'eraser') {
      const hit = [...elementsRef.current].reverse().find(el => hitTest(pos, el));
      if (hit) {
        const next = elementsRef.current.filter(el => el.id !== hit.id);
        elementsRef.current = next;
        updateElements(next, false);
        hasErasedRef.current = true;
      }
      return;
    }

    if (currentElement) {
      let nextPoints = [...currentElement.points];
      
      // Freehand tools
      if (['pen', 'eraser', 'highlighter', 'brush'].includes(currentElement.type)) {
        const lastPt = nextPoints[nextPoints.length - 1];
        const dist = Math.hypot(pos.x - lastPt.x, pos.y - lastPt.y);
        if (dist > 2) nextPoints.push(pos);
      } 
      // Shape tools
      else {
        // Enforce 1:1 aspect ratio for Circle and Square (if we had square tool)
        if (currentElement.type === 'circle') {
            const start = nextPoints[0];
            const dx = pos.x - start.x;
            const dy = pos.y - start.y;
            const max = Math.max(Math.abs(dx), Math.abs(dy));
            // Keep direction
            nextPoints[1] = {
                x: start.x + (dx >= 0 ? max : -max),
                y: start.y + (dy >= 0 ? max : -max)
            };
        } else {
            nextPoints[1] = pos;
        }
      }
      setCurrentElement({ ...currentElement, points: nextPoints });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    if (settings.tool === 'select') {
      if (selectedElementId) updateElements(localElements);
      return;
    }

    if (settings.tool === 'eraser') {
        // Commit changes to history if anything was erased during drag
        if (hasErasedRef.current) {
            updateElements(elementsRef.current, true);
        }
        return;
    }

    if (currentElement) {
       // Validate minimum points
       const isFreehand = ['pen', 'highlighter', 'brush', 'eraser'].includes(currentElement.type);
       if (currentElement.points.length < 2 && !isFreehand) {
           setCurrentElement(null);
           return;
       }
       updateElements([...localElements, currentElement]);
       setCurrentElement(null);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }} 
        className={`block w-full h-full ${isDrawingMode ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
      />
    </div>
  );
});

export default Whiteboard;
