
import React from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const TextWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const { content, fontSize, align, color, bold } = widget.settings;

  return (
    <div className="flex flex-col h-full w-full">
      <textarea
        className="w-full h-full bg-transparent resize-none outline-none border-none p-4 placeholder-text-secondary/50 text-text-main"
        style={{
            fontSize: `${fontSize || 24}px`,
            textAlign: align || 'left',
            color: color || 'var(--c-text-main)',
            fontWeight: bold ? 'bold' : 'normal',
            fontFamily: 'Quicksand, sans-serif'
        }}
        value={content || ''}
        placeholder="Type something..."
        readOnly={!isTeacher}
        onChange={(e) => onUpdate({ settings: { ...widget.settings, content: e.target.value } })}
      />
      
      {isTeacher && (
         <div className="absolute top-0 right-0 left-0 bg-bg-main shadow-md transform -translate-y-full opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 p-1 rounded-t-lg border border-border-default justify-center">
            <input 
              type="color" 
              value={color || '#091e42'} 
              onChange={(e) => onUpdate({ settings: { ...widget.settings, color: e.target.value } })}
              className="w-6 h-6 p-0 border-none rounded cursor-pointer" 
            />
            <button 
                onClick={() => onUpdate({ settings: { ...widget.settings, bold: !bold } })}
                className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-text-main ${bold ? 'bg-border-default' : 'hover:bg-bg-alt'}`}
            >B</button>
            <div className="w-px h-4 bg-border-default mx-1"></div>
            <button onClick={() => onUpdate({ settings: { ...widget.settings, fontSize: (fontSize || 24) - 4 } })} className="w-6 h-6 hover:bg-bg-alt rounded text-xs text-text-main">-</button>
            <span className="text-[10px] w-4 text-center text-text-main">{fontSize || 24}</span>
            <button onClick={() => onUpdate({ settings: { ...widget.settings, fontSize: (fontSize || 24) + 4 } })} className="w-6 h-6 hover:bg-bg-alt rounded text-xs text-text-main">+</button>
         </div>
      )}
    </div>
  );
};
