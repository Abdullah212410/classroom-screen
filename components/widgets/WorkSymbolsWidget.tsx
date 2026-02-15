
import React from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

const SYMBOLS = [
    { id: 'silence', label: 'Silence', icon: '🤫' },
    { id: 'whisper', label: 'Whisper', icon: '😶‍🌫️' },
    { id: 'ask', label: 'Ask Neighbor', icon: '🗣️' },
    { id: 'group', label: 'Work Together', icon: '👥' },
];

export const WorkSymbolsWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const { symbol } = widget.settings;
  const activeSymbol = SYMBOLS.find(s => s.id === symbol) || SYMBOLS[0];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative group">
       <div className="text-[8rem] leading-none filter drop-shadow-xl select-none">
          {activeSymbol.icon}
       </div>
       <div className="mt-2 bg-white/90 backdrop-blur-md px-4 py-1 rounded-full shadow-sm border border-white/20">
          <span className="text-sm font-black uppercase tracking-widest text-slate-800">{activeSymbol.label}</span>
       </div>

       {isTeacher && (
           <div className="absolute bottom-full mb-2 flex gap-2 bg-white p-2 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
              {SYMBOLS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => onUpdate({ settings: { ...widget.settings, symbol: s.id } })}
                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-xl transition-all ${symbol === s.id ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'hover:bg-gray-100'}`}
                    title={s.label}
                  >
                      {s.icon}
                  </button>
              ))}
           </div>
       )}
    </div>
  );
};
