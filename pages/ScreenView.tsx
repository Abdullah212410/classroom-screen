
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { roomService } from '../services/roomService';
import { RoomState, RoomBackground } from '../types';
import ScreenLayout from '../components/ScreenLayout';
import Whiteboard from '../components/Whiteboard';

const DEFAULT_ROOM_ID = 'main-classroom-session';
const SAFE_FALLBACK_IMG = 'https://images.unsplash.com/photo-1483664852095-d6cc68707056?auto=format&fit=crop&w=1920&q=80';

const ScreenView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [room, setRoom] = useState<RoomState | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get room ID from URL params or use default
  const roomId = searchParams.get('roomId') || DEFAULT_ROOM_ID;

  useEffect(() => {
    const initialState = roomService.getRoomState(roomId);
    setRoom(initialState);

    // Subscribe to room updates
    const unsubscribe = roomService.addListener((msg) => {
      if (msg.roomId === roomId && (msg.type === 'UPDATE_ROOM' || msg.type === 'SYNC_RESPONSE')) {
        setRoom(msg.payload);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  // Video detection
  const isVideo = room?.background?.mediaType === 'video' ||
                  (typeof room?.background?.value === 'string' && !!room.background.value.match(/\.(mp4|webm|mov|m4v)(\?|$|#)/i));

  // Video Playback Logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    let isActive = true;

    // Enforce Properties
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.playsInline = true;
    video.loop = true;

    // Enforce Attributes
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');

    video.removeAttribute('crossorigin');

    // Load & Play
    video.load();

    const attemptPlay = () => {
        if (!isActive) return;
        if (video.paused) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.warn('[Video] Playback prevented:', err.message);
                });
            }
        }
    };

    requestAnimationFrame(attemptPlay);

    const handleVisibility = () => {
        if (!document.hidden && video.paused) {
            attemptPlay();
        }
    };

    const handleError = () => {
        if (!isActive || !video.error) return;
        console.error(`[Video] Critical Error ${video.error.code}: ${video.error.message}`);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    video.addEventListener('error', handleError);

    return () => {
        isActive = false;
        document.removeEventListener('visibilitychange', handleVisibility);
        video.removeEventListener('error', handleError);
    };
  }, [room?.background.value, isVideo]);

  if (!room) return (
    <div className="h-screen w-screen flex items-center justify-center font-bold text-indigo-600 mono">
      LOADING SCREEN...
    </div>
  );

  const bgStyle = {
    backgroundImage: (room.background.type !== 'none' && !isVideo) ? `url(${room.background.value})` : 'none',
    backgroundColor: room.background.type === 'none' ? '#f3f4f6' : 'transparent',
    backgroundSize: room.background.fit || 'cover',
  };

  const videoUrl = room.background.value;

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ position: 'fixed', inset: 0 }}>
      {/* Background Layer */}
      <div
        className="absolute inset-0 z-0 bg-center"
        style={bgStyle}
      >
        {isVideo && videoUrl && (
          <video
            ref={videoRef}
            key={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            loop
            autoPlay
            style={{ objectFit: room.background.fit || 'cover' }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
      </div>

      {/* Whiteboard Layer (drawing elements) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Whiteboard
          elements={room.drawingElements || []}
          onUpdateElements={() => {}}
          isDrawing={false}
          brushSettings={{ tool: 'pen', color: '#000000', size: 4, fill: false }}
          isTeacher={false}
        />
      </div>

      {/* Widgets Layer (read-only) */}
      <div className="absolute inset-0 z-20">
        <ScreenLayout
          widgets={room.widgets}
          isTeacher={false}
          onUpdateWidget={() => {}}
          onRemoveWidget={() => {}}
        />
      </div>
    </div>
  );
};

export default ScreenView;
