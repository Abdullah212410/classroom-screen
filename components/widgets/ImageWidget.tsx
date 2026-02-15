
import React from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const ImageWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const { url } = widget.settings;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onUpdate({ settings: { ...widget.settings, url: ev.target?.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative group">
      {url ? (
        <img src={url} alt="Sticker" className="w-full h-full object-contain pointer-events-none" />
      ) : (
        <div className="flex items-center justify-center h-full text-text-secondary border-2 border-dashed border-border-default rounded-xl m-2">
           <span className="text-xs font-bold uppercase">No Image</span>
        </div>
      )}

      {isTeacher && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm rounded-xl">
           <label className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-bg-alt text-text-main">
              Upload
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
           </label>
           <button 
             onClick={() => {
                const newUrl = prompt("Enter image URL:", url);
                if (newUrl !== null) onUpdate({ settings: { ...widget.settings, url: newUrl } });
             }}
             className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-bg-alt text-text-main"
           >
              Link
           </button>
        </div>
      )}
    </div>
  );
};
