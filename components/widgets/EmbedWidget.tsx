
import React, { useMemo } from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const EmbedWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  // Use embedCode, fallback to url for backward compatibility
  const rawInput = widget.settings.embedCode ?? widget.settings.url ?? '';

  const iframeProps = useMemo(() => {
    if (!rawInput) return null;

    // 1. Try parsing as HTML to find an iframe tag
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawInput, 'text/html');
    const iframe = doc.querySelector('iframe');

    if (iframe) {
      const src = iframe.getAttribute('src');
      
      // Security: Strictly allow only http/https protocols
      if (!src || (!src.startsWith('http://') && !src.startsWith('https://'))) {
        return null;
      }

      return {
        src,
        width: iframe.getAttribute('width') || '100%',
        height: iframe.getAttribute('height') || '100%',
        title: iframe.getAttribute('title') || 'Embed Content',
        allow: iframe.getAttribute('allow') || undefined,
        allowFullScreen: iframe.hasAttribute('allowfullscreen') || iframe.hasAttribute('allowFullScreen'),
        loading: iframe.getAttribute('loading') as 'lazy' | 'eager' | undefined,
        referrerPolicy: iframe.getAttribute('referrerpolicy') as React.HTMLAttributeReferrerPolicy | undefined,
      };
    }

    // 2. Fallback: Check if input is just a direct URL (e.g. pasted a link instead of code)
    // Regex for basic URL validation starting with http/https
    const urlPattern = /^(https?:\/\/[^\s]+)$/;
    if (urlPattern.test(rawInput.trim())) {
      return {
        src: rawInput.trim(),
        width: '100%',
        height: '100%',
        title: 'Embed Content',
        allowFullScreen: true,
      };
    }

    return null;
  }, [rawInput]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 bg-bg-alt flex items-center justify-center relative overflow-hidden">
        {iframeProps ? (
          <iframe 
            {...iframeProps}
            className="w-full h-full border-0" 
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-text-secondary p-6 text-center select-none">
             <div className="w-16 h-16 mb-3 rounded-2xl bg-border-default flex items-center justify-center text-text-secondary/50">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
               </svg>
             </div>
             <span className="text-sm font-bold text-text-secondary">Invalid or missing embed code</span>
          </div>
        )}
      </div>
      
      {isTeacher && (
        <div className="p-4 bg-bg-main border-t border-border-default">
           <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2 block">Embed Code</label>
           <textarea
             value={rawInput} 
             placeholder={'<iframe src="..." width="..." height="..." allow="..." ></iframe>'}
             onChange={(e) => onUpdate({ settings: { ...widget.settings, embedCode: e.target.value, url: e.target.value } })}
             className="w-full p-3 text-xs border border-border-default rounded-xl bg-bg-alt focus:bg-bg-main focus:border-focus focus:ring-4 focus:ring-focus-light outline-none transition-all resize-none font-mono text-text-main placeholder-text-secondary/50"
             rows={3}
             spellCheck={false}
           />
        </div>
      )}
    </div>
  );
};
