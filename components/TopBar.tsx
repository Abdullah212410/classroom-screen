
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopMenu } from './TopMenu';
import { RoomState } from '../types';
import { exportStateToJson } from '../utils/backupJson';

interface TopBarProps {
  isDrawingMode?: boolean;
  onExitDrawing?: () => void;
  room?: RoomState | null;
  onImportRoom?: (room: RoomState) => void;
  // Screen navigation props
  currentScreenIndex?: number;
  totalScreens?: number;
  canGoBack?: boolean;
  onPreviousScreen?: () => void;
  onCreateNewScreen?: () => void;
  onDeleteScreen?: (screenId?: string) => void;
  screensList?: Array<{ id: string; name: string }>;
}

const TopBar: React.FC<TopBarProps> = ({
  isDrawingMode,
  onExitDrawing,
  room,
  onImportRoom,
  currentScreenIndex = 1,
  totalScreens = 1,
  canGoBack = false,
  onPreviousScreen,
  onCreateNewScreen,
  onDeleteScreen,
  screensList = []
}) => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <header className="absolute top-0 w-full h-16 flex items-center justify-between px-4 md:px-6 z-[300] shrink-0 pointer-events-none mt-2 gap-3 flex-wrap">

      {/* Left Section */}
      <div className="pointer-events-auto backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-white/50 flex items-center gap-3 transition-all hover:shadow-xl" style={{ backgroundColor: 'rgba(237, 59, 145, 0.9)' }}>
        {isDrawingMode ? (
          <>
             <button
                onClick={onExitDrawing}
                className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors group shrink-0 border border-white/30"
                title="Back to Tools"
            >
               <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
               </svg>
            </button>
            <div className="flex items-center gap-2 border-l border-white/30 pl-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <span className="text-sm font-extrabold text-white tracking-tight">Annotating</span>
            </div>
          </>
        ) : (
          <>
            <button onClick={handleHomeClick} className="w-9 h-9 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-all shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </button>
            <div className="flex flex-col items-start">
              <span className="text-sm font-extrabold text-white hidden sm:inline-block tracking-tight">String Board</span>
              <span className="text-[10px] text-white/70 hidden sm:inline-block">Auto-saved</span>
            </div>
          </>
        )}
      </div>

      {/* Middle Section - Screen Navigation */}
      {!isDrawingMode && totalScreens > 0 && (
        <ScreenNavigationWidget
          currentScreenIndex={currentScreenIndex}
          totalScreens={totalScreens}
          canGoBack={canGoBack}
          onPreviousScreen={onPreviousScreen || (() => {})}
          onCreateNewScreen={onCreateNewScreen || (() => {})}
          onDeleteScreen={onDeleteScreen}
          screensList={screensList}
        />
      )}

      {/* Right Section */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
            onClick={() => room && exportStateToJson(room)}
            className="w-10 h-10 backdrop-blur-xl rounded-full shadow-lg border border-white/50 flex items-center justify-center text-white hover:shadow-xl transition-all shrink-0 group"
            style={{ backgroundColor: 'rgba(237, 59, 145, 0.9)' }}
            title="Download JSON"
        >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
        </button>

        <button
            onClick={toggleFullscreen}
            className="w-10 h-10 backdrop-blur-xl rounded-full shadow-lg border border-white/50 flex items-center justify-center text-white hover:shadow-xl transition-all shrink-0 group"
            style={{
              backgroundColor: '#ED3B91',
              transition: 'background-color 0.2s ease, transform 0.1s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D92F82'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ED3B91'}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
             {isFullscreen ? (
                <svg className="w-5 h-5 group-hover:scale-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            ) : (
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            )}
        </button>

        <TopMenu room={room} onImport={onImportRoom} />
      </div>
    </header>
  );
};

// Screen Navigation Widget Component
interface ScreenNavigationWidgetProps {
  currentScreenIndex: number;
  totalScreens: number;
  canGoBack: boolean;
  onPreviousScreen: () => void;
  onCreateNewScreen: () => void;
  onDeleteScreen?: (screenId?: string) => void;
  screensList?: Array<{ id: string; name: string }>;
}

const ScreenNavigationWidget: React.FC<ScreenNavigationWidgetProps> = ({
  currentScreenIndex,
  totalScreens,
  canGoBack,
  onPreviousScreen,
  onCreateNewScreen,
  onDeleteScreen,
  screensList = []
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleDeleteClick = (screenId?: string) => {
    if (totalScreens <= 1) {
      alert('Cannot delete the last remaining screen.');
      return;
    }

    const screenName = screenId
      ? screensList.find(s => s.id === screenId)?.name
      : `Screen ${currentScreenIndex}`;

    const confirmed = window.confirm(`Delete ${screenName}?\n\nThis action cannot be undone.`);
    if (confirmed && onDeleteScreen) {
      onDeleteScreen(screenId);
      setShowMenu(false);
    }
  };

  return (
    <div ref={menuRef} className="relative pointer-events-auto">
      <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-100 p-1 transition-transform hover:scale-105 select-none">
        <button
          onClick={onPreviousScreen}
          disabled={!canGoBack}
          className="flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors w-8 h-8 md:w-10 md:h-10"
          title="Previous Screen"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="px-2 md:px-3 font-black text-gray-600 tabular-nums tracking-tight min-w-[50px] md:min-w-[60px] text-center text-xs md:text-sm hover:bg-gray-100 rounded-full transition-colors"
          title="Screen options"
        >
          {currentScreenIndex} / {totalScreens}
        </button>

        <button
          onClick={onCreateNewScreen}
          className="flex items-center justify-center rounded-full transition-colors w-8 h-8 md:w-10 md:h-10"
          style={{
            backgroundColor: '#ed3b91',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d91f7a'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ed3b91'}
          title="Create New Screen"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Delete Menu Dropdown */}
      {showMenu && (
        <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[200px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            Manage Screens
          </div>

          <button
            onClick={() => handleDeleteClick()}
            disabled={totalScreens <= 1}
            className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors flex items-center gap-3 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Current Screen
          </button>

          {totalScreens > 1 && (
            <>
              <div className="h-px bg-gray-100 my-1"></div>
              <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                All Screens
              </div>
              {screensList.map((screen, idx) => (
                <button
                  key={screen.id}
                  onClick={() => handleDeleteClick(screen.id)}
                  className={`w-full text-left px-4 py-2 hover:bg-red-50 text-sm transition-colors flex items-center justify-between group ${
                    idx + 1 === currentScreenIndex ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700'
                  }`}
                >
                  <span>{screen.name}</span>
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 text-red-500 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TopBar;
