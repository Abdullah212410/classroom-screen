
import React from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

const STICKERS = ['⭐', '🌟', '❤️', '👍', '🎉', '🔥', '💯', '✅', '❌', '💡', '🚀', '🐱', '🐶', '🍕'];

export const StickerWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const { sticker } = widget.settings;

  return (
    <div className="flex flex-col items-center justify-center h-full group relative">
       <div className="text-[8rem] leading-none select-none filter drop-shadow-xl hover:scale-110 transition-transform cursor-grab active:cursor-grabbing">
           {sticker || '⭐'}
       </div>

       {isTeacher && (
           <div className="absolute inset-x-0 bottom-0 bg-bg-main/90 backdrop-blur p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 overflow-x-auto scrollbar-hide rounded-b-xl border-t border-border-default">
               {STICKERS.map(s => (
                   <button 
                     key={s}
                     onClick={() => onUpdate({ settings: { sticker: s } })}
                     className="text-2xl hover:bg-bg-alt p-1 rounded transition-colors"
                   >
                       {s}
                   </button>
               ))}
           </div>
       )}
    </div>
  );
};
