
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { roomService } from '../services/roomService';
import { RoomState, Widget, WidgetType, RoomBackground, BrushSettings, DrawingElement, AppMode } from '../types';
import ScreenLayout from '../components/ScreenLayout';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Whiteboard from '../components/Whiteboard';
import { ToolsPanel } from '../components/ToolsPanel';
import { BackgroundNavigation } from '../components/BackgroundNavigation';

const DEFAULT_ROOM_ID = 'main-classroom-session';
const SAFE_FALLBACK_IMG = 'https://images.unsplash.com/photo-1483664852095-d6cc68707056?auto=format&fit=crop&w=1920&q=80';
const FALLBACK_VIDEO_MP4 = 'https://assets.mixkit.co/videos/preview/mixkit-white-abstract-bokeh-lights-22955-large.mp4';

const ClassroomScreen: React.FC = () => {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [mode, setMode] = useState<AppMode>('tools');
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  
  const [brushSettings, setBrushSettings] = useState<BrushSettings>({
    tool: 'pen',
    color: '#000000',
    size: 4,
    fill: false
  });
  
  const whiteboardRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const initialState = roomService.getRoomState(DEFAULT_ROOM_ID);
    setRoom(initialState);

    const unsubscribe = roomService.addListener((msg) => {
      if (msg.roomId === DEFAULT_ROOM_ID && (msg.type === 'UPDATE_ROOM' || msg.type === 'SYNC_RESPONSE')) {
        setRoom(msg.payload);
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMode('tools');
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z') {
          if (e.shiftKey) whiteboardRef.current?.redo();
          else whiteboardRef.current?.undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const updateRoom = useCallback((newRoom: RoomState) => {
    setRoom(newRoom);
    roomService.saveRoomState(newRoom);
    roomService.broadcast({
      type: 'UPDATE_ROOM',
      payload: newRoom,
      roomId: DEFAULT_ROOM_ID,
      sender: 'teacher'
    });
  }, []);

  const handleUpdateDrawingElements = (elements: DrawingElement[]) => {
    if (!room) return;
    updateRoom({ ...room, drawingElements: elements });
  };

  const handleImportRoom = (importedRoom: RoomState) => {
    if (!room) return;
    const newRoomState = {
      ...importedRoom,
      roomId: room.roomId
    };
    updateRoom(newRoomState);
  };

  const addWidget = (type: WidgetType) => {
    if (!room) return;
    const initialDims = getInitialDimensions(type);
    const newWidget: Widget = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: type.toUpperCase().replace(/_/g, ' '),
      size: 'medium',
      dimensions: initialDims,
      position: { 
        x: 100 + (room.widgets.length * 24), 
        y: 100 + (room.widgets.length * 24) 
      },
      minimized: false,
      settings: getDefaultSettings(type),
      state: getDefaultState(type)
    };
    updateRoom({ ...room, widgets: [...room.widgets, newWidget] });
  };

  const removeWidget = (id: string) => {
    if (!room) return;
    updateRoom({ ...room, widgets: room.widgets.filter(w => w.id !== id) });
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    if (!room) return;
    updateRoom({
      ...room,
      widgets: room.widgets.map(w => w.id === id ? { ...w, ...updates } : w)
    });
  };

  const setBackground = (bg: RoomBackground) => {
    if (!room) return;
    updateRoom({ ...room, background: bg });
  };

  // Robust determination of video type with query param support
  const isVideo = room?.background?.mediaType === 'video' || 
                  (typeof room?.background?.value === 'string' && !!room.background.value.match(/\.(mp4|webm|mov|m4v)(\?|$|#)/i));

  // Video Playback Logic - Uses Key-based remounting for reliable source switching
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    let isActive = true;
    
    // 1. Enforce Properties
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.playsInline = true;
    video.loop = true;
    
    // 2. Enforce Attributes
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    
    // Ensure no crossOrigin is set to prevent CORS issues with opaque sources
    video.removeAttribute('crossorigin');

    // 3. Load & Play
    video.load();

    const attemptPlay = () => {
        if (!isActive) return;
        // Only attempt if paused to avoid promise interruption
        if (video.paused) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.warn('[Video] Playback prevented:', err.message);
                });
            }
        }
    };

    // Use rAF to ensure DOM is ready
    requestAnimationFrame(attemptPlay);

    // 4. Handlers
    const handleVisibility = () => {
        if (!document.hidden && video.paused) {
            attemptPlay();
        }
    };

    const handleError = () => {
        if (!isActive || !video.error) return;
        // If the video element errors (meaning ALL sources failed), fall back to image
        console.error(`[Video] Critical Error ${video.error.code}: ${video.error.message}`);
        if (isActive) {
            setBackground({
                type: 'preset',
                value: SAFE_FALLBACK_IMG,
                fit: 'cover',
                mediaType: 'image'
            });
        }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    video.addEventListener('error', handleError);

    return () => {
        isActive = false;
        document.removeEventListener('visibilitychange', handleVisibility);
        video.removeEventListener('error', handleError);
    };
  }, [room?.background.value, isVideo]); // Re-runs whenever the video URL (key) changes

  if (!room) return <div className="h-screen w-screen flex items-center justify-center font-bold text-indigo-600 mono">BOOTING_SYSTEM...</div>;

  const bgStyle = {
    backgroundImage: (room.background.type !== 'none' && !isVideo) ? `url(${room.background.value})` : 'none',
    backgroundColor: room.background.type === 'none' ? '#f3f4f6' : 'transparent',
    backgroundSize: room.background.fit || 'cover',
  };

  const isDrawing = mode === 'annotate';
  const videoUrl = room.background.value;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 relative">
      <TopBar 
        isDrawingMode={isDrawing} 
        onExitDrawing={() => setMode('tools')} 
        room={room}
        onImportRoom={handleImportRoom}
      />

      {!isDrawing && (
        <BackgroundNavigation 
          currentBackground={room.background}
          onSetBackground={setBackground}
          onOpenModal={() => setIsBgModalOpen(true)}
        />
      )}
      
      <div className="flex-1 relative overflow-hidden h-full w-full bg-slate-900">
        {/* Layer 0: Background */}
        <div 
            className={`fixed inset-0 z-0 bg-center bg-no-repeat transition-all duration-500 ${isVideo ? 'hidden' : 'block'}`}
            style={{ ...bgStyle, position: 'fixed' }}
        />

        {/* Video Element with Source Fallback */}
        {isVideo && (
            <video
                key={videoUrl} // Critical: forces React to replace element, re-evaluating <source> tags
                ref={videoRef}
                className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-100 transition-opacity duration-1000"
                style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                muted
                playsInline
                autoPlay
                loop
                preload="auto"
                // No crossOrigin prop
            >
                {/* Primary Source */}
                <source src={videoUrl} type={getVideoMimeType(videoUrl)} />
                
                {/* Fallback Source (Safe MP4 for iOS/Safari if Primary is WebM or fails) */}
                <source src={FALLBACK_VIDEO_MP4} type="video/mp4" />
            </video>
        )}

        {/* Layer 10: Widgets */}
        <div className={`absolute inset-0 z-10 transition-all duration-300 ${isDrawing ? 'opacity-80 blur-[1px]' : ''}`}>
          <ScreenLayout 
            room={room} 
            isTeacher={true} 
            onUpdateWidget={updateWidget}
            onRemoveWidget={removeWidget}
          />
        </div>

        {/* Layer 20: Whiteboard */}
        <div 
          className={`absolute inset-0 z-20 transition-all duration-300 ${isDrawing ? 'pointer-events-auto bg-black/5' : 'pointer-events-none'}`}
        >
          <Whiteboard 
            ref={whiteboardRef}
            settings={brushSettings} 
            isTeacher={true}
            isDrawingMode={isDrawing}
            elements={room.drawingElements || []}
            onUpdate={handleUpdateDrawingElements}
          />
        </div>

        {isDrawing && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[300] flex justify-center w-full pointer-events-none">
            <div className="pointer-events-auto">
                <ToolsPanel 
                settings={brushSettings}
                onUpdate={(updates) => setBrushSettings(prev => ({ ...prev, ...updates }))}
                onClear={() => whiteboardRef.current?.clear()}
                onUndo={() => whiteboardRef.current?.undo()}
                onRedo={() => whiteboardRef.current?.redo()}
                />
            </div>
          </div>
        )}
      </div>

      {!isDrawing && (
          <Sidebar 
            onAddWidget={addWidget} 
            onSetBackground={setBackground}
            onToggleDrawMode={() => setMode('annotate')}
            isDrawingMode={isDrawing}
            room={room}
            bgModalOpen={isBgModalOpen}
            onToggleBgModal={setIsBgModalOpen}
          />
      )}
    </div>
  );
};

