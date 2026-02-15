
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

const COLORS = [
  '#ffffff', '#ef4444', '#10b981', '#3b82f6', '#22d3ee', '#fbbf24', '#a78bfa'
];

const STROKE_WIDTHS = [2, 4, 8, 12, 16];
const MAX_HISTORY = 30;

export const DrawWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const redrawFromData = useCallback((canvas: HTMLCanvasElement, dataUrl: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    
    if (!dataUrl) {
      ctx.clearRect(0, 0, rect.width, rect.height);
      return;
    }
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
    };
    img.src = dataUrl;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const handleResize = () => {
      const parent = canvas.parentElement!;
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      const currentData = canvas.toDataURL();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (widget.state.drawingData) {
          redrawFromData(canvas, widget.state.drawingData);
        } else if (currentData && currentData.length > 100) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, rect.width, rect.height);
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
          };
          img.src = currentData;
        }
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas.parentElement);
    handleResize();
    return () => resizeObserver.disconnect();
  }, [redrawFromData, widget.state.drawingData]);

  const getPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isTeacher) return;
    setIsDrawing(true);
    lastPointRef.current = getPos(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !isTeacher || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || !lastPointRef.current) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.strokeStyle = widget.settings.strokeColor || '#22d3ee';
    ctx.lineWidth = widget.settings.lineWidth || 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPointRef.current = pos;
  };

  const handlePointerUp = () => {
    if (!isDrawing || !canvasRef.current) return;
    setIsDrawing(false);
    lastPointRef.current = null;
    
    const dataUrl = canvasRef.current.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(dataUrl);
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    onUpdate({ state: { ...widget.state, drawingData: dataUrl } });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      <div className="flex-1 relative touch-none bg-slate-900/50">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 w-full h-full cursor-crosshair"
        />
      </div>

      {isTeacher && (
        <div className="p-4 bg-slate-900 border-t border-white/5 flex flex-col gap-4 z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => onUpdate({ settings: { ...widget.settings, strokeColor: c } })}
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 shrink-0 ${widget.settings.strokeColor === c ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
                <button onClick={() => {}} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                </button>
                <div className="w-px h-4 bg-white/10 mx-1"></div>
                <button onClick={() => {}} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mono whitespace-nowrap">Output_Beam</span>
             <div className="flex-1 flex gap-1.5">
                {STROKE_WIDTHS.map(w => (
                  <button key={w} onClick={() => onUpdate({ settings: { ...widget.settings, lineWidth: w } })} className={`flex-1 h-7 rounded-lg flex items-center justify-center transition-all ${widget.settings.lineWidth === w ? 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-white/5 border border-white/5 hover:border-white/10'}`}>
                    <div className={`${widget.settings.lineWidth === w ? 'bg-slate-950' : 'bg-slate-600'} rounded-full`} style={{ width: Math.max(2, w/2), height: Math.max(2, w/2) }}></div>
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
