
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
    {
      id: 'red',
      bgColor: '#FF3B30',
      glowShadow: '0 0 30px rgba(255,59,48,0.8), 0 0 60px rgba(255,59,48,0.4)',
      ring: 'ring-[#FF3B30]/50'
    },
    {
      id: 'yellow',
      bgColor: '#FFD60A',
      glowShadow: '0 0 30px rgba(255,214,10,0.8), 0 0 60px rgba(255,214,10,0.4)',
      ring: 'ring-[#FFD60A]/50'
    },
    {
      id: 'green',
      bgColor: '#34C759',
      glowShadow: '0 0 30px rgba(52,199,89,0.8), 0 0 60px rgba(52,199,89,0.4)',
      ring: 'ring-[#34C759]/50'
    },
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
      
      <div
        className="p-6 rounded-full flex flex-col gap-5 relative"
        style={{
          background: '#0B0B0F',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)'
        }}
      >
        {colors.map(c => {
          const isActive = color === c.id;
          return (
            <button
              key={c.id}
              disabled={!isTeacher}
              onClick={() => onUpdate({ state: { color: c.id } })}
              className={`rounded-full transition-all duration-300 border-2 relative ${isActive ? `scale-[1.15] border-white ring-4 ${c.ring} z-10 brightness-110` : 'border-gray-300/60 opacity-50 hover:opacity-70'}`}
              style={{
                width: 'clamp(3.5rem, 10vw, 5rem)',
                height: 'clamp(3.5rem, 10vw, 5rem)',
                backgroundColor: isActive ? c.bgColor : `${c.bgColor}20`,
                boxShadow: isActive ? c.glowShadow : '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
              }}
            >
              {isActive && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent rounded-full"></div>
                  <div className="absolute inset-2 bg-white/20 rounded-full blur-sm"></div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
