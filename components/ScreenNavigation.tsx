
import React from 'react';

interface ScreenNavigationProps {
  currentScreenIndex: number;
  totalScreens: number;
  canGoBack: boolean;
  onPreviousScreen: () => void;
  onCreateNewScreen: () => void;
}

export const ScreenNavigation: React.FC<ScreenNavigationProps> = ({
  currentScreenIndex,
  totalScreens,
  canGoBack,
  onPreviousScreen,
  onCreateNewScreen
}) => {
  return (
    <div className="absolute bottom-24 left-4 md:bottom-8 md:left-6 z-[290] flex items-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-100 p-1 pointer-events-auto transition-transform hover:scale-105 select-none touch-manipulation">
      <button
        onClick={onPreviousScreen}
        disabled={!canGoBack}
        className="flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)]"
        title="Previous Screen"
      >
        <svg className="w-[clamp(1.25rem,2.5vw,1.5rem)] h-[clamp(1.25rem,2.5vw,1.5rem)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <span className="px-3 font-black text-gray-600 tabular-nums tracking-tight min-w-[60px] text-center text-[clamp(0.75rem,1.5vw,1rem)]">
        {currentScreenIndex} / {totalScreens}
      </span>

      <button
        onClick={onCreateNewScreen}
        className="flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)]"
        title="Create New Screen"
      >
        <svg className="w-[clamp(1.25rem,2.5vw,1.5rem)] h-[clamp(1.25rem,2.5vw,1.5rem)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
           <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};
