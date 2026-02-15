
import React from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const HyperlinkWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const { text, url } = widget.settings;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block w-full text-center py-8 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-2xl transition-all shadow-lg active:scale-95"
      >
        {text || 'Visit Link'}
      </a>
      
      {isTeacher && (
        <div className="mt-6 w-full flex flex-col gap-2">
           <input 
             type="text" 
             value={text} 
             placeholder="Button Text"
             onChange={(e) => onUpdate({ settings: { ...widget.settings, text: e.target.value }})}
             className="w-full p-2 text-xs border rounded"
           />
           <input 
             type="text" 
             value={url} 
             placeholder="Link URL"
             onChange={(e) => onUpdate({ settings: { ...widget.settings, url: e.target.value }})}
             className="w-full p-2 text-xs border rounded"
           />
        </div>
      )}
    </div>
  );
};
