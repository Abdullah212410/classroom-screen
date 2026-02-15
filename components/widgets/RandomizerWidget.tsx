
import React, { useState } from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const RandomizerWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const { lastPicked } = widget.state || {};
  const { items } = widget.settings;
  const [isSpinning, setIsSpinning] = useState(false);

  const handlePick = () => {
    const list = items.split('\n').map((i: string) => i.trim()).filter((i: string) => i !== '');
    if (list.length === 0) return;

    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      const temp = list[Math.floor(Math.random() * list.length)];
      onUpdate({ state: { lastPicked: temp } });
      count++;
      if (count > 15) {
        clearInterval(interval);
        const final = list[Math.floor(Math.random() * list.length)];
        onUpdate({ state: { lastPicked: final } });
        setIsSpinning(false);
      }
    }, 60);
  };

  return (
    <div className="flex flex-col h-full bg-white p-6">
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <div className={`text-4xl font-black text-center px-6 py-12 rounded-[2rem] w-full transition-all duration-150 ${isSpinning ? 'scale-110 text-blue-500 bg-blue-50 rotate-2' : 'text-gray-900 bg-gray-50'}`}>
          {lastPicked || '---'}
        </div>
        {!lastPicked && !isSpinning && <div className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ready to pick!</div>}
      </div>

      {isTeacher && (
        <div className="mt-6 flex flex-col gap-4">
           <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Student List</label>
              <textarea 
                className="w-full text-sm p-4 border-2 border-gray-100 rounded-2xl h-24 bg-gray-50 focus:bg-white focus:border-blue-200 outline-none transition-all scrollbar-hide"
                value={items}
                placeholder="Enter names, one per line..."
                onChange={(e) => onUpdate({ settings: { ...widget.settings, items: e.target.value }})}
              />
           </div>
           <button 
             onClick={handlePick}
             disabled={isSpinning}
             className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 ${isSpinning ? 'bg-blue-100 text-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30'}`}
           >
             {isSpinning ? 'CHOOOOSING...' : 'PICK RANDOM'}
           </button>
        </div>
      )}
    </div>
  );
};
