
import React, { useState } from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const GroupMakerWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const { names, groupSize, groups } = widget.settings;

  const handleGenerate = () => {
    const nameList = (names || '').split('\n').map((n: string) => n.trim()).filter((n: string) => n);
    if (nameList.length === 0) return;

    for (let i = nameList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nameList[i], nameList[j]] = [nameList[j], nameList[i]];
    }

    const newGroups: string[][] = [];
    const size = parseInt(groupSize) || 3;
    
    for (let i = 0; i < nameList.length; i += size) {
        newGroups.push(nameList.slice(i, i + size));
    }

    onUpdate({ settings: { ...widget.settings, groups: newGroups } });
  };

  return (
    <div className="flex flex-col h-full bg-white p-4">
      <div className="flex-1 overflow-auto scrollbar-hide">
         {(!groups || groups.length === 0) ? (
             <div className="flex items-center justify-center h-full text-text-secondary text-sm font-bold">
                 Enter names and click generate
             </div>
         ) : (
             <div className="grid grid-cols-2 gap-3">
                 {groups.map((grp: string[], i: number) => (
                     <div key={i} className="bg-focus-light p-3 rounded-xl border border-focus/20">
                         <div className="text-[10px] font-black text-focus uppercase mb-1">Group {i + 1}</div>
                         <div className="text-sm font-bold text-text-main leading-tight">
                             {grp.map(n => <div key={n}>{n}</div>)}
                         </div>
                     </div>
                 ))}
             </div>
         )}
      </div>

      {isTeacher && (
         <div className="mt-4 border-t border-border-default pt-4 flex flex-col gap-3">
             <textarea 
                className="w-full h-20 bg-bg-alt rounded-xl p-3 text-xs border border-border-default focus:border-focus outline-none resize-none text-text-main"
                placeholder="Paste names here (one per line)..."
                value={names || ''}
                onChange={(e) => onUpdate({ settings: { ...widget.settings, names: e.target.value } })}
             />
             <div className="flex gap-2">
                 <div className="flex items-center bg-bg-alt rounded-xl px-3 border border-border-default">
                     <span className="text-[10px] font-bold text-text-secondary uppercase mr-2">Size</span>
                     <input 
                       type="number" 
                       className="w-10 bg-transparent text-sm font-bold outline-none text-text-main"
                       value={groupSize || 3}
                       onChange={(e) => onUpdate({ settings: { ...widget.settings, groupSize: e.target.value } })}
                     />
                 </div>
                 <button 
                   onClick={handleGenerate}
                   className="flex-1 bg-primary hover:bg-primary-hover text-white py-2 rounded-xl font-bold text-xs uppercase tracking-wide transition-colors shadow-md"
                 >
                    Generate
                 </button>
             </div>
         </div>
      )}
    </div>
  );
};
