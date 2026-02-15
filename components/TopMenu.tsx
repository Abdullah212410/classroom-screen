
import React, { useState, useEffect, useRef } from 'react';
import { RoomState } from '../types';
import { exportStateToJson, importStateFromJson } from '../utils/backupJson';
import { useTheme } from './ThemeContext';

interface TopMenuProps {
  room?: RoomState | null;
  onImport?: (room: RoomState) => void;
}

export const TopMenu: React.FC<TopMenuProps> = ({ room, onImport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modal, setModal] = useState<'settings' | 'share' | 'trash' | 'shortcuts' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { theme, toggleTheme } = useTheme();

  // Toggle Fullscreen logic
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      switch(e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          setModal('settings');
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'k':
          e.preventDefault();
          setModal('shortcuts');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleDownload = () => {
    if (room) {
      exportStateToJson(room);
      setIsOpen(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) {
      const importedRoom = await importStateFromJson(file);
      if (importedRoom) {
        onImport(importedRoom);
        alert('Backup restored successfully!');
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    setIsOpen(false);
  };

  const MenuItem = ({ 
    icon, 
    label, 
    shortcut, 
    external, 
    onClick 
  }: { 
    icon: React.ReactNode, 
    label: string, 
    shortcut?: string, 
    external?: boolean, 
    onClick: () => void 
  }) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-bg-alt transition-colors group text-left"
    >
      <div className="flex items-center gap-3 text-text-main font-medium text-sm">
        <span className="text-text-secondary group-hover:text-primary transition-colors">{icon}</span>
        {label}
      </div>
      <div className="flex items-center gap-2">
        {external && (
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        )}
        {shortcut && (
          <span className="w-6 h-6 flex items-center justify-center rounded-md bg-bg-alt text-text-secondary text-xs font-bold border border-border-default">
            {shortcut}
          </span>
        )}
      </div>
    </button>
  );

  return (
    <div className="relative pointer-events-auto" ref={menuRef}>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".json" 
        onChange={handleFileChange} 
      />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 backdrop-blur-xl rounded-full shadow-lg border border-white/50 flex items-center justify-center text-white transition-all shrink-0 group ${isOpen ? 'ring-2 ring-focus' : ''}`}
        style={{
          backgroundColor: '#ED3B91',
          transition: 'background-color 0.2s ease, transform 0.1s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D92F82'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ED3B91'}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="More options"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
           <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-72 bg-bg-main rounded-2xl shadow-floating border border-border-default py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
           
           <MenuItem 
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
             label="Settings" 
             shortcut="S" 
             onClick={() => { setModal('settings'); setIsOpen(false); }} 
           />
           <MenuItem 
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
             label="Download JSON" 
             onClick={handleDownload} 
           />
           <MenuItem 
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
             label="Upload JSON" 
             onClick={handleUploadClick} 
           />
           <MenuItem 
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
             label="Share collection" 
             onClick={() => { setModal('share'); setIsOpen(false); }} 
           />
           <MenuItem 
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
             label="Restore widgets" 
             onClick={() => { setModal('trash'); setIsOpen(false); }} 
           />
           <MenuItem 
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>}
             label="Full screen" 
             shortcut="F" 
             onClick={() => { toggleFullscreen(); setIsOpen(false); }} 
           />
           <MenuItem 
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>}
             label="Keyboard shortcuts" 
             shortcut="K" 
             onClick={() => { setModal('shortcuts'); setIsOpen(false); }} 
           />
           <MenuItem 
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
             label="Helpcenter" 
             external 
             onClick={() => { window.open('https://classroomscreen.com/help', '_blank'); setIsOpen(false); }} 
           />
           
           <div className="mx-4 my-2 border-t border-border-default"></div>

           {/* Promo Card */}
           <div className="mx-2 mb-2 bg-primary/5 p-4 rounded-xl text-center border border-primary/10">
              <h4 className="font-bold text-primary text-sm mb-1">Remember to save your work!</h4>
              <p className="text-xs text-text-secondary mb-3 leading-relaxed">Save all your favorite lessons with ClassroomScreen Pro.</p>
              <button className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">
                Discover Pro features
              </button>
           </div>
        </div>
      )}

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setModal(null)}>
           <div className="bg-bg-main rounded-2xl shadow-floating p-6 w-full max-w-md animate-in zoom-in-95 border border-border-default" onClick={e => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-text-main">
                    {modal === 'settings' && 'Settings'}
                    {modal === 'share' && 'Share Collection'}
                    {modal === 'trash' && 'Trash'}
                    {modal === 'shortcuts' && 'Keyboard Shortcuts'}
                </h3>
                <button onClick={() => setModal(null)} className="p-2 hover:bg-bg-alt rounded-full text-text-secondary">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="text-text-main">
                {modal === 'settings' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-bg-alt rounded-xl border border-border-default">
                            <span className="font-medium">Dark Mode</span>
                            <button 
                              onClick={toggleTheme}
                              className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-primary' : 'bg-border-default'}`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-5' : 'left-1'}`}></div>
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-bg-alt rounded-xl border border-border-default">
                            <span className="font-medium">Sound Effects</span>
                            <div className="w-10 h-6 bg-primary rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div></div>
                        </div>
                        <p className="text-xs text-text-secondary mt-4 text-center">Version 2.0.1 (Clone)</p>
                    </div>
                )}
                
                {modal === 'share' && (
                    <div className="space-y-4">
                        <p className="text-sm">Share this classroom with students or colleagues.</p>
                        <div className="flex gap-2">
                            <input type="text" readOnly value={window.location.href} className="flex-1 bg-bg-alt border border-border-default rounded-lg px-3 py-2 text-sm text-text-secondary outline-none" />
                            <button className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-hover">Copy</button>
                        </div>
                    </div>
                )}

                {modal === 'trash' && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-16 h-16 bg-bg-alt rounded-full flex items-center justify-center mb-4 text-text-secondary">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <p className="font-medium">Trash is empty</p>
                        <p className="text-sm text-text-secondary">Deleted widgets will appear here.</p>
                    </div>
                )}

                {modal === 'shortcuts' && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 bg-bg-alt rounded-xl border border-border-default">
                            <span className="text-sm font-medium">Settings</span>
                            <kbd className="px-2 py-1 bg-white rounded border border-border-default text-xs font-bold text-text-secondary">S</kbd>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-bg-alt rounded-xl border border-border-default">
                            <span className="text-sm font-medium">Full Screen</span>
                            <kbd className="px-2 py-1 bg-white rounded border border-border-default text-xs font-bold text-text-secondary">F</kbd>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-bg-alt rounded-xl border border-border-default">
                            <span className="text-sm font-medium">Shortcuts</span>
                            <kbd className="px-2 py-1 bg-white rounded border border-border-default text-xs font-bold text-text-secondary">K</kbd>
                        </div>
                    </div>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
