
import React, { useState, useRef, useEffect } from 'react';
import { WidgetType, RoomBackground, RoomState } from '../types';
import { EditWidgetsModal } from './EditWidgetsModal';
import { BackgroundsModal } from './BackgroundsModal';

interface SidebarProps {
  onAddWidget: (type: WidgetType) => void;
  onSetBackground: (bg: RoomBackground) => void;
  onToggleDrawMode: () => void;
  isDrawingMode: boolean;
  room: RoomState;
  bgModalOpen?: boolean;
  onToggleBgModal?: (open: boolean) => void;
}

// --- Icons (Pixel Perfect Doodle Match) ---
// Using currentColor allows the icon to adapt to the button's text color
const DoodleIcon = ({ children, className = "w-8 h-8", fill = "none", stroke = "currentColor", strokeWidth="2" }: { children?: React.ReactNode, className?: string, fill?: string, stroke?: string, strokeWidth?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    {children}
  </svg>
);

export const ICONS: Record<string, React.ReactNode> = {
  // Left Controls
  SQUIGGLE: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14C5.5 14 7 10 9 10C11 10 12.5 14 15 14C17.5 14 19 10 20 10" />
    </svg>
  ),
  POINTER: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M7 2l12 11.2-5.8.5 3.3 5.3-2.3 1.5-3.3-5.3-2.8 3.8z"/>
    </svg>
  ),
  
  BACKGROUND: (
    <DoodleIcon>
       <rect x="4" y="6" width="24" height="20" rx="3" fill="var(--c-bg-main)"/>
       <path d="M4 20L10 14L16 20L22 14L28 20" />
       <circle cx="22" cy="10" r="2" fill="var(--c-text-secondary)" stroke="none"/>
       {/* Paint roller overlay hint */}
       <rect x="2" y="4" width="8" height="6" rx="1" fill="var(--c-focus)" transform="rotate(-15 6 7)" stroke="none" opacity="0.8"/>
    </DoodleIcon>
  ),
  
  [WidgetType.POLL]: (
    <DoodleIcon>
      <rect x="5" y="4" width="22" height="24" rx="3" fill="var(--c-bg-main)"/>
      <path d="M12 10h10M12 16h10M12 22h10" strokeWidth="2"/>
      <circle cx="8" cy="10" r="1.5" fill="var(--c-success)" stroke="none"/>
      <circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="8" cy="22" r="1.5" fill="currentColor" stroke="none"/>
    </DoodleIcon>
  ),
  
  [WidgetType.RANDOMIZER]: (
    <DoodleIcon>
      <rect x="6" y="6" width="16" height="20" rx="2" fill="var(--c-bg-main)" transform="rotate(-10 14 16)"/>
      <rect x="10" y="6" width="16" height="20" rx="2" fill="var(--c-bg-main)" transform="rotate(10 18 16)"/>
      <path d="M16 14a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" fill="var(--c-focus)" stroke="none" transform="rotate(10 18 16)" />
      <path d="M14 20h8" transform="rotate(10 18 16)" />
    </DoodleIcon>
  ),
  
  [WidgetType.NOISE_METER]: (
    <DoodleIcon>
      <path d="M4 18h4l3-8 4 12 3-8 4 4h4" strokeWidth="2.5"/>
      <path d="M4 6h24v20H4z" stroke="none" fill="none"/> {/* Spacer */}
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.3"/>
    </DoodleIcon>
  ),
  
  [WidgetType.IMAGE]: (
    <DoodleIcon>
      <rect x="4" y="5" width="24" height="22" rx="3" fill="var(--c-bg-main)"/>
      <circle cx="9" cy="10" r="2.5" fill="var(--c-warning)" stroke="none"/>
      <path d="M4 22l7-9 6 6 4-5 7 8" fill="none" strokeWidth="2"/>
    </DoodleIcon>
  ),
  
  [WidgetType.TEXT]: (
    <DoodleIcon>
      <path d="M6 5h20v22H6z" fill="var(--c-bg-main)"/>
      <path d="M20 5v6l6 6V5h-6z" fill="var(--c-bg-alt)" stroke="currentColor"/>
      <text x="16" y="23" fontSize="18" fontWeight="bold" fill="currentColor" textAnchor="middle" stroke="none" fontFamily="sans-serif">Aa</text>
    </DoodleIcon>
  ),
  
  [WidgetType.WORK_SYMBOLS]: (
    <DoodleIcon>
      <path d="M8 24c-3 0-5-3-5-6s2-6 7-6c1 0 2 0 3 1c1-3 4-5 7-5c5 0 9 4 9 9c0 4-3 7-7 7" fill="var(--c-bg-main)"/>
      <circle cx="24" cy="10" r="4" fill="var(--c-bg-alt)" stroke="currentColor"/>
      <circle cx="24" cy="10" r="1" fill="currentColor" stroke="none"/>
      <circle cx="21" cy="13" r="1" fill="currentColor" stroke="none"/>
      <circle cx="27" cy="7" r="1" fill="currentColor" stroke="none"/>
    </DoodleIcon>
  ),
  
  [WidgetType.TRAFFIC_LIGHT]: (
    <DoodleIcon>
      <rect x="10" y="3" width="12" height="26" rx="6" fill="var(--c-bg-main)"/>
      <circle cx="16" cy="8" r="3" fill="var(--c-danger)" stroke="none"/>
      <circle cx="16" cy="16" r="3" fill="var(--c-warning)" stroke="none"/>
      <circle cx="16" cy="24" r="3" fill="var(--c-success)" stroke="none"/>
      <circle cx="16" cy="8" r="3" fill="none" stroke="currentColor"/>
      <circle cx="16" cy="16" r="3" fill="none" stroke="currentColor"/>
      <circle cx="16" cy="24" r="3" fill="none" stroke="currentColor"/>
    </DoodleIcon>
  ),
  
  [WidgetType.TIMETABLE]: (
    <DoodleIcon>
      <rect x="5" y="4" width="22" height="24" rx="3" fill="var(--c-bg-main)"/>
      <line x1="12" y1="4" x2="12" y2="28" strokeWidth="1.5"/>
      <line x1="5" y1="12" x2="27" y2="12" strokeWidth="1.5"/>
      <line x1="5" y1="20" x2="27" y2="20" strokeWidth="1.5"/>
      <circle cx="19" cy="8" r="2" fill="var(--c-focus)" stroke="none"/>
      <circle cx="19" cy="16" r="2" fill="var(--c-focus)" stroke="none"/>
      <path d="M17 23l2 2 4-4" stroke="var(--c-success)" strokeWidth="2" fill="none"/>
    </DoodleIcon>
  ),
  
  [WidgetType.TIMER]: (
    <DoodleIcon>
      <path d="M8 6h16" strokeWidth="2.5"/>
      <path d="M8 26h16" strokeWidth="2.5"/>
      <path d="M10 6 L22 6 L22 6 C22 12 16 16 16 16 C16 16 10 12 10 6 Z" fill="var(--c-bg-main)"/>
      <path d="M10 26 L22 26 L22 26 C22 20 16 16 16 16 C16 16 10 20 10 26 Z" fill="var(--c-warning)"/>
    </DoodleIcon>
  ),
  
  [WidgetType.CLOCK]: (
    <DoodleIcon>
      <circle cx="16" cy="16" r="11" fill="var(--c-bg-main)"/>
      <path d="M16 16L16 10" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M16 16L20 20" strokeWidth="2.5" strokeLinecap="round" stroke="var(--c-primary)"/>
      <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none"/>
      <path d="M16 5v2m11 9h-2m-9 11v-2m-11-9h2" opacity="0.5"/>
    </DoodleIcon>
  ),
  
  [WidgetType.GROUP_MAKER]: (
    <DoodleIcon>
      <rect x="5" y="6" width="18" height="20" rx="3" fill="var(--c-bg-main)"/>
      <circle cx="14" cy="13" r="3" fill="var(--c-bg-alt)"/>
      <path d="M11 19c0-1.5 1.5-3 6-3" />
      <circle cx="23" cy="23" r="6" fill="var(--c-success)"/>
      <path d="M23 20v6m-3-3h6" stroke="white" strokeWidth="2" />
    </DoodleIcon>
  ),
  
  [WidgetType.VIDEO]: (
    <DoodleIcon>
      <rect x="4" y="7" width="24" height="18" rx="3" fill="var(--c-bg-main)"/>
      <path d="M14 11v10l8-5z" fill="var(--c-primary)" stroke="none"/>
      <path d="M14 11v10l8-5z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </DoodleIcon>
  ),
  
  [WidgetType.DICE]: (
    <DoodleIcon>
      <rect x="6" y="8" width="16" height="16" rx="3" fill="var(--c-bg-main)" transform="rotate(-10 14 16)"/>
      <rect x="12" y="5" width="16" height="16" rx="3" fill="var(--c-bg-main)" transform="rotate(10 20 13)"/>
      <circle cx="17" cy="10" r="2" fill="currentColor" stroke="none"/>
      <circle cx="23" cy="16" r="2" fill="currentColor" stroke="none"/>
    </DoodleIcon>
  ),
  
  [WidgetType.WEBCAM]: (
    <DoodleIcon>
      <circle cx="16" cy="14" r="8" fill="var(--c-bg-main)"/>
      <circle cx="16" cy="14" r="3" fill="var(--c-focus)" stroke="none"/>
      <circle cx="16" cy="14" r="3" fill="none" stroke="currentColor"/>
      <path d="M16 22v4M10 26h12" />
    </DoodleIcon>
  ),
  
  [WidgetType.CALENDAR]: (
    <DoodleIcon>
      <rect x="5" y="6" width="22" height="20" rx="3" fill="var(--c-bg-main)"/>
      <path d="M5 11h22" />
      <path d="M9 4v4m14-4v4" />
      <text x="16" y="22" fontSize="10" fontWeight="bold" fill="currentColor" textAnchor="middle" stroke="none" fontFamily="sans-serif">12</text>
    </DoodleIcon>
  ),
  
  [WidgetType.EVENT_COUNT]: (
    <DoodleIcon>
      <rect x="5" y="6" width="22" height="20" rx="3" fill="var(--c-bg-main)"/>
      <path d="M5 11h22" />
      <path d="M11 4h10" />
      <rect x="14" y="15" width="11" height="8" rx="1" fill="var(--c-success)" transform="rotate(-10 19.5 19)"/>
      <text x="19.5" y="21" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle" stroke="none" fontFamily="sans-serif" transform="rotate(-10 19.5 19)">365</text>
    </DoodleIcon>
  ),
  
  [WidgetType.STOPWATCH]: (
    <DoodleIcon>
      <circle cx="16" cy="17" r="10" fill="var(--c-bg-main)"/>
      <path d="M16 7V4M13 4h6" />
      <path d="M24 9l-1 1" />
      <rect x="11" y="16" width="10" height="4" rx="1" fill="var(--c-border)"/>
      <text x="16" y="19" fontSize="4" fontWeight="bold" fill="currentColor" textAnchor="middle" stroke="none" fontFamily="monospace">00:00</text>
    </DoodleIcon>
  ),
  
  [WidgetType.DRAW]: (
    <DoodleIcon>
      <path d="M6 26l3 3" />
      <path d="M9 23l-3 3-2-2 3-3" fill="var(--c-bg-main)"/>
      <path d="M9 23L20 12c1-1 1-2 0-3l-2-2c-1-1-2-1-3 0L4 18" fill="var(--c-bg-main)"/>
      <path d="M20 12l-3 3" />
      <rect x="18" y="9" width="5" height="5" transform="rotate(45 20.5 11.5)" fill="var(--c-primary)"/>
    </DoodleIcon>
  ),
  
  [WidgetType.EMBED]: (
    <DoodleIcon>
      <rect x="3" y="6" width="26" height="20" rx="3" fill="var(--c-bg-main)"/>
      <path d="M3 11h26" />
      <circle cx="6" cy="8.5" r="1" fill="currentColor" stroke="none"/>
      <circle cx="10" cy="8.5" r="1" fill="currentColor" stroke="none"/>
      <path d="M12 15l-2 3 2 3m8-6l2 3-2 3m-4-7l-2 8" stroke="var(--c-focus)" strokeLinecap="round"/>
    </DoodleIcon>
  ),
  
  [WidgetType.QR]: (
    <DoodleIcon>
      <rect x="5" y="5" width="22" height="22" rx="2" fill="var(--c-bg-main)"/>
      <path d="M9 9h5v5h-5z" />
      <path d="M18 9h5v5h-5z" />
      <path d="M9 18h5v5h-5z" />
      <path d="M18 18h2v2h2v2h-4z" fill="currentColor" stroke="none"/>
    </DoodleIcon>
  ),
  
  [WidgetType.HYPERLINK]: (
    <DoodleIcon>
      <rect x="5" y="6" width="22" height="20" rx="3" fill="var(--c-bg-main)"/>
      <path d="M11 16l-3 3m6-6l-3 3" />
      <path d="M17 10l3-3" />
      <circle cx="23" cy="7" r="4" fill="var(--c-success)"/>
      <path d="M21 7l2-2 2 2" stroke="white" strokeWidth="1.5" fill="none"/>
    </DoodleIcon>
  ),
  
  [WidgetType.STICKERS]: (
    <DoodleIcon>
      <path d="M16 27C8 27 5 19 5 16C5 11 8 5 16 5C24 5 27 11 27 16C27 19 24 27 16 27Z" fill="var(--c-bg-main)"/>
      <path d="M16 10c-2 0-3 1-3 3s2 3 3 3s3-1 3-3s-1-3-3-3" fill="var(--c-primary)" stroke="none"/>
      <path d="M16 10c-2 0-3 1-3 3s2 3 3 3s3-1 3-3s-1-3-3-3" fill="none"/>
      <path d="M10 16c0 4 6 6 6 6s6-2 6-6" fill="none"/>
    </DoodleIcon>
  ),
  
  [WidgetType.SCOREBOARD]: (
    <DoodleIcon>
      <rect x="5" y="6" width="22" height="20" rx="2" fill="var(--c-bg-main)"/>
      <path d="M16 6V26" />
      <path d="M10 5v2m12-2v2" />
      <text x="10.5" y="20" fontSize="10" fontWeight="bold" fill="currentColor" textAnchor="middle" stroke="none">2</text>
      <text x="21.5" y="20" fontSize="10" fontWeight="bold" fill="currentColor" textAnchor="middle" stroke="none">1</text>
    </DoodleIcon>
  ),
};