function getVideoMimeType(url: string): string {
    if (/\.webm(\?|$|#)/i.test(url)) return 'video/webm';
    if (/\.ogv(\?|$|#)/i.test(url)) return 'video/ogg';
    return 'video/mp4';
}

function getInitialDimensions(type: WidgetType) {
    switch (type) {
        case WidgetType.DRAW: return { width: 500, height: 400 };
        case WidgetType.POLL: return { width: 400, height: 500 };
        case WidgetType.TIMER: return { width: 300, height: 350 };
        case WidgetType.TRAFFIC_LIGHT: return { width: 180, height: 380 };
        case WidgetType.EMBED: return { width: 500, height: 350 };
        case WidgetType.NOISE_METER: return { width: 300, height: 260 };
        case WidgetType.WORK_SYMBOLS: return { width: 200, height: 200 };
        case WidgetType.IMAGE: return { width: 300, height: 300 };
        case WidgetType.TEXT: return { width: 400, height: 200 };
        case WidgetType.TIMETABLE: return { width: 350, height: 400 };
        case WidgetType.CLOCK: return { width: 280, height: 180 };
        case WidgetType.GROUP_MAKER: return { width: 500, height: 400 };
        case WidgetType.VIDEO: return { width: 480, height: 320 };
        case WidgetType.WEBCAM: return { width: 400, height: 300 };
        case WidgetType.CALENDAR: return { width: 350, height: 350 };
        case WidgetType.EVENT_COUNT: return { width: 400, height: 200 };
        case WidgetType.STOPWATCH: return { width: 300, height: 200 };
        case WidgetType.SCOREBOARD: return { width: 400, height: 250 };
        case WidgetType.STICKERS: return { width: 200, height: 200 };
        default: return { width: 320, height: 320 };
    }
}

function getDefaultSettings(type: WidgetType) {
  switch (type) {
    case WidgetType.TIMER: return { duration: 300, sound: true };
    case WidgetType.TRAFFIC_LIGHT: return { label: 'Working Status' };
    case WidgetType.POLL: return { question: 'System Health Check?', options: ['Optimal', 'Warning', 'Critical'], showResults: true };
    case WidgetType.DICE: return { sides: 6 };
    case WidgetType.EMBED: return { url: '' };
    case WidgetType.HYPERLINK: return { text: 'Class Link', url: 'https://google.com' };
    case WidgetType.QR: return { url: window.location.href };
    case WidgetType.RANDOMIZER: return { items: 'Node A\nNode B\nNode C', allowRepeat: true };
    case WidgetType.DRAW: return { strokeColor: '#06b6d4', lineWidth: 4 };
    case WidgetType.NOISE_METER: return { threshold: 50 };
    case WidgetType.WORK_SYMBOLS: return { symbol: 'silence' };
    case WidgetType.IMAGE: return { url: '' };
    case WidgetType.TEXT: return { content: 'Welcome to Class!', fontSize: 32, bold: true, align: 'center', color: '#1f2937' };
    case WidgetType.TIMETABLE: return { rows: [{ time: '09:00', activity: 'Morning Circle' }, { time: '10:00', activity: 'Math' }] };
    case WidgetType.CLOCK: return { format24: false };
    case WidgetType.GROUP_MAKER: return { names: '', groupSize: 3, groups: [] };
    case WidgetType.VIDEO: return { url: '' };
    case WidgetType.EVENT_COUNT: return { targetDate: '', label: 'Next Break' };
    case WidgetType.SCOREBOARD: return { teams: [{name: 'Team A', score: 0}, {name: 'Team B', score: 0}] };
    case WidgetType.STICKERS: return { sticker: '⭐' };
    default: return {};
  }
}

function getDefaultState(type: WidgetType) {
  switch (type) {
    case WidgetType.TIMER: return { running: false, endTime: 0, pausedRemaining: 300 };
    case WidgetType.TRAFFIC_LIGHT: return { color: 'green' };
    case WidgetType.POLL: return { results: [0, 0, 0] };
    case WidgetType.DRAW: return { drawingData: '' };
    case WidgetType.DICE: return { currentRoll: 1 };
    default: return {};
  }
}

export default ClassroomScreen;
