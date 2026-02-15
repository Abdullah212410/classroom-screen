
import React, { useMemo, useEffect, useState } from 'react';
import { RoomBackground } from '../types';
import { BACKGROUND_CATEGORIES, BackgroundImage } from '../data/backgrounds';

interface BackgroundNavigationProps {
  currentBackground: RoomBackground;
  onSetBackground: (bg: RoomBackground) => void;
  onOpenModal: () => void;
}

// Module-level variables to persist history and counter across component re-mounts
let historyStack: RoomBackground[] = [];
let currentIndex = 0;

export const BackgroundNavigation: React.FC<BackgroundNavigationProps> = ({
  currentBackground,
  onSetBackground,
  onOpenModal
}) => {
  const [userUploads, setUserUploads] = useState<BackgroundImage[]>([]);
  // Local state to force re-render when module-level variables change
  const [, setTick] = useState(0);

  // Load user uploads
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_backgrounds');
      if (stored) {
        setUserUploads(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load user backgrounds', e);
    }
  }, [currentBackground]);

  // Initialize history with current background on first load if empty
  useEffect(() => {
    if (historyStack.length === 0 && currentBackground) {
      historyStack.push(currentBackground);
      currentIndex = 0;
      setTick(t => t + 1);
    }
  }, []); 

  const allBackgrounds = useMemo(() => {
    const categoryImages = BACKGROUND_CATEGORIES.flatMap(c => c.images);
    return [...userUploads, ...categoryImages];
  }, [userUploads]);

  const handleNextRandom = () => {
    if (allBackgrounds.length === 0) return;

    // 1. Pick Random Background
    let nextIndex = Math.floor(Math.random() * allBackgrounds.length);
    const currentVal = currentBackground.value;
    
    // Avoid picking the same image twice in a row if possible
    if (allBackgrounds.length > 1 && allBackgrounds[nextIndex].url === currentVal) {
       nextIndex = (nextIndex + 1) % allBackgrounds.length;
    }

    const nextImg = allBackgrounds[nextIndex];
    const newBg: RoomBackground = {
      type: nextImg.tags.includes('upload') ? 'upload' : 'preset',
      value: nextImg.url,
      fit: 'cover',
      mediaType: nextImg.mediaType || 'image'
    };

    // 2. Manage History (Branching behavior)
    // If we are not at the end of history, remove all forward history (create new branch)
    if (currentIndex < historyStack.length - 1) {
      historyStack = historyStack.slice(0, currentIndex + 1);
    }

    // 3. Add new background and increment counter
    historyStack.push(newBg);
    currentIndex++;

    // 4. Apply changes
    onSetBackground(newBg);
    setTick(t => t + 1);
  };

  const handlePrevious = () => {
    // Only move back if we have history
    if (currentIndex > 0) {
      currentIndex--;
      const prevBg = historyStack[currentIndex];
      onSetBackground(prevBg);
      setTick(t => t + 1);
    }
  };

  return (
    <div className="absolute bottom-24 right-4 md:bottom-8 md:right-6 z-[290] flex items-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-100 p-1 pointer-events-auto transition-transform hover:scale-105 select-none touch-manipulation">
      <button
        onClick={handlePrevious}
        disabled={currentIndex <= 0}
        className="flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)]"
        title="Previous Background"
      >
        <svg className="w-[clamp(1.25rem,2.5vw,1.5rem)] h-[clamp(1.25rem,2.5vw,1.5rem)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <span className="px-3 font-black text-gray-600 tabular-nums tracking-tight min-w-[30px] text-center text-[clamp(0.75rem,1.5vw,1rem)]">
        {currentIndex}
      </span>

      <button
        onClick={handleNextRandom}
        className="flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)]"
        title="Random Background"
      >
        <svg className="w-[clamp(1.25rem,2.5vw,1.5rem)] h-[clamp(1.25rem,2.5vw,1.5rem)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
           <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};