export const WIDGET_LABELS: Record<string, string> = {
  [WidgetType.POLL]: 'poll',
  [WidgetType.RANDOMIZER]: 'randomizer',
  [WidgetType.NOISE_METER]: 'sound level',
  [WidgetType.IMAGE]: 'image',
  [WidgetType.TEXT]: 'text',
  [WidgetType.WORK_SYMBOLS]: 'work sym...',
  [WidgetType.TRAFFIC_LIGHT]: 'traffic light',
  [WidgetType.TIMETABLE]: 'timetable',
  [WidgetType.TIMER]: 'timer',
  [WidgetType.CLOCK]: 'clock',
  [WidgetType.GROUP_MAKER]: 'group mak...',
  [WidgetType.VIDEO]: 'video',
  [WidgetType.DICE]: 'dice',
  [WidgetType.WEBCAM]: 'webcam',
  [WidgetType.CALENDAR]: 'calendar',
  [WidgetType.EVENT_COUNT]: 'event cou...',
  [WidgetType.STOPWATCH]: 'stopwatch',
  [WidgetType.DRAW]: 'draw',
  [WidgetType.EMBED]: 'embed',
  [WidgetType.QR]: 'qr code',
  [WidgetType.HYPERLINK]: 'hyperlink',
  [WidgetType.STICKERS]: 'stickers',
  [WidgetType.SCOREBOARD]: 'scoreboard'
};

