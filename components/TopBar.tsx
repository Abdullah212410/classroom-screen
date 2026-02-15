
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopMenu } from './TopMenu';
import { RoomState } from '../types';
import { exportStateToJson } from '../utils/backupJson';

interface TopBarProps {
  isDrawingMode?: boolean;
  onExitDrawing?: () => void;
  room?: RoomState | null;
  onImportRoom?: (room: RoomState) => void;
}

const TopBar: React.FC<TopBarProps> = ({ isDrawingMode, onExitDrawing, room, onImportRoom }) => {
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
    <header className="absolute top-0 w-full h-16 flex items-center justify-between px-4 md:px-6 z-[300] shrink-0 pointer-events-none mt-2">
      
      {/* Left / Center Section */}
      <div className="pointer-events-auto bg-bg-main/80 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-white/50 flex items-center gap-3 transition-all hover:shadow-xl hover:bg-bg-main/90">
        {isDrawingMode ? (
          <>
             <button 
                onClick={onExitDrawing}
                className="w-9 h-9 bg-bg-alt rounded-full flex items-center justify-center text-text-secondary hover:bg-primary-hover hover:text-white transition-colors group shrink-0 border border-border-default"
                title="Back to Tools"
            >
               <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
               </svg>
            </button>
            <div className="flex items-center gap-2 border-l border-border-default pl-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                <span className="text-sm font-extrabold text-text-main tracking-tight">Annotating</span>
            </div>
          </>
        ) : (
          <>
            <button onClick={handleHomeClick} className="w-9 h-9 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-all shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </button>
            <span className="text-sm font-extrabold text-text-main hidden sm:inline-block tracking-tight">Classroom Screen</span>
          </>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button 
            onClick={() => room && exportStateToJson(room)}
            className="w-10 h-10 bg-bg-main/80 backdrop-blur-xl rounded-full shadow-lg border border-white/50 flex items-center justify-center text-text-secondary hover:text-text-main hover:bg-bg-main hover:shadow-xl transition-all shrink-0 group"
            title="Download JSON"
        >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
        </button>

        <button 
            onClick={toggleFullscreen}
            className="w-10 h-10 bg-bg-main/80 backdrop-blur-xl rounded-full shadow-lg border border-white/50 flex items-center justify-center text-text-secondary hover:text-text-main hover:bg-bg-main hover:shadow-xl transition-all shrink-0 group"
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

export default TopBar;
