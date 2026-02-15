
import React, { useState, useEffect } from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const ClockWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const [time, setTime] = useState(new Date());
  const { format24 } = widget.settings;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: !format24 
  });

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 relative">
       <div className="text-[clamp(3rem,8vw,5rem)] font-black text-text-main tabular-nums tracking-tighter leading-none font-[Nunito]">
          {timeString}
       </div>
       <div className="mt-3 text-sm font-bold text-text-secondary uppercase tracking-[0.2em]">
          {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
       </div>

       {isTeacher && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
               onClick={() => onUpdate({ settings: { ...widget.settings, format24: !format24 } })}
               className="bg-bg-alt hover:bg-border-hover px-2 py-1 rounded text-[10px] font-bold uppercase text-text-secondary border border-border-default"
             >
                {format24 ? '24h' : '12h'}
             </button>
          </div>
       )}
    </div>
  );
};