const DEFAULT_PINNED_WIDGETS = [
    WidgetType.POLL, WidgetType.RANDOMIZER, WidgetType.NOISE_METER, WidgetType.IMAGE, 
    WidgetType.TEXT, WidgetType.WORK_SYMBOLS, WidgetType.TRAFFIC_LIGHT, WidgetType.TIMETABLE, 
    WidgetType.TIMER, WidgetType.CLOCK
];

const DEFAULT_MORE_GRID_WIDGETS = [
    WidgetType.GROUP_MAKER, WidgetType.VIDEO, WidgetType.DICE, WidgetType.WEBCAM,
    WidgetType.TIMER, WidgetType.CALENDAR, WidgetType.EVENT_COUNT, WidgetType.STOPWATCH,
    WidgetType.DRAW, WidgetType.EMBED, WidgetType.QR, WidgetType.HYPERLINK,
    WidgetType.STICKERS, WidgetType.SCOREBOARD
];

interface WidgetButtonProps { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void; 
  active?: boolean; 
  className?: string; 
  isMore?: boolean; 
}

const WidgetButton: React.FC<WidgetButtonProps> = ({
  icon,
  label,
  onClick,
  active = false,
  className = "",
  isMore = false
}) => (
  <button
    onClick={onClick}
    className={`group flex flex-col items-center justify-center gap-1 transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer ${className}`}
    style={{
      minWidth: 'clamp(64px, 5vw, 76px)',
      padding: '8px 6px'
    }}
  >
    <div
        className={`flex items-center justify-center rounded-lg transition-all duration-200
        ${active
          ? 'bg-blue-50 ring-2 ring-blue-400 ring-offset-1 text-blue-600 scale-105'
          : 'group-hover:bg-black/5 text-gray-700'
        }`}
        style={{
          width: '28px',
          height: '28px'
        }}
    >
       <div className="scale-[0.85]">{icon}</div>
    </div>
    <span
      className={`text-[12px] font-medium truncate w-full text-center leading-tight tracking-tight
      ${active ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
      style={{ maxWidth: '72px' }}
    >
      {label}
    </span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  onAddWidget, 
  onSetBackground, 
  onToggleDrawMode, 
  isDrawingMode, 
  room,
  bgModalOpen,
  onToggleBgModal
}) => {
  const [localShowBgModal, setLocalShowBgModal] = useState(false);
  const showBgModal = bgModalOpen !== undefined ? bgModalOpen : localShowBgModal;
  const setShowBgModal = onToggleBgModal || setLocalShowBgModal;

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const popoverRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const [toolbarWidgets, setToolbarWidgets] = useState<WidgetType[]>(DEFAULT_PINNED_WIDGETS);
  const [moreWidgets, setMoreWidgets] = useState<WidgetType[]>(DEFAULT_MORE_GRID_WIDGETS);

  useEffect(() => {
    try {
      const savedToolbar = localStorage.getItem('ui.widgetLayout.toolbarOrder');
      const savedMore = localStorage.getItem('ui.widgetLayout.moreOrder');
      if (savedToolbar && savedMore) {
        setToolbarWidgets(JSON.parse(savedToolbar));
        setMoreWidgets(JSON.parse(savedMore));
      }
    } catch (e) {
      console.error('Failed to load widget layout', e);
    }
  }, []);

  const handleSaveLayout = (newToolbar: WidgetType[], newMore: WidgetType[]) => {
    setToolbarWidgets(newToolbar);
    setMoreWidgets(newMore);
    localStorage.setItem('ui.widgetLayout.toolbarOrder', JSON.stringify(newToolbar));
    localStorage.setItem('ui.widgetLayout.moreOrder', JSON.stringify(newMore));
    setShowMoreMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && !moreButtonRef.current?.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  const toggleCollapse = () => {
    if (!isCollapsed) {
        setShowMoreMenu(false);
    }
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <div className="fixed bottom-6 left-0 right-0 z-[200] flex justify-center px-4 pointer-events-none">

        {/* Main Toolbar - Redesigned */}
        <div
          className={`pointer-events-auto flex items-center overflow-visible relative transition-all duration-300 ease-out ${
            isCollapsed ? 'rounded-full px-2' : 'rounded-[24px] px-5'
          }`}
          style={{
            backgroundColor: '#f3f4f6',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
            padding: isCollapsed ? '8px' : '12px 20px',
            gap: isCollapsed ? '0' : '20px',
            maxWidth: '95vw'
          }}
        >

            <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'hidden opacity-0' : 'flex opacity-100'}`} style={{ gap: '20px' }}>
                {/* Draw/Annotate Mode Toggle - Purple Button */}
                <button
                    onClick={onToggleDrawMode}
                    className={`flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isDrawingMode
                        ? 'bg-indigo-600 text-white shadow-lg scale-105'
                        : 'bg-indigo-500 text-white hover:bg-indigo-600'
                    }`}
                    style={{
                      width: '44px',
                      height: '44px',
                      boxShadow: isDrawingMode ? '0 4px 16px rgba(99, 102, 241, 0.4)' : '0 2px 8px rgba(99, 102, 241, 0.3)'
                    }}
                    title="Draw Mode"
                    aria-label="Toggle Annotation Mode"
                >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                      <path d="M2 2l7.586 7.586"/>
                      <circle cx="11" cy="11" r="2"/>
                    </svg>
                </button>

                {/* Main Widget Buttons */}
                <div className="flex items-center overflow-x-auto scrollbar-hide" style={{ gap: '20px' }}>
                    <WidgetButton
                        label="background"
                        onClick={() => setShowBgModal(true)}
                        active={showBgModal}
                        icon={ICONS.BACKGROUND}
                    />

                    {toolbarWidgets.map((type) => (
                        <WidgetButton
                            key={type}
                            label={WIDGET_LABELS[type]}
                            icon={ICONS[type]}
                            onClick={() => onAddWidget(type)}
                        />
                    ))}
                </div>

                {/* More Button */}
                <div className="relative shrink-0">
                    <button
                        ref={moreButtonRef}
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className={`group flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer`}
                        style={{
                          minWidth: 'clamp(64px, 5vw, 76px)',
                          padding: '8px 6px'
                        }}
                    >
                        <div
                            className={`flex items-center justify-center rounded-lg transition-all duration-200
                            ${showMoreMenu
                              ? 'bg-blue-50 ring-2 ring-blue-400 ring-offset-1 text-blue-600 scale-105'
                              : 'group-hover:bg-black/5 text-gray-700'
                            }`}
                            style={{ width: '28px', height: '28px' }}
                        >
                            <div className="grid grid-cols-3 gap-[3px]">
                            {[...Array(9)].map((_,i) => (
                                <div
                                  key={i}
                                  className={`w-[3px] h-[3px] rounded-full ${
                                    showMoreMenu ? 'bg-blue-600' : 'bg-gray-700'
                                  }`}
                                ></div>
                            ))}
                            </div>
                        </div>
                        <span
                          className={`text-[12px] font-medium leading-tight tracking-tight
                          ${showMoreMenu ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                        >
                          more
                        </span>
                    </button>

                    {/* More Popover - Redesigned */}
                    {showMoreMenu && (
                        <div
                            ref={popoverRef}
                            className="absolute bottom-full right-0 mb-6 p-6 w-[min(400px,85vw)] z-[220] cursor-default rounded-[20px] animate-in slide-in-from-bottom-2 fade-in duration-200"
                            style={{
                              backgroundColor: '#ffffff',
                              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
                              transformOrigin: 'bottom right',
                              border: '1px solid rgba(0, 0, 0, 0.06)'
                            }}
                        >
                            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45" style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.05)' }}></div>

                            <div className="w-full flex justify-center mb-6">
                                <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="text-center font-semibold text-indigo-600 text-sm hover:text-indigo-700 hover:underline transition-colors"
                                >
                                Edit widget bar
                                </button>
                            </div>

                            <div className="grid grid-cols-4 gap-y-6 gap-x-3">
                                {moreWidgets.map((type) => (
                                    <div key={type} className="flex flex-col items-center group">
                                        <button
                                            onClick={() => { onAddWidget(type); setShowMoreMenu(false); }}
                                            className="w-[52px] h-[52px] flex items-center justify-center rounded-xl hover:bg-gray-100 hover:scale-110 transition-all duration-200 border border-transparent hover:border-gray-200 mb-1.5 text-gray-700"
                                        >
                                            <div className="scale-90">{ICONS[type]}</div>
                                        </button>
                                        <span className="text-[11px] font-medium text-center w-full truncate px-1 text-gray-700 tracking-tight">
                                            {WIDGET_LABELS[type]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Collapse/Expand Chevron */}
            <button
                onClick={toggleCollapse}
                className={`flex items-center justify-center rounded-full hover:bg-black/5 text-gray-600 transition-all duration-300 ease-out ${
                  isCollapsed ? 'rotate-180 w-10 h-10' : 'w-8 h-8'
                }`}
                aria-label={isCollapsed ? 'Expand toolbar' : 'Collapse toolbar'}
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
               </svg>
            </button>
        </div>
      </div>

      <EditWidgetsModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveLayout}
        initialToolbar={toolbarWidgets}
        initialMore={moreWidgets}
        icons={ICONS}
        labels={WIDGET_LABELS}
      />

      <BackgroundsModal 
        isOpen={showBgModal} 
        onClose={() => setShowBgModal(false)}
        onSetBackground={onSetBackground}
        currentBackground={room.background}
      />
    </>
  );
};

export default Sidebar;
