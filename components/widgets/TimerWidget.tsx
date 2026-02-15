
import React, { useState, useEffect, useRef } from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const TimerWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const { running, endTime, pausedRemaining } = widget.state || { running: false, endTime: 0, pausedRemaining: 300 };
  const [localRemaining, setLocalRemaining] = useState(pausedRemaining || 300);
  const [inputMin, setInputMin] = useState('5');
  const [inputSec, setInputSec] = useState('00');
  
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      if (running) {
        const now = Date.now();
        const left = Math.max(0, Math.ceil((endTime - now) / 1000));
        setLocalRemaining(left);
        
        if (left <= 0) {
           if (isTeacher && left === 0 && running) {
             const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
             audio.play().catch(() => {});
             onUpdate({ state: { ...widget.state, running: false, pausedRemaining: 0 } });
           }
        } else {
          frameRef.current = requestAnimationFrame(tick);
        }
      } else {
        setLocalRemaining(pausedRemaining !== undefined ? pausedRemaining : 300);
      }
    };

    tick();
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [running, endTime, pausedRemaining, isTeacher, onUpdate, widget.state]);

  const handleStart = () => {
    let durationToUse = pausedRemaining;
    if (pausedRemaining <= 0) {
       const min = parseInt(inputMin) || 0;
       const sec = parseInt(inputSec) || 0;
       durationToUse = min * 60 + sec;
    }

    if (durationToUse <= 0) return;

    const now = Date.now();
    onUpdate({ 
      state: { 
        running: true, 
        endTime: now + durationToUse * 1000,
        pausedRemaining: durationToUse 
      } 
    });
  };

  const handlePause = () => {
    onUpdate({ 
      state: { 
        running: false, 
        endTime: 0,
        pausedRemaining: localRemaining 
      } 
    });
  };

  const handleReset = () => {
    const duration = (parseInt(inputMin) || 0) * 60 + (parseInt(inputSec) || 0);
    onUpdate({ 
      state: { 
        running: false, 
        endTime: 0,
        pausedRemaining: duration 
      } 
    });
    setLocalRemaining(duration);
  };

  const setPreset = (min: number) => {
    const secs = min * 60;
    setInputMin(min.toString());
    setInputSec('00');
    
    if (!running) {
        onUpdate({ 
            state: { 
            running: false, 
            endTime: 0,
            pausedRemaining: secs 
            } 
        });
        setLocalRemaining(secs);
    }
  };

  const handleInputChange = (field: 'min' | 'sec', value: string) => {
      const clean = value.replace(/[^0-9]/g, '');
      if (field === 'min') setInputMin(clean);
      else setInputSec(clean);
      
      if (!running) {
          const m = parseInt(field === 'min' ? clean : inputMin) || 0;
          const s = parseInt(field === 'sec' ? clean : inputSec) || 0;
          const total = m * 60 + s;
           onUpdate({ 
            state: { 
                running: false, 
                endTime: 0,
                pausedRemaining: total 
            } 
        });
      }
  };

  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalDuration = Math.max(1, (parseInt(inputMin) || 0) * 60 + (parseInt(inputSec) || 0));
  const displayTotal = Math.max(totalDuration, localRemaining);
  const progress = Math.min(100, Math.max(0, (localRemaining / displayTotal) * 100));

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-text-main relative">
      {/* Visual Ring */}
      <div 
        className="relative flex items-center justify-center mb-6 shrink-0"
        style={{ width: 'clamp(10rem, 40vw, 14rem)', height: 'clamp(10rem, 40vw, 14rem)' }}
      >
          <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
              {/* Background Ring */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-neutral-border)" strokeWidth="4" className="opacity-50" />
              {/* Progress Ring */}
              <circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke={localRemaining < 10 && running ? 'var(--color-status-danger)' : 'var(--color-primary-main)'} 
                strokeWidth="6" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * (localRemaining > 0 ? progress : 0)) / 100}
                strokeLinecap="round"
                className="transition-all duration-300 linear"
              />
          </svg>
          
          {/* Central Time Display */}
          <div className="absolute flex flex-col items-center justify-center">
             {running ? (
                 <div 
                    className={`font-black tabular-nums tracking-tighter ${localRemaining < 10 ? 'text-red-500 animate-pulse' : 'text-text-main'}`}
                    style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontFamily: 'Nunito, sans-serif' }}
                 >
                    {formatTime(localRemaining)}
                 </div>
             ) : (
                <div className="flex items-center justify-center gap-1">
                    <input 
                        type="text" 
                        value={inputMin}
                        onChange={(e) => handleInputChange('min', e.target.value)}
                        className="font-black text-text-main text-center bg-transparent border-b-2 border-transparent hover:border-border-default focus:border-focus outline-none transition-colors rounded-none placeholder-text-secondary/30"
                        style={{ width: 'clamp(3.5rem, 10vw, 4.5rem)', fontSize: 'clamp(2rem, 6vw, 3rem)', fontFamily: 'Nunito, sans-serif' }}
                        placeholder="00"
                    />
                    <span className="font-black text-text-secondary pb-3" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>:</span>
                    <input 
                        type="text" 
                        value={inputSec}
                        onChange={(e) => handleInputChange('sec', e.target.value)}
                        className="font-black text-text-main text-center bg-transparent border-b-2 border-transparent hover:border-border-default focus:border-focus outline-none transition-colors rounded-none placeholder-text-secondary/30"
                        style={{ width: 'clamp(3.5rem, 10vw, 4.5rem)', fontSize: 'clamp(2rem, 6vw, 3rem)', fontFamily: 'Nunito, sans-serif' }}
                        placeholder="00"
                    />
                </div>
             )}
             {localRemaining === 0 && !running && <span className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1 animate-bounce">Time's Up!</span>}
          </div>
      </div>
      
      {isTeacher && (
        <div className="flex flex-col gap-3 w-full max-w-[320px]">
           <div className="flex gap-2">
             {!running ? (
               <button onClick={handleStart} className="flex-1 btn-primary py-3 text-sm tracking-wide shadow-md">
                 {pausedRemaining > 0 && pausedRemaining < ((parseInt(inputMin)||0)*60 + (parseInt(inputSec)||0)) ? "RESUME" : "START"}
               </button>
             ) : (
               <button onClick={handlePause} className="flex-1 bg-amber-400 hover:bg-amber-500 text-white py-3 rounded-xl font-bold shadow-md transition-all active:scale-95 text-sm tracking-wide">
                 PAUSE
               </button>
             )}
             <button onClick={handleReset} className="px-6 btn-secondary py-3 text-sm">
               RESET
             </button>
           </div>

           {!running && (
             <div className="flex gap-2 justify-center mt-1 flex-wrap">
                {[1, 5, 10, 15].map(m => (
                  <button 
                    key={m} 
                    onClick={() => setPreset(m)}
                    className="px-3 py-1.5 rounded-lg bg-bg-alt text-xs font-bold text-text-secondary hover:bg-primary-hover hover:text-white transition-colors border border-border-default"
                  >
                    {m}m
                  </button>
                ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
};
