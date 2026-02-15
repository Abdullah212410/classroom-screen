
import React, { useState, useEffect, useRef } from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const StopwatchWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);

  useEffect(() => {
    if (running) {
        startTimeRef.current = Date.now() - offsetRef.current;
        const tick = () => {
            offsetRef.current = Date.now() - startTimeRef.current;
            setElapsed(offsetRef.current);
            animationFrameRef.current = requestAnimationFrame(tick);
        };
        tick();
    } else {
        cancelAnimationFrame(animationFrameRef.current);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [running]);

  const format = (ms: number) => {
      const min = Math.floor(ms / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      const centi = Math.floor((ms % 1000) / 10);
      return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${centi.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-white text-text-main">
        <div className="text-5xl font-black tabular-nums tracking-wider mono mb-6 text-text-main drop-shadow-sm">
            {format(elapsed)}
        </div>

        {isTeacher && (
            <div className="flex gap-3">
                <button 
                  onClick={() => setRunning(!running)}
                  className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all text-white ${running ? 'bg-danger shadow-lg' : 'bg-primary shadow-lg shadow-glow'}`}
                >
                    {running ? 'Stop' : 'Start'}
                </button>
                <button 
                  onClick={() => { setRunning(false); setElapsed(0); offsetRef.current = 0; }}
                  className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs bg-bg-alt text-text-secondary hover:bg-gray-200 transition-colors"
                >
                    Reset
                </button>
            </div>
        )}
    </div>
  );
};
