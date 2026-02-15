
import React from 'react';

interface Screen {
  id: string;
  name: string;
  createdAt: number;
}

interface ScreenSwitcherProps {
  screens: Screen[];
  activeScreenId: string;
  onSwitchScreen: (screenId: string) => void;
  onCreateScreen: () => void;
}

export const ScreenSwitcher: React.FC<ScreenSwitcherProps> = ({
  screens,
  activeScreenId,
  onSwitchScreen,
  onCreateScreen
}) => {
  if (screens.length <= 1) return null;

  return (
    <div className="absolute top-20 left-4 z-[290] pointer-events-auto">
      <div className="backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden" style={{ backgroundColor: 'rgba(237, 59, 145, 0.95)' }}>
        <div className="flex items-center gap-1 p-1">
          {screens.map((screen, index) => (
            <button
              key={screen.id}
              onClick={() => onSwitchScreen(screen.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeScreenId === screen.id
                  ? 'bg-white text-primary shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
              title={screen.name}
            >
              Screen {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export interface Screen {
  id: string;
  name: string;
  createdAt: number;
}
