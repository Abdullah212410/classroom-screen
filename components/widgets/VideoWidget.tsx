
import React from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const VideoWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const { url } = widget.settings;

  const getEmbedUrl = (input: string) => {
    if (!input) return '';
    if (input.includes('youtube.com') || input.includes('youtu.be')) {
      // Simple YouTube ID extraction
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = input.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    }
    if (input.includes('vimeo.com')) {
       const id = input.split('/').pop();
       return `https://player.vimeo.com/video/${id}`;
    }
    return input; // Assume direct link or embeddable
  };

  const finalUrl = getEmbedUrl(url);
  const isRawVideo = (finalUrl || '').match(/\.(mp4|webm|mov|ogg|m4v)(\?|$|#)/i);

  return (
    <div className="flex flex-col h-full bg-black rounded-lg overflow-hidden">
      {finalUrl ? (
          isRawVideo ? (
             <video 
                src={finalUrl}
                className="w-full h-full object-contain"
                controls
                playsInline
             />
          ) : (
             <iframe 
                src={finalUrl} 
                className="w-full h-full border-0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
             />
          )
      ) : (
          <div className="flex items-center justify-center h-full text-text-secondary font-bold">
              No Video URL
          </div>
      )}

      {isTeacher && (
         <div className="bg-bg-main p-2">
            <input 
              type="text" 
              className="w-full bg-bg-alt rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 ring-focus text-text-main placeholder-text-secondary"
              placeholder="Paste YouTube/Vimeo/MP4 URL..."
              value={url || ''}
              onChange={(e) => onUpdate({ settings: { ...widget.settings, url: e.target.value } })}
            />
         </div>
      )}
    </div>
  );
};
