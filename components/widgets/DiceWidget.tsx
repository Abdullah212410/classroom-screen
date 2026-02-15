
import React, { useState } from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const DiceWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const { currentRoll } = widget.state || { currentRoll: 1 };
  const { sides } = widget.settings;
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      onUpdate({ state: { currentRoll: Math.floor(Math.random() * sides) + 1 } });
      count++;
      if (count > 12) {
        clearInterval(interval);
        onUpdate({ state: { currentRoll: Math.floor(Math.random() * sides) + 1 } });
        setIsRolling(false);
      }
    }, 80);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-gradient-to-b from-white to-gray-50">
      <div 
        onClick={isTeacher ? rollDice : undefined}
        className={`w-32 h-32 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-8 border-white flex items-center justify-center text-7xl font-black text-gray-800 select-none ${isTeacher ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} transition-all duration-150 ${isRolling ? 'animate-dice' : 'hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]'}`}
      >
        {currentRoll}
      </div>
      
      {isTeacher && (
        <div className="mt-8 flex flex-col gap-3 w-full max-w-[200px]">
          <div className="flex items-center justify-between">
             <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">SIDES: {sides}</span>
          </div>
          <input 
            type="range" 
            min="2" max="20" 
            value={sides} 
            onChange={(e) => onUpdate({ settings: { ...widget.settings, sides: parseInt(e.target.value) }})}
            className="w-full accent-blue-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <button 
            onClick={rollDice}
            disabled={isRolling}
            className={`w-full py-3 rounded-2xl text-xs font-extrabold uppercase tracking-widest transition-all ${isRolling ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-black hover:shadow-xl active:scale-95'}`}
          >
            {isRolling ? 'ROLLING...' : 'ROLL DICE'}
          </button>
        </div>
      )}
      
      {!isTeacher && (
          <div className="mt-4 text-[10px] font-bold text-blue-500 uppercase tracking-widest animate-pulse">
            Teacher is rolling...
          </div>
      )}
    </div>
  );
};
