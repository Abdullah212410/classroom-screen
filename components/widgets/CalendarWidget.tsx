
import React, { useState } from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const CalendarWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const [date, setDate] = useState(new Date());
  const events = widget.settings.events || {};

  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handleDayClick = (day: number) => {
    if (!isTeacher) return;
    const key = `${date.getFullYear()}-${date.getMonth()}-${day}`;
    const current = events[key] || '';
    const note = prompt('Event for ' + key, current);
    if (note !== null) {
        onUpdate({ settings: { ...widget.settings, events: { ...events, [key]: note } } });
    }
  };

  const changeMonth = (delta: number) => {
    setDate(new Date(date.getFullYear(), date.getMonth() + delta, 1));
  };

  return (
    <div className="flex flex-col h-full bg-white p-4">
      <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-bg-alt rounded text-text-secondary">◀</button>
          <div className="font-bold text-text-main">{monthNames[date.getMonth()]} {date.getFullYear()}</div>
          <button onClick={() => changeMonth(1)} className="p-1 hover:bg-bg-alt rounded text-text-secondary">▶</button>
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1 text-center">
          {['S','M','T','W','T','F','S'].map(d => (
              <div key={d} className="text-[10px] font-bold text-text-secondary uppercase">{d}</div>
          ))}
          {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
              const d = i + 1;
              const key = `${date.getFullYear()}-${date.getMonth()}-${d}`;
              const hasEvent = !!events[key];
              const isToday = new Date().toDateString() === new Date(date.getFullYear(), date.getMonth(), d).toDateString();
              
              return (
                  <div 
                    key={d} 
                    onClick={() => handleDayClick(d)}
                    className={`
                      aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-bold cursor-pointer transition-all
                      ${isToday ? 'bg-focus text-white shadow-md' : 'hover:bg-bg-alt text-text-main'}
                      ${hasEvent && !isToday ? 'bg-focus-light text-focus border border-focus' : ''}
                    `}
                    title={events[key]}
                  >
                      {d}
                      {hasEvent && <div className={`w-1 h-1 rounded-full mt-0.5 ${isToday ? 'bg-white' : 'bg-focus'}`}></div>}
                  </div>
              );
          })}
      </div>
    </div>
  );
};
