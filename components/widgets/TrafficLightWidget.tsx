
import React from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const TrafficLightWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const { color } = widget.state;
  const { label } = widget.settings;

  const colors = [
    { id: 'red', bg: 'bg-red-500', shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]', ring: 'ring-red-500/40' },
    { id: 'yellow', bg: 'bg-amber-400', shadow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]', ring: 'ring-amber-400/40' },
    { id: 'green', bg: 'bg-emerald-500', shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]', ring: 'ring-emerald-500/40' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 overflow-hidden">
      <div className="mb-4 text-center w-full">
         {isTeacher ? (
           <input 
             type="text" 
             value={label} 
             onChange={(e) => onUpdate({ settings: { ...widget.settings, label: e.target.value }})}
             className="bg-transparent text-center font-bold text-text-secondary outline-none border-b border-transparent focus:border-focus transition-colors uppercase tracking-[0.2em] text-[10px] w-full"
           />
         ) : (
           <h3 className="font-bold text-text-secondary uppercase tracking-[0.2em] text-[10px] truncate">{label}</h3>
         )}
      </div>
      
      <div className="bg-bg-alt/50 p-4 rounded-full flex flex-col gap-4 shadow-inner border border-border-default backdrop-blur-sm relative">
        {colors.map(c => (
          <button 
            key={c.id}
            disabled={!isTeacher}
            onClick={() => onUpdate({ state: { color: c.id } })}
            className={`rounded-full transition-all duration-300 border-2 relative ${color === c.id ? `${c.bg} ${c.shadow} scale-110 border-white ring-4 ${c.ring} z-10` : 'bg-gray-200 border-transparent opacity-40 hover:opacity-60 grayscale'}`}
            style={{ width: 'clamp(3rem, 10vw, 4rem)', height: 'clamp(3rem, 10vw, 4rem)' }}
          >
            {color === c.id && <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-full"></div>}
          </button>
        ))}
      </div>
    </div>
  );
};
