
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { roomService } from '../services/roomService';
import { RoomState, Widget, WidgetType, RoomBackground } from '../types';
import ScreenLayout from '../components/ScreenLayout';
import Sidebar from '../components/Sidebar';

const TeacherView: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<RoomState | null>(null);
  // Add isDrawingMode state to satisfy Sidebar requirements
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    const initialState = roomService.getRoomState(roomId);
    setRoom(initialState);

    const unsubscribe = roomService.addListener((msg) => {
      if (msg.type === 'SYNC_REQUEST' && msg.roomId === roomId) {
        roomService.broadcast({
          type: 'SYNC_RESPONSE',
          payload: roomService.getRoomState(roomId),
          roomId,
          sender: 'teacher'
        });
      }
    });

    return unsubscribe;
  }, [roomId]);

  const updateRoom = useCallback((newRoom: RoomState) => {
    if (!roomId) return;
    setRoom(newRoom);
    roomService.saveRoomState(newRoom);
    roomService.broadcast({
      type: 'UPDATE_ROOM',
      payload: newRoom,
      roomId,
      sender: 'teacher'
    });
  }, [roomId]);

  const addWidget = (type: WidgetType) => {
    if (!room) return;
    const initialDims = getInitialDimensions(type);
    const newWidget: Widget = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: type.toUpperCase().replace('_', ' '),
      size: 'medium',
      dimensions: initialDims,
      position: { x: 100 + (room.widgets.length * 20), y: 100 + (room.widgets.length * 20) },
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

  if (!room) return <div className="p-8">Loading Room...</div>;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden font-sans">
      <div className="flex-1 relative bg-[#eef1f5]">
        <ScreenLayout 
          room={room} 
          isTeacher={true} 
          onUpdateWidget={updateWidget}
          onRemoveWidget={removeWidget}
        />
      </div>
      {/* Fix: Added missing onToggleDrawMode and isDrawingMode props to satisfy SidebarProps interface */}
      <Sidebar 
        onAddWidget={addWidget} 
        onSetBackground={setBackground}
        onToggleDrawMode={() => setIsDrawingMode(!isDrawingMode)}
        isDrawingMode={isDrawingMode}
        room={room}
      />
    </div>
  );
};

function getInitialDimensions(type: WidgetType) {
    switch (type) {
        case WidgetType.DRAW: return { width: 500, height: 450 };
        case WidgetType.POLL: return { width: 400, height: 500 };
        case WidgetType.TIMER: return { width: 320, height: 380 };
        case WidgetType.TRAFFIC_LIGHT: return { width: 200, height: 400 };
        default: return { width: 340, height: 340 };
    }
}

function getDefaultSettings(type: WidgetType) {
  switch (type) {
    case WidgetType.TIMER: return { duration: 300, sound: true };
    case WidgetType.TRAFFIC_LIGHT: return { label: 'Working Time' };
    case WidgetType.POLL: return { question: 'What\'s your status?', options: ['I\'m done!', 'Almost there', 'Still working'], showResults: true };
    case WidgetType.DICE: return { sides: 6 };
    case WidgetType.EMBED: return { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' };
    case WidgetType.HYPERLINK: return { text: 'Class Folder', url: 'https://google.com' };
    case WidgetType.QR: return { url: window.location.href };
    case WidgetType.RANDOMIZER: return { items: 'Alice\nBob\nCharlie\nDiana\nEthan', allowRepeat: true };
    case WidgetType.DRAW: return { strokeColor: '#3b82f6', lineWidth: 4 };
    default: return {};
  }
}

function getDefaultState(type: WidgetType) {
  switch (type) {
    case WidgetType.TIMER: return { remaining: 300, running: false };
    case WidgetType.TRAFFIC_LIGHT: return { color: 'green' };
    case WidgetType.POLL: return { results: [0, 0, 0] };
    case WidgetType.DRAW: return { drawingData: '' };
    default: return {};
  }
}

export default TeacherView;
