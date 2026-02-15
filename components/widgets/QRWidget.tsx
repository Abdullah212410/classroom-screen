
import React from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const QRWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const { url } = widget.settings;

  // Simple QR generation using an external API for lightness
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url || 'https://classroomscreen.com')}`;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100 flex items-center justify-center">
        <img src={qrUrl} alt="QR Code" className="max-w-full max-h-full aspect-square" />
      </div>
      
      {isTeacher && (
        <div className="mt-4 w-full">
           <label className="text-[10px] font-bold text-gray-400 block mb-1">TARGET URL</label>
           <input 
             type="text" 
             value={url} 
             placeholder="https://..."
             onChange={(e) => onUpdate({ settings: { ...widget.settings, url: e.target.value }})}
             className="w-full p-2 text-xs border rounded bg-gray-50 focus:bg-white"
           />
        </div>
      )}
    </div>
  );
};
