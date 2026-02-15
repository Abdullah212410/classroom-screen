
import React, { useState, useEffect } from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const EventCountWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const { targetDate, label } = widget.settings; 
  // targetDate: ISO string
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const dist = new Date(targetDate).getTime() - now;
        
        if (dist < 0) {
             setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else {
             setTimeLeft({
                 days: Math.floor(dist / (1000 * 60 * 60 * 24)),
                 hours: Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                 minutes: Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60)),
                 seconds: Math.floor((dist % (1000 * 60)) / 1000)
             });
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white" style={{ maxHeight: '85vh', maxWidth: '100%', overflow: 'hidden' }}>
       <div className="text-center flex flex-col justify-center" style={{ flex: '1 1 auto', minHeight: 0, overflow: 'auto', maxWidth: '100%' }}>
           <div className="text-xl font-bold mb-4 opacity-90">{label || 'Event Countdown'}</div>
           <div className="flex gap-4" style={{ minWidth: 0 }}>
              {[
                  { l: 'Days', v: timeLeft.days },
                  { l: 'Hrs', v: timeLeft.hours },
                  { l: 'Min', v: timeLeft.minutes },
                  { l: 'Sec', v: timeLeft.seconds }
              ].map(item => (
                  <div key={item.l} className="flex flex-col items-center">
                      <div className="text-4xl font-black tabular-nums">{item.v}</div>
                      <div className="text-[10px] font-bold uppercase opacity-60 tracking-widest">{item.l}</div>
                  </div>
              ))}
           </div>
       </div>

       {isTeacher && (
           <div className="w-full p-2 bg-white/10 backdrop-blur-md flex gap-2 mt-4" style={{ flex: '0 0 auto', minWidth: 0 }}>
               <input
                 type="text"
                 placeholder="Event Name"
                 value={label || ''}
                 onChange={(e) => onUpdate({ settings: { ...widget.settings, label: e.target.value } })}
                 className="flex-1 min-w-0 bg-white/20 border-none rounded text-xs px-2 text-white placeholder-white/50 focus:ring-0"
               />
               <input
                 type="datetime-local"
                 value={targetDate || ''}
                 onChange={(e) => onUpdate({ settings: { ...widget.settings, targetDate: e.target.value } })}
                 className="w-32 bg-white/20 border-none rounded text-xs px-2 text-white"
                 style={{ maxWidth: '100%' }}
               />
           </div>
       )}
    </div>
  );
};
